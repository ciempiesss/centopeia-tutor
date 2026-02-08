import type { CommandHandler } from '../../ui/terminal/commands';

// Sistema Anti-Parálisis para AUDHD
// Cuando el usuario no puede empezar una tarea, este sistema
// la descompone en pasos ridículamente pequeños

interface MicroStep {
  id: number;
  text: string;
  duration: number; // minutos estimados
  action: string;   // acción concreta
}

interface TaskBreakdown {
  original: string;
  steps: MicroStep[];
  totalSteps: number;
}

export class AntiParalysisSystem {
  // Plantillas de descomposición para tareas comunes de programación
  private taskTemplates: Record<string, (task: string) => MicroStep[]> = {
    'aprender': (task) => [
      { id: 1, text: 'Abre el material (no leas, solo abre)', duration: 1, action: 'Abrir libro/link' },
      { id: 2, text: 'Lee el título del tema', duration: 1, action: 'Leer título' },
      { id: 3, text: 'Lee la primera oración', duration: 2, action: 'Primera oración' },
      { id: 4, text: 'Identifica UNA palabra nueva', duration: 2, action: 'Buscar palabra' },
    ],
    'ejercicio': (task) => [
      { id: 1, text: 'Abre el editor (no escribas)', duration: 1, action: 'Abrir editor' },
      { id: 2, text: 'Lee el enunciado del ejercicio', duration: 3, action: 'Leer enunciado' },
      { id: 3, text: 'Escribe solo el nombre de la función', duration: 2, action: 'Escribir nombre' },
      { id: 4, text: 'Escribe un comentario de qué debe hacer', duration: 3, action: 'Comentario' },
      { id: 5, text: 'Escribe la primera línea de código', duration: 5, action: 'Primera línea' },
    ],
    'proyecto': (task) => [
      { id: 1, text: 'Crea una carpeta vacía', duration: 1, action: 'Crear carpeta' },
      { id: 2, text: 'Abre la terminal en esa carpeta', duration: 1, action: 'Abrir terminal' },
      { id: 3, text: 'Escribe el nombre del proyecto en un README', duration: 3, action: 'README' },
      { id: 4, text: 'Crea UN archivo vacío', duration: 1, action: 'Crear archivo' },
    ],
    'revisar': (task) => [
      { id: 1, text: 'Abre el código (no lo leas todo)', duration: 1, action: 'Abrir código' },
      { id: 2, text: 'Lee solo el nombre de la primera función', duration: 1, action: 'Leer nombre' },
      { id: 3, text: 'Encuentra UNA línea que no entiendas', duration: 3, action: 'Buscar línea' },
    ],
  };

  // Detectar si el usuario está atascado (task paralysis)
  detectParalysis(input: string): boolean {
    const paralysisIndicators = [
      'no sé por dónde empezar',
      'no puedo empezar',
      'me da pereza',
      'estoy abrumado',
      'es muy difícil',
      'no entiendo nada',
      'me bloqueé',
      'no avanzo',
      'ayuda',
      'estoy atascado',
      'no sé qué hacer',
      'me paralicé',
    ];

    const lowerInput = input.toLowerCase();
    return paralysisIndicators.some(indicator => lowerInput.includes(indicator));
  }

  // Generar descomposición de tarea
  breakdownTask(task: string): TaskBreakdown {
    // Detectar tipo de tarea
    const lowerTask = task.toLowerCase();
    let steps: MicroStep[] = [];

    if (lowerTask.includes('aprender') || lowerTask.includes('estudiar')) {
      steps = this.taskTemplates['aprender'](task);
    } else if (lowerTask.includes('ejercicio') || lowerTask.includes('practicar')) {
      steps = this.taskTemplates['ejercicio'](task);
    } else if (lowerTask.includes('proyecto') || lowerTask.includes('app')) {
      steps = this.taskTemplates['proyecto'](task);
    } else if (lowerTask.includes('revisar') || lowerTask.includes('repasar')) {
      steps = this.taskTemplates['revisar'](task);
    } else {
      // Descomposición genérica
      steps = [
        { id: 1, text: 'Respira profundo (3 segundos)', duration: 1, action: 'Respirar' },
        { id: 2, text: 'Escribe el objetivo en UNA frase', duration: 2, action: 'Definir objetivo' },
        { id: 3, text: 'Abre la herramienta necesaria', duration: 1, action: 'Abrir herramienta' },
        { id: 4, text: 'Haz UNA acción mínima', duration: 5, action: 'Primera acción' },
      ];
    }

    return {
      original: task,
      steps,
      totalSteps: steps.length,
    };
  }

  // Generar mensaje de apoyo RSD-safe
  generateSupportMessage(): string {
    const messages = [
      'Esto pasa. Vamos a hacerlo más pequeño.',
      'No hay prisa. Un paso a la vez.',
      'El inicio es lo más difícil. Empecemos ridículamente fácil.',
      'Tu cerebro necesita un punto de entrada. Aquí va uno:',
      'No tienes que entender todo ahora. Solo abrir esto:',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Generar comando /micro
  generateMicroCommand(breakdown: TaskBreakdown): string {
    const firstStep = breakdown.steps[0];
    
    return `
🧠 [green]MODO ANTI-PARÁLISIS ACTIVADO[/green]

${this.generateSupportMessage()}

Tarea: "${breakdown.original}"

[green]Paso 1/${breakdown.totalSteps}[/green] (solo este, nada más):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${firstStep.text}
⏱️ Tiempo estimado: ${firstStep.duration} minuto(s)
🎯 Acción: ${firstStep.action}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[dim]Cuando termines este paso, escribe "listo" y te doy el siguiente.[/dim]
[dim]Si no puedes con este paso, dime y lo hacemos MÁS pequeño.[/dim]
`;
  }

  // Progresar al siguiente paso
  getNextStep(breakdown: TaskBreakdown, currentStepId: number): MicroStep | null {
    return breakdown.steps.find(s => s.id === currentStepId + 1) || null;
  }

  // Celebrar progreso (RSD-safe)
  generateCelebration(stepNumber: number, totalSteps: number, steps?: MicroStep[]): string {
    if (stepNumber === totalSteps) {
      return `
🎉 ¡LO HICISTE!

Completaste todos los pasos. La tarea ya está en movimiento.
[green]El inicio es lo más difícil[/green] - ya pasó lo peor.

¿Continuas o necesitas un break?`;
    }

    const encouragements = [
      `✅ Paso ${stepNumber} completado. Eso es progreso real.`,
      `✅ Bien. Un paso menos. Siguiente:`,
      `✅ Avanzaste. No tiene que ser perfecto, solo moverse.`,
      `✅ Hecho. La física dice que un objeto en movimiento tiende a seguir en movimiento.`,
    ];

    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    // Use provided steps if available
    if (steps && steps.length > 0) {
      const nextStep = steps.find(s => s.id === stepNumber + 1);
      if (nextStep) {
        return `
${randomEncouragement}

[green]Paso ${stepNumber + 1}:[/green] ${nextStep.text}
⏱️ ${nextStep.duration} min`;
      }
    }

    return randomEncouragement;
  }
}

// Singleton instance
export const antiParalysis = new AntiParalysisSystem();

// Comando /micro
export const microCommand: CommandHandler = async (args) => {
  const task = args.join(' ');
  
  if (!task) {
    return `
╔══════════════════════════════════════════════════════════════╗
║              MODO ANTI-PARÁLISIS (AUDHD)                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Cuando una tarea parece imposible de empezar, este modo     ║
║  la divide en pasos ridículamente pequeños.                  ║
║                                                              ║
║  Uso: /micro [tarea que te bloquea]                          ║
║                                                              ║
║  Ejemplos:                                                   ║
║  • /micro quiero aprender SQL pero no sé por dónde empezar   ║
║  • /micro tengo que hacer un ejercicio de Python             ║
║  • /micro necesito empezar un proyecto                       ║
║                                                              ║
║  [dim]No hay vergüenza en pedir ayuda para empezar.          ║
║  [dim]El 80% de la productividad es solo iniciar.            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  const breakdown = antiParalysis.breakdownTask(task);
  return antiParalysis.generateMicroCommand(breakdown);
};
