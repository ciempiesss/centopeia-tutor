import React, { useState, useEffect } from 'react';
import { 
  Terminal, Play, Brain, Target, Zap, Dice5,
  MessageSquare, ChevronRight, Sparkles, Briefcase,
  Clock, Trophy, Flame
} from 'lucide-react';
import type { LearningPath, Skill, MicroModule } from '../../data/learningPaths';
import type { InterviewQuestion } from '../../data/interviewQuestions';
import { getRandomQuestions } from '../../data/interviewQuestions';
import { LEARNING_PATHS, getNextModule } from '../../data/learningPaths';

interface TerminalHomeProps {
  onCommand: (command: string) => void;
  onStartInterview?: () => void;
  selectedPath?: LearningPath | null;
}

// Comando rápido con descripción
interface QuickCommand {
  id: string;
  command: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  shortcut?: string;
}

const QUICK_COMMANDS: QuickCommand[] = [
  {
    id: 'focus',
    command: '/focus 15',
    label: 'Focus Sprint',
    description: '15 min de concentración',
    icon: Zap,
    color: '#00ff41',
    shortcut: 'F',
  },
  {
    id: 'practice',
    command: '/practice python',
    label: 'Practicar',
    description: 'Ejercicio al azar',
    icon: Brain,
    color: '#00f0ff',
    shortcut: 'P',
  },
  {
    id: 'quiz',
    command: '/quiz',
    label: 'Quiz Rápido',
    description: '5 preguntas test',
    icon: Target,
    color: '#ffb000',
    shortcut: 'Q',
  },
  {
    id: 'interview',
    command: '/interview',
    label: 'Simular Entrevista',
    description: 'Modo entrevista QA',
    icon: Briefcase,
    color: '#ff6b6b',
    shortcut: 'I',
  },
  {
    id: 'micro',
    command: '/micro',
    label: 'Modo Anti-Parálisis',
    description: 'Cuando no puedes empezar',
    icon: Sparkles,
    color: '#9b59b6',
    shortcut: 'M',
  },
  {
    id: 'stats',
    command: '/stats',
    label: 'Ver Progreso',
    description: 'Tus estadísticas',
    icon: Trophy,
    color: '#f39c12',
    shortcut: 'S',
  },
];

// Sugerencia aleatoria
interface Suggestion {
  id: string;
  type: 'quiz' | 'lesson' | 'practice' | 'interview';
  title: string;
  description: string;
  command: string;
  duration: string;
  icon: React.ElementType;
  color: string;
}

function generateSuggestions(selectedPath?: LearningPath | null): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Si tiene ruta seleccionada, sugerir siguiente módulo
  if (selectedPath) {
    const nextModule = getNextModule(selectedPath);
    if (nextModule) {
      suggestions.push({
        id: 'next-module',
        type: 'lesson',
        title: `Continuar: ${nextModule.title}`,
        description: `Siguiente módulo de ${selectedPath.title}`,
        command: '/learn',
        duration: `${nextModule.duration} min`,
        icon: Play,
        color: selectedPath.color,
      });
    }
  }
  
  // Siempre agregar opciones variadas
  suggestions.push(
    {
      id: 'random-quiz',
      type: 'quiz',
      title: 'Quiz al Azar',
      description: 'Pon a prueba tus conocimientos',
      command: '/quiz',
      duration: '5 min',
      icon: Dice5,
      color: '#ffb000',
    },
    {
      id: 'interview-prep',
      type: 'interview',
      title: 'Preparar Entrevista',
      description: 'Practica preguntas reales de empresas',
      command: '/interview',
      duration: '15 min',
      icon: Briefcase,
      color: '#ff6b6b',
    },
    {
      id: 'practice-code',
      type: 'practice',
      title: 'Ejercicio de Código',
      description: 'Python o SQL práctico',
      command: '/practice python',
      duration: '10 min',
      icon: Terminal,
      color: '#00f0ff',
    }
  );
  
  // Mezclar y tomar 3
  return suggestions.slice(0, 3);
}

export function TerminalHome({ onCommand, onStartInterview, selectedPath }: TerminalHomeProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    setSuggestions(generateSuggestions(selectedPath));
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [selectedPath]);

  const handleCommand = (command: string) => {
    if (command === '/interview' && onStartInterview) {
      onStartInterview();
    } else {
      onCommand(command);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6">
      {/* Header con saludo */}
      <div className="border border-hacker-border rounded-xl p-4 bg-hacker-bgSecondary/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-hacker-textMuted text-sm">{getGreeting()}</p>
            <h2 className="text-xl font-bold text-hacker-text">
              ¿Qué quieres aprender hoy?
            </h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono text-hacker-primary">
              {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-hacker-textMuted">
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Comandos rápidos - Grid visual */}
      <div>
        <h3 className="text-sm font-bold text-hacker-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Acceso Rápido
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={() => handleCommand(cmd.command)}
                className="group p-4 rounded-xl border border-hacker-border bg-hacker-bgSecondary
                         hover:border-hacker-borderHover hover:bg-hacker-bgTertiary
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                         focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgPrimary
                         transition-all duration-200 text-left relative overflow-hidden"
              >
                {/* Color accent */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5"
                  style={{ backgroundColor: cmd.color }}
                />
                
                <div className="flex items-start justify-between mb-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${cmd.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: cmd.color }} />
                  </div>
                  {cmd.shortcut && (
                    <span className="text-xs text-hacker-textDim font-mono">
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
                
                <h4 className="font-bold text-hacker-text text-sm mb-1">
                  {cmd.label}
                </h4>
                <p className="text-xs text-hacker-textMuted">
                  {cmd.description}
                </p>
                
                <div className="mt-2 text-xs font-mono text-hacker-textDim opacity-0 group-hover:opacity-100 transition-opacity">
                  {cmd.command}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sugerencias al azar - Anti-indecisión */}
      <div>
        <h3 className="text-sm font-bold text-hacker-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Dice5 className="w-4 h-4" />
          Elige por mí (Anti-indecisión)
        </h3>
        <p className="text-xs text-hacker-textDim mb-3">
          ¿No sabes por dónde empezar? Haz clic en cualquiera:
        </p>
        <div className="space-y-2">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.id}
                onClick={() => handleCommand(suggestion.command)}
                className="w-full p-3 rounded-xl border border-hacker-border bg-hacker-bgSecondary
                         hover:border-hacker-borderHover hover:bg-hacker-bgTertiary
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                         focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgPrimary
                         transition-all duration-200 flex items-center gap-4 group"
              >
                <div 
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${suggestion.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: suggestion.color }} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-hacker-text">
                      {suggestion.title}
                    </span>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${suggestion.color}20`,
                        color: suggestion.color 
                      }}
                    >
                      {suggestion.type}
                    </span>
                  </div>
                  <p className="text-xs text-hacker-textMuted">
                    {suggestion.description} • {suggestion.duration}
                  </p>
                </div>
                
                <ChevronRight className="w-5 h-5 text-hacker-textDim group-hover:text-hacker-text transition-colors" />
              </button>
            );
          })}
        </div>
        
        {/* Botón para recargar sugerencias */}
        <button
          onClick={() => setSuggestions(generateSuggestions(selectedPath))}
          className="mt-2 text-xs text-hacker-textDim hover:text-hacker-text 
                   flex items-center gap-1 transition-colors"
        >
          <Dice5 className="w-3 h-3" />
          Dame otras opciones
        </button>
      </div>

      {/* Modo entrevista destacado */}
      <div className="border-2 border-dashed border-hacker-primary/50 rounded-xl p-4 bg-hacker-primary/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-hacker-primary/20">
            <Briefcase className="w-8 h-8 text-hacker-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-hacker-text text-lg">
              Simulador de Entrevistas
            </h3>
            <p className="text-sm text-hacker-textMuted mb-3">
              Practica con preguntas reales de empresas mexicanas como Softtek, 
              Kueski, Kavak y startups tech. Incluye feedback y mejores respuestas.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs px-2 py-1 rounded bg-hacker-bgTertiary text-hacker-textMuted">
                Técnicas
              </span>
              <span className="text-xs px-2 py-1 rounded bg-hacker-bgTertiary text-hacker-textMuted">
                Comportamentales
              </span>
              <span className="text-xs px-2 py-1 rounded bg-hacker-bgTertiary text-hacker-textMuted">
                Escenarios
              </span>
            </div>
            <button
              onClick={() => handleCommand('/interview')}
              className="px-4 py-2 bg-hacker-primary text-hacker-bg font-bold rounded-lg
                       hover:bg-hacker-primaryDim transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                       focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgPrimary
                       flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Iniciar Simulación
            </button>
          </div>
        </div>
      </div>

      {/* Consejo AUDHD del día */}
      <div className="border border-hacker-border rounded-xl p-4 bg-hacker-accent/5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-hacker-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-hacker-accent text-sm mb-1">
              Consejo AUDHD
            </h4>
            <p className="text-sm text-hacker-text">
              Cuando no sepas por dónde empezar, usa el principio de los 
              <span className="text-hacker-primary font-bold"> 2 minutos</span>: 
              haz solo el primer paso ridículamente pequeño. El resto fluye solo.
            </p>
          </div>
        </div>
      </div>

      {/* Comandos adicionales */}
      <div className="border-t border-hacker-border pt-4">
        <p className="text-xs text-hacker-textDim mb-2">Comandos adicionales:</p>
        <div className="flex flex-wrap gap-2">
          {['/help', '/role', '/config', '/stop', '/learn', '/practice sql'].map(cmd => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              className="px-3 py-1.5 text-xs font-mono rounded-lg
                       bg-hacker-bgTertiary text-hacker-textMuted
                       hover:bg-hacker-border hover:text-hacker-text
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                       transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente para modo entrevista completo
interface InterviewModeProps {
  onExit: () => void;
}

export function InterviewMode({ onExit }: InterviewModeProps) {
  const [questions] = useState(() => getRandomQuestions(5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="p-8 text-center">
        <Trophy className="w-16 h-16 text-hacker-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-hacker-text mb-2">
          ¡Práctica completada!
        </h2>
        <p className="text-hacker-textMuted mb-6">
          Revisaste {questions.length} preguntas de entrevista. 
          Recuerda: la práctica hace al maestro.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setCompleted(false);
              setShowAnswer(false);
            }}
            className="px-6 py-3 bg-hacker-primary text-hacker-bg font-bold rounded-xl
                     hover:bg-hacker-primaryDim transition-colors block w-full
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                     focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgSecondary"
          >
            Otra ronda
          </button>
          <button
            onClick={onExit}
            className="px-6 py-3 border border-hacker-border text-hacker-text rounded-xl
                     hover:bg-hacker-bgTertiary transition-colors block w-full
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                     focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgSecondary"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-hacker-border bg-hacker-bgSecondary">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-hacker-primary" />
            <span className="font-bold text-hacker-text">Simulador de Entrevista</span>
          </div>
          <button
            onClick={onExit}
            className="text-xs text-hacker-textMuted hover:text-hacker-text
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                       focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgSecondary rounded px-2 py-1"
          >
            Salir
          </button>
        </div>
        <div className="h-1 bg-hacker-bgTertiary rounded-full overflow-hidden">
          <div 
            className="h-full bg-hacker-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-hacker-textMuted mt-1">
          Pregunta {currentIndex + 1} de {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <span className="text-xs text-hacker-textMuted uppercase tracking-wider">
              {current.category} • {current.difficulty}
            </span>
            <h2 className="text-xl font-bold text-hacker-text mt-2 mb-4">
              {current.questionES}
            </h2>
            {current.questionEN && (
              <p className="text-sm text-hacker-textDim italic">
                {current.questionEN}
              </p>
            )}
          </div>

          {!showAnswer ? (
            <div className="space-y-4">
              <p className="text-hacker-textMuted">
                Piensa en tu respuesta antes de ver los tips...
              </p>
              <button
                onClick={() => setShowAnswer(true)}
                className="px-6 py-3 bg-hacker-primary text-hacker-bg font-bold rounded-xl
                         hover:bg-hacker-primaryDim transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                         focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgSecondary"
              >
                Ver tips de respuesta
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Good answer tips */}
              <div className="bg-hacker-primary/5 border border-hacker-primary/30 rounded-xl p-4">
                <h3 className="font-bold text-hacker-primary mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Cómo responder bien
                </h3>
                <ul className="space-y-2">
                  {current.goodAnswerTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-hacker-text">
                      <span className="text-hacker-primary">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What they look for */}
              <div className="bg-hacker-bgTertiary rounded-xl p-4">
                <h3 className="font-bold text-hacker-text mb-3">
                  Qué busca el entrevistador
                </h3>
                <ul className="space-y-2">
                  {current.whatTheyLookFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-hacker-textMuted">
                      <Target className="w-4 h-4 text-hacker-accent flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up questions */}
              {current.followUpQuestions && (
                <div className="bg-hacker-accent/5 border border-hacker-accent/30 rounded-xl p-4">
                  <h3 className="font-bold text-hacker-accent mb-3">
                    Preguntas de seguimiento posibles
                  </h3>
                  <ul className="space-y-2">
                    {current.followUpQuestions.map((q, i) => (
                      <li key={i} className="text-sm text-hacker-text">
                        • {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next button */}
              <button
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setShowAnswer(false);
                  } else {
                    setCompleted(true);
                  }
                }}
                className="w-full px-6 py-3 bg-hacker-primary text-hacker-bg font-bold rounded-xl
                         hover:bg-hacker-primaryDim transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                         focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgSecondary"
              >
                {currentIndex < questions.length - 1 ? 'Siguiente pregunta' : 'Finalizar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TerminalHome;
