import type { CommandHandler } from './index';
import { LEARNING_PATHS } from '../../../data/learningPaths';

// Topics for random learning
const RANDOM_TOPICS = [
  {
    topic: 'SQL JOINs',
    description: 'Cómo combinar datos de múltiples tablas',
    command: '/learn sql',
    path: 'qa',
  },
  {
    topic: 'Python List Comprehensions',
    description: 'Crear listas de forma concisa y elegante',
    command: '/learn python',
    path: 'developer',
  },
  {
    topic: 'HTTP Status Codes',
    description: 'Qué significan 200, 404, 500 y los demás',
    command: '/quiz general',
    path: 'qa',
  },
  {
    topic: 'Git Básico',
    description: 'Commit, push, pull y branches',
    command: '/learn git',
    path: 'developer',
  },
  {
    topic: 'Testing Pyramid',
    description: 'Unit, Integration y E2E tests',
    command: '/learn testing',
    path: 'qa',
  },
  {
    topic: 'CSS Flexbox',
    description: 'Alinear elementos como un pro',
    command: '/practice css',
    path: 'developer',
  },
  {
    topic: 'RegEx Básico',
    description: 'Buscar patrones en texto',
    command: '/practice regex',
    path: 'developer',
  },
  {
    topic: 'API REST',
    description: 'Cómo funcionan las APIs modernas',
    command: '/learn api',
    path: 'qa',
  },
  {
    topic: 'Data Types',
    description: 'Strings, numbers, booleans y más',
    command: '/quiz python',
    path: 'developer',
  },
  {
    topic: 'Agile vs Waterfall',
    description: 'Metodologías de desarrollo de software',
    command: '/quiz general',
    path: 'qa',
  },
];

export const randomCommand: CommandHandler = async (args, context) => {
  // Select random topic
  const randomIndex = Math.floor(Math.random() * RANDOM_TOPICS.length);
  const topic = RANDOM_TOPICS[randomIndex];

  return `
╔══════════════════════════════════════════════════════════════╗
║                    🎲 TEMA AL AZAR                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📚 ${topic.topic.padEnd(52)} ║
║                                                              ║
║  ${topic.description.padEnd(60)} ║
║                                                              ║
║  Path sugerido: ${topic.path.toUpperCase().padEnd(46)} ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Para aprender esto, escribe:                                ║
║  [green]${topic.command.padEnd(56)}[/green]  ║
║                                                              ║
║  [dim]O escribe /random para otro tema aleatorio[/dim]          ║
╚══════════════════════════════════════════════════════════════╝
`;
};
