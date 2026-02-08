import type { CommandHandler } from './index';
import { codeExecutor, EXERCISE_LIBRARY } from '../../../tools/CodeExecutor';
import { CentopeiaDatabase } from '../../../storage/Database';

const db = CentopeiaDatabase.getInstance();

// Track active exercises per session
const activeExercises: Map<string, {
  exerciseId: string;
  topic: string;
  attemptCount: number;
  completed: boolean;
}> = new Map();

export const practiceCommand: CommandHandler = async (args, context) => {
  const sessionId = context?.sessionId;
  
  // List available topics if no args
  if (!args[0]) {
    return `
╔══════════════════════════════════════════════════════════════╗
║              EJERCICIOS PRÁCTICOS                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  [green]/practice python[/green]     - Ejercicios de Python         ║
║  [green]/practice sql[/green]        - Ejercicios de SQL            ║
║  [green]/practice js[/green]         - Ejercicios de JavaScript     ║
║                                                              ║
║  ─────────────────────────────────────────────────────────  ║
║  Modo interactivo:                                            ║
║  1. Escribe /practice [tema] para empezar                    ║
║  2. Te doy un ejercicio con código inicial                   ║
║  3. Escribe tu código (us \`\`\`python para bloques)            ║
║  4. Ejecuto y te doy feedback                                ║
║                                                              ║
║  [dim]Consejo:[/dim] Si te atascas, escribe "hint" o "pista"   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  const topic = args[0].toLowerCase();
  const exercises = EXERCISE_LIBRARY[topic];

  if (!exercises || exercises.length === 0) {
    return `[red]Error:[/red] No hay ejercicios disponibles para "${topic}".\n\nTópicos disponibles: python, sql`;
  }

  // Get or create session exercise state
  let exerciseState = sessionId ? activeExercises.get(sessionId) : null;
  
  // If user provided code (check for code blocks)
  const input = args.join(' ');
  const codeBlockMatch = input.match(/```(?:python)?\n?([\s\S]*?)```/);
  
  if (codeBlockMatch && exerciseState && sessionId) {
    // User submitted code
    const code = codeBlockMatch[1].trim();
    const exercise = exercises.find(e => e.id === exerciseState!.exerciseId);
    
    if (!exercise) {
      return 'Error: Ejercicio no encontrado. Empieza de nuevo con /practice ' + topic;
    }

    exerciseState.attemptCount++;
    
    // Validate
    const result = await codeExecutor.validateExercise(code, exercise);
    
    // Save progress
    if (result.correct && sessionId) {
      exerciseState.completed = true;
      const session = await db.getStudySession(sessionId);
      if (session) {
        session.exercisesCompleted = (session.exercisesCompleted || 0) + 1;
        await db.saveStudySession(session);
      }
    }

    let feedback = result.feedback;
    
    // Add execution output if any
    if (result.result.output) {
      feedback += `\n\n[dim]Output:[/dim]\n\`\`\`\n${result.result.output}\n\`\`\``;
    }

    // Add hint if wrong and multiple attempts
    if (!result.correct && exerciseState.attemptCount >= 2) {
      const hint = codeExecutor.getHint(exercise, exerciseState.attemptCount - 1);
      feedback += `\n\n💡 [yellow]Pista:[/yellow] ${hint}`;
    }

    // Next steps
    if (result.correct) {
      feedback += `\n\n✅ Ejercicio completado. ¿Siguiente?\nEscribe /practice ${topic} para otro ejercicio.`;
    }

    return feedback;
  }

  // Start new exercise
  const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
  
  if (sessionId) {
    activeExercises.set(sessionId, {
      exerciseId: randomExercise.id,
      topic,
      attemptCount: 0,
      completed: false,
    });
  }

  return `
💻 EJERCICIO: ${randomExercise.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${randomExercise.description}

[dim]Código inicial:[/dim]
\`\`\`python
${randomExercise.starterCode}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Escribe tu solución usando:
\`\`\`python
tu código aquí
\`\`\`

[dim]O escribe "hint" para una pista[/dim]
`;
};

// Helper to check if user is asking for hint
export const isHintRequest = (input: string): boolean => {
  const hintWords = ['hint', 'pista', 'ayuda', 'help', 'no sé'];
  return hintWords.some(word => input.toLowerCase().includes(word));
};

// Get hint for current exercise
export const getHint = async (sessionId: string): Promise<string> => {
  const exerciseState = activeExercises.get(sessionId);
  if (!exerciseState) {
    return 'No hay ejercicio activo. Escribe /practice [tema] para empezar.';
  }

  const exercises = EXERCISE_LIBRARY[exerciseState.topic];
  const exercise = exercises.find(e => e.id === exerciseState.exerciseId);
  
  if (!exercise) {
    return 'Ejercicio no encontrado.';
  }

  const hint = codeExecutor.getHint(exercise, exerciseState.attemptCount);
  return `💡 [yellow]Pista:[/yellow] ${hint}`;
};
