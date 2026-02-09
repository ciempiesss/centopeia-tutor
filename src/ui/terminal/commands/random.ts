import type { CommandHandler } from './index';

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
    topic: 'JavaScript Functions',
    description: 'Funciones, parámetros y retorno',
    command: '/learn javascript',
    path: 'developer',
  },
  {
    topic: 'HTTP Status Codes',
    description: 'Qué significan 200, 404, 500 y los demás',
    command: '/quiz general',
    path: 'qa',
  },
  {
    topic: 'Data Types (Python)',
    description: 'Strings, numbers, booleans y más',
    command: '/quiz python',
    path: 'developer',
  },
  {
    topic: 'Ejercicio de Python',
    description: 'Practica con un reto rápido',
    command: '/practice python',
    path: 'developer',
  },
];

export const randomCommand: CommandHandler = async (args, context) => {
  // Select random topic
  const randomIndex = Math.floor(Math.random() * RANDOM_TOPICS.length);
  const topic = RANDOM_TOPICS[randomIndex];

  return `[green]🎲 Tema al azar:[/green] ${topic.topic}

${topic.description}

Path: ${topic.path.toUpperCase()}

Para aprender: [green]${topic.command}[/green]
[dim]O escribe /random para otro tema[/dim]`;
};


