import React from 'react';
import { 
  Rocket, Key, Target, BookOpen, 
  Lightbulb, Zap, X, CheckCircle2, Circle 
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

  return (
    <div className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-hacker-primary/10 rounded-lg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-hacker-primary" />
          </div>
          <div>
            <h3 className="font-bold text-hacker-text">Primeros Pasos</h3>
            <p className="text-hacker-textMuted text-sm">
              {completedCount} de {checklist.length} completado
            </p>
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-hacker-textDim hover:text-hacker-text 
                     hover:bg-hacker-bgTertiary transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

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
  );
}

export default GettingStarted;
