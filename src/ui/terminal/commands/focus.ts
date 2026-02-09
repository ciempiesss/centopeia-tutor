import type { CommandHandler } from './index';

// Valid input ranges for focus sprint
const MIN_FOCUS_MINUTES = 1;
const MAX_FOCUS_MINUTES = 120;
const DEFAULT_FOCUS_MINUTES = 15;

export const focusCommand: CommandHandler = async (args) => {
  // Parse and validate minutes with strict checking
  let minutes = DEFAULT_FOCUS_MINUTES;
  
  if (args[0]) {
    const parsed = parseInt(args[0], 10);
    if (!isNaN(parsed) && parsed >= MIN_FOCUS_MINUTES && parsed <= MAX_FOCUS_MINUTES) {
      minutes = parsed;
    } else {
      return `[red]Error:[/red] Minutos inválidos. Usa: /focus [${MIN_FOCUS_MINUTES}-${MAX_FOCUS_MINUTES}]`;
    }
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
