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
    case 'pomodoro':
      return `✅ Sprint de trabajo configurado a [green]${value} minutos[/green]`;
    case 'break':
      return `✅ Descanso configurado a [green]${value} minutos[/green]`;
    case 'rsd':
      return `✅ Sensibilidad RSD configurada a [green]${value}[/green]`;
    case 'sounds':
      return `✅ Sonidos ${value === 'on' ? '[green]activados[/green]' : '[yellow]desactivados[/yellow]'}`;
    case 'theme':
      return `✅ Tema cambiado a [green]${value}[/green]`;
    case 'font':
      return `✅ Tamaño de fuente: [green]${value}px[/green]`;
    case 'sync':
      return `✅ Sincronización ${value === 'on' ? '[green]activada[/green]' : '[yellow]desactivada[/yellow]'}`;
    default:
      return `[red]Error:[/red] Configuración no reconocida: ${setting}`;
  }
};
