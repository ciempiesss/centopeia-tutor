import type { CommandHandler } from './index';
import { secureStorage } from '../../../storage/SecureStorage';
import { CentopeiaDatabase } from '../../../storage/Database';

export const configCommand: CommandHandler = async (args) => {
  const db = CentopeiaDatabase.getInstance();
  const profile = await db.getOrCreateUserProfile();
  if (!args[0]) {
    return `[green]CONFIGURACIÓN[/green]

AJUSTES:
  [green]/config apikey [key][/green]  - API key de Groq
  [green]/config pomodoro 15[/green]   - Minutos de trabajo
  [green]/config break 5[/green]       - Minutos de descanso

PERSONALIZACIÓN:
  [green]/config theme dark[/green]     - Tema visual
  [green]/config font 14[/green]        - Tamaño de fuente

[dim]Obtén tu API key en:[/dim] https://console.groq.com`;
  }

  const setting = args[0];
  const value = args[1];

  switch (setting) {
    case 'apikey':
      if (!value) {
        return `[red]Error:[/red] Debes proporcionar una API key.\nUso: /config apikey gsk_xxxxxxxx`;
      }
      // Validate API key format
      if (!value.startsWith('gsk_')) {
        return `[yellow]⚠️ Advertencia:[/yellow] La API key no parece ser de Groq (debe empezar con 'gsk_').`;
      }
      // Guardar en secure storage
      await secureStorage.setApiKey(value);
      return `✅ API key guardada.\n\n[green]Escribe /config debug para verificar o recarga la página.[/green]`;
    case 'pomodoro': {
      const pomodoroMinutes = parseInt(value || '15', 10);
      if (isNaN(pomodoroMinutes) || pomodoroMinutes < 1 || pomodoroMinutes > 60) {
        return `[red]Error:[/red] Valor inválido. Usa: /config pomodoro [1-60]`;
      }
      await db.setUserProfile({
        ...profile,
        audhdConfig: {
          ...profile.audhdConfig,
          pomodoroWorkMinutes: pomodoroMinutes,
        },
      });
      return `✅ Sprint de trabajo configurado a [green]${pomodoroMinutes} minutos[/green]`;
    }
    case 'break': {
      const breakMinutes = parseInt(value || '5', 10);
      if (isNaN(breakMinutes) || breakMinutes < 1 || breakMinutes > 30) {
        return `[red]Error:[/red] Valor inválido. Usa: /config break [1-30]`;
      }
      await db.setUserProfile({
        ...profile,
        audhdConfig: {
          ...profile.audhdConfig,
          pomodoroBreakMinutes: breakMinutes,
        },
      });
      return `✅ Descanso configurado a [green]${breakMinutes} minutos[/green]`;
    }
    case 'font': {
      const fontSize = parseInt(value || '14', 10);
      if (isNaN(fontSize) || fontSize < 10 || fontSize > 24) {
        return `[red]Error:[/red] Tamaño inválido. Usa: /config font [10-24]`;
      }
      await db.setUserProfile({
        ...profile,
        audhdConfig: {
          ...profile.audhdConfig,
          sensoryPreferences: {
            ...profile.audhdConfig.sensoryPreferences,
            fontSize,
          },
        },
      });
      return `✅ Tamaño de fuente: [green]${fontSize}px[/green]`;
    }
    case 'theme': {
      if (!value) {
        return `[red]Error:[/red] Debes proporcionar un tema. Uso: /config theme dark`;
      }
      await db.setUserProfile({
        ...profile,
        audhdConfig: {
          ...profile.audhdConfig,
          sensoryPreferences: {
            ...profile.audhdConfig.sensoryPreferences,
            theme: value,
          },
        },
      });
      return `✅ Tema configurado a [green]${value}[/green]`;
    }
    case 'sync':
      return `✅ Sincronización ${value === 'on' ? '[green]activada[/green]' : '[yellow]desactivada[/yellow]'}`;
    case 'debug': {
      const hasEnvKey = !!import.meta.env.VITE_GROQ_API_KEY;
      const hasStoredKey = await secureStorage.hasApiKey();
      return `[green]Debug info:[/green]\nENV API Key: ${hasEnvKey ? '✅ Configurada' : '❌ No configurada'}\nStorage API Key: ${hasStoredKey ? '✅ Configurada' : '❌ No configurada'}\nRevisa la consola (F12) para más detalles.`;
    }
    default:
      return `[red]Error:[/red] Configuración no reconocida: ${setting}`;
  }
};
