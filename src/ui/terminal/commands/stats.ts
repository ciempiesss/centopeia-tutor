import type { CommandHandler } from './index';
import { Preferences } from '@capacitor/preferences';

export const statsCommand: CommandHandler = async () => {
  // Load stats from storage with error handling
  let stats = { completedToday: 0, totalMinutes: 0 };
  try {
    const { value } = await Preferences.get({ key: 'focus_sprint_stats' });
    if (value) {
      try {
        stats = JSON.parse(value);
      } catch (parseError) {
        console.error('[Stats] Failed to parse stats, resetting:', parseError);
        // Reset corrupted stats
        await Preferences.set({ key: 'focus_sprint_stats', value: JSON.stringify(stats) });
      }
    }
  } catch (storageError) {
    console.error('[Stats] Failed to load from storage:', storageError);
  }

  return `
╔══════════════════════════════════════════════════════════════╗
║                   TUS ESTADÍSTICAS                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📊 FOCUS SPRINTS                                            ║
║     Completados hoy:  [green]${stats.completedToday || 0}[/green]                        ║
║     Minutos totales:  [green]${Math.floor(stats.totalMinutes || 0)}[/green]                        ║
║                                                              ║
║  📚 APRENDIZAJE                                              ║
║     Conceptos vistos: [yellow]0[/yellow]                        ║
║     Ejercicios:       [yellow]0[/yellow]                        ║
║     Quizzes:          [yellow]0[/yellow]                        ║
║                                                              ║
║  🎯 PROGRESO POR ROL                                         ║
║     QA Tester:        [dim]0%[/dim]                        ║
║     Developer:        [dim]0%[/dim]                        ║
║     Data Analyst:     [dim]0%[/dim]                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

[dim]Los datos se sincronizan entre dispositivos (cuando hay conexión)[/dim]
`;
};
