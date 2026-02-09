import type { CommandHandler } from './index';

export const helpCommand: CommandHandler = async () => {
  return `[green]COMANDOS DISPONIBLES[/green]

📚 APRENDIZAJE
  [green]/learn [tema][/green]      - Inicia aprendizaje (sql, python, js)
  [green]/practice python[/green]  - Ejercicios prácticos con código
  [green]/quiz [tema][/green]      - Quiz de conocimientos
  [green]/role [qa/dev/data][/green] - Cambia tu rol principal
  [green]/module [id][/green]       - Ver contenido de un módulo

🎯 FOCUS & PRODUCTIVIDAD
  [green]/focus [min][/green]       - Sprint de concentración
  [green]/stop[/green]              - Detiene el sprint
  [green]/micro [tarea][/green]     - Modo anti-parálisis

⚙️ CONFIGURACIÓN
  [green]/home[/green]              - Volver al inicio
  [green]/config apikey [key][/green] - Configurar API
  [green]/config debug[/green]       - Verificar estado API key
  [green]/stats[/green]             - Tus estadísticas
  [green]/unlock[/green]            - Desbloquea input

COMANDOS DIRECTOS (sin /):
  Escribe cualquier pregunta y responderé
  Ejemplo: "¿qué es SQL?"

[green]💡 Tip:[/green] Usa /practice python para ejercicios interactivos`;
};
