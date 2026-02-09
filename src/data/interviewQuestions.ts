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
  modelAnswer?: string; // Respuesta modelo/ejemplo de respuesta clave
  companies?: string[]; // Empresas donde se ha visto esta pregunta
}

// =============================================================================
// PREGUNTAS TÉCNICAS - FUNDAMENTOS DEL ROL QA (El "Por Qué")
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
    id: 'qa-tech-verification-001',
    category: 'technical',
    difficulty: 'junior',
    questionES: '¿Cuál es la diferencia entre Verificación y Validación?',
    questionEN: 'What is the difference between Verification and Validation?',
    context: 'Pregunta clásica ISTQB para verificar entendimiento de conceptos fundamentales',
    whatTheyLookFor: [
      'Entendimiento de los objetivos de cada proceso',
      'Capacidad de ejemplificar la diferencia',
      'Conocimiento de estándares de calidad'
    ],
    goodAnswerTips: [
      'Verification: "Are we building the product RIGHT?" - revisa si seguimos las especificaciones',
      'Validation: "Are we building the RIGHT product?" - revisa si cumple la necesidad del usuario',
      'Analogía: Verification = seguir el plano correctamente | Validation = asegurar que la casa sea habitable',
      'Ejemplo práctico: Verification = code review | Validation = UAT con usuario final'
    ],
    followUpQuestions: [
      '¿En qué fase del SDLC se hace cada una?',
      '¿Quién participa en cada proceso?'
    ],
    modelAnswer: 'La verificación revisa si estamos construyendo el producto correctamente (según especificaciones). La validación revisa si estamos construyendo el producto correcto (según la necesidad del usuario). Es la diferencia entre seguir el plano y asegurar que la casa sea habitable.',
    companies: ['Softtek', 'Globant', 'IBM México']
  },
  {
    id: 'qa-tech-exit-criteria-001',
    category: 'technical',
    difficulty: 'junior-plus',
    questionES: '¿Cuándo decides dejar de probar? (Exit Criteria)',
    questionEN: 'When do you decide to stop testing? (Exit Criteria)',
    context: 'Evalúa entendimiento de gestión de riesgo y calidad',
    whatTheyLookFor: [
      'Consciencia de que nunca se "termina" de probar',
      'Entendimiento de criterios de salida objetivos',
      'Capacidad de balancear tiempo vs calidad'
    ],
    goodAnswerTips: [
      '"Nunca se termina de probar, se detiene por riesgo o tiempo"',
      'Criterios de salida definidos en Test Plan: bugs críticos cerrados, cobertura aceptable',
      'Análisis de riesgo: qué áreas son críticas para el negocio',
      'Comunicación con stakeholders sobre el nivel de calidad alcanzado',
      'Documentar deuda técnica o riesgos asumidos'
    ]
  },
  {
    id: 'qa-tech-smoke-sanity-001',
    category: 'technical',
    difficulty: 'junior',
    questionES: '¿Qué diferencia hay entre Smoke Testing y Sanity Testing?',
    questionEN: 'What is the difference between Smoke Testing and Sanity Testing?',
    context: 'Pregunta clásica que muchos confunden. Evalúa precisión técnica',
    whatTheyLookFor: [
      'Claridad en definiciones específicas',
      'Entender alcance de cada uno',
      'Saber cuándo aplicar cada uno'
    ],
    goodAnswerTips: [
      'Smoke: Amplio y superficial - "¿La build enciende? ¿Puedo entrar?"',
      'Sanity: Profundo y estrecho - "¿El bug específico que arreglaron ya funciona y no rompió lo de al lado?"',
      'Smoke se hace en builds nuevas para verificar estabilidad general',
      'Sanity se hace después de un fix específico para verificar ese cambio',
      'Ambos son subconjuntos de Regression Testing'
    ]
  },
  {
    id: 'qa-tech-severity-priority-001',
    category: 'technical',
    difficulty: 'junior',
    questionES: 'Diferencia entre Prioridad y Severidad.',
    questionEN: 'Difference between Priority and Severity.',
    context: 'Fundamental para reportar bugs correctamente',
    whatTheyLookFor: [
      'Entendimiento de impacto técnico vs urgencia de negocio',
      'Capacidad de ejemplificar',
      'Consciencia de que son independientes'
    ],
    goodAnswerTips: [
      'Severidad = Impacto TÉCNICO (ej. el sistema crashea)',
      'Prioridad = Urgencia de NEGOCIO (ej. el logo está mal)',
      'Ejemplo: Crash en pantalla oculta = Alta Severidad / Baja Prioridad',
      'Ejemplo: Error ortográfico en Home = Baja Severidad / Alta Prioridad',
      'QA define Severidad basado en impacto técnico',
      'PO/PM define Prioridad basado en impacto al negocio'
    ]
  },
  {
    id: 'qa-tech-production-bug-001',
    category: 'technical',
    difficulty: 'junior-plus',
    questionES: '¿Qué haces si encuentras un bug en Producción?',
    questionEN: 'What do you do if you find a bug in Production?',
    context: 'Evalúa manejo de crisis y procedimientos',
    whatTheyLookFor: [
      'Calma bajo presión',
      'Evaluación rápida de impacto',
      'Escalamiento apropiado',
      'Análisis root cause sin culpas'
    ],
    goodAnswerTips: [
      '1. Mantengo la calma - no es el fin del mundo',
      '2. Verifico el impacto: ¿cuántos usuarios afecta? ¿hay workaround?',
      '3. Si es crítico: alerto inmediatamente (Hotfix / Rollback)',
      '4. Si no es crítico: lo reporto para el siguiente sprint',
      '5. Documentar el bug con toda la evidencia posible',
      '6. Post-mortem: ¿Cómo se nos pasó? Root Cause Analysis',
      '7. "Mejorar el proceso, no para culpar" - lessons learned'
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
// PREGUNTAS COMPORTAMENTALES - HABILIDADES BLANDAS Y "LA VIBRA"
// =============================================================================

export const BEHAVIORAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'qa-beh-001',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Por qué QA? ¿Por qué no desarrollador?',
    questionEN: 'Why QA? Why not developer?',
    context: 'Pregunta clásica para entender motivación genuina del rol',
    whatTheyLookFor: [
      'Mente naturalmente inquisitiva',
      'Satisfacción por proteger al usuario final',
      'Entendimiento del rol como guardian de calidad',
      'NO ver QA como "puerta de entrada" a dev'
    ],
    goodAnswerTips: [
      'Mencionar curiosidad por entender cómo funcionan las cosas "por dentro"',
      'Hablar de satisfacción de encontrar problemas antes que usuarios',
      'Enfatizar que te gusta pensar como "usuario final" y romper cosas constructivamente',
      'Conectar con el impacto: "proteger la experiencia del usuario final"',
      'NO decir "para después ser dev" o "no me dieron chance de dev"'
    ]
  },
  {
    id: 'qa-beh-why-qa-001',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Por qué quieres ser QA Tester?',
    questionEN: 'Why do you want to be a QA Tester?',
    context: 'Versión más abierta para entender motivación personal',
    whatTheyLookFor: [
      'Pasión genuina por la calidad',
      'Mentalidad analítica y curiosa',
      'Consciencia del valor del rol'
    ],
    goodAnswerTips: [
      '"Tengo una mente naturalmente inquisitiva"',
      '"Me gusta entender cómo funcionan las cosas por dentro"',
      '"Siento satisfacción al proteger la experiencia del usuario final"',
      'Compartir una anécdota personal de cuando encontraste un bug importante',
      'Mencionar que disfrutas el detective work de encontrar root causes'
    ]
  },
  {
    id: 'qa-beh-pressure-001',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Cómo manejas la presión cuando se acerca el release?',
    questionEN: 'How do you handle pressure when the release is near?',
    context: 'Evalúa manejo de estrés y profesionalismo bajo presión',
    whatTheyLookFor: [
      'Comunicación transparente sobre riesgos',
      'Capacidad de priorizar lo crítico',
      'No prometer imposibles',
      'Calidad sobre velocidad'
    ],
    goodAnswerTips: [
      '"Comunicación transparente. No prometo imposibles"',
      'Si veo riesgos, levanto la mano temprano (no al último día)',
      'Priorizar basado en impacto al usuario y negocio',
      'Enfocarme en calidad sobre cantidad de tests',
      'Documentar decisiones y riesgos asumidos',
      'Mantener la calma y ser el "puerto seguro" del equipo'
    ]
  },
  {
    id: 'qa-beh-updated-001',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Cómo te mantienes actualizado en QA?',
    questionEN: 'How do you stay updated in QA?',
    context: 'Evalúa proactividad y compromiso con el aprendizaje continuo',
    whatTheyLookFor: [
      'Curiosidad genuina por aprender',
      'Recursos de la comunidad',
      'Práctica fuera del trabajo',
      'Consciencia de que el software cambia'
    ],
    goodAnswerTips: [
      'Leo blogs: Ministry of Testing, Test Automation University',
      'Sigo comunidades: r/QualityAssurance, Slack/Discord de testing',
      'Practico con herramientas nuevas (Cypress, Playwright) en proyectos personales',
      'YouTube channels: Automation Step by Step, TestGuild',
      '"El software cambia, yo también" - mostrar mentalidad de crecimiento',
      'NO decir "solo lo que me enseñan en el trabajo"'
    ]
  },
  {
    id: 'qa-beh-boredom-001',
    category: 'behavioral',
    difficulty: 'junior',
    questionES: '¿Qué harías si te aburres de probar lo mismo siempre (regresión)?',
    questionEN: 'What would you do if you get bored testing the same thing (regression)?',
    context: 'Evalúa actitud proactiva ante tareas repetitivas',
    whatTheyLookFor: [
      'Mentalidad de mejora continua',
      'Iniciativa para automatizar',
      'Creatividad para innovar procesos'
    ],
    goodAnswerTips: [
      '"Busco automatizarlo o proponer que se automatice"',
      'Intento romperlo de formas nuevas (Chaos Engineering mental)',
      'La repetición es la señal para innovar el proceso',
      'Documentar y proponer mejoras al proceso de regresión',
      'Verlo como oportunidad de encontrar edge cases que antes no vimos'
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
// PREGUNTAS DE ESCENARIO - ESCENARIOS PRÁCTICOS (Realidad Simulada)
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
    id: 'qa-sce-works-on-my-machine-001',
    category: 'scenario',
    difficulty: 'junior',
    questionES: 'Si encuentras un bug y el desarrollador dice "En mi máquina funciona", ¿qué haces?',
    questionEN: 'You find a bug but the developer says "Works on my machine". What do you do?',
    context: 'Situación MUY común. Evalúa diplomacia y resolución de problemas',
    whatTheyLookFor: [
      'NO entrar en debate de egos',
      'Método científico para aislar variables',
      'Colaboración con el dev, no confrontación',
      'Documentación clara'
    ],
    goodAnswerTips: [
      '"No entro en debate de egos. Mi objetivo es aislar la variable que nos diferencia"',
      'Verifico el entorno: versión de código, navegador, datos de prueba',
      'Limpio caché y cookies',
      'Si persiste, lo reproduzco frente a él o grabo un video con logs',
      'Comparar configuraciones lado a lado',
      'Ofrecer pair debugging - "sentémonos juntos a verlo"',
      'El objetivo es resolver el problema, no tener la razón'
    ],
    followUpQuestions: [
      '¿Y si sigue sin creerte?',
      '¿Cuándo involucrarías a un QA Lead?'
    ]
  },
  {
    id: 'qa-sce-login-edge-001',
    category: 'scenario',
    difficulty: 'junior',
    questionES: 'Tienes un formulario de login. Dame casos de prueba NO obvios.',
    questionEN: 'You have a login form. Give me NON-obvious test cases.',
    context: 'Evalúa creatividad y pensamiento "out of the box"',
    whatTheyLookFor: [
      'Pensamiento más allá del happy path',
      'Consciencia de seguridad',
      'Consideración de UX edge cases',
      'Conocimiento de caracteres especiales'
    ],
    goodAnswerTips: [
      'Inyección SQL: "\'; DROP TABLE users; --"',
      'Copiar/pegar passwords con espacios al final (trim issues)',
      'Caracteres no latinos: emojis, ñ, chino, árabes',
      'Botón "atrás" del navegador después de loguearse (caché)',
      'Timeout de sesión: ¿qué pasa con requests pendientes?',
      'Intentos simultáneos en dos pestañas (race conditions)',
      'Password con null bytes o caracteres de control',
      'SQL wildcard characters: %, _',
      'Longitud extrema: 1 caracter vs 1000 caracteres',
      'Copy-paste desde Word (caracteres especiales invisibles)'
    ]
  },
  {
    id: 'qa-sce-prioritize-001',
    category: 'scenario',
    difficulty: 'junior-plus',
    questionES: '¿Cómo priorizas tus pruebas si tienes 2 días para algo que requiere 5?',
    questionEN: 'How do you prioritize testing when you have 2 days for something that needs 5?',
    context: 'Evalúa gestión de riesgo y comunicación',
    whatTheyLookFor: [
      'Uso de Matriz de Riesgo',
      'Priorización basada en impacto al negocio',
      'Comunicación proactiva con stakeholders',
      'Documentación de deuda técnica'
    ],
    goodAnswerTips: [
      'Matriz de Riesgo: Impacto × Probabilidad',
      'Pruebo primero los flujos críticos (lo que bloquea al usuario o genera dinero)',
      'Identificar happy paths que deben funcionar sí o sí',
      'Lo cosmético o flujos raros se documentan como riesgo asumido',
      'COMUNICAR ESTO AL PM antes de empezar - no al final',
      'Proponer plan B: ¿podemos hacer release parcial?',
      'Documentar qué NO se probó y los riesgos asociados'
    ]
  },
  {
    id: 'qa-sce-interesting-bug-001',
    category: 'scenario',
    difficulty: 'junior',
    questionES: 'Describe un bug interesante que hayas encontrado.',
    questionEN: 'Describe an interesting bug you\'ve found.',
    context: 'Evalúa experiencia práctica y capacidad de storytelling técnico',
    whatTheyLookFor: [
      'Experiencia real (o bien simulada)',
      'Pensamiento analítico',
      'Curiosidad técnica',
      'Capacidad de comunicar complejidad'
    ],
    goodAnswerTips: [
      'Preparar una historia real con estructura STAR',
      'Contexto: ¿qué estabas probando?',
      'Descubrimiento: ¿cómo lo encontraste?',
      'Impacto: ¿qué consecuencias tenía?',
      'Resolución: ¿cómo se arregló?',
      'Ejemplo: "Al cambiar la zona horaria del dispositivo, los pedidos se duplicaban porque el backend no normalizaba a UTC"',
      'Mostrar curiosidad técnica y detective work'
    ]
  },
  {
    id: 'qa-sce-ambiguous-req-001',
    category: 'scenario',
    difficulty: 'junior',
    questionES: 'El requerimiento es ambiguo o no existe. ¿Cómo pruebas?',
    questionEN: 'The requirement is ambiguous or doesn\'t exist. How do you test?',
    context: 'Evalúa autonomía y testing exploratorio',
    whatTheyLookFor: [
      'Iniciativa para aclarar requerimientos',
      'Capacidad de testing exploratorio',
      'Uso de estándares de la industria',
      'Documentación de supuestos'
    ],
    goodAnswerTips: [
      'Hago Testing Exploratorio basado en mi experiencia',
      'Uso mi intuición y comparo con productos similares o estándares de la industria',
      'Documento mis supuestos MIENTRAS pruebo',
      'Valido mis supuestos con el PO/Dev lo antes posible',
      'Tomo screenshots de comportamiento actual como "documentación viva"',
      'En paralelo, levanto el issue de requerimiento faltante',
      'Comunico: "Asumí X comportamiento basado en Y, ¿es correcto?"'
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
