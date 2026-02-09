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

// Wrap command handlers with error handling
const wrapCommand = (
  handler: CommandHandler,
  commandName: string
): CommandHandler => {
  return async (args: string[], context?: CommandContext): Promise<string> => {
    try {
      return await handler(args, context);
    } catch (error) {
      console.error(`[Command] Error in ${commandName}:`, error);

      // Return user-friendly error message
      const errorMessage = error instanceof Error
        ? error.message
        : 'Error desconocido';

      return `[red]Error en comando ${commandName}:[/red] ${errorMessage}\n\n` +
             `[dim]Si el problema persiste, recarga la página (F5).[/dim]`;
    }
  };
};

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
  '/help': wrapCommand(helpCommand, '/help'),
  '/ayuda': wrapCommand(helpCommand, '/ayuda'),
  '/focus': wrapCommand(focusCommand, '/focus'),
  '/sprint': wrapCommand(focusCommand, '/sprint'),
  '/stop': wrapCommand(async () => 'Sprint detenido.', '/stop'),
  '/role': wrapCommand(roleCommand, '/role'),
  '/rol': wrapCommand(roleCommand, '/rol'),
  '/stats': wrapCommand(statsCommand, '/stats'),
  '/estadisticas': wrapCommand(statsCommand, '/estadisticas'),
  '/learn': wrapCommand(learnCommand, '/learn'),
  '/aprender': wrapCommand(learnCommand, '/aprender'),
  '/practice': wrapCommand(practiceCommand, '/practice'),
  '/practica': wrapCommand(practiceCommand, '/practica'),
  '/quiz': wrapCommand(quizCommand, '/quiz'),
  '/test': wrapCommand(quizCommand, '/test'),
  '/config': wrapCommand(configCommand, '/config'),
  '/configuracion': wrapCommand(configCommand, '/configuracion'),
  '/micro': wrapCommand(microCommand, '/micro'),
  '/paso': wrapCommand(microCommand, '/paso'),
  '/random': wrapCommand(randomCommand, '/random'),
  '/aleatorio': wrapCommand(randomCommand, '/aleatorio'),
  '/hint': wrapCommand(async () => 'Usa el comando /practice para ejercicios con pistas incluidas.', '/hint'),
  '/pista': wrapCommand(async () => 'Usa el comando /practice para ejercicios con pistas incluidas.', '/pista'),
};

// Default handler for unknown commands
export const defaultHandler: CommandHandler = async (args) => {
  return `Comando no reconocido: ${args[0]}\n\nEscribe /help para ver los comandos disponibles.`;
};
