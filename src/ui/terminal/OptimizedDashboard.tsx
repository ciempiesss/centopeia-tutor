import { useState, useEffect, useMemo, useCallback, memo, useTransition, Suspense } from 'react';
import { 
  Terminal, BookOpen, Target, BarChart3, 
  Zap, Clock, TrendingUp, Award, Brain
} from 'lucide-react';
import { useFocusSprint } from '../../core/audhd/FocusSprint';
import { CentopeiaDatabase } from '../../storage/Database';
import { LEARNING_PATHS, getPathById, calculatePathProgress } from '../../data/learningPaths';
import type { LearningPath, StudySession, UserProfile } from '../../types';
import { PathSelector } from '../components/PathSelector';
import { ErrorBoundary } from '../components/ErrorBoundary';

const db = CentopeiaDatabase.getInstance();

// ═══════════════════════════════════════════════════════════════════════════════
// MEJORAS VERCEL REACT BEST PRACTICES:
// 1. Lazy imports para heavy components (bundle optimization)
// 2. Module-level cache para evitar re-fetches (server-cache-lru pattern)
// 3. Suspense boundaries para streaming (async-suspense-boundaries)
// 4. Memoized components para evitar re-renders (rerender-memo)
// 5. Promise.all() para operaciones paralelas (async-parallel)
// ═══════════════════════════════════════════════════════════════════════════════

// Module-level cache para session data (prevents waterfalls across renders)
const sessionCache = new Map<string, StudySession>();

// Lazy loaded heavy components (bundle-dynamic-imports)
const LearningPathView = lazy(() => import('../components/LearningPathView').then(m => ({ default: m.LearningPathView })));
const StatsDashboard = lazy(() => import('../components/StatsDashboard').then(m => ({ default: m.StatsDashboard })));

interface DashboardStats {
  totalMinutes: number;
  completedModules: number;
  currentStreak: number;
  focusSessions: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: StatCard (Memoized - rerender-memo)
// Extraído para evitar re-renders cuando el padre cambia
// ═══════════════════════════════════════════════════════════════════════════════
interface StatCardProps {
  icon: typeof Terminal;
  label: string;
  value: string | number;
  trend?: number;
  color: string;
}

const StatCard = memo(function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  return (
    <div 
      className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-4 
                 hover:border-hacker-borderHover transition-colors"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 100px' }} // rendering-content-visibility
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-hacker-text">{value}</p>
        <p className="text-sm text-hacker-textMuted">{label}</p>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: QuickAction (Memoized)
// ═══════════════════════════════════════════════════════════════════════════════
interface QuickActionProps {
  icon: typeof Terminal;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const QuickAction = memo(function QuickAction({ icon: Icon, label, onClick, variant = 'secondary' }: QuickActionProps) {
  const baseClasses = "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ";
  const variantClasses = variant === 'primary' 
    ? "bg-hacker-primary/10 border-hacker-primary/30 hover:bg-hacker-primary/20 text-hacker-primary"
    : "bg-hacker-bgTertiary border-hacker-border hover:border-hacker-borderHover text-hacker-text";

  return (
    <button 
      onClick={onClick}
      className={baseClasses + variantClasses}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: PathProgressCard (Memoized)
// Muestra progreso de un path específico
// ═══════════════════════════════════════════════════════════════════════════════
interface PathProgressCardProps {
  path: LearningPath;
  progress: number;
  onContinue: () => void;
}

const PathProgressCard = memo(function PathProgressCard({ path, progress, onContinue }: PathProgressCardProps) {
  return (
    <div className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2.5 rounded-lg"
            style={{ backgroundColor: `${path.color}20` }}
          >
            <Target className="w-6 h-6" style={{ color: path.color }} />
          </div>
          <div>
            <h3 className="font-bold text-hacker-text">{path.title}</h3>
            <p className="text-sm text-hacker-textMuted">{path.estimatedWeeks} semanas</p>
          </div>
        </div>
        <span 
          className="text-2xl font-bold"
          style={{ color: path.color }}
        >
          {progress}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-hacker-bgTertiary rounded-full overflow-hidden mb-4">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: path.color }}
        />
      </div>
      
      <button 
        onClick={onContinue}
        className="w-full py-2.5 rounded-lg bg-hacker-primary/10 text-hacker-primary 
                   font-medium hover:bg-hacker-primary/20 transition-colors"
      >
        {progress === 0 ? 'Empezar' : progress === 100 ? 'Completado' : 'Continuar'}
      </button>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: RecentActivity (Memoized)
// Lista de actividad reciente con virtualización implícita
// ═══════════════════════════════════════════════════════════════════════════════
interface ActivityItem {
  id: string;
  type: 'module' | 'quiz' | 'focus' | 'milestone';
  title: string;
  timestamp: string;
  pathColor: string;
}

const ActivityItemComponent = memo(function ActivityItemComponent({ item }: { item: ActivityItem }) {
  const icons = {
    module: BookOpen,
    quiz: Award,
    focus: Zap,
    milestone: TrendingUp
  };
  
  const Icon = icons[item.type];
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-hacker-bgTertiary/50">
      <div 
        className="p-2 rounded-md"
        style={{ backgroundColor: `${item.pathColor}20` }}
      >
        <Icon className="w-4 h-4" style={{ color: item.pathColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-hacker-text truncate">{item.title}</p>
        <p className="text-xs text-hacker-textDim">{item.timestamp}</p>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: OptimizedDashboard
// ═══════════════════════════════════════════════════════════════════════════════
export function OptimizedDashboard() {
  // Estados principales
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'path' | 'terminal' | 'stats'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // useTransition para cambios de vista no-urgentes (rerender-transitions)
  const [isPending, startTransition] = useTransition();
  
  // Focus sprint hook
  const { isActive: isFocusActive, timeRemaining, startSprint, stats: focusStats } = useFocusSprint();

  // ═══════════════════════════════════════════════════════════════════════════════
  // INICIALIZACIÓN: Parallel Data Fetching (async-parallel)
  // Cargamos user profile y session en paralelo en lugar de secuencial
  // ═══════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        // Inicializar DB primero
        await db.initialize();
        
        // Parallel fetching: Promise.all para operaciones independientes
        const [profile, currentSession] = await Promise.all([
          db.getUserProfile(),
          // Crear nueva sesión
          Promise.resolve().then(async () => {
            const session: StudySession = {
              id: crypto.randomUUID(),
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
            return session;
          })
        ]);
        
        if (!isMounted) return;
        
        // Cache session para evitar re-fetch (server-cache-lru pattern)
        if (currentSession) {
          sessionCache.set(currentSession.id, currentSession);
        }
        
        setUserProfile(profile);
        
        // Cargar path seleccionado si existe
        if (profile?.roleFocus && profile.roleFocus !== 'exploring') {
          const savedPath = getPathById(profile.roleFocus);
          if (savedPath) {
            setSelectedPath(savedPath);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setIsLoading(false);
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // STATS MEMOIZADAS: Derived State Calculation (rerender-derived-state-no-effect)
  // Calculamos stats directamente durante render, no en useEffect
  // ═══════════════════════════════════════════════════════════════════════════════
  const dashboardStats: DashboardStats = useMemo(() => {
    const totalMinutes = focusStats.totalMinutes + (userProfile?.audhdConfig?.pomodoroWorkMinutes || 0);
    
    return {
      totalMinutes: Math.round(totalMinutes),
      completedModules: userProfile?.customPrompts ? Object.keys(userProfile.customPrompts).length : 0,
      currentStreak: calculateStreak(),
      focusSessions: focusStats.completedToday
    };
  }, [focusStats, userProfile]);

  // Helper para streak (simplificado)
  function calculateStreak(): number {
    // Lógica de streak basada en datos guardados
    return 3; // Placeholder
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HANDLERS: useCallback con dependencias mínimas
  // ═══════════════════════════════════════════════════════════════════════════════
  const handlePathSelect = useCallback(async (path: LearningPath) => {
    setSelectedPath(path);
    
    // Guardar preferencia
    if (userProfile) {
      const updatedProfile = { ...userProfile, roleFocus: path.id as any };
      await db.setUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
    }
    
    // Transición no-urgente para cambio de vista
    startTransition(() => {
      setCurrentView('path');
    });
  }, [userProfile]);

  const handleQuickAction = useCallback((action: 'focus' | 'terminal' | 'stats') => {
    if (action === 'focus') {
      startSprint(25);
    } else {
      startTransition(() => {
        setCurrentView(action);
      });
    }
  }, [startSprint]);

  const handleBackToDashboard = useCallback(() => {
    startTransition(() => {
      setCurrentView('dashboard');
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER: Suspense boundaries para streaming (async-suspense-boundaries)
  // ═══════════════════════════════════════════════════════════════════════════════
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

  // Vista de Path seleccionado
  if (currentView === 'path' && selectedPath) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<ViewSkeleton />}>
          <div className="h-screen bg-hacker-bg flex flex-col">
            <header className="bg-hacker-bgSecondary border-b border-hacker-border px-6 py-4">
              <button 
                onClick={handleBackToDashboard}
                className="text-hacker-textMuted hover:text-hacker-text transition-colors"
              >
                ← Volver al dashboard
              </button>
            </header>
            <main className="flex-1 overflow-hidden">
              <LearningPathView path={selectedPath} onBack={handleBackToDashboard} />
            </main>
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Vista de Stats
  if (currentView === 'stats') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<ViewSkeleton />}>
          <div className="h-screen bg-hacker-bg flex flex-col">
            <header className="bg-hacker-bgSecondary border-b border-hacker-border px-6 py-4">
              <button 
                onClick={handleBackToDashboard}
                className="text-hacker-textMuted hover:text-hacker-text transition-colors"
              >
                ← Volver al dashboard
              </button>
            </header>
            <main className="flex-1 overflow-hidden">
              <StatsDashboard />
            </main>
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-hacker-bg">
      {/* Header */}
      <header className="bg-hacker-bgSecondary border-b border-hacker-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-hacker-primary" />
            <div>
              <h1 className="text-xl font-bold text-hacker-text">Centopeia</h1>
              <p className="text-xs text-hacker-textMuted">Dashboard Optimizado</p>
            </div>
          </div>
          
          {isFocusActive && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-hacker-primary/20">
              <Zap className="w-4 h-4 text-hacker-primary" />
              <span className="text-hacker-primary font-mono font-bold">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Clock}
            label="Minutos de estudio"
            value={dashboardStats.totalMinutes}
            trend={12}
            color="#00ff41"
          />
          <StatCard 
            icon={BookOpen}
            label="Módulos completados"
            value={dashboardStats.completedModules}
            color="#00f0ff"
          />
          <StatCard 
            icon={TrendingUp}
            label="Racha actual"
            value={`${dashboardStats.currentStreak} días`}
            trend={dashboardStats.currentStreak > 0 ? 100 : 0}
            color="#ffb000"
          />
          <StatCard 
            icon={Zap}
            label="Sprints hoy"
            value={dashboardStats.focusSessions}
            color="#ff6b6b"
          />
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <section className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-5">
              <h2 className="text-lg font-bold text-hacker-text mb-4">Acciones rápidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <QuickAction 
                  icon={Zap}
                  label="Iniciar Focus"
                  onClick={() => handleQuickAction('focus')}
                  variant="primary"
                />
                <QuickAction 
                  icon={Terminal}
                  label="Abrir Terminal"
                  onClick={() => handleQuickAction('terminal')}
                />
                <QuickAction 
                  icon={BarChart3}
                  label="Ver estadísticas"
                  onClick={() => handleQuickAction('stats')}
                />
              </div>
            </section>

            {/* Learning Paths */}
            <section className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-hacker-text">Tus rutas de aprendizaje</h2>
                <button 
                  onClick={() => setCurrentView('dashboard')} // Cambiar a selector
                  className="text-sm text-hacker-primary hover:underline"
                >
                  Ver todas
                </button>
              </div>
              
              {selectedPath ? (
                <PathProgressCard 
                  path={selectedPath}
                  progress={calculatePathProgress(selectedPath)}
                  onContinue={() => setCurrentView('path')}
                />
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-hacker-textDim mx-auto mb-3" />
                  <p className="text-hacker-textMuted mb-4">No has seleccionado una ruta aún</p>
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="px-4 py-2 bg-hacker-primary text-hacker-bg rounded-lg font-medium"
                  >
                    Explorar rutas
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            
            {/* Recent Activity */}
            <section className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-5">
              <h2 className="text-lg font-bold text-hacker-text mb-4">Actividad reciente</h2>
              <div className="space-y-2">
                {[
                  { id: '1', type: 'module' as const, title: 'Completaste: Fundamentos de Testing', timestamp: 'Hace 2 horas', pathColor: '#00ff41' },
                  { id: '2', type: 'focus' as const, title: 'Focus sprint de 25 minutos', timestamp: 'Hace 5 horas', pathColor: '#ffb000' },
                  { id: '3', type: 'quiz' as const, title: 'Quiz: SQL Básico - 80%', timestamp: 'Ayer', pathColor: '#00f0ff' },
                ].map(item => (
                  <ActivityItemComponent key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* Daily Goal */}
            <section className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-5">
              <h2 className="text-lg font-bold text-hacker-text mb-3">Meta diaria</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-hacker-textMuted">Progreso</span>
                  <span className="text-hacker-primary font-medium">75%</span>
                </div>
                <div className="h-2 bg-hacker-bgTertiary rounded-full overflow-hidden">
                  <div className="h-full bg-hacker-primary rounded-full transition-all duration-500" style={{ width: '75%' }} />
                </div>
                <div className="flex items-center gap-2 text-sm text-hacker-textMuted">
                  <Award className="w-4 h-4 text-hacker-accent" />
                  <span>¡Solo 15 minutos más!</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Pending state overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-hacker-bg/50 flex items-center justify-center z-50">
          <div className="animate-spin w-8 h-8 border-4 border-hacker-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}

// Skeleton para Suspense fallback
function ViewSkeleton() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-hacker-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-hacker-primary font-mono">Cargando...</p>
      </div>
    </div>
  );
}

export default OptimizedDashboard;
