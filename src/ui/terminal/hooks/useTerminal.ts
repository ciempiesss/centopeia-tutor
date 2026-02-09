import { useState, useRef, useEffect, useCallback } from 'react';
import type { TerminalMessage, StudySession } from '../../../types';
import { generateId } from '../../../utils/idGenerator';
import { LLMClient } from '../../../core/agent/LLMClient';
import { ContextManager } from '../../../core/agent/ContextManager';
import { CentopeiaDatabase } from '../../../storage/Database';
import { secureStorage } from '../../../storage/SecureStorage';
import { useFocusSprint } from '../../../core/audhd/FocusSprint';
import { commandRegistry } from '../commands';
import { codeExecutor } from '../../../tools/CodeExecutor';
import { quizGenerator } from '../../../tools/QuizGenerator';
import { getPathById, type LearningPath } from '../../../data/learningPaths';

// Initialize services
const db = CentopeiaDatabase.getInstance();
const contextManager = new ContextManager();

export interface UseTerminalReturn {
  messages: TerminalMessage[];
  isTyping: boolean;
  llmClient: LLMClient | null;
  currentSession: StudySession | null;
  isInitialized: boolean;
  completedModules: number;
  isFocusActive: boolean;
  timeRemaining: number;
  focusStats: { completedToday: number; totalMinutes: number };
  handleCommand: (input: string) => Promise<void>;
  addAssistantMessage: (content: string, type?: 'text' | 'code' | 'error' | 'success' | 'warning') => void;
  startSprint: (minutes: number) => Promise<void>;
  stopSprint: () => Promise<void>;
  extendSprint: (minutes: number) => Promise<void>;
}

// Welcome message component for cleaner code
const WelcomeMessage = () => `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗███████╗███╗   ██╗████████╗ ██████╗ ██████╗ ███████╗██╗ █████╗   ║
║  ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗██╔══██╗██╔════╝██║██╔══██╗  ║
║  ██║     █████╗  ██╔██╗ ██║   ██║   ██║   ██║██████╔╝█████╗  ██║███████║  ║
║  ██║     ██╔══╝  ██║╚██╗██║   ██║   ██║   ██║██╔═══╝ ██╔══╝  ██║██╔══██║  ║
║  ╚██████╗███████╗██║ ╚████║   ██║   ╚██████╔╝██║     ███████╗██║██║  ██║  ║
║   ╚═════╝╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚══════╝╚═╝╚═╝  ╚═╝  ║
║                                                              ║
║              TUTOR DE PROGRAMACIÓN AUDHD-OPTIMIZED           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Bienvenido a Centopeia. Tu tutor técnico personal.
Escribe /help para ver comandos disponibles.

[dim]Consejo AUDHD:[/dim] Usa /focus 15 para empezar un sprint de 15 minutos.
[dim]Práctica:[/dim] Escribe /practice python para ejercicios interactivos.
`;

// Sanitize user input to prevent XSS and injection attacks
const sanitizeInput = (input: string): string => {
  // Remove null bytes
  let sanitized = input.replace(/\x00/g, '');

  // Basic XSS prevention - escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/\u003c/g, '&lt;')
    .replace(/\u003e/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Limit input length (prevent DoS)
  const MAX_INPUT_LENGTH = 10000;
  if (sanitized.length > MAX_INPUT_LENGTH) {
    console.warn(`[Terminal] Input truncated from ${sanitized.length} to ${MAX_INPUT_LENGTH} chars`);
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
  }

  return sanitized;
};

// Validate input doesn't contain dangerous patterns
const validateInput = (input: string): { valid: boolean; error?: string } => {
  // Check for extremely long words (potential attack)
  const words = input.split(/\s+/);
  const maxWordLength = 500;
  for (const word of words) {
    if (word.length > maxWordLength) {
      return {
        valid: false,
        error: `Palabra demasiado larga (${word.length} caracteres). Máximo permitido: ${maxWordLength}`,
      };
    }
  }

  // Check for repeated characters (spam/DoS)
  const repeatedCharPattern = /(.)\1{50,}/;
  if (repeatedCharPattern.test(input)) {
    return {
      valid: false,
      error: 'Input contiene caracteres repetidos excesivamente',
    };
  }

  return { valid: true };
};

export function useTerminal(): UseTerminalReturn {
  // State management
  const [messages, setMessages] = useState<TerminalMessage[]>(() => [
    {
      id: generateId(),
      role: 'system',
      content: WelcomeMessage(),
      timestamp: new Date().toISOString(),
      type: 'success',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [llmClient, setLlmClient] = useState<LLMClient | null>(null);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [completedModules, setCompletedModules] = useState(0);

  // Refs for mutable state and safety mechanisms
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCancelledRef = useRef(false);

  // Focus sprint integration
  const {
    isActive: isFocusActive,
    timeRemaining,
    startSprint,
    stopSprint,
    extendSprint,
    stats: focusStats,
  } = useFocusSprint();

  // Initialize terminal session (database already initialized in App.tsx)
  useEffect(() => {
    isCancelledRef.current = false;

    const init = async () => {
      try {
        // Create new study session
        const session: StudySession = {
          id: generateId(),
          startedAt: new Date().toISOString(),
          focusSprintCount: 0,
          totalFocusMinutes: 0,
          breaksTaken: 0,
          breaksSkipped: 0,
          frustrationEvents: 0,
          conceptsCovered: [],
          exercisesCompleted: 0,
          exercisesCorrect: 0,
        };

        await db.saveStudySession(session);

        if (!isCancelledRef.current) {
          setCurrentSession(session);
          contextManager.setSession(session);

          // Load user's selected path from profile
          const profile = await db.getUserProfile();
          if (profile?.roleFocus && profile.roleFocus !== 'exploring') {
            const path = getPathById(profile.roleFocus);
            if (path) {
              setSelectedPath(path);
            }
          }

          // Check for API key in secure storage
          const apiKey = await secureStorage.getApiKey();
          if (apiKey) {
            setLlmClient(new LLMClient({ apiKey }));
            console.log('[LLM] API key cargada automáticamente, Kimi K2 listo');
          } else {
            console.log('[LLM] Sin API key, modo demo activo. Usa /config apikey TU_KEY');
          }

          // Load completed modules count
          const completedCount = await db.getCompletedModulesCount();
          setCompletedModules(completedCount);

          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (!isCancelledRef.current) {
          addAssistantMessage(
            '[red]Error de inicialización:[/red] Algo salió mal al iniciar. Intenta recargar la app.',
            'error'
          );
        }
      }
    };

    init();

    return () => {
      isCancelledRef.current = true;
    };
  }, []);

  // Save message to database
  const saveMessage = useCallback(async (message: TerminalMessage) => {
    if (currentSession) {
      await db.addConversation(currentSession.id, message);
    }
  }, [currentSession]);

  // Add assistant message to state and save to DB
  const addAssistantMessage = useCallback((
    content: string,
    type?: 'text' | 'code' | 'error' | 'success' | 'warning'
  ) => {
    const assistantMsg: TerminalMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      type,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    saveMessage(assistantMsg);
  }, [saveMessage]);

  // Check if input is a code block
  const isCodeBlock = useCallback((input: string): boolean => {
    return input.trim().startsWith('```') && input.trim().endsWith('```');
  }, []);

  // Extract code from markdown block
  const extractCode = useCallback((input: string): { language: string; code: string } => {
    const trimmed = input.trim();
    const lines = trimmed.split('\n');

    const firstLine = lines[0].replace('```', '').trim();
    const language = firstLine || 'python';

    const codeLines = lines.slice(1, -1);
    const code = codeLines.join('\n');

    return { language, code };
  }, []);

  // Execute code block
  const handleCodeExecution = useCallback(async (input: string): Promise<string> => {
    const { language, code } = extractCode(input);

    if (language === 'python' || language === 'py') {
      try {
        const result = await codeExecutor.executePython(code);

        let response = `[green]✓ Código ejecutado[/green] (${result.executionTime}ms)\n\n`;

        if (result.output) {
          response += `[dim]Output:[/dim]\n\`\`\`\n${result.output}\n\`\`\``;
        }

        if (result.error) {
          response += `\n\n[red]Error:[/red]\n\`\`\`\n${result.error}\n\`\`\``;
        }

        return response;
      } catch (error) {
        return `[red]Error al ejecutar:[/red] ${error instanceof Error ? error.message : 'Error desconocido'}`;
      }
    }

    return `[yellow]Lenguaje "${language}" no soportado aún. Usa \`\`\`python\`\`\`.`;
  }, [extractCode]);

  // Extract concept from user input
  const extractConcept = useCallback((input: string): string | null => {
    const conceptPatterns = [
      /(?:qué es|qué son|explica|dime sobre)\s+(\w+)/i,
      /(?:cómo funciona|cómo usar|cómo hacer)\s+(\w+)/i,
    ];

    for (const pattern of conceptPatterns) {
      const match = input.match(pattern);
      if (match) return match[1].toLowerCase();
    }

    return null;
  }, []);

  // Process input with LLM
  const processWithLLM = useCallback(async (input: string) => {
    if (!llmClient) {
      // Use demo mode without LLM
      const demoResponses: Record<string, string> = {
        hola: '¡Hola! Soy Centopeia, tu tutor técnico. ¿Qué te gustaría aprender hoy?\n\nEscribe /role para elegir tu path (QA, Developer, o Data Analyst).',
        help: 'Escribe /help para ver todos los comandos disponibles.',
        sql: 'SQL es un lenguaje para bases de datos. ¿Quieres empezar con SELECT básico?\n\nEscribe /learn sql para comenzar el módulo.',
        python:
          'Python es un lenguaje versátil. ¿Prefieres empezar con sintaxis básica o ir directo a ejercicios?\n\nEscribe /practice python para ejercicios prácticos.',
      };

      const lowerInput = input.toLowerCase();
      let response = demoResponses[lowerInput];

      if (!response) {
        response = `Entendido: "${input}"\n\n[Modo Demo] Para respuestas inteligentes con IA, configura tu API key de Groq:\n/config apikey TU_API_KEY\n\nObtén una gratis en: https://console.groq.com`;
      }

      addAssistantMessage(response);
      return;
    }

    try {
      // Get user profile for role context
      const profile = await db.getUserProfile();
      const userRole = profile?.roleFocus || 'exploring';

      // Build context
      const contextWindow = contextManager.buildContextWindow(messages);
      const enhancedMessages = contextManager.enhanceWithContext(contextWindow.messages, input);

      // Get response from LLM with dynamic prompting
      const response = await llmClient.sendMessage({
        messages: enhancedMessages,
        role: userRole,
        context: {
          sessionId: currentSession?.id,
          userRole,
          messageCount: messages.length,
          currentTopic: currentSession?.lastTopic,
        },
      });

      addAssistantMessage(response);

      // Update session with concept if detected
      if (currentSession) {
        const concept = extractConcept(input);
        if (concept && !currentSession.conceptsCovered?.includes(concept)) {
          currentSession.conceptsCovered = [...(currentSession.conceptsCovered || []), concept];
          await db.saveStudySession(currentSession);
        }
      }
    } catch (error) {
      addAssistantMessage(
        `Error al comunicar con el tutor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'error'
      );
    }
  }, [addAssistantMessage, currentSession, extractConcept, llmClient, messages]);

  // Main command handler
  const handleCommand = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Validate input
    const validation = validateInput(trimmed);
    if (!validation.valid) {
      addAssistantMessage(`[red]Error de validación:[/red] ${validation.error}`, 'error');
      return;
    }

    // Sanitize input
    const sanitizedInput = sanitizeInput(trimmed);

    // Add user message (use original for display, sanitized for processing)
    const userMsg: TerminalMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed, // Keep original for display
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    await saveMessage(userMsg);
    setIsTyping(true);

    // Safety timeout - auto-unlock input after 10 seconds to prevent getting stuck
    safetyTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      console.warn('[Safety] Input auto-unlocked after timeout');
    }, 10000);

    try {
      // Check if it's a code block
      if (isCodeBlock(trimmed)) {
        const response = await handleCodeExecution(trimmed);
        addAssistantMessage(response);
        setIsTyping(false);
        return;
      }

      // Parse command using sanitized input for processing
      const parts = sanitizedInput.split(' ');
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Check if it's a command
      if (command.startsWith('/')) {
        // Handle interview mode - this is handled by the UI component
        if (command === '/interview') {
          setIsTyping(false);
          return;
        }

        // Handle home command - this is handled by the UI component
        if (command === '/home') {
          // Reset any active quiz when going home
          if (currentSession?.id) {
            quizGenerator.resetQuiz(currentSession.id);
          }
          setIsTyping(false);
          return;
        }

        // Emergency unlock command
        if (command === '/unlock') {
          setIsTyping(false);
          addAssistantMessage('✅ Input desbloqueado. Si sigues con problemas, recarga la página (F5).');
          return;
        }

        const handler = commandRegistry[command];

        // Handle quiz command - ensure input stays enabled
        if (command === '/quiz') {
          if (handler) {
            const response = await handler(args, { sessionId: currentSession?.id });
            addAssistantMessage(response);
          } else {
            addAssistantMessage('Error: Comando /quiz no disponible.');
          }
          setIsTyping(false);
          return;
        }

        if (handler) {
          // Handle special commands
          if (command === '/focus' || command === '/sprint') {
            const minutes = args[0] ? parseInt(args[0], 10) : 15;
            if (!isNaN(minutes) && minutes >= 1 && minutes <= 120) {
              await startSprint(minutes);
            } else {
              addAssistantMessage(`[red]Error:[/red] Duración inválida. Usa /focus [1-120]`);
              setIsTyping(false);
              return;
            }
            const response = await handler(args, { sessionId: currentSession?.id });
            addAssistantMessage(response);
          } else if (command === '/stop') {
            await stopSprint();
            addAssistantMessage('Sprint detenido. ¿Cómo te fue?');
          } else {
            const response = await handler(args, { sessionId: currentSession?.id });
            addAssistantMessage(response);
          }
        } else {
          addAssistantMessage(
            `Comando no reconocido: ${command}\n\nEscribe /help para ver los comandos disponibles.`
          );
        }
      } else {
        // Check if there's an active quiz
        if (currentSession?.id && quizGenerator.getCurrentQuestion(currentSession.id)) {
          // Treat as quiz answer
          const response = await commandRegistry['/quiz']([trimmed], { sessionId: currentSession.id });
          addAssistantMessage(response);
        } else {
          // Process with LLM using sanitized input
          await processWithLLM(sanitizedInput);
        }
      }
    } catch (error) {
      console.error('[Terminal] Command error:', error);
      addAssistantMessage(
        `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        'error'
      );
    } finally {
      // Clear safety timeout if command completed normally
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      setIsTyping(false);
    }
  }, [
    addAssistantMessage,
    currentSession?.id,
    handleCodeExecution,
    isCodeBlock,
    processWithLLM,
    saveMessage,
    startSprint,
    stopSprint,
  ]);

  // Update context manager when selectedPath changes
  useEffect(() => {
    if (selectedPath) {
      contextManager.updateFullContext({ selectedPath });
      console.log('[Context] Path actualizado:', selectedPath.title);
    }
  }, [selectedPath]);

  // Update focus sprint in session
  useEffect(() => {
    let isCancelled = false;

    const updateSession = async () => {
      if (currentSession && !isFocusActive && focusStats.completedToday > 0) {
        currentSession.focusSprintCount = focusStats.completedToday;
        currentSession.totalFocusMinutes = focusStats.totalMinutes;
        await db.saveStudySession(currentSession);
        // Prevent any state updates if component unmounted during async operation
        if (isCancelled) {
          return;
        }
      }
    };

    updateSession();

    return () => {
      isCancelled = true;
    };
  }, [isFocusActive, focusStats, currentSession]);

  return {
    messages,
    isTyping,
    llmClient,
    currentSession,
    isInitialized,
    completedModules,
    isFocusActive,
    timeRemaining,
    focusStats,
    handleCommand,
    addAssistantMessage,
    startSprint,
    stopSprint,
    extendSprint,
  };
}
