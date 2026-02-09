import { useState, useEffect, Suspense, lazy } from 'react';
import { Terminal } from './ui/terminal/Terminal';
import { ErrorBoundary } from './ui/components/ErrorBoundary';
import { usePyodidePreload } from './hooks/usePyodidePreload';
import { useResponsive } from './hooks/useResponsive';
import { LeftPanel } from './ui/components/LeftPanel';
import { RightPanel } from './ui/components/RightPanel';

// Lazy loaded components
const PathSelector = lazy(() => import('./ui/components/PathSelector').then(m => ({ default: m.PathSelector })));
const LearningPathView = lazy(() => import('./ui/components/LearningPathView').then(m => ({ default: m.LearningPathView })));
import { LEARNING_PATHS, getPathById, getNextModule, findModuleById } from './data/learningPaths';
import type { LearningPath, MicroModule } from './data/learningPaths';
import type { UserProfile } from './types';
import { useKeyboardShortcuts } from './hooks/usePlatform';
import { CentopeiaDatabase } from './storage/Database';
import { emitTerminalCommand, onProfileUpdated, emitProfileUpdated } from './ui/terminal/terminalEvents';
import { BookOpen, Target, BarChart3, Code, ArrowLeft } from 'lucide-react';

const db = CentopeiaDatabase.getInstance();

type View = 'paths' | 'learn' | 'path-detail' | 'terminal' | 'stats';

function App() {
  const [currentView, setCurrentView] = useState<View>('terminal');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const { isDesktop } = useResponsive();
  const { isPreloaded, isPreloading } = usePyodidePreload(3000);

  // Stats for panels
  const [stats, setStats] = useState({
    completedModules: 0,
    totalStudyTime: 0,
    currentStreak: 1,
  });

  const applyProgressToPath = (
    path: LearningPath,
    progress: { moduleId: string; status: 'locked' | 'available' | 'in_progress' | 'completed' }[],
    unlockNext: boolean = false
  ): LearningPath => {
    const progressMap = new Map(progress.map(p => [p.moduleId, p.status]));
    const updatedSkills = path.skills.map(skill => {
      const updatedModules = skill.modules.map((module) => {
        const status = progressMap.get(module.id);
        return status ? { ...module, status } : module;
      });

      if (unlockNext) {
        for (let i = 0; i < updatedModules.length - 1; i++) {
          if (updatedModules[i].status === 'completed' && updatedModules[i + 1].status === 'locked') {
            updatedModules[i + 1] = { ...updatedModules[i + 1], status: 'available' };
            break;
          }
        }
      }

      return { ...skill, modules: updatedModules };
    });

    return { ...path, skills: updatedSkills };
  };

  // Load stats from database
  useEffect(() => {
    const loadStats = async () => {
      try {
        const completed = await db.getCompletedModulesCount();
        const totalTime = await db.getTotalStudyTime();
        setStats({
          completedModules: completed,
          totalStudyTime: totalTime,
          currentStreak: 1, // TODO: Implement streak tracking
        });
      } catch (error) {
        console.error('[App] Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  const refreshStats = async () => {
    try {
      const completed = await db.getCompletedModulesCount();
      const totalTime = await db.getTotalStudyTime();
      setStats({
        completedModules: completed,
        totalStudyTime: totalTime,
        currentStreak: 1,
      });
    } catch (error) {
      console.error('[App] Error refreshing stats:', error);
    }
  };

  // Initialize app
  useEffect(() => {
    let isCancelled = false;
    
    const init = async () => {
      try {
        await db.initialize();
        
        const profile = await db.getOrCreateUserProfile();
        if (!isCancelled) {
          if (profile?.roleFocus && profile.roleFocus !== 'exploring') {
            const roleToPath: Record<UserProfile['roleFocus'], LearningPath['id'] | null> = {
              qa_tester: 'qa',
              developer: 'developer',
              analyst: 'data-analyst',
              exploring: null,
            };
            const pathId = roleToPath[profile.roleFocus];
            const rawPath = pathId ? getPathById(pathId) : undefined;
            const savedPath = rawPath ? applyProgressToPath(rawPath, await db.getPathProgress(rawPath.id)) : undefined;
            if (savedPath) {
              setSelectedPath(savedPath);
            }
          }
          
          setUserProfile(profile);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[App] Initialization error:', error);
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // React to profile updates from terminal commands
  useEffect(() => {
    const unsubscribe = onProfileUpdated(async (event) => {
      try {
        const profile = await db.getOrCreateUserProfile();
        setUserProfile(profile);

        const roleToPath: Record<UserProfile['roleFocus'], LearningPath['id'] | null> = {
          qa_tester: 'qa',
          developer: 'developer',
          analyst: 'data-analyst',
          exploring: null,
        };
        const pathId = event.pathId || roleToPath[profile.roleFocus];
        const rawPath = pathId ? getPathById(pathId) : undefined;
        const path = rawPath ? applyProgressToPath(rawPath, await db.getPathProgress(rawPath.id)) : undefined;
        setSelectedPath(path || null);
      } catch (error) {
        console.error('[App] Error syncing profile:', error);
      }
    });
    return () => unsubscribe();
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+1': () => setCurrentView('terminal'),
    'ctrl+2': () => setCurrentView('paths'),
    'ctrl+3': () => selectedPath && setCurrentView('learn'),
    'ctrl+4': () => setCurrentView('stats'),
    'escape': () => {
      if (currentView === 'path-detail') {
        setCurrentView('paths');
      }
    },
  });

  const handleSelectPath = async (path: LearningPath) => {
    const progress = await db.getPathProgress(path.id);
    setSelectedPath(applyProgressToPath(path, progress));
    
    const profile = userProfile ?? await db.getOrCreateUserProfile();
    const roleMap: Record<string, 'qa_tester' | 'analyst' | 'developer'> = {
      'qa': 'qa_tester',
      'developer': 'developer',
      'data-analyst': 'analyst',
    };
    const nextRole = roleMap[path.id] || 'developer';
    await db.setUserProfile({ ...profile, roleFocus: nextRole });
    setUserProfile({ ...profile, roleFocus: nextRole });
    emitProfileUpdated({ roleFocus: nextRole, pathId: path.id });
    
    setCurrentView('learn');
  };

  const handleStartModule = (module: { id: string; title: string }) => {
    console.debug('[App] Módulo iniciado:', module.id);
    setCurrentView('learn');
    void markModuleInProgress(module.id);
    emitTerminalCommand(`/module ${module.id}`);
  };

  const handleCommand = (command: string) => {
    console.log('[App] Quick action command:', command);
    setCurrentView('terminal');
    emitTerminalCommand(command);
  };

  const handleStartSprint = (minutes: number) => {
    console.log('[App] Start sprint:', minutes, 'minutes');
    setCurrentView('terminal');
    emitTerminalCommand(`/focus ${minutes}`);
  };

  const markModuleInProgress = async (moduleId: string) => {
    const found = findModuleById(moduleId);
    if (!found) return;
    const { pathId, skillId, module } = found;
    await db.saveModuleProgress({
      moduleId: module.id,
      skillId,
      pathId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    });
    if (selectedPath && selectedPath.id === pathId) {
      const progress = await db.getPathProgress(pathId);
      setSelectedPath(applyProgressToPath(selectedPath, progress));
    }
  };

  const markModuleCompleted = async (moduleId: string) => {
    const found = findModuleById(moduleId);
    if (!found) return;
    const { pathId, skillId, module } = found;
    await db.saveModuleProgress({
      moduleId: module.id,
      skillId,
      pathId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      timeSpentMinutes: module.duration,
    });
    if (selectedPath && selectedPath.id === pathId) {
      const progress = await db.getPathProgress(pathId);
      setSelectedPath(applyProgressToPath(selectedPath, progress, true));
    }
    await refreshStats();
  };

  // Get next module for RightPanel
  const getNextModuleForPath = (): MicroModule | null => {
    if (!selectedPath) return null;
    return getNextModule(selectedPath);
  };

  // Calculate total modules for current path
  const getTotalModulesForPath = (): number => {
    if (!selectedPath) return 0;
    return selectedPath.skills.reduce((total, skill) => total + skill.modules.length, 0);
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'paths':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <div className="h-full overflow-y-auto">
              <PathSelector
                paths={Object.values(LEARNING_PATHS)}
                selectedPathId={selectedPath?.id}
                onSelectPath={handleSelectPath}
              />
            </div>
          </Suspense>
        );
        
      case 'learn':
        if (!selectedPath) {
          return (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <Target className="w-16 h-16 text-hacker-textDim mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-hacker-text mb-2">
                  Selecciona una ruta primero
                </h2>
                <p className="text-hacker-textMuted mb-6">
                  Necesitas elegir un rol profesional antes de comenzar a aprender.
                </p>
                <button
                  onClick={() => setCurrentView('paths')}
                  className="px-6 py-3 bg-hacker-primary text-hacker-bg font-bold rounded-xl
                           hover:bg-hacker-primaryDim transition-colors"
                >
                  Ver rutas disponibles
                </button>
              </div>
            </div>
          );
        }
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LearningPathView
              path={selectedPath}
              onStartModule={handleStartModule}
              onCompleteModule={(module) => void markModuleCompleted(module.id)}
            />
          </Suspense>
        );
        
      case 'stats':
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-hacker-textDim mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-hacker-text mb-2">
                Estadísticas detalladas
              </h2>
              <p className="text-hacker-textMuted">
                Próximamente: Dashboard completo de progreso
              </p>
            </div>
          </div>
        );
        
      case 'terminal':
      default:
        return <Terminal />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-hacker-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-hacker-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-hacker-primary font-mono mb-2">Iniciando Centopeia...</p>
          <p className="text-hacker-textMuted text-sm">
            {isPreloaded 
              ? '✓ Python runtime listo' 
              : isPreloading 
                ? 'Cargando Python runtime...' 
                : 'Cargando módulos de tutoría'}
          </p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    setCurrentView('terminal');
    window.location.reload();
  };

  return (
    <ErrorBoundary onReset={handleReset}>
      <div className="h-screen w-screen bg-hacker-bg overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-hacker-bgSecondary border-b border-hacker-border px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              <h1 
                className="font-bold text-hacker-primary text-lg lg:text-xl cursor-pointer hover:text-hacker-primaryDim transition-colors"
                onClick={() => setCurrentView('terminal')}
                title="Ir al inicio"
              >
                CENTOPEIA
              </h1>
              {isDesktop && (
                <>
                  <span className="text-hacker-textDim">|</span>
                  <span className="text-hacker-textMuted">
                    {currentView === 'terminal' && 'Terminal Interactiva'}
                    {currentView === 'paths' && 'Selección de Rol'}
                    {currentView === 'learn' && selectedPath && `Aprendiendo: ${selectedPath.title}`}
                    {currentView === 'stats' && 'Estadísticas'}
                  </span>
                </>
              )}
            </div>
            
            {selectedPath && (
              <div className="flex items-center gap-3">
                {isDesktop && (
                  <div 
                    className="px-3 py-1 rounded-full text-sm font-medium hidden lg:block"
                    style={{ 
                      backgroundColor: `${selectedPath.color}20`,
                      color: selectedPath.color 
                    }}
                  >
                    {selectedPath.title}
                  </div>
                )}
                <button
                  onClick={() => setCurrentView('paths')}
                  className="text-sm text-hacker-textMuted flex items-center gap-1 hover:text-hacker-text transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden lg:inline">Cambiar</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main content area - 3 columns on desktop */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - only desktop */}
          {isDesktop && (
            <LeftPanel 
              completedModules={stats.completedModules}
              totalStudyTime={stats.totalStudyTime}
              currentStreak={stats.currentStreak}
              onStartSprint={handleStartSprint}
              onQuickAction={(command) => handleCommand(command)}
            />
          )}
          
          {/* Center content */}
          <main className="flex-1 overflow-hidden">
            {renderContent()}
          </main>
          
          {/* Right Panel - only desktop */}
          {isDesktop && (
            <RightPanel
              selectedPath={selectedPath}
              completedModules={stats.completedModules}
              totalModules={getTotalModulesForPath()}
              nextModule={getNextModuleForPath()}
              onStartModule={(moduleId) => handleStartModule({ id: moduleId, title: '' })}
              onViewPath={() => setCurrentView('paths')}
            />
          )}
        </div>
        
        {/* Bottom Navigation - only mobile */}
        {!isDesktop && (
          <nav className="bg-hacker-bgSecondary border-t border-hacker-border pb-safe-b">
            <div className="flex justify-around items-center h-16">
              <NavButton
                icon={Code}
                label="Terminal"
                isActive={currentView === 'terminal'}
                onClick={() => setCurrentView('terminal')}
              />
              <NavButton
                icon={BookOpen}
                label={selectedPath ? 'Mi Ruta' : 'Rutas'}
                isActive={currentView === 'learn' || currentView === 'paths'}
                onClick={() => setCurrentView(selectedPath ? 'learn' : 'paths')}
              />
              <NavButton
                icon={BarChart3}
                label="Progreso"
                isActive={currentView === 'stats'}
                onClick={() => setCurrentView('stats')}
              />
            </div>
          </nav>
        )}
      </div>
    </ErrorBoundary>
  );
}

// Loading fallback component for lazy loaded components
function LoadingFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-hacker-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-hacker-primary font-mono">Cargando...</p>
      </div>
    </div>
  );
}

// Mobile nav button component
function NavButton({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 h-full
                 transition-colors duration-200 min-h-[44px]
                 ${isActive ? 'text-hacker-primary' : 'text-hacker-textMuted'}`}
      aria-label={label}
    >
      <Icon className="w-5 h-5 mb-1" aria-hidden="true" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default App;
