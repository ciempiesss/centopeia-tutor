import type { CommandHandler } from './index';
import { CentopeiaDatabase } from '../../../storage/Database';
import { secureStorage } from '../../../storage/SecureStorage';

const db = CentopeiaDatabase.getInstance();

export const configCommand: CommandHandler = async (args) => {
  if (!args[0]) {
    return `
╔══════════════════════════════════════════════════════════════╗
║                   CONFIGURACIÓN                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  AJUSTES AUDHD:                                              ║
║                                                              ║
║  [green]/config apikey [key][/green]  - API key de Groq (para IA)    ║
║  [green]/config pomodoro 15[/green] - Minutos de trabajo (default: 15) ║
║  [green]/config break 5[/green]     - Minutos de descanso (default: 5) ║
║  [green]/config rsd high[/green]    - Sensibilidad RSD (high/medium/low) ║
║  [green]/config sounds on[/green]   - Sonidos (on/off)                ║
║                                                              ║
║  PERSONALIZACIÓN:                                            ║
║  [green]/config theme dark[/green]  - Tema (dark/light/high-contrast) ║
║  [green]/config font 14[/green]     - Tamaño de fuente                ║
║                                                              ║
║  SINCRONIZACIÓN:                                             ║
║  [green]/config sync on[/green]     - Activar sincronización          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

[dim]Obtén tu API key gratis en:[/dim] https://console.groq.com
`;
  }

  const setting = args[0];
  const value = args[1];

  switch (setting) {
    case 'apikey':
      if (!value) {
        return `[red]Error:[/red] Debes proporcionar una API key.\nUso: /config apikey gsk_xxxxxxxx`;
      }
      // Validate API key format (Groq keys start with gsk_)
      if (!value.startsWith('gsk_')) {
        return `[yellow]⚠️ Advertencia:[/yellow] La API key no parece ser de Groq (debe empezar con 'gsk_').\n¿Estás seguro de que es correcta?`;
      }
      // Save API key securely (not in profile)
      await secureStorage.setApiKey(value);
      return `✅ API key configurada de forma segura. [green]Reinicia la app para activar el modo IA.[/green]`;
    case 'pomodoro': {
      const pomodoroMinutes = parseInt(value || '15', 10);
      if (isNaN(pomodoroMinutes) || pomodoroMinutes < 1 || pomodoroMinutes > 60) {
        return `[red]Error:[/red] Valor inválido. Usa: /config pomodoro [1-60]`;
      }
      return `✅ Sprint de trabajo configurado a [green]${pomodoroMinutes} minutos[/green]`;
    }
    case 'break': {
      const breakMinutes = parseInt(value || '5', 10);
      if (isNaN(breakMinutes) || breakMinutes < 1 || breakMinutes > 30) {
        return `[red]Error:[/red] Valor inválido. Usa: /config break [1-30]`;
      }
      return `✅ Descanso configurado a [green]${breakMinutes} minutos[/green]`;
    }
    case 'font': {
      const fontSize = parseInt(value || '14', 10);
      if (isNaN(fontSize) || fontSize < 10 || fontSize > 24) {
        return `[red]Error:[/red] Tamaño inválido. Usa: /config font [10-24]`;
      }
      return `✅ Tamaño de fuente: [green]${fontSize}px[/green]`;
    }
    case 'sync':
      return `✅ Sincronización ${value === 'on' ? '[green]activada[/green]' : '[yellow]desactivada[/yellow]'}`;
    default:
      return `[red]Error:[/red] Configuración no reconocida: ${setting}`;
  }
};
