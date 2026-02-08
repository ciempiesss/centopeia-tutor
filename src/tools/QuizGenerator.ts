import type { TerminalMessage } from '../types';
import { generateId } from '../utils/idGenerator';

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_trace';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface QuizSession {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string | number>;
  score: number;
  startedAt: string;
  completedAt?: string;
}

interface QuizResult {
  correct: boolean;
  selectedAnswer: string | number;
  correctAnswer: string | number;
  explanation: string;
  nextQuestion?: QuizQuestion;
  isLast: boolean;
  progress: { current: number; total: number };
}

// Quiz library organized by topic
export const QUIZ_LIBRARY: Record<string, QuizQuestion[]> = {
  python: [
    {
      id: 'py-q1',
      type: 'multiple_choice',
      question: '¿Qué función se usa para imprimir en Python?',
      options: ['echo()', 'print()', 'console.log()', 'puts()'],
      correctAnswer: 1, // Index of print()
      explanation: 'print() es la función built-in de Python para mostrar output.',
      difficulty: 'easy',
      topic: 'python',
    },
    {
      id: 'py-q2',
      type: 'true_false',
      question: 'En Python, las variables deben declarar su tipo antes de usarlas.',
      options: ['Verdadero', 'Falso'],
      correctAnswer: 1, // Falso
      explanation: 'Python es de tipado dinámico. No necesitas declarar tipos.',
      difficulty: 'easy',
      topic: 'python',
    },
    {
      id: 'py-q3',
      type: 'fill_blank',
      question: 'Completa: ___ i in range(5):\n    print(i)',
      correctAnswer: 'for',
      explanation: 'for se usa para iterar sobre secuencias como range().',
      difficulty: 'easy',
      topic: 'python',
    },
    {
      id: 'py-q4',
      type: 'code_trace',
      question: '¿Qué output produce este código?\n\nx = 10\ny = 3\nprint(x // y)',
      options: ['3.33', '3', '10/3', 'Error'],
      correctAnswer: 1, // 3
      explanation: '// es división entera (floor division). 10 // 3 = 3',
      difficulty: 'medium',
      topic: 'python',
    },
    {
      id: 'py-q5',
      type: 'multiple_choice',
      question: '¿Cuál es la diferencia entre lista y tupla?',
      options: [
        'Las listas usan [] y las tuplas ()',
        'Las listas son mutables, las tuplas inmutables',
        'Las tuplas son más rápidas',
        'Todas las anteriores'
      ],
      correctAnswer: 3, // Todas
      explanation: 'Todas son correctas: sintaxis diferente, mutabilidad, y rendimiento.',
      difficulty: 'medium',
      topic: 'python',
    },
  ],
  sql: [
    {
      id: 'sql-q1',
      type: 'multiple_choice',
      question: '¿Qué significa SQL?',
      options: [
        'Simple Question Language',
        'Structured Query Language',
        'System Query Logic',
        'Standard Question Logic'
      ],
      correctAnswer: 1, // Structured Query Language
      explanation: 'SQL = Structured Query Language (Lenguaje de Consulta Estructurado).',
      difficulty: 'easy',
      topic: 'sql',
    },
    {
      id: 'sql-q2',
      type: 'fill_blank',
      question: 'Comando para obtener datos: ___ * FROM tabla;',
      correctAnswer: 'SELECT',
      explanation: 'SELECT se usa para consultar/retornar datos de tablas.',
      difficulty: 'easy',
      topic: 'sql',
    },
    {
      id: 'sql-q3',
      type: 'multiple_choice',
      question: '¿Qué hace JOIN?',
      options: [
        'Elimina tablas',
        'Combina datos de múltiples tablas',
        'Ordena resultados',
        'Crea una nueva tabla'
      ],
      correctAnswer: 1,
      explanation: 'JOIN combina registros de dos o más tablas basándose en una condición relacionada.',
      difficulty: 'medium',
      topic: 'sql',
    },
  ],
  javascript: [
    {
      id: 'js-q1',
      type: 'multiple_choice',
      question: '¿Cómo se declara una variable constante en JS?',
      options: ['var', 'let', 'const', 'static'],
      correctAnswer: 2, // const
      explanation: 'const declara una variable que no puede ser reasignada.',
      difficulty: 'easy',
      topic: 'javascript',
    },
    {
      id: 'js-q2',
      type: 'code_trace',
      question: '¿Qué devuelve: typeof [] ?',
      options: ['"array"', '"object"', '"list"', '"undefined"'],
      correctAnswer: 1, // object
      explanation: 'En JavaScript, typeof [] retorna "object" (los arrays son objetos).',
      difficulty: 'medium',
      topic: 'javascript',
    },
  ],
  general: [
    {
      id: 'gen-q1',
      type: 'true_false',
      question: 'HTTP y HTTPS son lo mismo.',
      options: ['Verdadero', 'Falso'],
      correctAnswer: 1, // Falso
      explanation: 'HTTPS es HTTP con cifrado SSL/TLS para seguridad.',
      difficulty: 'easy',
      topic: 'general',
    },
    {
      id: 'gen-q2',
      type: 'multiple_choice',
      question: '¿Qué es un bug en programación?',
      options: [
        'Un insecto en el código',
        'Un error o defecto en el software',
        'Un tipo de variable',
        'Un framework'
      ],
      correctAnswer: 1,
      explanation: 'Bug = error o defecto que causa comportamiento inesperado.',
      difficulty: 'easy',
      topic: 'general',
    },
  ],
};

export class QuizGenerator {
  private activeQuizzes: Map<string, QuizSession> = new Map();

  // Generate a new quiz
  generateQuiz(topic: string, questionCount: number = 5): QuizSession {
    const questions = this.selectQuestions(topic, questionCount);
    
    const session: QuizSession = {
      id: generateId(),
      topic,
      questions,
      currentIndex: 0,
      answers: {},
      score: 0,
      startedAt: new Date().toISOString(),
    };

    this.activeQuizzes.set(session.id, session);
    return session;
  }

  // Select random questions from topic
  private selectQuestions(topic: string, count: number): QuizQuestion[] {
    const questions = QUIZ_LIBRARY[topic] || QUIZ_LIBRARY['general'];
    
    // Shuffle and take requested count
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Get current question
  getCurrentQuestion(sessionId: string): QuizQuestion | null {
    const session = this.activeQuizzes.get(sessionId);
    if (!session) return null;
    
    return session.questions[session.currentIndex] || null;
  }

  // Submit answer
  submitAnswer(sessionId: string, answer: string | number): QuizResult {
    const session = this.activeQuizzes.get(sessionId);
    if (!session) {
      throw new Error('Quiz session not found');
    }

    const question = session.questions[session.currentIndex];
    if (!question) {
      throw new Error('No more questions');
    }

    // Record answer
    session.answers[question.id] = answer;
    
    // Check correctness
    const correct = answer === question.correctAnswer;
    if (correct) {
      session.score++;
    }

    // Move to next
    session.currentIndex++;
    const nextQuestion = session.questions[session.currentIndex];
    const isLast = !nextQuestion;

    // If completed, record time
    if (isLast) {
      session.completedAt = new Date().toISOString();
    }

    return {
      correct,
      selectedAnswer: answer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      nextQuestion,
      isLast,
      progress: {
        current: session.currentIndex,
        total: session.questions.length,
      },
    };
  }

  // Get final results
  getResults(sessionId: string): { score: number; total: number; percentage: number; topic: string } | null {
    const session = this.activeQuizzes.get(sessionId);
    if (!session) return null;

    return {
      score: session.score,
      total: session.questions.length,
      percentage: Math.round((session.score / session.questions.length) * 100),
      topic: session.topic,
    };
  }

  // Format quiz for display
  formatQuestion(question: QuizQuestion, index: number, total: number): string {
    let formatted = `
╔══════════════════════════════════════════════════════════════╗
║  🎯 QUIZ - PREGUNTA ${index + 1} DE ${total}                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
${question.question.split('\n').map(line => `║  ${line.padEnd(56)} ║`).join('\n')}
║                                                              ║
╠══════════════════════════════════════════════════════════════╣`;

    if (question.options) {
      formatted += '\n║                                                              ║';
      question.options.forEach((option, i) => {
        const letters = ['A', 'B', 'C', 'D'];
        const line = `  ${letters[i]}) ${option}`;
        formatted += `\n║${line.padEnd(62)}║`;
      });
      formatted += '\n║                                                              ║';
    }

    if (question.type === 'fill_blank') {
      formatted += '\n║  [Responde con la palabra que falta]                         ║';
    }

    formatted += `
╠══════════════════════════════════════════════════════════════╣
║  [dim]Escribe la letra (A, B, C, D) o tu respuesta[/dim]          ║
║  [dim]Escribe /quiz exit para cancelar el quiz[/dim]              ║
╚══════════════════════════════════════════════════════════════╝`;
    
    return formatted;
  }

  // Parse user answer
  parseAnswer(userInput: string, question: QuizQuestion): string | number {
    const trimmed = userInput.trim().toUpperCase();

    if (question.type === 'multiple_choice' && question.options) {
      // Map letters to indices
      const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      if (letterMap[trimmed] !== undefined) {
        return letterMap[trimmed];
      }
    }

    if (question.type === 'true_false') {
      if (trimmed === 'V' || trimmed === 'VERDADERO' || trimmed === 'A') return 0;
      if (trimmed === 'F' || trimmed === 'FALSO' || trimmed === 'B') return 1;
    }

    // For fill_blank or other types, return as-is (lowercase for comparison)
    return userInput.trim().toLowerCase();
  }

  // Generate summary message
  generateSummary(results: { score: number; total: number; percentage: number; topic: string }): string {
    const { score, total, percentage, topic } = results;
    
    let emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
    let message = percentage >= 80 
      ? '¡Excelente trabajo!' 
      : percentage >= 60 
        ? '¡Buen trabajo! Hay espacio para mejorar.' 
        : '¡Sigue practicando! La mejora viene con la práctica.';

    return `
${emoji} RESULTADOS DEL QUIZ

Tema: ${topic.toUpperCase()}
Puntuación: ${score}/${total} (${percentage}%)

${message}

${percentage < 100 ? '[dim]Escribe /learn ' + topic + ' para revisar el tema.[/dim]' : ''}
${percentage >= 80 ? '[green]¡Listo para el siguiente nivel![/green]' : ''}
`;
  }

  // Reset/cancel a quiz session
  resetQuiz(sessionId: string): boolean {
    return this.activeQuizzes.delete(sessionId);
  }

  // Check if a quiz is active
  isActive(sessionId: string): boolean {
    return this.activeQuizzes.has(sessionId);
  }
}

// Singleton
export const quizGenerator = new QuizGenerator();
