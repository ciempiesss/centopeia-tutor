import type { CommandHandler } from './index';
import { Preferences } from '@capacitor/preferences';

export const statsCommand: CommandHandler = async () => {
  // Load stats from storage
  const { value } = await Preferences.get({ key: 'focus_sprint_stats' });
  const stats = value ? JSON.parse(value) : { completedToday: 0, totalMinutes: 0 };

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
