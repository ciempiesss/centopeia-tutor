import { BarChart3, Timer, Zap } from 'lucide-react';

interface LeftPanelProps {
  completedModules?: number;
  totalStudyTime?: number;
  currentStreak?: number;
  onStartSprint?: (minutes: number) => void;
  onQuickAction?: (action: string) => void;
}

export function LeftPanel({
  completedModules = 0,
  totalStudyTime = 0,
  currentStreak = 0,
  onStartSprint,
  onQuickAction,
}: LeftPanelProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 h-full bg-hacker-bgSecondary border-r border-hacker-border p-4 gap-4 overflow-y-auto">
      {/* Stats Section */}
      <section className="bg-hacker-bg border border-hacker-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-hacker-primary" />
          <h3 className="font-bold text-hacker-text">Estadísticas Hoy</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-hacker-textMuted text-sm">Módulos completados</span>
            <span className="font-mono text-hacker-primary font-bold">{completedModules}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-hacker-textMuted text-sm">Tiempo de estudio</span>
            <span className="font-mono text-hacker-secondary font-bold">{totalStudyTime} min</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-hacker-textMuted text-sm">Racha actual</span>
            <span className="font-mono text-hacker-accent font-bold">{currentStreak} días</span>
          </div>
        </div>
      </section>

      {/* Focus Sprint Section */}
      <section className="bg-hacker-bg border border-hacker-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-hacker-primary" />
          <h3 className="font-bold text-hacker-text">Focus Sprint</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[15, 25, 45].map((minutes) => (
            <button
              key={minutes}
              onClick={() => onStartSprint?.(minutes)}
              className="px-2 py-2 bg-hacker-bgTertiary border border-hacker-border rounded
                       text-hacker-text text-sm font-medium
                       hover:border-hacker-primary hover:text-hacker-primary
                       transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary"
            >
              {minutes} min
            </button>
          ))}
        </div>

        <p className="text-center text-hacker-textMuted text-xs">
          Listo para empezar
        </p>
      </section>

      {/* Quick Actions Section */}
      <section className="bg-hacker-bg border border-hacker-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-hacker-accent" />
          <h3 className="font-bold text-hacker-text">Acciones Rápidas</h3>
        </div>

        <div className="space-y-2">
          {[
            { label: 'Practicar Python', action: '/practice python' },
            { label: 'Ver Quiz', action: '/quiz' },
            { label: 'Tema al Azar', action: '/random' },
          ].map(({ label, action }) => (
            <button
              key={action}
              onClick={() => onQuickAction?.(action)}
              className="w-full px-3 py-2 bg-hacker-bgTertiary border border-hacker-border rounded
                       text-hacker-text text-sm text-left
                       hover:border-hacker-accent hover:text-hacker-accent
                       transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-accent"
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default LeftPanel;
