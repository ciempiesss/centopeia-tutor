import type { CommandHandler } from './index';
import { findModuleById } from '../../../data/learningPaths';

export const moduleCommand: CommandHandler = async (args) => {
  const moduleId = args[0];
  if (!moduleId) {
    return `[red]Error:[/red] Debes proporcionar un id de módulo. Uso: /module <id>`;
  }

  const found = findModuleById(moduleId);
  if (!found) {
    return `[red]Error:[/red] Módulo no encontrado: ${moduleId}`;
  }

  const { module } = found;

  return `
📘 [green]MÓDULO:[/green] ${module.title}

Duración: ${module.duration} min

[green]Objetivos:[/green]
${module.objectives.map((o) => `  • ${o}`).join('\n')}

[green]Contenido:[/green]
${module.content}

[green]Ejercicio:[/green]
${module.exercise}

[green]Auto-evaluación:[/green]
${module.checkQuestion}
`;
};
