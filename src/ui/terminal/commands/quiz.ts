import type { CommandHandler } from './index';
import { quizGenerator, QUIZ_LIBRARY } from '../../../tools/QuizGenerator';

// Track active quiz sessions
const activeQuizzes: Map<string, string> = new Map(); // sessionId -> quizId

export const quizCommand: CommandHandler = async (args, context) => {
  const sessionId = context?.sessionId;
  
  // Check for exit command first
  if (args[0] === 'exit' || args[0] === 'quit' || args[0] === 'salir') {
    if (sessionId && activeQuizzes.has(sessionId)) {
      activeQuizzes.delete(sessionId);
      return `🛑 Quiz cancelado. Puedes iniciar otro con /quiz [tema]`;
    }
    return `No hay ningún quiz activo para cancelar.`;
  }
  
  // Check if user is answering a question
  const input = args.join(' ').trim();
  
  if (sessionId && activeQuizzes.has(sessionId) && input && !input.startsWith('/')) {
    // User is answering a question
    const quizId = activeQuizzes.get(sessionId)!;
    const question = quizGenerator.getCurrentQuestion(quizId);
    
    if (!question) {
      // Quiz completed
      const results = quizGenerator.getResults(quizId);
      activeQuizzes.delete(sessionId);
      
      if (results) {
        return quizGenerator.generateSummary(results);
      }
      return 'Quiz completado.';
    }

    // Parse and submit answer
    const answer = quizGenerator.parseAnswer(input, question);
    const result = quizGenerator.submitAnswer(quizId, answer);

    // Build response
    let response = '';
    
    if (result.correct) {
      response += '✅ [green]¡Correcto![/green]\n';
    } else {
      response += `❌ [red]Incorrecto.[/red] La respuesta correcta era: ${result.correctAnswer}\n`;
    }

    response += `\n${result.explanation}\n`;

    // Next question or finish
    if (result.isLast) {
      const results = quizGenerator.getResults(quizId);
      activeQuizzes.delete(sessionId);
      
      if (results) {
        response += '\n' + quizGenerator.generateSummary(results);
      }
    } else if (result.nextQuestion) {
      response += '\n' + quizGenerator.formatQuestion(
        result.nextQuestion,
        result.progress.current,
        result.progress.total
      );
    }

    return response;
  }

  // Start new quiz
  if (!args[0]) {
    const topics = Object.keys(QUIZ_LIBRARY).join(', ');
    return `
╔══════════════════════════════════════════════════════════════╗
║                    QUIZ DE CONOCIMIENTOS                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  [green]/quiz python[/green]      - Quiz de Python                   ║
║  [green]/quiz sql[/green]         - Quiz de SQL                      ║
║  [green]/quiz javascript[/green]  - Quiz de JavaScript               ║
║  [green]/quiz general[/green]     - Conocimientos generales          ║
║                                                              ║
║  ─────────────────────────────────────────────────────────  ║
║  Instrucciones:                                              ║
║  1. Escribe /quiz [tema] para empezar                        ║
║  2. Responde escribiendo la letra (A, B, C, D)               ║
║  3. O escribe la respuesta directamente                      ║
║  4. Recibe feedback inmediato                                ║
║                                                              ║
║  [yellow]/quiz exit[/yellow]      - Salir del quiz actual            ║
║                                                              ║
║  [dim]Consejo:[/dim] Los quizzes son de 5 preguntas.            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  const topic = args[0].toLowerCase();
  
  if (!QUIZ_LIBRARY[topic]) {
    return `[red]Error:[/red] Tema "${topic}" no disponible.\n\nTópicos disponibles: ${Object.keys(QUIZ_LIBRARY).join(', ')}\n\n[dim]Escribe /quiz exit para salir de un quiz activo.[/dim]`;
  }

  // Generate new quiz
  const quiz = quizGenerator.generateQuiz(topic, 5);
  
  if (sessionId) {
    activeQuizzes.set(sessionId, quiz.id);
  }

  // Show first question
  const firstQuestion = quiz.questions[0];
  return `
🎯 QUIZ: ${topic.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${quizGenerator.formatQuestion(firstQuestion, 0, quiz.questions.length)}
`;
};

// Reset quiz (for testing or if stuck)
export const resetQuiz = (sessionId: string): void => {
  activeQuizzes.delete(sessionId);
};

// Check if there's an active quiz
export const hasActiveQuiz = (sessionId: string): boolean => {
  return activeQuizzes.has(sessionId);
};
