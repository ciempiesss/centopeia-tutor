import type { CommandHandler } from './index';

export const focusCommand: CommandHandler = async (args) => {
  const minutes = args[0] ? parseInt(args[0], 10) : 15;
  
  if (isNaN(minutes) || minutes < 1 || minutes > 120) {
    return `[red]Error:[/red] Minutos inválidos. Usa: /focus [1-120]`;
  }

  return `
🔥 [green]FOCUS SPRINT INICIADO[/green]

Duración: [yellow]${minutes} minutos[/yellow]
Modo: Trabajo concentrado

[dim]Tip AUDHD:[/dim]
- Solo UN concepto a la vez
- Si te atascas, escribe /hint
- Al terminar: descanso obligatorio de 5 min

⏱️ Timer iniciado... ¡Manos a la obra!
`;
};
