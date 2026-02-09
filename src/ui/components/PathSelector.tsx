import React from 'react';
import { Bug, Code, BarChart3, ChevronRight, Clock, Layers } from 'lucide-react';
import { calculatePathProgress } from '../../data/learningPaths';
import type { LearningPath } from '../../data/learningPaths';
import { usePlatform } from '../../hooks/usePlatform';
import { PlatformView } from './AdaptiveLayout';

interface PathSelectorProps {
  paths: LearningPath[];
  selectedPathId?: string;
  onSelectPath: (path: LearningPath) => void;
}

const iconMap = {
  bug: Bug,
  code: Code,
  'bar-chart': BarChart3,
};

// Card para móvil (stack vertical)
function MobilePathCard({ 
  path, 
  isSelected, 
  onClick 
}: { 
  path: LearningPath; 
  isSelected: boolean;
  onClick: () => void;
}) {
  // Safe icon lookup with runtime validation and type safety
  const iconKey = path.icon as keyof typeof iconMap;
  const Icon = (iconKey in iconMap ? iconMap[iconKey] : Code) as React.ElementType;
  const progress = calculatePathProgress(path);
  
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                 focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgPrimary
                 ${isSelected 
                   ? 'border-hacker-primary bg-hacker-primary/10' 
                   : 'border-hacker-border bg-hacker-bgSecondary hover:border-hacker-borderHover'
                 }`}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-3 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${path.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: path.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-hacker-text">{path.title}</h3>
          <p className="text-sm text-hacker-textMuted mt-1 line-clamp-2">
            {path.description}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-hacker-textDim">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {path.estimatedWeeks} semanas
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {path.skills.length} habilidades
            </span>
          </div>
          {progress > 0 && (
            <div className="mt-3">
              <div className="h-1.5 bg-hacker-bgTertiary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: path.color }}
                />
              </div>
              <span className="text-xs mt-1" style={{ color: path.color }}>
                {progress}% completado
              </span>
            </div>
          )}
        </div>
        <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform
                                ${isSelected ? 'rotate-90 text-hacker-primary' : 'text-hacker-textDim'}`} />
      </div>
    </button>
  );
}

// Card para desktop (grid)
function DesktopPathCard({ 
  path, 
  isSelected, 
  onClick 
}: { 
  path: LearningPath; 
  isSelected: boolean;
  onClick: () => void;
}) {
  // Safe icon lookup with runtime validation and type safety
  const iconKey = path.icon as keyof typeof iconMap;
  const Icon = (iconKey in iconMap ? iconMap[iconKey] : Code) as React.ElementType;
  const progress = calculatePathProgress(path);
  
  return (
    <button
      onClick={onClick}
      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                 motion-safe:hover:scale-[1.02] hover:shadow-lg
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                 focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgPrimary
                 ${isSelected 
                   ? 'border-hacker-primary bg-hacker-primary/5 shadow-hacker-primary/20' 
                   : 'border-hacker-border bg-hacker-bgSecondary hover:border-hacker-borderHover'
                 }`}
      style={{
        boxShadow: isSelected ? `0 0 30px ${path.color}20` : undefined
      }}
    >
      {/* Progress bar top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-hacker-bgTertiary rounded-t-2xl overflow-hidden">
        <div 
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: path.color }}
        />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-4 rounded-xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${path.color}20` }}
        >
          <Icon className="w-8 h-8" style={{ color: path.color }} />
        </div>
        {progress > 0 && (
          <span 
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: `${path.color}20`, color: path.color }}
          >
            {progress}%
          </span>
        )}
      </div>

      <h3 className="font-bold text-xl text-hacker-text mb-2">{path.title}</h3>
      <p className="text-sm text-hacker-textMuted mb-6 line-clamp-2">
        {path.description}
      </p>

      <div className="flex items-center gap-6 text-sm text-hacker-textDim">
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {path.estimatedWeeks} semanas
        </span>
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          {path.skills.length} habilidades
        </span>
      </div>

      {/* Hover effect line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 
                   group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ backgroundColor: path.color }}
      />
    </button>
  );
}

export function PathSelector({ paths, selectedPathId, onSelectPath }: PathSelectorProps) {
  const { isMobile } = usePlatform();

  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-hacker-text mb-2">
            Elige tu camino
          </h2>
          <p className="text-hacker-textMuted">
            Selecciona el rol que quieres dominar
          </p>
        </div>
        <div className="space-y-3">
          {paths.map((path) => (
            <MobilePathCard
              key={path.id}
              path={path}
              isSelected={selectedPathId === path.id}
              onClick={() => onSelectPath(path)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-hacker-text mb-3">
          Elige tu camino profesional
        </h2>
        <p className="text-hacker-textMuted text-lg max-w-2xl">
          Cada ruta está diseñada para llevarte de principiante a nivel profesional 
          en {paths[0]?.estimatedWeeks || 24} semanas con micro-lecciones diarias.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => (
          <DesktopPathCard
            key={path.id}
            path={path}
            isSelected={selectedPathId === path.id}
            onClick={() => onSelectPath(path)}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-hacker-bgTertiary rounded-lg border border-hacker-border">
        <p className="text-sm text-hacker-textMuted">
          <span className="text-hacker-primary">💡 Consejo:</span> Puedes cambiar de ruta en cualquier momento. 
          Tus progresos se guardan individualmente.
        </p>
      </div>
    </div>
  );
}
