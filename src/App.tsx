import { useState, useEffect, Suspense, lazy } from 'react';
import { Terminal } from './ui/terminal/Terminal';
import { ErrorBoundary } from './ui/components/ErrorBoundary';

// Lazy loaded components
const PathSelector = lazy(() => import('./ui/components/PathSelector').then(m => ({ default: m.PathSelector })));
const LearningPathView = lazy(() => import('./ui/components/LearningPathView').then(m => ({ default: m.LearningPathView })));
const AdaptiveLayout = lazy(() => import('./ui/components/AdaptiveLayout').then(m => ({ default: m.AdaptiveLayout })));
import { LEARNING_PATHS, getPathById } from './data/learningPaths';
import type { LearningPath, MicroModule } from './data/learningPaths';
import type { UserProfile } from './types';
import { usePlatform, useKeyboardShortcuts } from './hooks/usePlatform';
import { CentopeiaDatabase } from './storage/Database';
import { secureStorage } from './storage/SecureStorage';
import { BookOpen, Target, BarChart3, Code, ArrowLeft } from 'lucide-react';

const db = CentopeiaDatabase.getInstance();

type View = 'paths' | 'learn' | 'path-detail' | 'terminal' | 'stats';

function App() {
  const [currentView, setCurrentView] = useState<View>('terminal');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const { isDesktop } = usePlatform();

  // Initialize app
  useEffect(() => {
    const init = async () => {
      await db.initialize();
      
      // Load saved path selection
      const profile = await db.getUserProfile();
      if (profile?.roleFocus && profile.roleFocus !== 'exploring') {
        const savedPath = getPathById(profile.roleFocus);
        if (savedPath) {
          setSelectedPath(savedPath);
        }
      }
      
      setUserProfile(profile);
      setIsLoading(false);
    };
    
    init();
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
    setSelectedPath(path);
    
    // Save preference - map path.id to roleFocus type
    if (userProfile) {
      const roleMap: Record<string, 'qa_tester' | 'analyst' | 'developer'> = {
        'qa': 'qa_tester',
        'developer': 'developer',
        'data-analyst': 'analyst',
      };
      userProfile.roleFocus = roleMap[path.id] || 'developer';
      await db.setUserProfile(userProfile);
    }
    
    setCurrentView('learn');
  };

  const handleStartModule = (module: { id: string; title: string }) => {
    // Vista de módulo completa pendiente de implementar
    console.debug('[App] Módulo iniciado:', module.id);
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
          <p className="text-hacker-primary font-mono">Iniciando Centopeia...</p>
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
      {!isDesktop ? (
      <div className="h-screen w-screen bg-hacker-bg overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-hacker-bgSecondary border-b border-hacker-border px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-hacker-primary text-lg">CENTOPEIA</h1>
            {selectedPath && currentView !== 'paths' && (
              <button
                onClick={() => setCurrentView('paths')}
                className="text-sm text-hacker-textMuted flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Cambiar rol
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
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
      </div>
    ) : (
    <Suspense fallback={<LoadingFallback />}>
      <AdaptiveLayout>
        <div className="h-full flex flex-col">
        {/* Desktop Header */}
        <header className="bg-hacker-bgSecondary border-b border-hacker-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-bold text-hacker-primary text-xl">CENTOPEIA</h1>
              <span className="text-hacker-textDim">|</span>
              <span className="text-hacker-textMuted">
                {currentView === 'terminal' && 'Terminal Interactiva'}
                {currentView === 'paths' && 'Selección de Rol'}
                {currentView === 'learn' && selectedPath && `Aprendiendo: ${selectedPath.title}`}
                {currentView === 'stats' && 'Estadísticas'}
              </span>
            </div>
            
            {selectedPath && (
              <div className="flex items-center gap-3">
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${selectedPath.color}20`,
                    color: selectedPath.color 
                  }}
                >
                  {selectedPath.title}
                </div>
                <button
                  onClick={() => setCurrentView('paths')}
                  className="text-sm text-hacker-textMuted hover:text-hacker-text transition-colors"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
        </div>
      </AdaptiveLayout>
    </Suspense>
    )}
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
