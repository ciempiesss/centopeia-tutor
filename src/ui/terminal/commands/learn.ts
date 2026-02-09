import type { CommandHandler } from './index';

const topics = {
  sql: {
    name: 'SQL',
    description: 'Structured Query Language para bases de datos',
    modules: ['SELECT básico', 'WHERE y filtros', 'JOINs', 'GROUP BY', 'Subqueries'],
  },
  python: {
    name: 'Python',
    description: 'Lenguaje de programación versátil',
    modules: ['Variables y tipos', 'Estructuras de control', 'Funciones', 'Listas y diccionarios', 'Módulos'],
  },
  javascript: {
    name: 'JavaScript',
    description: 'Lenguaje de la web',
    modules: ['Variables', 'Funciones', 'DOM', 'Eventos', 'Async/Await'],
  },
};

export const learnCommand: CommandHandler = async (args) => {
  if (!args[0]) {
    return `
╔══════════════════════════════════════════════════════════════╗
║                   TEMAS DISPONIBLES                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  [green]/learn sql[/green]        - SQL (bases de datos)            ║
║  [green]/learn python[/green]     - Python (programación)           ║
║  [green]/learn javascript[/green] - JavaScript (web)                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

[dim]Cada tema se divide en micro-módulos de 10-15 minutos[/dim]
`;
  }

  const topicKey = args[0].toLowerCase() as keyof typeof topics;
  const topic = topics[topicKey];

  if (!topic) {
    return `[red]Error:[/red] Tema no encontrado. Usa /learn para ver opciones.`;
  }

  const nextStep = topicKey === 'python'
    ? '/practice python'
    : `/quiz ${topicKey}`;

  return `
📚 [green]INICIANDO:[/green] ${topic.name}

${topic.description}

Módulos disponibles:
${topic.modules.map((m, i) => `  ${i + 1}. ${m}`).join('\n')}

[dim]Siguiente paso recomendado: ${nextStep}[/dim]
`;
};
