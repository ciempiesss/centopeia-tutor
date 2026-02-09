import { useState, useRef, useEffect } from 'react';
import type { TerminalMessage, StudySession } from '../../../types';
import { generateId } from '../../../utils/idGenerator';
import { LLMClient } from '../../../core/agent/LLMClient';
import { ContextManager } from '../../../core/agent/ContextManager';
import { CentopeiaDatabase } from '../../../storage/Database';
import { useFocusSprint } from '../../../core/audhd/FocusSprint';
import { commandRegistry } from '../commands';
import { codeExecutor } from '../../../tools/CodeExecutor';
import { quizGenerator } from '../../../tools/QuizGenerator';
import { getPathById, type LearningPath } from '../../../data/learningPaths';
import { secureStorage } from '../../../storage/SecureStorage';
import { getHint, hasActiveExercise, isHintRequest } from '../commands/practice';
import { onProfileUpdated } from '../terminalEvents';

// Initialize services
const db = CentopeiaDatabase.getInstance();
const contextManager = new ContextManager();

const ENV_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
console.log('[ENV] API Key disponible:', ENV_API_KEY ? '✅ SÍ' : '❌ NO');

export interface UseTerminalReturn {
  messages: TerminalMessage[];
  isTyping: boolean;
  llmClient: LLMClient | null;
  currentSession: StudySession | null;
  isInitialized: boolean;
  completedModules: number;
  selectedPath: LearningPath | null;
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

// Sanitize user input (minimal). Rendering already escapes HTML in OutputBuffer.
const sanitizeInput = (input: string): string => {
  // Remove null bytes
  let sanitized = input.replace(/\x00/g, '');

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
  // State management - start with welcome message
  const [messages, setMessages] = useState<TerminalMessage[]>(() => {
    // Check if we're in a new session or returning
    const hasExistingSession = sessionStorage.getItem('centopeia_session_active');
    if (!hasExistingSession) {
      sessionStorage.setItem('centopeia_session_active', 'true');
      return [{
        id: generateId(),
        role: 'system',
        content: WelcomeMessage(),
        timestamp: new Date().toISOString(),
        type: 'success',
      }];
    }
    return [];
  });
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
          const profile = await db.getOrCreateUserProfile();
          if (profile?.roleFocus && profile.roleFocus !== 'exploring') {
            const roleToPath: Record<string, 'qa' | 'developer' | 'data-analyst'> = {
              qa_tester: 'qa',
              developer: 'developer',
              analyst: 'data-analyst',
            };
            const path = getPathById(roleToPath[profile.roleFocus]);
            if (path) {
              setSelectedPath(path);
            }
          }

          // ACTIVAR LLM CON ENV API KEY O STORAGE
          const storedKey = await secureStorage.getApiKey();
          const apiKey = ENV_API_KEY || storedKey || '';
          if (apiKey) {
            const client = new LLMClient({ apiKey });
            setLlmClient(client);
            console.log('[LLM] ✅ API key cargada (env o storage)');
          } else {
            console.log('[LLM] ⚠️ Sin API key configurada');
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

  // Sync selected path when profile changes from terminal commands
  useEffect(() => {
    const unsubscribe = onProfileUpdated(async (event) => {
      try {
        const profile = await db.getOrCreateUserProfile();
        const roleToPath: Record<string, 'qa' | 'developer' | 'data-analyst'> = {
          qa_tester: 'qa',
          developer: 'developer',
          analyst: 'data-analyst',
        };
        const pathId = event.pathId || roleToPath[profile.roleFocus];
        const path = pathId ? getPathById(pathId) : undefined;
        if (path) {
          setSelectedPath(path);
        }
      } catch (error) {
        console.error('[Terminal] Error syncing profile:', error);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save message to database - NO useCallback to avoid stale closures
  const saveMessage = async (message: TerminalMessage) => {
    if (currentSession) {
      await db.addConversation(currentSession.id, message);
    }
  };

  // Add assistant message to state and save to DB
  const addAssistantMessage = (
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
  };

  // Check if input is a code block
  const isCodeBlock = (input: string): boolean => {
    return input.trim().startsWith('```') && input.trim().endsWith('```');
  };

  // Extract code from markdown block
  const extractCode = (input: string): { language: string; code: string } => {
    const trimmed = input.trim();
    const lines = trimmed.split('\n');

    const firstLine = lines[0].replace('```', '').trim();
    const language = firstLine || 'python';

    const codeLines = lines.slice(1, -1);
    const code = codeLines.join('\n');

    return { language, code };
  };

  // Execute code block
  const handleCodeExecution = async (input: string): Promise<string> => {
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
  };

  // Extract concept from user input
  const extractConcept = (input: string): string | null => {
    const conceptPatterns = [
      /(?:qué es|qué son|explica|dime sobre)\s+(\w+)/i,
      /(?:cómo funciona|cómo usar|cómo hacer)\s+(\w+)/i,
    ];

    for (const pattern of conceptPatterns) {
      const match = input.match(pattern);
      if (match) return match[1].toLowerCase();
    }

    return null;
  };

  // Process input with LLM
  const processWithLLM = async (input: string, baseMessages: TerminalMessage[]) => {
    // USAR API KEY DEL ENV SIEMPRE
    let client = llmClient;
    
    if (!client) {
      const storedKey = await secureStorage.getApiKey();
      const apiKey = ENV_API_KEY || storedKey || '';
      if (apiKey) {
        client = new LLMClient({ apiKey });
        setLlmClient(client);
        console.log('[LLM] ✅ Usando API key (env o storage)');
      }
    }
    
    if (client && !llmClient) {
      setLlmClient(client);
    }

    if (!client) {
      // Quick responses for common questions without LLM
      const quickResponses: Record<string, string> = {
        hola: '¡Hola! Soy Centopeia, tu tutor técnico. ¿Qué te gustaría aprender hoy?\n\nEscribe /role para elegir tu path (QA, Developer, o Data Analyst).',
        help: 'Escribe /help para ver todos los comandos disponibles.',
        sql: 'SQL es un lenguaje para bases de datos. ¿Quieres empezar con SELECT básico?\n\nEscribe /learn sql para comenzar el módulo.',
        python:
          'Python es un lenguaje versátil. ¿Prefieres empezar con sintaxis básica o ir directo a ejercicios?\n\nEscribe /practice python para ejercicios prácticos.',
      };

      const lowerInput = input.toLowerCase();
      let response = quickResponses[lowerInput];

      if (!response) {
        response = `[yellow]Modo local activo.[/yellow]\n\nPara respuestas con IA, agrega tu API key al archivo .env.local:\nVITE_GROQ_API_KEY=tu_key_aqui\n\nObtén una gratis en: https://console.groq.com`;
      }

      addAssistantMessage(response);
      return;
    }

    try {
      console.log('[LLM] Enviando mensaje a Groq...');
      // Agregar indicador temporal
      const tempId = generateId();
      setMessages(prev => [...prev, {
        id: tempId,
        role: 'assistant',
        content: '[dim]⏱️ Pensando...[/dim]',
        timestamp: new Date().toISOString(),
        type: 'text',
      }]);
      
      // Get user profile for role context
      const profile = await db.getOrCreateUserProfile();
      const userRole = profile?.roleFocus || 'exploring';

      // Build context
      const contextWindow = contextManager.buildContextWindow(baseMessages);
      const enhancedMessages = contextManager.enhanceWithContext(contextWindow.messages, input);

      console.log('[LLM] Mensajes enviados:', enhancedMessages.length);
      
      // Get response from LLM with dynamic prompting
      const startTime = Date.now();
      const response = await client.sendMessage({
        messages: enhancedMessages,
        role: userRole,
        context: {
          sessionId: currentSession?.id,
          userRole,
          messageCount: baseMessages.length,
          currentTopic: currentSession?.lastTopic,
        },
      });
      const elapsed = Date.now() - startTime;
      
      console.log('[LLM] Respuesta recibida en', elapsed, 'ms');
      console.log('[LLM] Respuesta:', response.substring(0, 100) + '...');

      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== '[dim]⏱️ Pensando...[/dim]');
        return [...filtered, {
          id: generateId(),
          role: 'assistant',
          content: response + `\n\n[dim]⏱️ ${elapsed}ms[/dim]`,
          timestamp: new Date().toISOString(),
          type: 'text',
        }];
      });

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
  };

  // Main command handler
  const handleCommand = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // ACTIVAR LLM CON ENV API KEY O STORAGE SI NO ESTÁ ACTIVO
    if (!llmClient) {
      const storedKey = await secureStorage.getApiKey();
      const apiKey = ENV_API_KEY || storedKey || '';
      if (apiKey) {
        const client = new LLMClient({ apiKey });
        setLlmClient(client);
        console.log('[LLM] ✅ API key activada (env o storage)');
      }
    }

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
      // Parse command using raw input (avoid breaking slashes)
      const parts = trimmed.split(' ');
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
        // If in active practice, route code blocks to /practice
        if (currentSession?.id && hasActiveExercise(currentSession.id) && isCodeBlock(trimmed)) {
          const response = await commandRegistry['/practice']([trimmed], { sessionId: currentSession.id });
          addAssistantMessage(response);
          setIsTyping(false);
          return;
        }

        // Hint handling during practice
        if (currentSession?.id && hasActiveExercise(currentSession.id) && isHintRequest(trimmed)) {
          const hint = await getHint(currentSession.id);
          addAssistantMessage(hint);
          setIsTyping(false);
          return;
        }

        // Execute standalone code blocks (no active practice)
        if (isCodeBlock(trimmed)) {
          const response = await handleCodeExecution(trimmed);
          addAssistantMessage(response);
          setIsTyping(false);
          return;
        }

        // Check if there's an active quiz
        if (currentSession?.id && quizGenerator.getCurrentQuestion(currentSession.id)) {
          // Treat as quiz answer
          const response = await commandRegistry['/quiz']([trimmed], { sessionId: currentSession.id });
          addAssistantMessage(response);
        } else {
          // Process with LLM using sanitized input
          const nextMessages = [...messages, userMsg];
          await processWithLLM(sanitizedInput, nextMessages);
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
  };

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
    selectedPath,
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
