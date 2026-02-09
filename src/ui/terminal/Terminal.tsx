import { useRef, useEffect, useState, useCallback } from 'react';
import { StatusBar } from './StatusBar';
import { TerminalHome, InterviewMode } from './TerminalHome';
import { TerminalInput } from './components/TerminalInput';
import { TerminalOutput } from './components/TerminalOutput';
import { useTerminal } from './hooks/useTerminal';
import { onTerminalCommand } from './terminalEvents';

export function Terminal() {
  const terminal = useTerminal();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showHome, setShowHome] = useState(true);
  const [interviewMode, setInterviewMode] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(true);

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminal.messages]);

  const handleCommand = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Handle navigation commands
    if (trimmed === '/interview') {
      setInterviewMode(true);
      setShowHome(false);
      return;
    }

    if (trimmed === '/home') {
      setShowHome(true);
      setInterviewMode(false);
      return;
    }

    // Hide home when any command is used
    if (showHome) {
      setShowHome(false);
    }

    await terminal.handleCommand(input);
  }, [showHome, terminal]);

  // Listen for external commands (e.g., UI buttons)
  useEffect(() => {
    const unsubscribe = onTerminalCommand((command) => {
      handleCommand(command);
    });
    return () => unsubscribe();
  }, [handleCommand]);

  const handleHomeCommand = (cmd: string) => {
    if (cmd === '/interview') {
      setInterviewMode(true);
      setShowHome(false);
    } else {
      handleCommand(cmd);
    }
  };

  const handleHomeClick = () => {
    setShowHome(true);
    setInterviewMode(false);
  };

  // Loading state
  if (!terminal.isInitialized) {
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
      className="flex flex-col h-screen w-screen bg-hacker-bg text-hacker-text font-mono
                 overflow-hidden safe-area-inset"
      role="main"
      aria-label="Terminal de Centopeia"
    >
      {/* Status Bar */}
      <StatusBar 
        isFocusActive={terminal.isFocusActive}
        timeRemaining={terminal.timeRemaining}
        focusStats={terminal.focusStats}
        messageCount={terminal.messages.length}
        llmConnected={!!terminal.llmClient}
        onHomeClick={handleHomeClick}
        totalTime={25 * 60}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {interviewMode ? (
          <InterviewMode onExit={() => setInterviewMode(false)} />
        ) : showHome ? (
          <div className="flex-1 overflow-y-auto p-4">
          <TerminalHome 
            onCommand={handleHomeCommand}
            onStartInterview={() => setInterviewMode(true)}
            hasApiKey={!!terminal.llmClient}
            selectedPath={terminal.selectedPath}
            completedModules={terminal.completedModules}
            showGettingStarted={showGettingStarted}
            onDismissGettingStarted={() => setShowGettingStarted(false)}
          />
          </div>
        ) : (
          <TerminalOutput 
            messages={terminal.messages}
            isTyping={terminal.isTyping}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      {/* Input Line - hidden in interview mode */}
      {!interviewMode && (
        <TerminalInput 
          onSubmit={handleCommand}
          isDisabled={terminal.isTyping}
          placeholder={terminal.isFocusActive 
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
