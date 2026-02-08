import type { TerminalMessage, Conversation, StudySession } from '../../types';

interface ContextWindow {
  messages: TerminalMessage[];
  totalTokens: number;
}

export class ContextManager {
  private maxTokens: number;
  private maxMessages: number;
  private currentSession: StudySession | null = null;

  constructor(maxTokens: number = 4000, maxMessages: number = 20) {
    this.maxTokens = maxTokens;
    this.maxMessages = maxMessages;
  }

  setSession(session: StudySession) {
    this.currentSession = session;
  }

  getSession(): StudySession | null {
    return this.currentSession;
  }

  // Build context window for LLM
  buildContextWindow(
    allMessages: TerminalMessage[],
    recentCount: number = 10
  ): ContextWindow {
    // Get recent messages
    const recent = allMessages.slice(-recentCount);
    
    // Calculate approximate tokens (rough estimate: 4 chars = 1 token)
    const totalTokens = recent.reduce((acc, msg) => {
      return acc + Math.ceil(msg.content.length / 4);
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
    if (!this.currentSession) return null;

    const parts: string[] = ['Contexto actual:'];
    
    if (this.currentSession.lastTopic) {
      parts.push(`- Tema actual: ${this.currentSession.lastTopic}`);
    }
    
    if (this.currentSession.conceptsCovered?.length) {
      parts.push(`- Conceptos vistos: ${this.currentSession.conceptsCovered.join(', ')}`);
    }

    if (this.currentSession.exercisesCompleted > 0) {
      parts.push(`- Ejercicios completados: ${this.currentSession.exercisesCompleted}`);
    }

    return parts.length > 1 ? parts.join('\n') : null;
  }

  // Summarize older messages to save tokens
  async summarizeMessages(messages: TerminalMessage[]): Promise<string> {
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
