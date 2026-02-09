import type { TerminalMessage, Conversation, StudySession } from '../../types';
import type { LearningPath } from '../../data/learningPaths';

interface ContextWindow {
  messages: TerminalMessage[];
  totalTokens: number;
}

interface FullAppContext {
  session: StudySession | null;
  selectedPath: LearningPath | null;
  currentModule: string | null;
  recentCommands: string[];
  quizResults: { topic: string; score: number }[];
  focusSprintsCompleted: number;
}

export class ContextManager {
  private maxTokens: number;
  private maxMessages: number;
  private currentSession: StudySession | null = null;
  private fullContext: FullAppContext = {
    session: null,
    selectedPath: null,
    currentModule: null,
    recentCommands: [],
    quizResults: [],
    focusSprintsCompleted: 0,
  };

  constructor(maxTokens: number = 4000, maxMessages: number = 20) {
    this.maxTokens = maxTokens;
    this.maxMessages = maxMessages;
  }

  setSession(session: StudySession) {
    this.currentSession = session;
    this.fullContext.session = session;
  }

  getSession(): StudySession | null {
    return this.currentSession;
  }

  updateFullContext(updates: Partial<FullAppContext>) {
    this.fullContext = { ...this.fullContext, ...updates };
  }

  addCommand(command: string) {
    this.fullContext.recentCommands.unshift(command);
    if (this.fullContext.recentCommands.length > 10) {
      this.fullContext.recentCommands.pop();
    }
  }

  addQuizResult(topic: string, score: number) {
    this.fullContext.quizResults.unshift({ topic, score });
    if (this.fullContext.quizResults.length > 5) {
      this.fullContext.quizResults.pop();
    }
  }

  // Better token estimation based on language patterns
  private estimateTokens(text: string): number {
    if (!text || text.length === 0) return 0;

    // For English/Spanish: ~1.3 tokens per word is more accurate
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;

    let tokenEstimate = Math.ceil(wordCount * 1.3);

    // Code blocks have higher token density
    if (text.includes('```')) {
      tokenEstimate = Math.ceil(tokenEstimate * 1.2);
    }

    // Very short text adjustment
    if (charCount < 20) {
      tokenEstimate = Math.max(tokenEstimate, Math.ceil(charCount / 2));
    }

    // Cap at reasonable maximum
    const MAX_TOKENS = 100000;
    return Math.min(tokenEstimate, MAX_TOKENS);
  }

  // Build context window for LLM
  buildContextWindow(
    allMessages: TerminalMessage[],
    recentCount: number = 10
  ): ContextWindow {
    const recent = allMessages.slice(-recentCount);

    const totalTokens = recent.reduce((acc, msg) => {
      return acc + this.estimateTokens(msg.content);
    }, 0);

    return {
      messages: recent,
      totalTokens,
    };
  }

  // Add relevant context based on query
  enhanceWithContext(
    messages: TerminalMessage[],
    query: string
  ): TerminalMessage[] {
    const contextMessages: TerminalMessage[] = [];

    // Add session context if available
    if (this.currentSession) {
      const sessionContext = this.getSessionContext();
      if (sessionContext) {
        contextMessages.push({
          id: 'session-context',
          role: 'system',
          content: sessionContext,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return [...contextMessages, ...messages];
  }

  private getSessionContext(): string | null {
    if (!this.currentSession && !this.fullContext.selectedPath) return null;

    const parts: string[] = ['=== CONTEXTO COMPLETO DE CENTOPEIA ==='];
    
    // PATH seleccionado
    if (this.fullContext.selectedPath) {
      parts.push(`\n📚 PATH ACTIVO: ${this.fullContext.selectedPath.title}`);
      parts.push(`   Descripción: ${this.fullContext.selectedPath.description}`);
      parts.push(`   Duración: ${this.fullContext.selectedPath.estimatedWeeks} semanas`);
      parts.push(`   Skills: ${this.fullContext.selectedPath.skills.length}`);
    }

    // Módulo actual
    if (this.fullContext.currentModule) {
      parts.push(`\n📖 MÓDULO ACTUAL: ${this.fullContext.currentModule}`);
    }

    // Sesión actual
    if (this.currentSession) {
      parts.push(`\n⏱️  SESIÓN DE HOY:`);
      
      if (this.currentSession.lastTopic) {
        parts.push(`   - Tema reciente: ${this.currentSession.lastTopic}`);
      }
      
      if (this.currentSession.conceptsCovered?.length) {
        parts.push(`   - Conceptos vistos: ${this.currentSession.conceptsCovered.slice(-5).join(', ')}`);
      }

      if (this.currentSession.exercisesCompleted > 0) {
        parts.push(`   - Ejercicios: ${this.currentSession.exercisesCompleted} completados`);
      }

      if (this.currentSession.focusSprintCount > 0) {
        parts.push(`   - Sprints: ${this.currentSession.focusSprintCount} completados`);
        parts.push(`   - Minutos de focus: ${Math.round(this.currentSession.totalFocusMinutes || 0)}`);
      }
    }

    // Quiz recientes
    if (this.fullContext.quizResults.length > 0) {
      parts.push(`\n🎯 QUIZ RECIENTES:`);
      this.fullContext.quizResults.forEach(q => {
        parts.push(`   - ${q.topic}: ${q.score}%`);
      });
    }

    // Comandos recientes
    if (this.fullContext.recentCommands.length > 0) {
      parts.push(`\n⌨️  COMANDOS USADOS RECIENTEMENTE:`);
      this.fullContext.recentCommands.slice(0, 5).forEach(cmd => {
        parts.push(`   - ${cmd}`);
      });
    }

    parts.push(`\n=== FIN DEL CONTEXTO ===\n`);

    return parts.join('\n');
  }

  // Summarize older messages to save tokens
  // NOTE: This function is synchronous as it doesn't require async operations
  summarizeMessages(messages: TerminalMessage[]): string {
    if (messages.length < 5) return '';

    const content = messages
      .map(m => `${m.role}: ${m.content.substring(0, 200)}`)
      .join('\n');

    return `Resumen de la conversación anterior:\n${content}`;
  }

  // Detect if user is asking about previous context
  isContextualQuery(query: string): boolean {
    const contextualKeywords = [
      'eso', 'eso mismo', 'lo anterior', 'lo que dijiste',
      'continúa', 'sigue', 'más sobre', 'el tema',
      'la explicación', 'el ejemplo', 'recuerdas',
    ];

    const lowerQuery = query.toLowerCase();
    return contextualKeywords.some(kw => lowerQuery.includes(kw));
  }

  // Format messages for display
  formatForDisplay(messages: TerminalMessage[]): TerminalMessage[] {
    return messages.map(msg => ({
      ...msg,
      // Truncate very long messages for display
      content: msg.content.length > 2000 
        ? msg.content.substring(0, 2000) + '... [mensaje truncado]'
        : msg.content,
    }));
  }
}
