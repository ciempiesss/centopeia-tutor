import React, { useState, useEffect } from 'react';
import { 
  Play, Brain, Target, Zap, Dice5,
  Sparkles, Trophy, Briefcase, Terminal, ChevronRight,
  Building2, BookOpen, Lightbulb, AlertCircle, CheckCircle2,
  X, ArrowLeft
} from 'lucide-react';
import type { LearningPath } from '../../data/learningPaths';
import type { InterviewQuestion, QuestionCategory } from '../../data/interviewQuestions';
import { 
  getRandomQuestions, 
  getQuestionsByCategory,
  TECHNICAL_QUESTIONS,
  BEHAVIORAL_QUESTIONS,
  SCENARIO_QUESTIONS,
  PROCESS_QUESTIONS,
  TOOLS_QUESTIONS,
  ALL_QUESTIONS
} from '../../data/interviewQuestions';
import { getNextModule } from '../../data/learningPaths';
import { GettingStarted } from './GettingStarted';

interface TerminalHomeProps {
  onCommand: (command: string) => void;
  onStartInterview?: () => void;
  selectedPath?: LearningPath | null;
  hasApiKey?: boolean;
  completedModules?: number;
  showGettingStarted?: boolean;
  onDismissGettingStarted?: () => void;
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
    id: 'random',
    command: '/random',
    label: 'Tema al Azar',
    description: 'Aprende algo nuevo',
    icon: Dice5,
    color: '#ff6b6b',
    shortcut: 'R',
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

export function TerminalHome({ 
  onCommand, 
  onStartInterview, 
  selectedPath,
  hasApiKey = false,
  completedModules = 0,
  showGettingStarted = true,
  onDismissGettingStarted
}: TerminalHomeProps) {
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

  const getWelcomeMessage = () => {
    if (!selectedPath) {
      return {
        title: '¿Qué quieres aprender hoy?',
        subtitle: 'Selecciona un path abajo o explora libremente',
      };
    }
    
    const hour = currentTime.getHours();
    const greetings = {
      morning: ['Buenos días', '¡Arriba que hay que codear!', '¿Café y código?'],
      afternoon: ['Buenas tardes', '¿Productivo el día?', 'Seguimos aprendiendo'],
      evening: ['Buenas noches', '¿Código nocturno?', 'Nunca es tarde para aprender'],
    };
    
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const greeting = greetings[timeOfDay][Math.floor(Math.random() * greetings[timeOfDay].length)];
    
    return {
      title: `${greeting}`,
      subtitle: `Path activo: ${selectedPath.title} (${selectedPath.skills.length} skills)`,
    };
  };

  const handleGettingStartedAction = (action: 'config' | 'paths' | 'help' | 'focus') => {
    const commandMap = {
      config: '/config',
      paths: '/role',
      help: '/learn python',
      focus: '/micro',
    };
    handleCommand(commandMap[action]);
  };

  const shouldShowGettingStarted = showGettingStarted && (!hasApiKey || !selectedPath || completedModules === 0);

  return (
    <div className="space-y-6">
      {/* Getting Started - Onboarding */}
      {shouldShowGettingStarted && (
        <GettingStarted
          hasApiKey={hasApiKey}
          hasSelectedPath={!!selectedPath}
          completedModules={completedModules}
          onAction={handleGettingStartedAction}
          onDismiss={onDismissGettingStarted}
        />
      )}

      {/* Header con saludo inteligente */}
      <div className="border border-hacker-border rounded-xl p-4 bg-hacker-bgSecondary/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-hacker-textMuted text-sm">{getGreeting()}</p>
            <h2 className="text-xl font-bold text-hacker-text">
              {getWelcomeMessage().title}
            </h2>
            <p className="text-sm text-hacker-textDim mt-1">
              {getWelcomeMessage().subtitle}
            </p>
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
          {['/help', '/role', '/config', '/stop', '/learn', '/practice python'].map(cmd => (
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

// Categorías de entrevista para el selector
type InterviewCategory = 'all' | QuestionCategory;

interface InterviewModeProps {
  onExit: () => void;
}

// Componente de tarjeta de categoría
function CategoryCard({ 
  title, 
  description, 
  count, 
  icon: Icon, 
  color,
  onClick,
  isSelected
}: { 
  title: string;
  description: string;
  count: number;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border transition-all duration-200 text-left group
        ${isSelected 
          ? 'border-hacker-primary bg-hacker-primary/10' 
          : 'border-hacker-border bg-hacker-bgSecondary hover:border-hacker-borderHover hover:bg-hacker-bgTertiary'
        }`}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-hacker-text text-sm">{title}</h4>
            {isSelected && <CheckCircle2 className="w-4 h-4 text-hacker-primary" />}
          </div>
          <p className="text-xs text-hacker-textMuted mt-1">{description}</p>
          <span className="text-xs text-hacker-textDim mt-2 inline-block">{count} preguntas</span>
        </div>
      </div>
    </button>
  );
}

export function InterviewMode({ onExit }: InterviewModeProps) {
  const [mode, setMode] = useState<'selector' | 'practice' | 'study'>('selector');
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory>('all');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [studyMode, setStudyMode] = useState(false);

  const categories = [
    { 
      id: 'technical' as QuestionCategory, 
      title: 'Fundamentos Técnicos', 
      description: 'Conceptos clave: Verificación vs Validación, Bug Lifecycle, Smoke vs Sanity',
      count: TECHNICAL_QUESTIONS.length,
      icon: Brain,
      color: '#00ff41'
    },
    { 
      id: 'scenario' as QuestionCategory, 
      title: 'Escenarios Prácticos', 
      description: 'Casos reales: "En mi máquina funciona", priorización, bugs interesantes',
      count: SCENARIO_QUESTIONS.length,
      icon: AlertCircle,
      color: '#ffb000'
    },
    { 
      id: 'behavioral' as QuestionCategory, 
      title: 'Habilidades Blandas', 
      description: 'Soft skills: manejo de presión, por qué QA, mantenerte actualizado',
      count: BEHAVIORAL_QUESTIONS.length,
      icon: Sparkles,
      color: '#00f0ff'
    },
    { 
      id: 'process' as QuestionCategory, 
      title: 'Procesos & Agile', 
      description: 'Metodologías: QA en Scrum, Definition of Done, integración ágil',
      count: PROCESS_QUESTIONS.length,
      icon: Target,
      color: '#9b59b6'
    },
    { 
      id: 'tools' as QuestionCategory, 
      title: 'Herramientas', 
      description: 'Stack técnico: Jira, Postman, SQL, Git, automatización',
      count: TOOLS_QUESTIONS.length,
      icon: Briefcase,
      color: '#ff6b6b'
    },
  ];

  const startPractice = (category: InterviewCategory) => {
    let selectedQuestions: InterviewQuestion[];
    if (category === 'all') {
      selectedQuestions = getRandomQuestions(5);
    } else {
      const categoryQuestions = getQuestionsByCategory(category);
      selectedQuestions = [...categoryQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    }
    setQuestions(selectedQuestions);
    setSelectedCategory(category);
    setMode('practice');
    setStudyMode(false);
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(false);
  };

  const startStudyMode = () => {
    setQuestions(ALL_QUESTIONS);
    setMode('practice');
    setStudyMode(true);
    setCurrentIndex(0);
    setShowAnswer(true);
    setCompleted(false);
  };

  // Vista de selector de categoría
  if (mode === 'selector') {
    return (
      <div className="h-full flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-hacker-border bg-hacker-bgSecondary sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-hacker-primary/20">
                <Briefcase className="w-5 h-5 text-hacker-primary" />
              </div>
              <div>
                <h2 className="font-bold text-hacker-text">Simulador de Entrevistas</h2>
                <p className="text-xs text-hacker-textMuted">
                  Preguntas reales de empresas mexicanas
                </p>
              </div>
            </div>
            <button
              onClick={onExit}
              className="p-2 rounded-lg text-hacker-textDim hover:text-hacker-text hover:bg-hacker-bgTertiary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-w-3xl mx-auto w-full space-y-6">
          {/* Intro */}
          <div className="bg-hacker-primary/5 border border-hacker-primary/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-hacker-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-hacker-text mb-1">
                  Preparación para empresas reales
                </h3>
                <p className="text-sm text-hacker-textMuted">
                  Preguntas basadas en entrevistas reales de: <span className="text-hacker-primary">Softtek</span>,{' '}
                  <span className="text-hacker-primary">Kueski</span>,{' '}
                  <span className="text-hacker-primary">Kavak</span>,{' '}
                  <span className="text-hacker-primary">Konfío</span>,{' '}
                  <span className="text-hacker-primary">Mercado Libre</span> y startups tech mexicanas.
                </p>
              </div>
            </div>
          </div>

          {/* Modo Estudio */}
          <div className="bg-hacker-accent/5 border border-hacker-accent/20 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-hacker-accent/20">
                <BookOpen className="w-6 h-6 text-hacker-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-hacker-text mb-1">Modo Estudio</h3>
                <p className="text-sm text-hacker-textMuted mb-3">
                  Revisa todas las preguntas con sus respuestas clave completas. 
                  Ideal para prepararte antes de una entrevista real.
                </p>
                <button
                  onClick={startStudyMode}
                  className="px-4 py-2 bg-hacker-accent text-hacker-bg font-bold rounded-lg
                           hover:bg-hacker-accentDim transition-colors text-sm"
                >
                  Ver todas las preguntas ({ALL_QUESTIONS.length})
                </button>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-sm font-bold text-hacker-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Practica por categoría
            </h3>
            <div className="grid gap-3">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  {...cat}
                  onClick={() => startPractice(cat.id)}
                  isSelected={false}
                />
              ))}
            </div>
          </div>

          {/* Práctica general */}
          <button
            onClick={() => startPractice('all')}
            className="w-full p-4 rounded-xl border-2 border-dashed border-hacker-primary/50 
                     bg-hacker-primary/5 hover:bg-hacker-primary/10 transition-colors
                     flex items-center justify-center gap-3 group"
          >
            <Play className="w-5 h-5 text-hacker-primary group-hover:scale-110 transition-transform" />
            <span className="font-bold text-hacker-text">Práctica Rápida (5 preguntas aleatorias)</span>
          </button>
        </div>
      </div>
    );
  }

  // Vista de práctica/estudio
  if (completed) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Trophy className="w-16 h-16 text-hacker-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-hacker-text mb-2">
          {studyMode ? '¡Estudio completado!' : '¡Práctica completada!'}
        </h2>
        <p className="text-hacker-textMuted mb-6 max-w-md">
          {studyMode 
            ? `Revisaste ${questions.length} preguntas. Recuerda: la preparación es la clave del éxito.`
            : `Revisaste ${questions.length} preguntas de entrevista. La práctica hace al maestro.`
          }
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => setMode('selector')}
            className="px-6 py-3 bg-hacker-primary text-hacker-bg font-bold rounded-xl
                     hover:bg-hacker-primaryDim transition-colors block w-full"
          >
            Volver al menú
          </button>
          <button
            onClick={onExit}
            className="px-6 py-3 border border-hacker-border text-hacker-text rounded-xl
                     hover:bg-hacker-bgTertiary transition-colors block w-full"
          >
            Salir al terminal
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
            <button
              onClick={() => setMode('selector')}
              className="p-1.5 rounded-lg text-hacker-textDim hover:text-hacker-text hover:bg-hacker-bgTertiary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Briefcase className="w-5 h-5 text-hacker-primary" />
            <span className="font-bold text-hacker-text">
              {studyMode ? 'Modo Estudio' : 'Simulador'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-hacker-textMuted">
              {currentIndex + 1} / {questions.length}
            </span>
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg text-hacker-textDim hover:text-hacker-text hover:bg-hacker-bgTertiary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-hacker-bgTertiary rounded-full overflow-hidden">
          <div 
            className="h-full bg-hacker-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Question Card */}
          <div className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs px-2 py-1 rounded-full bg-hacker-primary/20 text-hacker-primary uppercase tracking-wider">
                {current.category}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-hacker-bgTertiary text-hacker-textMuted">
                {current.difficulty}
              </span>
              {current.companies && current.companies.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-hacker-accent/20 text-hacker-accent flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {current.companies.slice(0, 2).join(', ')}
                </span>
              )}
            </div>
            
            <h2 className="text-lg font-bold text-hacker-text mb-3">
              {current.questionES}
            </h2>
            
            {current.questionEN && (
              <p className="text-sm text-hacker-textDim italic border-l-2 border-hacker-border pl-3">
                {current.questionEN}
              </p>
            )}
            
            {current.context && (
              <p className="text-xs text-hacker-textMuted mt-3">
                <span className="text-hacker-accent">Contexto:</span> {current.context}
              </p>
            )}
          </div>

          {/* Answer Section */}
          {(!showAnswer && !studyMode) ? (
            <div className="text-center py-8">
              <p className="text-hacker-textMuted mb-4">
                Piensa en tu respuesta antes de ver los tips...
              </p>
              <button
                onClick={() => setShowAnswer(true)}
                className="px-6 py-3 bg-hacker-primary text-hacker-bg font-bold rounded-xl
                         hover:bg-hacker-primaryDim transition-colors"
              >
                Ver tips de respuesta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Model Answer (if available) */}
              {current.modelAnswer && (
                <div className="bg-hacker-primary/10 border border-hacker-primary/30 rounded-xl p-4">
                  <h3 className="font-bold text-hacker-primary mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Respuesta Clave
                  </h3>
                  <p className="text-sm text-hacker-text leading-relaxed">
                    {current.modelAnswer}
                  </p>
                </div>
              )}

              {/* Good answer tips */}
              <div className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-4">
                <h3 className="font-bold text-hacker-text mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-hacker-accent" />
                  Cómo responder bien
                </h3>
                <ul className="space-y-2">
                  {current.goodAnswerTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-hacker-text">
                      <span className="text-hacker-primary mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What they look for */}
              <div className="bg-hacker-bgSecondary border border-hacker-border rounded-xl p-4">
                <h3 className="font-bold text-hacker-text mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-hacker-secondary" />
                  Qué busca el entrevistador
                </h3>
                <ul className="space-y-2">
                  {current.whatTheyLookFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-hacker-textMuted">
                      <span className="text-hacker-secondary mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up questions */}
              {current.followUpQuestions && current.followUpQuestions.length > 0 && (
                <div className="bg-hacker-accent/5 border border-hacker-accent/20 rounded-xl p-4">
                  <h3 className="font-bold text-hacker-accent mb-3">
                    Preguntas de seguimiento posibles
                  </h3>
                  <ul className="space-y-2">
                    {current.followUpQuestions.map((q, i) => (
                      <li key={i} className="text-sm text-hacker-text flex items-start gap-2">
                        <span className="text-hacker-accent">?</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                {currentIndex > 0 && (
                  <button
                    onClick={() => {
                      setCurrentIndex(currentIndex - 1);
                      if (!studyMode) setShowAnswer(false);
                    }}
                    className="px-4 py-2 border border-hacker-border text-hacker-text rounded-lg
                             hover:bg-hacker-bgTertiary transition-colors"
                  >
                    Anterior
                  </button>
                )}
                <button
                  onClick={() => {
                    if (currentIndex < questions.length - 1) {
                      setCurrentIndex(currentIndex + 1);
                      if (!studyMode) setShowAnswer(false);
                    } else {
                      setCompleted(true);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-hacker-primary text-hacker-bg font-bold rounded-xl
                           hover:bg-hacker-primaryDim transition-colors"
                >
                  {currentIndex < questions.length - 1 ? 'Siguiente pregunta' : 'Finalizar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TerminalHome;
