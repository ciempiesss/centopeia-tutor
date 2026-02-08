import { helpCommand } from './help';
import { focusCommand } from './focus';
import { roleCommand } from './role';
import { statsCommand } from './stats';
import { learnCommand } from './learn';
import { configCommand } from './config';
import { microCommand } from '../../../core/audhd/AntiParalysis';
import { practiceCommand } from './practice';
import { quizCommand } from './quiz';
import { randomCommand } from './random';

export interface CommandContext {
  sessionId?: string;
}

export interface CommandHandler {
  (args: string[], context?: CommandContext): Promise<string>;
}

export interface CommandRegistry {
  [key: string]: CommandHandler;
}

export const commandRegistry: CommandRegistry = {
  '/help': helpCommand,
  '/ayuda': helpCommand,
  '/focus': focusCommand,
  '/sprint': focusCommand,
  '/stop': async () => 'Sprint detenido.',
  '/role': roleCommand,
  '/rol': roleCommand,
  '/stats': statsCommand,
  '/estadisticas': statsCommand,
  '/learn': learnCommand,
  '/aprender': learnCommand,
  '/practice': practiceCommand,
  '/practica': practiceCommand,
  '/quiz': quizCommand,
  '/test': quizCommand,
  '/config': configCommand,
  '/configuracion': configCommand,
  '/micro': microCommand,
  '/paso': microCommand,
  '/random': randomCommand,
  '/aleatorio': randomCommand,
  '/hint': async () => 'Usa el comando /practice para ejercicios con pistas incluidas.',
  '/pista': async () => 'Usa el comando /practice para ejercicios con pistas incluidas.',
};

// Default handler for unknown commands
export const defaultHandler: CommandHandler = async (args) => {
  return `Comando no reconocido: ${args[0]}\n\nEscribe /help para ver los comandos disponibles.`;
};
