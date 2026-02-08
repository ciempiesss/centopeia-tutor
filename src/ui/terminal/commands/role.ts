import type { CommandHandler } from './index';

const roles = {
  qa: {
    name: 'QA Tester',
    description: 'Quality Assurance y testing de software',
    skills: ['SQL', 'Python', 'Playwright', 'Testing Manual'],
  },
  dev: {
    name: 'Developer',
    description: 'Desarrollo de software full-stack',
    skills: ['JavaScript', 'Python', 'React', 'Node.js'],
  },
  data: {
    name: 'Data Analyst',
    description: 'Análisis de datos y business intelligence',
    skills: ['SQL Avanzado', 'Python Data', 'Estadística', 'Visualización'],
  },
};

export const roleCommand: CommandHandler = async (args) => {
  if (!args[0]) {
    return `
╔══════════════════════════════════════════════════════════════╗
║                      SELECCIONA TU ROL                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  [green]/role qa[/green]     - QA Tester                        ║
║    Testing, automatización, calidad de software             ║
║                                                              ║
║  [green]/role dev[/green]    - Developer                        ║
║    Desarrollo web, aplicaciones, APIs                       ║
║                                                              ║
║  [green]/role data[/green]   - Data Analyst                     ║
║    Análisis de datos, SQL, visualización                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  const roleKey = args[0].toLowerCase() as keyof typeof roles;
  const role = roles[roleKey];

  if (!role) {
    return `[red]Error:[/red] Rol no válido. Opciones: qa, dev, data`;
  }

  return `
✅ [green]ROL SELECCIONADO:[/green] ${role.name}

${role.description}

Habilidades a desarrollar:
${role.skills.map(s => `  • ${s}`).join('\n')}

[dim]Puedes cambiar de rol en cualquier momento con /role[/dim]
`;
};
