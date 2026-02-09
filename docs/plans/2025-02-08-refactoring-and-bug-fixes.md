# Centopeia Tutor - Refactoring & Bug Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Aplicar los 5 fixes identificados mientras se realiza auditoría continua para detectar bugs adicionales.

**Architecture:** Descomponer Terminal.tsx en componentes pequeños, implementar inyección de dependencias para Database, agregar React Query, error tracking y preload de Pyodide.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind, Capacitor, React Query

---

## FIX 1: Componentización de Terminal.tsx

**Archivos:**
- Crear: `src/ui/terminal/TerminalView.tsx`
- Crear: `src/ui/terminal/TerminalInput.tsx`
- Crear: `src/ui/terminal/TerminalOutput.tsx`
- Crear: `src/ui/terminal/TerminalHeader.tsx`
- Crear: `src/ui/terminal/WelcomeMessage.tsx`
- Crear: `src/ui/terminal/hooks/useTerminal.ts`
- Crear: `src/ui/terminal/hooks/useCommands.ts`
- Modificar: `src/ui/terminal/Terminal.tsx` (refactor completo)

### Task 1.1: Crear hook useTerminal

**Step 1: Escribir hook useTerminal.ts**

```typescript
// src/ui/terminal/hooks/useTerminal.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import type { TerminalMessage, StudySession } from '../../../types';
import { generateId } from '../../../utils/idGenerator';
import { LLMClient } from '../../../core/agent/LLMClient';
import { ContextManager } from '../../../core/agent/ContextManager';
import { CentopeiaDatabase } from '../../../storage/Database';
import { secureStorage } from '../../../storage/SecureStorage';
import { codeExecutor } from '../../../tools/CodeExecutor';
import { quizGenerator } from '../../../tools/QuizGenerator';
import { useFocusSprint } from '../../../core/audhd/FocusSprint';

const db = CentopeiaDatabase.getInstance();
const contextManager = new ContextManager();

export interface UseTerminalReturn {
  messages: TerminalMessage[];
  isTyping: boolean;
  llmClient: LLMClient | null;
  currentSession: StudySession | null;
  isInitialized: boolean;
  completedModules: number;
  focusSprint: ReturnType<typeof useFocusSprint>;
  handleCommand: (input: string) => Promise<void>;
  addAssistantMessage: (content: string, type?: 'text' | 'code' | 'error' | 'success' | 'warning') => void;
  initialize: () => Promise<void>;
}

export function useTerminal(): UseTerminalReturn {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [llmClient, setLlmClient] = useState<LLMClient | null>(null);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [completedModules, setCompletedModules] = useState(0);

  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const focusSprint = useFocusSprint();

  // Inicialización
  const initialize = useCallback(async () => {
    try {
      await db.initialize();

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
      setCurrentSession(session);
      contextManager.setSession(session);

      const apiKey = await secureStorage.getApiKey();
      if (apiKey) {
        setLlmClient(new LLMClient({ apiKey }));
      }

      const completedCount = await db.getCompletedModulesCount();
      setCompletedModules(completedCount);

      setIsInitialized(true);
    } catch (error) {
      console.error('Initialization error:', error);
      setIsInitialized(true);
    }
  }, []);

  // Guardar mensaje en DB
  const saveMessage = useCallback(async (message: TerminalMessage) => {
    if (currentSession) {
      await db.addConversation(currentSession.id, message);
    }
  }, [currentSession]);

  // Agregar mensaje del assistant
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

  // Procesar con LLM
  const processWithLLM = useCallback(async (input: string) => {
    // Implementación...
  }, [llmClient, currentSession]);

  // Manejar comando
  const handleCommand = useCallback(async (input: string) => {
    // Implementación completa extraída de Terminal.tsx
  }, []);

  return {
    messages,
    isTyping,
    llmClient,
    currentSession,
    isInitialized,
    completedModules,
    focusSprint,
    handleCommand,
    addAssistantMessage,
    initialize,
  };
}
```

**Step 2: Commit**

```bash
git add src/ui/terminal/hooks/useTerminal.ts
git commit -m "feat(terminal): add useTerminal hook for state management"
```

---

## FIX 2: Agregar React Query para Data Fetching

**Archivos:**
- Crear: `src/hooks/useDatabase.ts`
- Modificar: `src/main.tsx`
- Modificar: `src/App.tsx`
- Agregar dependencia: `@tanstack/react-query`

### Task 2.1: Instalar React Query

**Step 1: Instalar dependencia**

```bash
cd centopeia-tutor && npm install @tanstack/react-query
```

**Step 2: Crear hook useDatabase**

```typescript
// src/hooks/useDatabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CentopeiaDatabase } from '../storage/Database';
import type { UserProfile, StudySession } from '../types';

const db = CentopeiaDatabase.getInstance();

export const databaseKeys = {
  all: ['database'] as const,
  profile: () => [...databaseKeys.all, 'profile'] as const,
  session: (id: string) => [...databaseKeys.all, 'session', id] as const,
  conversations: (sessionId: string) => [...databaseKeys.all, 'conversations', sessionId] as const,
  progress: () => [...databaseKeys.all, 'progress'] as const,
  completedModules: () => [...databaseKeys.all, 'completedModules'] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: databaseKeys.profile(),
    queryFn: () => db.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useStudySession(sessionId: string) {
  return useQuery({
    queryKey: databaseKeys.session(sessionId),
    queryFn: () => db.getStudySession(sessionId),
    enabled: !!sessionId,
  });
}

export function useConversations(sessionId: string) {
  return useQuery({
    queryKey: databaseKeys.conversations(sessionId),
    queryFn: () => db.getConversations(sessionId),
    enabled: !!sessionId,
  });
}

export function useCompletedModules() {
  return useQuery({
    queryKey: databaseKeys.completedModules(),
    queryFn: () => db.getCompletedModulesCount(),
  });
}

export function useSaveStudySession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (session: StudySession) => db.saveStudySession(session),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.session(variables.id) });
    },
  });
}

export function useSetUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profile: UserProfile) => db.setUserProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.profile() });
    },
  });
}
```

**Step 3: Configurar QueryClient en main.tsx**

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000,   // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

**Step 4: Commit**

```bash
git add src/hooks/useDatabase.ts src/main.tsx package.json package-lock.json
git commit -m "feat(database): add React Query for data fetching and caching"
```

---

## FIX 3: Implementar Error Tracking con Sentry

**Archivos:**
- Modificar: `src/main.tsx`
- Modificar: `src/ui/components/ErrorBoundary.tsx`
- Agregar dependencia: `@sentry/react`

### Task 3.1: Instalar Sentry

**Step 1: Instalar dependencia**

```bash
cd centopeia-tutor && npm install @sentry/react
```

**Step 2: Configurar Sentry**

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

// Inicializar Sentry en producción
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

**Step 3: Actualizar ErrorBoundary para reportar a Sentry**

```typescript
// src/ui/components/ErrorBoundary.tsx
import { Component, ReactNode, ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    
    // Reportar a Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-hacker-bg flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Algo salió mal
            </h2>
            <p className="text-hacker-textMuted mb-6">
              Ha ocurrido un error inesperado. El equipo ha sido notificado.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-hacker-primary text-hacker-bg font-bold rounded-xl hover:bg-hacker-primaryDim transition-colors"
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 4: Commit**

```bash
git add src/main.tsx src/ui/components/ErrorBoundary.tsx package.json package-lock.json
git commit -m "feat(errors): add Sentry error tracking and enhanced error boundary"
```

---

## FIX 4: Pre-cargar Pyodide en Background

**Archivos:**
- Crear: `src/hooks/usePyodidePreload.ts`
- Modificar: `src/App.tsx`

### Task 4.1: Crear hook de preload

**Step 1: Crear usePyodidePreload.ts**

```typescript
// src/hooks/usePyodidePreload.ts
import { useEffect, useState } from 'react';
import { codeExecutor } from '../tools/CodeExecutor';

export function usePyodidePreload() {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [preloadError, setPreloadError] = useState<Error | null>(null);

  useEffect(() => {
    // Pre-cargar Pyodide silenciosamente después de que la app esté lista
    const timer = setTimeout(async () => {
      try {
        console.log('[Pyodide] Preloading in background...');
        await codeExecutor.initialize();
        console.log('[Pyodide] Preload complete');
        setIsPreloaded(true);
      } catch (error) {
        console.warn('[Pyodide] Preload failed (will retry on first use):', error);
        setPreloadError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }, 2000); // Esperar 2 segundos después de montaje

    return () => clearTimeout(timer);
  }, []);

  return { isPreloaded, preloadError };
}
```

**Step 2: Integrar en App.tsx**

```typescript
// src/App.tsx
import { usePyodidePreload } from './hooks/usePyodidePreload';

function App() {
  // ... estado existente ...
  const { isPreloaded } = usePyodidePreload();

  // Añadir indicador en loading screen
  const getLoadingMessage = () => {
    if (isPreloaded) return 'Pyodide listo';
    return 'Cargando módulos...';
  };

  // ... resto del componente ...
}
```

**Step 3: Commit**

```bash
git add src/hooks/usePyodidePreload.ts src/App.tsx
git commit -m "feat(pyodide): add background preloading for better UX"
```

---

## FIX 5: Refactor de Database a Inyección de Dependencias (Opcional/Futuro)

**Archivos:**
- Crear: `src/storage/Database.interface.ts`
- Modificar: `src/storage/Database.ts`
- Modificar: `src/hooks/useDatabase.ts`

**Nota:** Este fix es más invasivo y puede romper compatibilidad. Debe hacerse con cuidado.

---

## AUDITORÍA CONTINUA - Issues Encontrados

### Issue A1: Token Estimation Inaccurate
**Ubicación:** `src/core/agent/ContextManager.ts:72-74`

```typescript
// Actual: naive 4 chars = 1 token
const totalTokens = recent.reduce((acc, msg) => {
  return acc + Math.ceil(msg.content.length / 4);
}, 0);

// Mejor: tiktoken o aproximación más precisa
const estimateTokens = (text: string): number => {
  // Aproximación más realista: ~1.3 tokens por palabra en español/inglés
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount * 1.3);
};
```

### Issue A2: Race Condition en FocusSprint
**Ubicación:** `src/core/audhd/FocusSprint.ts:191-210`

```typescript
// Problema: setInterval con setState puede tener race conditions
intervalRef.current = setInterval(() => {
  setState(prev => {
    if (prev.timeRemaining <= 1) {
      if (prev.isBreak) {
        stopSprint(); // Esto llama a setState mientras otro setState está en progreso
      } else {
        completeSprint();
      }
      return prev;
    }
    return { ...prev, timeRemaining: prev.timeRemaining - 1 };
  });
}, 1000);
```

**Fix:** Extraer lógica a useEffect separado y usar refs.

### Issue A3: Missing Error Handling in Command Registry
**Ubicación:** `src/ui/terminal/commands/index.ts`

Los comandos no tienen try-catch wrapper consistente.

### Issue A4: Memory Leak en useFocusSprint
**Ubicación:** `src/ui/terminal/Terminal.tsx:335-353`

```typescript
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
```

Problema: Si componente se desmonta durante `saveStudySession`, puede haber warning de React.

**Fix:** Usar abort controller o cleanup flag.

### Issue A5: Input Sanitization Missing
**Ubicación:** `src/ui/terminal/Terminal.tsx:222`

```typescript
const parts = input.trim().split(' ');
// No hay sanitización de caracteres especiales o XSS
```

### Issue A6: WelcomeMessage se recrea en cada render
**Ubicación:** `src/ui/terminal/Terminal.tsx:24-43`

```typescript
// Actual: función que retorna string (recreada cada vez)
const WelcomeMessage = () => `
╔══════════════════════════════════════════════════════════════╗
...
`;

// Mejor: constante estática fuera del componente
const WELCOME_MESSAGE = `...`;
```

### Issue A7: Duplicate Database Initialization
**Ubicación:** `src/App.tsx:35` y `src/ui/terminal/Terminal.tsx:84`

Ambos inicializan la base de datos, causando posible duplicación.

**Fix:** Mover inicialización a App.tsx solamente.

---

## TESTING PLAN

### Tests para React Query hooks

```typescript
// src/hooks/__tests__/useDatabase.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile } from '../useDatabase';

// Mock del database
vi.mock('../../storage/Database', () => ({
  CentopeiaDatabase: {
    getInstance: () => ({
      getUserProfile: vi.fn(),
    }),
  },
}));

describe('useUserProfile', () => {
  it('should fetch user profile', async () => {
    const { result } = renderHook(() => useUserProfile(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

---

## COMPLETION CHECKLIST

- [ ] FIX 1: Terminal componentizado (useTerminal hook creado)
- [ ] FIX 2: React Query implementado
- [ ] FIX 3: Sentry error tracking agregado
- [ ] FIX 4: Pyodide preloading implementado
- [ ] FIX 5: Database DI (opcional)
- [ ] Issue A1: Token estimation fix
- [ ] Issue A2: FocusSprint race condition fix
- [ ] Issue A3: Command error handling
- [ ] Issue A4: Memory leak fix
- [ ] Issue A5: Input sanitization
- [ ] Issue A6: WelcomeMessage memoization
- [ ] Issue A7: Duplicate init fix
- [ ] Tests para nuevos hooks
- [ ] Build pasa sin errores
- [ ] App funciona en modo demo
