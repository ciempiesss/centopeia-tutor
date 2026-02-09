import React, { useState } from 'react';
import { 
  Rocket, Key, Target, BookOpen, 
  Lightbulb, Zap, X, CheckCircle2, Circle,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface GettingStartedProps {
  hasApiKey: boolean;
  hasSelectedPath: boolean;
  completedModules: number;
  onAction: (action: 'config' | 'paths' | 'help' | 'focus') => void;
  onDismiss?: () => void;
}

interface ChecklistItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  completed: boolean;
  actionLabel: string;
  action: 'config' | 'paths' | 'help';
}

export function GettingStarted({ 
  hasApiKey, 
  hasSelectedPath, 
  completedModules,
  onAction, 
  onDismiss 
}: GettingStartedProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const checklist: ChecklistItem[] = [
    {
      id: 'apikey',
      icon: Key,
      title: 'Configurar API Key',
      description: 'Conecta tu cuenta de Groq para usar la IA',
      completed: hasApiKey,
      actionLabel: 'Configurar',
      action: 'config',
    },
    {
      id: 'role',
      icon: Target,
      title: 'Seleccionar un rol',
      description: 'Elige entre QA, Developer o Data Analyst',
      completed: hasSelectedPath,
      actionLabel: 'Ver rutas',
      action: 'paths',
    },
    {
      id: 'module',
      icon: BookOpen,
      title: 'Completar tu primer módulo',
      description: 'Aprende algo nuevo o haz un quiz',
      completed: completedModules > 0,
      actionLabel: 'Empezar',
      action: 'help',
    },
  ];

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;
  const allCompleted = completedCount === checklist.length;

  return (
    <div className={`bg-hacker-bgSecondary border border-hacker-border rounded-xl mb-6 overflow-hidden transition-all duration-300 ${allCompleted ? 'opacity-75' : ''}`}>
      {/* Header - Clickable to expand/collapse */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full p-4 flex items-center justify-between hover:bg-hacker-bgTertiary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${allCompleted ? 'bg-hacker-primary/20' : 'bg-hacker-primary/10'}`}>
            {allCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-hacker-primary" />
            ) : (
              <Rocket className="w-5 h-5 text-hacker-primary" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-hacker-text flex items-center gap-2">
              Primeros Pasos
              {allCompleted && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-hacker-primary/20 text-hacker-primary">
                  ¡Completado!
                </span>
              )}
            </h3>
            <p className="text-hacker-textMuted text-sm">
              {completedCount} de {checklist.length} completado
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mini progress bar (visible when collapsed) */}
          {!isExpanded && (
            <div className="hidden sm:block w-24 h-2 bg-hacker-bgTertiary rounded-full overflow-hidden mr-2">
              <div 
                className="h-full bg-hacker-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="p-1.5 rounded-lg text-hacker-textDim hover:text-hacker-text 
                       hover:bg-hacker-bgTertiary transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <div className="p-1.5 text-hacker-textDim">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-4 pb-5 animate-fade-in">
          {/* Progress Bar */}
          <div className="mb-5">
            <div className="h-2 bg-hacker-bgTertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-hacker-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3 mb-5">
            {checklist.map((item) => {
              const Icon = item.icon;
              const StatusIcon = item.completed ? CheckCircle2 : Circle;
              
              return (
                <div 
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors
                            ${item.completed 
                              ? 'bg-hacker-primary/5' 
                              : 'bg-hacker-bg hover:bg-hacker-bgTertiary/50'
                            }`}
                >
                  {/* Status Icon */}
                  <StatusIcon 
                    className={`w-5 h-5 mt-0.5 flex-shrink-0
                              ${item.completed 
                                ? 'text-hacker-primary' 
                                : 'text-hacker-textDim'
                              }`} 
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon className={`w-4 h-4 ${item.completed ? 'text-hacker-primary' : 'text-hacker-textMuted'}`} />
                      <span className={`font-medium text-sm ${item.completed ? 'text-hacker-primary' : 'text-hacker-text'}`}>
                        {item.title}
                      </span>
                    </div>
                    <p className="text-hacker-textMuted text-xs mb-2">
                      {item.description}
                    </p>
                    
                    {!item.completed && (
                      <button
                        onClick={() => onAction(item.action)}
                        className="text-xs px-3 py-1.5 rounded-md
                                 bg-hacker-primary/20 text-hacker-primary font-medium
                                 hover:bg-hacker-primary/30 transition-colors"
                      >
                        {item.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tip */}
          <div className="bg-hacker-bg rounded-lg p-4 border border-hacker-border">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-hacker-accent" />
                <Zap className="w-4 h-4 text-hacker-primary" />
              </div>
              <div className="flex-1">
                <p className="text-hacker-text text-sm mb-2">
                  <span className="text-hacker-accent">Consejo:</span> Usa 
                  <code className="mx-1 px-1.5 py-0.5 bg-hacker-bgSecondary rounded text-hacker-primary font-mono text-xs">
                    /micro
                  </code>
                  cuando no puedas empezar
                </p>
                <button
                  onClick={() => onAction('focus')}
                  className="text-xs px-3 py-1.5 rounded-md
                           bg-hacker-primary text-hacker-bg font-medium
                           hover:bg-hacker-primaryDim transition-colors"
                >
                  Probar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GettingStarted;
