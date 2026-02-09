import React, { useState, memo, useMemo } from 'react';
import { 
  ChevronDown, ChevronUp, Clock, CheckCircle2, 
  Circle, Play, Lock, Trophy, Target,
  ArrowRight, BookOpen
} from 'lucide-react';
import { calculatePathProgress, getNextModule } from '../../data/learningPaths';
import type { LearningPath, Skill, MicroModule } from '../../data/learningPaths';
import { usePlatform } from '../../hooks/usePlatform';
import { DesktopSplitPane } from './AdaptiveLayout';

interface LearningPathViewProps {
  path: LearningPath;
  onStartModule: (module: MicroModule) => void;
  onCompleteModule: (module: MicroModule) => void;
}

// Status badge component
const StatusBadge = memo(function StatusBadge({ status }: { status: MicroModule['status'] }) {
  const styles = {
    locked: 'bg-hacker-textDim/20 text-hacker-textDim',
    available: 'bg-hacker-secondary/20 text-hacker-secondary',
    in_progress: 'bg-hacker-accent/20 text-hacker-accent animate-pulse',
    completed: 'bg-hacker-primary/20 text-hacker-primary',
  };

  const labels = {
    locked: 'Bloqueado',
    available: 'Disponible',
    in_progress: 'En progreso',
    completed: 'Completado',
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
});

// Level badge
const LevelBadge = memo(function LevelBadge({ level }: { level: Skill['level'] }) {
  const styles = {
    beginner: 'bg-green-500/20 text-green-400',
    intermediate: 'bg-yellow-500/20 text-yellow-400',
    advanced: 'bg-red-500/20 text-red-400',
  };

  const labels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[level]}`}>
      {labels[level]}
    </span>
  );
});

// Skill card (expandible)
const SkillCard = memo(function SkillCard({ 
  skill, 
  pathColor,
  onSelectModule,
  expanded,
  onToggle,
}: { 
  skill: Skill;
  pathColor: string;
  onSelectModule: (module: MicroModule) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const completedModules = useMemo(() => 
    skill.modules.filter(m => m.status === 'completed').length, 
    [skill.modules]
  );
  const progress = useMemo(() => 
    skill.modules.length > 0 ? (completedModules / skill.modules.length) * 100 : 0,
    [completedModules, skill.modules.length]
  );

  return (
    <div className="border border-hacker-border rounded-xl overflow-hidden bg-hacker-bgSecondary">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-hacker-bgTertiary 
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                   focus-visible:ring-inset transition-colors"
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${pathColor}20` }}
        >
          <span className="text-xl font-bold" style={{ color: pathColor }}>
            {skill.order}
          </span>
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-hacker-text">{skill.title}</h3>
            <LevelBadge level={skill.level} />
          </div>
          <p className="text-sm text-hacker-textMuted line-clamp-1">
            {skill.description}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-hacker-textDim">
              {completedModules}/{skill.modules.length} módulos
            </div>
            <div className="text-xs text-hacker-textMuted">
              ~{skill.estimatedHours}h
            </div>
          </div>
          
          {/* Progress ring */}
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-hacker-bgTertiary"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={pathColor}
                strokeWidth="4"
                strokeDasharray={`${progress * 1.26} 126`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {Math.round(progress)}%
            </span>
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-hacker-textMuted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-hacker-textMuted" />
          )}
        </div>
      </button>

      {/* Modules list */}
      {expanded && (
        <div className="border-t border-hacker-border">
          {skill.modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => module.status !== 'locked' && onSelectModule(module)}
              disabled={module.status === 'locked'}
              className={`w-full p-4 flex items-center gap-4 text-left
                        border-b border-hacker-border last:border-0
                        transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                        focus-visible:ring-inset
                        ${module.status === 'locked' 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-hacker-bgTertiary cursor-pointer'
                        }`}
            >
              {/* Status icon */}
              <div className="w-8 flex-shrink-0 flex justify-center">
                {module.status === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-hacker-primary" />
                )}
                {module.status === 'in_progress' && (
                  <Play className="w-5 h-5 text-hacker-accent" />
                )}
                {module.status === 'available' && (
                  <Circle className="w-5 h-5 text-hacker-secondary" />
                )}
                {module.status === 'locked' && (
                  <Lock className="w-5 h-5 text-hacker-textDim" />
                )}
              </div>

              {/* Module info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-hacker-textDim">{index + 1}.</span>
                  <span className="font-medium text-hacker-text truncate">
                    {module.title}
                  </span>
                </div>
                <p className="text-sm text-hacker-textMuted line-clamp-1">
                  {module.description}
                </p>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1 text-xs text-hacker-textDim flex-shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {module.duration}min
              </div>

              {/* Status badge */}
              <div className="hidden sm:block">
                <StatusBadge status={module.status} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Vista móvil: Lista vertical
function MobilePathView({ path, onStartModule, onCompleteModule }: LearningPathViewProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(
    path.skills.find(s => s.status !== 'locked')?.id || null
  );

  const progress = calculatePathProgress(path);
  const nextModule = getNextModule(path);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-hacker-border bg-hacker-bgSecondary">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${path.color}20` }}
          >
            <Trophy className="w-6 h-6" style={{ color: path.color }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-hacker-text">{path.title}</h2>
            <p className="text-sm text-hacker-textMuted">
              {path.skills.length} habilidades • {path.estimatedWeeks} semanas
            </p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-hacker-textMuted">Progreso general</span>
            <span className="font-bold" style={{ color: path.color }}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-hacker-bgTertiary rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: path.color }}
            />
          </div>
        </div>

        {/* Continue button */}
        {nextModule && (
          <button
            onClick={() => onStartModule(nextModule)}
            className="w-full mt-4 py-3 px-4 rounded-xl font-medium
                     flex items-center justify-center gap-2
                     transition-all motion-safe:active:scale-[0.98]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                     focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgSecondary"
            style={{ 
              backgroundColor: path.color,
              color: '#0a0a0a'
            }}
          >
            <Play className="w-5 h-5" />
            Continuar: {nextModule.title}
          </button>
        )}
      </div>

      {/* Skills list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {path.skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            pathColor={path.color}
            onSelectModule={onStartModule}
            expanded={expandedSkill === skill.id}
            onToggle={() => setExpandedSkill(
              expandedSkill === skill.id ? null : skill.id
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Vista desktop: Split pane
function DesktopPathView({ path, onStartModule, onCompleteModule }: LearningPathViewProps) {
  const [selectedModule, setSelectedModule] = useState<MicroModule | null>(null);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(
    new Set([path.skills.find(s => s.status !== 'locked')?.id || ''])
  );

  const progress = calculatePathProgress(path);
  const completedModules = path.skills.flatMap(s => s.modules).filter(m => m.status === 'completed').length;
  const totalModules = path.skills.flatMap(s => s.modules).length;

  const toggleSkill = (skillId: string) => {
    const newSet = new Set(expandedSkills);
    if (newSet.has(skillId)) {
      newSet.delete(skillId);
    } else {
      newSet.add(skillId);
    }
    setExpandedSkills(newSet);
  };

  const LeftPanel = (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-hacker-border">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${path.color}20` }}
          >
            <Trophy className="w-8 h-8" style={{ color: path.color }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-hacker-text">{path.title}</h2>
            <p className="text-hacker-textMuted">{path.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-hacker-bgTertiary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: path.color }}>
              {progress}%
            </div>
            <div className="text-xs text-hacker-textMuted">Completado</div>
          </div>
          <div className="bg-hacker-bgTertiary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-hacker-text">
              {completedModules}/{totalModules}
            </div>
            <div className="text-xs text-hacker-textMuted">Módulos</div>
          </div>
          <div className="bg-hacker-bgTertiary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-hacker-text">
              {path.estimatedWeeks}
            </div>
            <div className="text-xs text-hacker-textMuted">Semanas</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="h-3 bg-hacker-bgTertiary rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: path.color }}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="p-6 space-y-4">
        {path.skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            pathColor={path.color}
            onSelectModule={(module) => {
              setSelectedModule(module);
              onStartModule(module);
            }}
            expanded={expandedSkills.has(skill.id)}
            onToggle={() => toggleSkill(skill.id)}
          />
        ))}
      </div>
    </div>
  );

  const RightPanel = selectedModule ? (
    <ModuleDetail 
      module={selectedModule} 
      pathColor={path.color}
      onClose={() => setSelectedModule(null)}
      onStartModule={onStartModule}
      onCompleteModule={onCompleteModule}
    />
  ) : (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center">
        <BookOpen className="w-16 h-16 text-hacker-textDim mx-auto mb-4" />
        <h3 className="text-xl font-bold text-hacker-text mb-2">
          Selecciona un módulo
        </h3>
        <p className="text-hacker-textMuted max-w-sm">
          Haz clic en cualquier módulo del panel izquierdo para ver su contenido 
          y comenzar a aprender.
        </p>
      </div>
    </div>
  );

  return (
    <DesktopSplitPane 
      left={LeftPanel} 
      right={RightPanel}
      splitRatio={0.45}
    />
  );
}

// Module detail panel (desktop)
function ModuleDetail({ 
  module, 
  pathColor,
  onClose,
  onStartModule,
  onCompleteModule,
}: { 
  module: MicroModule;
  pathColor: string;
  onClose: () => void;
  onStartModule: (module: MicroModule) => void;
  onCompleteModule: (module: MicroModule) => void;
}) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <StatusBadge status={module.status} />
            <h2 className="text-2xl font-bold text-hacker-text mt-2">
              {module.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-hacker-textMuted">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {module.duration} minutos
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {module.objectives.length} objetivos
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hacker-bgTertiary rounded-lg transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary"
          >
            Cerrar
          </button>
        </div>

        {/* Objectives */}
        <div className="mb-8">
          <h3 className="font-bold text-hacker-text mb-3">Objetivos de aprendizaje</h3>
          <ul className="space-y-2">
            {module.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-hacker-primary flex-shrink-0 mt-0.5" />
                <span className="text-hacker-text">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content preview */}
        <div className="mb-8">
          <h3 className="font-bold text-hacker-text mb-3">Contenido</h3>
          <div className="bg-hacker-bgTertiary rounded-xl p-4 text-hacker-text leading-relaxed">
            {module.content}
          </div>
        </div>

        {/* Exercise */}
        <div className="mb-8">
          <h3 className="font-bold text-hacker-text mb-3">Ejercicio práctico</h3>
          <div className="border border-hacker-border rounded-xl p-4">
            <p className="text-hacker-text">{module.exercise}</p>
          </div>
        </div>

        {/* Check question */}
        <div className="mb-8">
          <h3 className="font-bold text-hacker-text mb-3">Auto-evaluación</h3>
          <div className="bg-hacker-primary/5 border border-hacker-primary/30 rounded-xl p-4">
            <p className="text-hacker-text font-medium mb-2">Pregunta:</p>
            <p className="text-hacker-text">{module.checkQuestion}</p>
          </div>
        </div>

        {/* Start button */}
        {module.status !== 'locked' && (
          <button
            onClick={() => onStartModule(module)}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2
                     transition-all motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                     focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgSecondary"
            style={{ 
              backgroundColor: pathColor,
              color: '#0a0a0a'
            }}
          >
            <Play className="w-6 h-6" />
            {module.status === 'completed' ? 'Revisar nuevamente' : 'Comenzar módulo'}
          </button>
        )}

        {module.status !== 'completed' && module.status !== 'locked' && (
          <button
            onClick={() => onCompleteModule(module)}
            className="w-full mt-3 py-3 rounded-xl font-bold text-sm
                     border border-hacker-border text-hacker-text
                     hover:bg-hacker-bgTertiary transition-colors"
          >
            Marcar como completado
          </button>
        )}
      </div>
    </div>
  );
}

export function LearningPathView(props: LearningPathViewProps) {
  const { isMobile } = usePlatform();
  
  return isMobile 
    ? <MobilePathView {...props} /> 
    : <DesktopPathView {...props} />;
}
