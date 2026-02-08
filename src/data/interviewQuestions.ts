/**
 * PREGUNTAS DE ENTREVISTA QA TESTER JR - MÉXICO
 * 
 * Basado en preguntas reales de empresas como: Softtek, Globant, IBM, 
 * Kueski, Kavak, Konfio, Mercado Libre México, y startups tech mexicanas.
 */

export type QuestionCategory = 'technical' | 'behavioral' | 'scenario' | 'process' | 'tools';
export type Difficulty = 'junior' | 'junior-plus';

export interface InterviewQuestion {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  questionES: string;
  questionEN?: string;
  context: string; // Contexto de cuándo se pregunta
  whatTheyLookFor: string[]; // Qué busca el entrevistador
  goodAnswerTips: string[]; // Tips para buena respuesta
  followUpQuestions?: string[]; // Preguntas de seguimiento posibles
}

// =============================================================================
// PREGUNTAS TÉCNICAS
// =============================================================================

export const TECHNICAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'qa-tech-001',
    category: 'technical',
    difficulty: 'junior',
    questionES: '¿Qué es el ciclo de vida del bug (bug lifecycle)?',
    questionEN: 'What is the bug lifecycle?',
    context: 'Pregunta de apertura, verifica conocimientos básicos de QA',
    whatTheyLookFor: [
      'Conocimiento de estados del bug',
      'Entendimiento de flujo de trabajo',
      'Familiaridad con herramientas de tracking'
    ],
    goodAnswerTips: [
      'Menciona estados: New → Assigned → Open → Fixed → Retest → Closed/Reopened',
      'Menciona quién interviene en cada estado (Tester, Dev, QA Lead)',
      'Da ejemplo de transición de estados con un caso real'
    ],
    followUpQuestions: [
      '¿Qué haces si un dev marca tu bug como "Cannot Reproduce"?',
      '¿Cuándo cierras un bug sin verificar el fix?'
    ]
  },
  {
    id: 'qa-tech-002',
    category: 'technical',
    difficulty: 'junior',
    questionES: 'Explica la diferencia entre smoke testing y regression testing',
    questionEN: 'Explain the difference between smoke and regression testing',
    context: 'Verifica entendimiento de tipos de testing',
    whatTheyLookFor: [
      'Claridad en definiciones',
      'Saber cuándo aplicar cada uno',
      'Entender priorización'
    ],
    goodAnswerTips: [
      'Smoke: "¿La build enciende?" - verificación superficial crítica',
      'Regression: "¿Rompi algo que funcionaba?" - pruebas profundas',
      'Menciona que smoke corre primero, regression después'
    ]
  },
  {
    id: 'qa-tech-003',
    category: 'technical',
    difficulty: 'junior',
    questionES: '¿Qué información debe tener un buen reporte de bug?',
    questionEN: 'What makes a good bug report?',
    context: 'Crítico para el día a día, evalúa documentación',
    whatTheyLookFor: [
      'Atención al detalle',
      'Comunicación clara',
      'Pensamiento estructurado'
    ],
    goodAnswerTips: [
      'Título descriptivo y específico',
      'Pasos de reproducción numerados y claros',
      'Resultado esperado vs actual',
      'Evidencia (screenshots, logs, videos)',
      'Environment (OS, browser, versión)',
      'Severidad y prioridad apropiadas'
    ]
  },
  {
    id: 'qa-tech-004',
    category: 'technical',
    difficulty: 'junior',
    questionES: 'Diferencia entre verificación (verification) y validación (validation)',
    questionEN: 'Difference between verification and validation',
    context: 'Pregunta clásica de ISTQB, evalúa fundamentos',
    whatTheyLookFor: [
      'Conocimiento teórico sólido',
      'Capacidad de ejemplificar'
    ],
    goodAnswerTips: [
      'Verification: "Are we building the product right?" (proceso)',
      'Validation: "Are we building the right product?" (producto final)',
      'Ejemplo: Verification = revisar código, Validation = UAT con usuario'
    ]
  },
  {
    id: 'qa-tech-005',
    category: 'technical',
    difficulty: 'junior',
    questionES: '¿Qué es una prueba de caja negra (black box testing)?',
    questionEN: 'What is black box testing?',
    context: 'Fundamentos de metodologías de testing',
    whatTheyLookFor: [
      'Entendimiento de técnicas de testing',
      'Diferenciación con white box'
    ],
    goodAnswerTips: [
      'No se ve el código interno',
      'Se basa en requirements/inputs/outputs',
      'Técnicas: equivalence partitioning, boundary value analysis',
      'Contrastar con white box (que sí ve código)'
    ]
  },
  {
    id: 'qa-tech-006',
    category: 'technical',
    difficulty: 'junior-plus',
    questionES: 'Escribe una query SQL para encontrar usuarios duplicados por email',
    questionEN: 'Write a SQL query to find duplicate users by email',
    context: 'Muy común en startups mexicanas (Kueski, Kavak), evalúa SQL práctico',
    whatTheyLookFor: [
      'Conocimiento de GROUP BY y HAVING',
      'Pensamiento lógico',
      'Atención a data quality'
    ],
    goodAnswerTips: [
      'Usar GROUP BY email',
      'HAVING count(*) > 1',
      'Bonus: mostrar cuántas veces se repite cada uno',
      'Mencionar que podrías agregar índice unique para prevenir'
    ]
  },
  {
    id: 'qa-tech-007',
    category: 'technical',
    difficulty: 'junior',
    questionES: '¿Qué es el API Testing y qué verificas en una API?',
    questionEN: 'What is API testing and what do you verify?',
    context: 'Muy solicitado actualmente, especialmente en fintechs mexicanas',
    whatTheyLookFor: [
      'Conocimiento de HTTP/protocolos',
      'Entendimiento de status codes',
      'Validación de contratos JSON'
    ],
    goodAnswerTips: [
      'Verificar status codes (200, 404, 500, etc.)',
      'Validar estructura de response (schema)',
      'Verificar data correctness',
      'Probar edge cases (nulls, campos vacíos, caracteres especiales)',
      'Mencionar herramientas: Postman, REST Assured, etc.'
    ]
  },
  {
    id: 'qa-tech-008',
    category: 'technical',
    difficulty: 'junior-plus',
    questionES: '¿Qué información incluirías en un test case para probar un login?',
    questionEN: 'What would you include in a test case for a login feature?',
    context: 'Evalúa pensamiento de casos edge y cobertura',
    whatTheyLookFor: [
      'Pensamiento de casos positivos y negativos',
      'Consideración de seguridad',
      'Atención a UX'
    ],
    goodAnswerTips: [
      'Positivos: credenciales válidas',
      'Negativos: password incorrecto, usuario inexistente, campos vacíos',
      'Seguridad: SQL injection, XSS en campos',
      'UX: mensajes de error claros, máscara de password',
      'Límites: password muy largo, caracteres especiales'
    ]
  }
];

// =============================================================================
// PREGUNTAS COMPORTAMENTALES
// =============================================================================

export const BEHAVIORAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'qa-beh-001',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Por qué quieres ser QA Tester y no desarrollador?',
    questionEN: 'Why do you want to be a QA Tester and not a developer?',
    context: 'Pregunta clásica para entender motivación',
    whatTheyLookFor: [
      'Motivación genuina por QA',
      'Entendimiento del rol',
      'No ver QA como "puerta de entrada" a dev'
    ],
    goodAnswerTips: [
      'Mencionar gusto por encontrar problemas antes que usuarios',
      'Hablar de satisfacción de mejorar calidad del producto',
      'Mencionar que te gusta pensar como "usuario final"',
      'NO decir "para después ser dev"'
    ]
  },
  {
    id: 'qa-beh-002',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: 'Describe un bug que encontraste del que te sientas orgulloso',
    questionEN: 'Describe a bug you found that you are proud of',
    context: 'Evalúa experiencia real y capacidad de comunicación',
    whatTheyLookFor: [
      'Experiencia práctica previa',
      'Pensamiento analítico',
      'Comunicación estructurada'
    ],
    goodAnswerTips: [
      'Estructura: Contexto → Qué encontraste → Impacto → Cómo lo reportaste',
      'Enfatizar el impacto en usuario final',
      'Mencionar colaboración con devs para arreglarlo',
      'Si no tienes experiencia real, usar proyecto personal o bootcamp'
    ]
  },
  {
    id: 'qa-beh-003',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Cómo manejas el conflicto cuando un desarrollador dice que tu bug no es válido?',
    questionEN: 'How do you handle conflict when a developer says your bug is not valid?',
    context: 'Situación MUY común, evalúa soft skills críticas',
    whatTheyLookFor: [
      'Capacidad de mantener profesionalismo',
      'Comunicación no confrontacional',
      'Enfoque en evidencia y datos'
    ],
    goodAnswerTips: [
      'NO: "Insisto hasta que me hacen caso"',
      'SÍ: "Reviso si mi reporte fue claro y reproducible"',
      'Solicitar revisión de QA Lead si no se llega a acuerdo',
      'Mantener foco en calidad del producto, no en tener razón',
      'Mencionar que a veces el dev tiene razón y uno aprende'
    ]
  },
  {
    id: 'qa-beh-004',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: 'Cuéntame de una vez que tuviste que trabajar bajo presión de tiempo',
    questionEN: 'Tell me about a time you had to work under time pressure',
    context: 'Evalúa manejo de estrés y priorización',
    whatTheyLookFor: [
      'Priorización efectiva',
      'Comunicación proactiva',
      'Enfoque en lo crítico'
    ],
    goodAnswerTips: [
      'Usar método STAR (Situation, Task, Action, Result)',
      'Mencionar cómo priorizaste (riesgo, impacto, probabilidad)',
      'Comunicar a stakeholders sobre limitaciones',
      'Enfatizar que calidad no se compromete por velocidad'
    ]
  },
  {
    id: 'qa-beh-005',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Cómo te mantienes actualizado en tendencias de QA?',
    questionEN: 'How do you stay updated with QA trends?',
    context: 'Evalúa proactividad y compromiso con el rol',
    whatTheyLookFor: [
      'Curiosidad genuina',
      'Recursos de aprendizaje',
      'Participación en comunidad'
    ],
    goodAnswerTips: [
      'Mencionar blogs: Ministry of Testing, Test Automation University',
      'YouTube channels: Automation Step by Step, TestGuild',
      'Practicar en proyectos personales',
      'Communities: Slack/Discord de testing',
      'NO decir "solo en el trabajo"'
    ]
  },
  {
    id: 'qa-beh-006',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Qué haces cuando no sabes cómo probar algo?',
    questionEN: 'What do you do when you don\'t know how to test something?',
    context: 'Evalúa autonomía y recursos',
    whatTheyLookFor: [
      'Capacidad de investigar',
      'Saber cuándo pedir ayuda',
      'Creatividad para explorar'
    ],
    goodAnswerTips: [
      'Investigar documentación y requisitos primero',
      'Buscar tests similares en el proyecto',
      'Preguntar a compañeros o mentor',
      'Explorar la aplicación como usuario',
      'Documentar lo aprendido para el equipo'
    ]
  }
];

// =============================================================================
// PREGUNTAS DE ESCENARIO
// =============================================================================

export const SCENARIO_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'qa-sce-001',
    category: 'scenario',
    difficulty: 'junior',
    questionES: 'Tienes 2 horas para probar una nueva feature antes del release. ¿Qué haces?',
    questionEN: 'You have 2 hours to test a new feature before release. What do you do?',
    context: 'Evalúa priorización bajo presión',
    whatTheyLookFor: [
      'Priorización basada en riesgo',
      'Smoke testing primero',
      'Comunicación de cobertura'
    ],
    goodAnswerTips: [
      '1. Entender qué es lo más crítico de la feature',
      '2. Hacer smoke testing básico (¿enciende?)',
      '3. Probar el happy path principal',
      '4. Identificar riesgos y edge cases críticos',
      '5. Comunicar qué se probó y qué no',
      '6. NO prometer cobertura completa en 2 horas'
    ]
  },
  {
    id: 'qa-sce-002',
    category: 'scenario',
    difficulty: 'junior-plus',
    questionES: 'Encontraste un bug crítico a 1 día del release. El PM quiere lanzar igual. ¿Qué haces?',
    questionEN: 'You found a critical bug 1 day before release. PM wants to ship anyway. What do you do?',
    context: 'Situación ética y de comunicación',
    whatTheyLookFor: [
      'Comunicación clara del riesgo',
      'Enfoque en datos, no opiniones',
      'Escalación apropiada'
    ],
    goodAnswerTips: [
      'Documentar el bug con severidad/prioridad clara',
      'Explicar impacto en usuarios con datos',
      'Proponer workaround o mitigación',
      'Si no se escucha, escalar a QA Lead/Manager',
      'Documentar tu recomendación por escrito'
    ]
  },
  {
    id: 'qa-sce-003',
    category: 'scenario',
    difficulty: 'junior',
    questionES: 'Escribe un test case para un carrito de compras (agregar producto)',
    questionEN: 'Write a test case for an add-to-cart feature',
    context: 'Ejercicio práctico común',
    whatTheyLookFor: [
      'Claridad en pasos',
      'Datos de prueba específicos',
      'Cobertura de escenarios'
    ],
    goodAnswerTips: [
      'Precondición: Usuario logueado, producto disponible',
      'Pasos: Buscar producto → Click "Add to cart" → Verificar carrito',
      'Expected: Producto aparece en carrito con cantidad 1 y precio correcto',
      'Mencionar casos adicionales: agregar mismo producto 2 veces, producto sin stock'
    ]
  },
  {
    id: 'qa-sce-004',
    category: 'scenario',
    difficulty: 'junior',
    questionES: 'Un bug que reportaste fue marcado como "Cannot Reproduce". ¿Qué haces?',
    questionEN: 'A bug you reported was marked "Cannot Reproduce". What do you do?',
    context: 'Situación cotidiana de QA',
    whatTheyLookFor: [
      'Persistencia sin confrontación',
      'Mejora de reporte',
      'Colaboración con dev'
    ],
    goodAnswerTips: [
      'Revisar si mis pasos fueron claros y específicos',
      'Reproducirlo yo mismo de nuevo grabando video',
      'Verificar environment (mismo OS, browser, versión)',
      'Ofrecer sesión de pair testing con el dev',
      'Agregar más evidencia: logs, screenshots, steps detallados'
    ]
  }
];

// =============================================================================
// PREGUNTAS DE PROCESO/AGILE
// =============================================================================

export const PROCESS_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'qa-pro-001',
    category: 'process',
    difficulty: 'junior',
    questionES: '¿Cómo se integra QA en un equipo Agile/Scrum?',
    questionEN: 'How does QA integrate into an Agile/Scrum team?',
    context: 'Muy común, evalúa entendimiento de metodologías',
    whatTheyLookFor: [
      'Entendimiento de Agile',
      'Participación desde el inicio',
      'Colaboración con equipo'
    ],
    goodAnswerTips: [
      'QA participa desde refinamiento de historias',
      'Definir acceptance criteria juntos',
      'Testing continuo durante el sprint, no solo al final',
      'Participar en daily standups',
      'Ser parte del equipo, no un departamento separado'
    ]
  },
  {
    id: 'qa-pro-002',
    category: 'process',
    difficulty: 'junior',
    questionES: '¿Cuándo consideras que una feature está lista para release (Definition of Done)?',
    questionEN: 'When do you consider a feature ready for release (Definition of Done)?',
    context: 'Evalúa estándares de calidad',
    whatTheyLookFor: [
      'Criterios de calidad claros',
      'Entendimiento de DoD',
      'Balance entre calidad y velocidad'
    ],
    goodAnswerTips: [
      'Todos los criterios de aceptación pasan',
      'Tests ejecutados sin fallas críticas',
      'Documentación actualizada si aplica',
      'Code review aprobado',
      'NO tiene que ser "perfecto", pero debe ser "usable sin riesgo mayor"'
    ]
  }
];

// =============================================================================
// PREGUNTAS DE HERRAMIENTAS
// =============================================================================

export const TOOLS_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'qa-too-001',
    category: 'tools',
    difficulty: 'junior',
    questionES: '¿Qué herramientas de testing has usado?',
    questionEN: 'What testing tools have you used?',
    context: 'Verifica experiencia práctica',
    whatTheyLookFor: [
      'Familiaridad con stack común',
      'Capacidad de aprender nuevas herramientas',
      'Entendimiento de categorías'
    ],
    goodAnswerTips: [
      'Test Management: Jira, TestRail, Zephyr',
      'API Testing: Postman, Insomnia',
      'Automation: Selenium, Playwright (si aplica)',
      'BD: SQL, MongoDB Compass',
      'Version Control: Git, GitHub/GitLab',
      'SIEMPRE mencionar que eres rápido aprendiendo nuevas herramientas'
    ]
  },
  {
    id: 'qa-too-002',
    category: 'tools',
    difficulty: 'junior',
    questionES: '¿Cómo automatizarías una prueba repetitiva?',
    questionEN: 'How would you automate a repetitive test?',
    context: 'Evalúa conocimiento de automatización básica',
    whatTheyLookFor: [
      'Entendimiento de ROI de automatización',
      'Conocimiento básico de scripting',
      'Consciencia de mantenibilidad'
    ],
    goodAnswerTips: [
      'Identificar si vale la pena automatizar (¿se repite frecuentemente?)',
      'Elegir herramienta apropiada (Playwright para UI, REST Assured para API)',
      'Hacer el script parametrizable',
      'Considerar mantenibilidad (Page Object Model para UI)',
      'Integrar en CI/CD pipeline'
    ]
  }
];

// =============================================================================
// EXPORTAR TODAS LAS PREGUNTAS
// =============================================================================

export const ALL_QUESTIONS: InterviewQuestion[] = [
  ...TECHNICAL_QUESTIONS,
  ...BEHAVIORAL_QUESTIONS,
  ...SCENARIO_QUESTIONS,
  ...PROCESS_QUESTIONS,
  ...TOOLS_QUESTIONS,
];

export function getQuestionsByCategory(category: QuestionCategory): InterviewQuestion[] {
  return ALL_QUESTIONS.filter(q => q.category === category);
}

export function getRandomQuestions(count: number = 5): InterviewQuestion[] {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getQuestionsByDifficulty(difficulty: Difficulty): InterviewQuestion[] {
  return ALL_QUESTIONS.filter(q => q.difficulty === difficulty);
}

// Para simulador: generar entrevista completa
export function generateMockInterview(): InterviewQuestion[] {
  const interview: InterviewQuestion[] = [];
  
  // 2 técnicas básicas
  interview.push(...TECHNICAL_QUESTIONS.filter(q => q.difficulty === 'junior').slice(0, 2));
  
  // 2 comportamentales
  interview.push(...BEHAVIORAL_QUESTIONS.slice(0, 2));
  
  // 1 escenario
  interview.push(...SCENARIO_QUESTIONS.slice(0, 1));
  
  // 1 proceso
  interview.push(...PROCESS_QUESTIONS.slice(0, 1));
  
  return interview;
}
