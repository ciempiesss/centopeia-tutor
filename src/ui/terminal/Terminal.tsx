import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { TerminalMessage, StudySession } from '../../types';
import { InputLine } from './InputLine';
import { OutputBuffer } from './OutputBuffer';
import { StatusBar } from './StatusBar';
import { useFocusSprint } from '../../core/audhd/FocusSprint';
import { TerminalHome, InterviewMode } from './TerminalHome';
import type { LearningPath } from '../../data/learningPaths';
import { commandRegistry } from './commands';
import { LLMClient } from '../../core/agent/LLMClient';
import { ContextManager } from '../../core/agent/ContextManager';
import { CentopeiaDatabase } from '../../storage/Database';
import { secureStorage } from '../../storage/SecureStorage';
import { codeExecutor } from '../../tools/CodeExecutor';
import { quizGenerator } from '../../tools/QuizGenerator';
import { generateId } from '../../utils/idGenerator';
import { Capacitor } from '@capacitor/core';

// Initialize services
const db = CentopeiaDatabase.getInstance();
const contextManager = new ContextManager();

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

export function Terminal() {
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
  const [showHome, setShowHome] = useState(true);
  const [interviewMode, setInterviewMode] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { 
    isActive: isFocusActive, 
    timeRemaining, 
    startSprint, 
    stopSprint,
    extendSprint,
    stats: focusStats 
  } = useFocusSprint();

  // Initialize database and session
  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      try {
        await db.initialize();
        
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
        
        if (!isCancelled) {
          setCurrentSession(session);
          contextManager.setSession(session);
          
          // Check for API key in secure storage
          const apiKey = await secureStorage.getApiKey();
          if (apiKey) {
            setLlmClient(new LLMClient({ apiKey }));
          }
          
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (!isCancelled) {
          addAssistantMessage(
            '[red]Error de inicialización:[/red] Algo salió mal al iniciar. Intenta recargar la app.',
            'error'
          );
        }
      }
    };

    init();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const saveMessage = useCallback(async (message: TerminalMessage) => {
    if (currentSession) {
      await db.addConversation(currentSession.id, message);
    }
  }, [currentSession]);

  const addAssistantMessage = useCallback((content: string, type?: 'text' | 'code' | 'error' | 'success' | 'warning') => {
    const assistantMsg: TerminalMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      type,
    };
    setMessages(prev => [...prev, assistantMsg]);
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

  const handleCommand = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: TerminalMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMsg]);
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

      // Parse command
      const parts = trimmed.split(' ');
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Check if it's a command
      if (command.startsWith('/')) {
        // Hide home when any command is used
        if (showHome) setShowHome(false);
        
        // Handle interview mode
        if (command === '/interview') {
          setInterviewMode(true);
          setIsTyping(false);
          return;
        }
        
        // Handle home command
        if (command === '/home') {
          setShowHome(true);
          setInterviewMode(false);
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
          // Skip quiz here - already handled above
          if (command === '/quiz') {
            return;
          }
          
          // Handle special commands
          if (command === '/focus' || command === '/sprint') {
            const minutes = args[0] ? parseInt(args[0], 10) : 15;
            if (!isNaN(minutes) && minutes > 0 && minutes <= 120) {
              await startSprint(minutes);
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
          addAssistantMessage(`Comando no reconocido: ${command}\n\nEscribe /help para ver los comandos disponibles.`);
        }
      } else {
        // Check if there's an active quiz
        if (currentSession?.id && quizGenerator.getCurrentQuestion(currentSession.id)) {
          // Treat as quiz answer
          const response = await commandRegistry['/quiz']([trimmed], { sessionId: currentSession.id });
          addAssistantMessage(response);
        } else {
          // Process with LLM
          await processWithLLM(trimmed);
        }
      }
    } catch (error) {
      addAssistantMessage(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  }, [addAssistantMessage, currentSession?.id, handleCodeExecution, isCodeBlock, saveMessage, startSprint, stopSprint]);

  const processWithLLM = useCallback(async (input: string) => {
    if (!llmClient) {
      // Use demo mode without LLM
      const demoResponses: Record<string, string> = {
        'hola': '¡Hola! Soy Centopeia, tu tutor técnico. ¿Qué te gustaría aprender hoy?\n\nEscribe /role para elegir tu path (QA, Developer, o Data Analyst).',
        'help': 'Escribe /help para ver todos los comandos disponibles.',
        'sql': 'SQL es un lenguaje para bases de datos. ¿Quieres empezar con SELECT básico?\n\nEscribe /learn sql para comenzar el módulo.',
        'python': 'Python es un lenguaje versátil. ¿Prefieres empezar con sintaxis básica o ir directo a ejercicios?\n\nEscribe /practice python para ejercicios prácticos.',
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
      const enhancedMessages = contextManager.enhanceWithContext(
        contextWindow.messages,
        input
      );

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
  }, [addAssistantMessage, currentSession, llmClient, messages]);

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

  // Update focus sprint in session
  useEffect(() => {
    const updateSession = async () => {
      if (currentSession && !isFocusActive && focusStats.completedToday > 0) {
        currentSession.focusSprintCount = focusStats.completedToday;
        currentSession.totalFocusMinutes = focusStats.totalMinutes;
        await db.saveStudySession(currentSession);
      }
    };

    updateSession();
  }, [isFocusActive, focusStats, currentSession]);

  // Loading state
  if (!isInitialized) {
    return (
      <div className="flex flex-col h-screen bg-hacker-bg text-hacker-text font-mono items-center justify-center">
        <div className="animate-pulse text-hacker-primary text-xl">
          Iniciando Centopeia...
        </div>
        <div className="mt-4 text-hacker-textMuted text-sm">
          Cargando módulos de tutoría
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={terminalRef}
      className="flex flex-col h-screen w-screen bg-hacker-bg text-hacker-text font-mono
                 overflow-hidden safe-area-inset"
      role="main"
      aria-label="Terminal de Centopeia"
    >
      {/* Status Bar */}
      <StatusBar 
        isFocusActive={isFocusActive}
        timeRemaining={timeRemaining}
        focusStats={focusStats}
        messageCount={messages.length}
        llmConnected={!!llmClient}
      />

      {/* Main Content Area */}
      {interviewMode ? (
        <InterviewMode onExit={() => setInterviewMode(false)} />
      ) : showHome ? (
        <div className="flex-1 overflow-y-auto p-4">
          <TerminalHome 
            onCommand={(cmd) => {
              if (cmd === '/interview') {
                setInterviewMode(true);
              } else {
                setShowHome(false);
                handleCommand(cmd);
              }
            }}
            onStartInterview={() => setInterviewMode(true)}
            selectedPath={selectedPath}
          />
        </div>
      ) : (
        <OutputBuffer 
          messages={messages} 
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
      )}

      {/* Input Line - hidden in interview mode */}
      {!interviewMode && (
        <InputLine 
          onSubmit={handleCommand}
          isDisabled={isTyping}
          placeholder={isFocusActive 
            ? "Focus mode activo... escribe /stop para pausar" 
            : showHome 
              ? "O escribe un comando directamente..."
              : "Escribe un comando o bloque de código..."
          }
        />
      )}
    </div>
  );
}
