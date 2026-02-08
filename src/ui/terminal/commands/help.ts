import type { CommandHandler } from './index';

export const helpCommand: CommandHandler = async () => {
  return `
╔══════════════════════════════════════════════════════════════╗
║                    COMANDOS DISPONIBLES                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📚 APRENDIZAJE                                              ║
║  [green]/learn [tema][/green]     - Inicia aprendizaje (sql, python, js)  ║
║  [green]/practice [tema][/green] - Ejercicios prácticos con código      ║
║  [green]/quiz [tema][/green]     - Quiz de conocimientos (5 preguntas)  ║
║  [green]/role [qa/dev/data][/green] - Cambia tu rol principal          ║
║                                                              ║
║  🎯 FOCUS & PRODUCTIVIDAD (AUDHD)                           ║
║  [green]/focus [min][/green]      - Sprint de concentración (def: 15)   ║
║  [green]/stop[/green]             - Detiene el sprint actual           ║
║  [green]/micro [tarea][/green]    - Modo anti-parálisis                 ║
║                                                              ║
║  ⚙️  CONFIGURACIÓN                                           ║
║  [green]/home[/green]              - Volver al inicio                  ║
║  [green]/config apikey [key][/green] - Configurar API de Groq          ║
║  [green]/config pomodoro 15[/green]  - Minutos de trabajo              ║
║  [green]/config break 5[/green]      - Minutos de descanso             ║
║  [green]/stats[/green]              - Tus estadísticas                 ║
║  [green]/unlock[/green]            - Desbloquea input si se atasca    ║
║                                                              ║
║  ─────────────────────────────────────────────────────────  ║
║  COMANDOS DIRECTOS (sin /):                                  ║
║  Escribe cualquier pregunta y el tutor responderá            ║
║  Ejemplo: "¿qué es SQL?" o "explícame joins"                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

[green]💡 TIP AUDHD:[/green] Si te bloqueas, usa:
[micro] /micro quiero aprender X pero no sé por dónde empezar

[green]💡 TIP PRÁCTICA:[/green] Escribe /practice python para ejercicios:
- Ejecutas código real en el navegador
- Feedback inmediato
- Pistas cuando te atascas

[dim]Modelo:[/dim] Kimi K2 (Moonshot AI) via Groq
`;
};
