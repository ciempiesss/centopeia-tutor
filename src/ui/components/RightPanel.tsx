import React from 'react';
import { BookOpen, Play, Trophy, Lock } from 'lucide-react';
import type { LearningPath, MicroModule } from '../../data/learningPaths';

interface RightPanelProps {
  selectedPath?: LearningPath | null;
  completedModules?: number;
  totalModules?: number;
  nextModule?: MicroModule | null;
  onStartModule?: (moduleId: string) => void;
  onViewPath?: () => void;
}

export function RightPanel({
  selectedPath,
  completedModules = 0,
  totalModules = 0,
  nextModule,
  onStartModule,
  onViewPath,
}: RightPanelProps) {
  const progressPercent = totalModules > 0 
    ? Math.round((completedModules / totalModules) * 100) 
    : 0;

  const achievements = [
    { id: '1', icon: '🏃', name: 'Sprint Master', unlocked: true },
    { id: '2', icon: '📚', name: 'First Module', unlocked: true },
    { id: '3', icon: '🔥', name: '7 Day Streak', unlocked: false },
    { id: '4', icon: '⭐', name: 'Quick Learner', unlocked: false },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-80 h-full bg-hacker-bgSecondary border-l border-hacker-border p-4 gap-4 overflow-y-auto">
      {/* Current Path Section */}
      <section className="card-terminal space-y-3">
        <div className="flex items-center gap-2 text-hacker-primary">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Tu Ruta Actual</h3>
        </div>

        {selectedPath ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedPath.color }}
              />
              <span className="font-semibold text-hacker-text">
                {selectedPath.title}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 bg-hacker-bgTertiary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progressPercent}%`, 
                    backgroundColor: selectedPath.color 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-hacker-textMuted">
                <span>{completedModules}/{totalModules} módulos</span>
                <span>{progressPercent}%</span>
              </div>
            </div>

            <button
              onClick={onViewPath}
              className="w-full btn-hacker text-xs py-2"
            >
              Ver Ruta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-hacker-textMuted">
              Selecciona una ruta para comenzar tu aprendizaje
            </p>
            <button
              onClick={onViewPath}
              className="w-full btn-hacker text-xs py-2"
            >
              Elegir Rol
            </button>
          </div>
        )}
      </section>

      {/* Next Module Section */}
      <section className="card-terminal space-y-3">
        <div className="flex items-center gap-2 text-hacker-primary">
          <Play className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Siguiente Módulo</h3>
        </div>

        {nextModule ? (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-hacker-text text-sm line-clamp-2">
                {nextModule.title}
              </h4>
              <p className="text-xs text-hacker-textMuted mt-1">
                {nextModule.duration} min
              </p>
            </div>
            <button
              onClick={() => onStartModule?.(nextModule.id)}
              className="w-full btn-hacker text-xs py-2"
            >
              Empezar
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-2xl">🎉</span>
            <p className="text-sm text-hacker-textMuted mt-2">
              ¡Completado!
            </p>
          </div>
        )}
      </section>

      {/* Achievements Section */}
      <section className="card-terminal space-y-3">
        <div className="flex items-center gap-2 text-hacker-primary">
          <Trophy className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Logros</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                achievement.unlocked
                  ? 'bg-hacker-primary/10 border-hacker-primary/30'
                  : 'bg-hacker-bgTertiary border-hacker-border opacity-60'
              }`}
            >
              <div className="text-2xl mb-1">
                {achievement.unlocked ? (
                  achievement.icon
                ) : (
                  <Lock className="w-6 h-6 mx-auto text-hacker-textDim" />
                )}
              </div>
              <p
                className={`text-xs ${
                  achievement.unlocked
                    ? 'text-hacker-text'
                    : 'text-hacker-textMuted'
                }`}
              >
                {achievement.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
