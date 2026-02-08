export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type SkillStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface MicroModule {
  id: string;
  title: string;
  duration: number; // minutos
  description: string;
  objectives: string[];
  content: string;
  exercise: string;
  checkQuestion: string;
  status: SkillStatus;
  completedAt?: string;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  level: SkillLevel;
  order: number;
  estimatedHours: number;
  modules: MicroModule[];
  prerequisites: string[];
  status: SkillStatus;
  progress: number; // 0-100
}

export interface LearningPath {
  id: 'qa' | 'developer' | 'data-analyst';
  title: string;
  description: string;
  icon: string;
  color: string;
  estimatedWeeks: number;
  skills: Skill[];
}

// =============================================================================
// QA TESTER LEARNING PATH
// =============================================================================

const qaPath: LearningPath = {
  id: 'qa',
  title: 'QA Tester',
  description: 'Especialista en garantía de calidad de software. Domina pruebas manuales y automatizadas.',
  icon: 'bug',
  color: '#00ff41',
  estimatedWeeks: 24,
  skills: [
    {
      id: 'qa-fundamentals',
      title: 'Fundamentos de Testing',
      description: 'Principios básicos de QA y tipos de pruebas',
      level: 'beginner',
      order: 1,
      estimatedHours: 8,
      prerequisites: [],
      status: 'available',
      progress: 0,
      modules: [
        {
          id: 'qa-v2-1-1',
          title: 'QA vs QC vs Testing: El Día a Día Real',
          duration: 30,
          description: 'Entiende tu rol real en un equipo de desarrollo profesional',
          objectives: [
            'Diferenciar QA, QC y Testing con ejemplos reales de trabajo',
            'Comprender el ciclo STLC en metodologías Agile/Scrum',
            'Identificar tus responsabilidades en un sprint real',
            'Conocer herramientas reales: JIRA, TestRail, Confluence'
          ],
          content: `🎮 HOOK: Tu Primer Día en el Trabajo

Es lunes 9am. Entras a tu nuevo trabajo como QA Junior en una fintech mexicana. Tu Scrum Master te presenta al equipo: 5 desarrolladores, 1 Product Owner (PO), 1 Scrum Master, y tú. El PO dice: "Tenemos un sprint de 2 semanas para lanzar 'transferencias instantáneas'. ¿Cuándo empiezas a testear?"

¿Qué respondes? ¿Esperas a que terminen de codear? ¿O hay algo que debes hacer AHORA?

Spoiler: Un buen QA empieza el DÍA 1 del sprint, no al final.

📚 CONCEPTO CLARO: Las 3 Caras de la Calidad

En la industria usamos tres términos que suenan similares pero son MUY diferentes:

🛡️ QA (Quality Assurance) = PREVENIR que existan bugs
• Es PROCESO, no pruebas
• Define estándares ANTES de que empiece el desarrollo
• Crea Definition of Ready y Definition of Done
• Establece qué porcentaje de code coverage se necesita
• Define si se requiere code review obligatorio
• Realiza análisis de riesgos antes de codificar

🔍 QC (Quality Control) = DETECTAR bugs existentes
• Es REVISIÓN del producto terminado
• Verifica que cumple con los requisitos
• Decide si el build está listo para production
• Realiza sign-off antes de releases
• Mide quality metrics (bugs encontrados, cobertura, etc.)

⚙️ Testing = La ejecución técnica de pruebas
• Escribir y ejecutar test cases
• Reportar bugs en herramientas como JIRA
• Crear datos de prueba (test data)
• Documentar test evidence (screenshots, videos)
• Mantener regression suites

🎯 ANALOGÍA: La Construcción de un Puente

Imagina que construyen un puente:

QA = El ingeniero que dice: "Necesitamos usar acero grado A, inspector certificado, y pruebas de carga antes de abrir." (Previene problemas con procesos)

QC = El inspector que revisa: "El puente está construido según los planos, la soldadura pasó pruebas, podemos abrirlo al público." (Detecta problemas en el resultado)

Tester = El técnico que ejecuta: "Aplicamos 50 toneladas de presión en el punto A, medimos deflexión de 2cm, dentro de tolerancia." (Ejecuta pruebas técnicas)`,
          
          exercise: `🎯 EJERCICIO: Tu Primer Sprint Planning

Vas a simular tu participación en una reunión real de Sprint Planning.

📋 MICRO-PASO 1/4 ⏱️ 5 minutos
Contexto: Eres QA en una app de delivery de comida mexicana (como Rappi).

El Product Owner presenta esta user story:

"Como usuario, quiero poder aplicar códigos de descuento en mi orden para pagar menos por mi comida."

Acceptance Criteria:
• El código debe aplicarse antes de pagar
• El descuento se ve reflejado en el total
• Si el código es inválido, mostrar error

💡 Tu misión: Identificar 3 preguntas que harías en la planning para prevenir bugs (actuando como QA, no solo como tester).

Ejemplo de respuesta (no copies esta, piensa la tuya):
"¿Qué pasa si el usuario aplica dos códigos? ¿Se acumulan o solo uno?"

Escribe tus 3 preguntas:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

✅ ¿Listo? Avanza al paso 2.

📋 MICRO-PASO 2/4 ⏱️ 5 minutos
Ahora juegas el rol de Tester (no QA).

Basándote en la misma user story del descuento, escribe:
• 2 test cases positivos (happy path)
• 2 test cases negativos (error handling)

Formato simple:
Test Case: [Nombre]
Steps: 1. ... 2. ... 3. ...
Expected: ...

Ejemplo (no copies):
Test Case: Aplicar código válido
Steps: 1. Agregar producto al carrito 2. Ir a checkout 3. Ingresar "DESCUENTO10" 4. Click Aplicar
Expected: Total se reduce 10%, mensaje "Código aplicado"

Tus 4 test cases:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
4. _______________________________________________

🎉 ¡Buen trabajo! Estás pensando como tester profesional.

📋 MICRO-PASO 3/4 ⏱️ 5 minutos

Investiga: Busca qué es JIRA y por qué es la herramienta #1 para reportar bugs en la industria. Escribe 3 características que la hacen útil para QA.`,
          
          checkQuestion: `🎯 CHECK PRÁCTICO: El Bug que Causó un Incidente

Escenario real: Eres QA Lead en una fintech mexicana. Es viernes 2pm. El equipo quiere hacer deploy de "transferencias instantáneas" a producción. El sprint termina hoy.

Un developer te dice: "Todo está probado, solo son 3 líneas de código que cambian, no puede fallar nada. Vamos a producción y nos vamos de fin de semana."

Tú revisas JIRA y ves:
• ✅ Unit tests pasan
• ✅ Code review aprobado
• ⚠️ Solo hiciste smoke tests, no regression completa
• ❌ No hay test cases escritos para transferencias (solo pruebas ad-hoc)

¿Qué haces?

A) Confías en el dev y apruebas el deploy. Son solo 3 líneas.
B) Dices que NO hasta hacer regression testing completo, aunque trabajes hasta tarde el viernes.
C) Sugieres deploy a staging el viernes, pero producción el lunes después de regression testing durante el fin de semana.
D) Pides que alguien más (otro QA o el dev) escriba test cases mientras tú haces regression.

✅ RESPUESTA CORRECTA: C

EXPLICACIÓN PROFESIONAL:

La opción C muestra pensamiento de QA profesional:
• Balancea velocidad vs calidad (no bloqueas el deploy a staging)
• Prioriza mitigación de riesgo (dinero de usuarios > presión de tiempo)
• Protege al equipo de un incidente en producción un viernes por la tarde
• Mantiene professional accountability (tú firmas con tu nombre el quality)

Por qué las otras están mal:
• A: "Solo 3 líneas" es famosa última frase antes de un outage. Knight Capital perdió $440 millones con "un pequeño cambio".
• B: Correcto en principio, pero innecesariamente rígido. Staging puede recibir el código hoy.
• D: Pasar responsabilidad no es profesional. Eres el QA, tú decides qué nivel de testing es adecuado.

Lección: En QA, tu trabajo es proteger al usuario Y al equipo. Un buen QA sabe decir "sí, pero..." en lugar de solo "no".`,
          
          status: 'available',
        },
        {
          id: 'qa-1-2',
          title: 'Tipos de Testing',
          duration: 25,
          description: 'Manual vs Automatizado, Funcional vs No Funcional',
          objectives: ['Distinguir tipos de testing', 'Saber cuándo usar cada uno'],
          content: 'Manual: Cuando se necesita juicio humano. Automatizado: Para regresiones repetitivas. Funcional: Lo que el sistema hace. No funcional: Cómo lo hace (performance, seguridad).',
          exercise: 'Clasifica escenarios de e-commerce en los tipos de testing.',
          checkQuestion: '¿Automatizarías una prueba que corre una vez por release?',
          status: 'locked',
        },
        {
          id: 'qa-1-3',
          title: 'Smoke, Sanity y Regresión',
          duration: 25,
          description: 'Diferencias y cuándo aplicar cada una',
          objectives: ['Entender pirámide de testing', 'Aplicar smoke testing'],
          content: 'Smoke: "¿Enciende?" - verificación básica. Sanity: "¿El fix funcionó?" - verificación específica. Regresión: "¿Rompi algo?" - pruebas completas.',
          exercise: 'Decide qué tests correr después de un hotfix de login.',
          checkQuestion: '¿Deberías seguir testeando si el smoke test falla?',
          status: 'locked',
        },
        {
          id: 'qa-1-4',
          title: 'Ciclo de Vida del Bug',
          duration: 20,
          description: 'Estados, severidad y prioridad',
          objectives: ['Trackear bugs correctamente', 'Asignar severidad/prioridad'],
          content: 'Estados: New → Assigned → Open → Fixed → Retest → Closed/Reopened. Severidad: Impacto técnico. Prioridad: Orden de arreglo.',
          exercise: 'Clasifica bugs reales en severidad/prioridad.',
          checkQuestion: '¿Puede un bug ser de baja severidad pero alta prioridad?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'qa-test-design',
      title: 'Diseño de Casos de Prueba',
      description: 'Técnicas de diseño y documentación',
      level: 'beginner',
      order: 2,
      estimatedHours: 10,
      prerequisites: ['qa-fundamentals'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'qa-2-1',
          title: 'Anatomía de un Test Case',
          duration: 25,
          description: 'Cómo escribir casos de prueba efectivos',
          objectives: ['Escribir test cases SMART', 'Usar plantillas estándar'],
          content: 'Un test case tiene: ID, Título, Precondiciones, Pasos, Resultado Esperado, Resultado Actual, Estado. Debe ser específico, medible y testeable.',
          exercise: 'Escribe 2 test cases para "Forgot Password" (uno positivo, uno negativo).',
          checkQuestion: '¿Los pasos deben incluir ubicaciones de UI como "botón azul"?',
          status: 'locked',
        },
        {
          id: 'qa-2-2',
          title: 'Partición de Equivalencia',
          duration: 25,
          description: 'Reducir casos de prueba redundantes',
          objectives: ['Identificar clases de equivalencia', 'Seleccionar valores representativos'],
          content: 'Divide inputs en clases equivalentes. Testea un valor por clase. Ej: Edad 18-65 → partitions: <18, 18-65, >65.',
          exercise: 'Define particiones para un campo de edad (18-65 años).',
          checkQuestion: '¿Por qué testear solo un valor de cada clase?',
          status: 'locked',
        },
        {
          id: 'qa-2-3',
          title: 'Análisis de Valores Frontera',
          duration: 25,
          description: 'Encontrar bugs en los límites',
          objectives: ['Aplicar BVA', 'Combinar con partición de equivalencia'],
          content: 'Los bugs ocurren en los límites. Testea: min-1, min, min+1, max-1, max, max+1. Ej: Contraseña 8-20 chars → testea 7,8,9,19,20,21.',
          exercise: 'Aplica BVA a un campo de contraseña (8-20 caracteres).',
          checkQuestion: '¿Cuáles son los 6 valores a testear en BVA para 1-100?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'qa-sql',
      title: 'SQL para Testers',
      description: 'Consultas para validación de datos',
      level: 'beginner',
      order: 3,
      estimatedHours: 6,
      prerequisites: [],
      status: 'available',
      progress: 0,
      modules: [
        {
          id: 'qa-3-1',
          title: 'SELECT y WHERE',
          duration: 30,
          description: 'Consultas básicas para testers',
          objectives: ['Escribir SELECTs', 'Filtrar con WHERE'],
          content: 'Testers usan SQL para: validar datos, setup de test data, verificar estados. Sintaxis: SELECT columna FROM tabla WHERE condición.',
          exercise: 'Escribe queries para: clientes activos, clientes 2024, primeros 10 alfabéticamente.',
          checkQuestion: '¿Cuál es la diferencia entre WHERE y HAVING?',
          status: 'available',
        },
        {
          id: 'qa-3-2',
          title: 'JOINs para Testers',
          duration: 30,
          description: 'Unir tablas para validaciones complejas',
          objectives: ['Usar INNER y LEFT JOIN', 'Validar datos entre tablas'],
          content: 'JOINs permiten validar relaciones entre datos. INNER JOIN: coincidencias. LEFT JOIN: todos de la izquierda + coincidencias.',
          exercise: 'Escribe queries para: órdenes con nombres de clientes, revenue por cliente, clientes sin órdenes.',
          checkQuestion: '¿Qué JOIN usarías para encontrar órdenes sin clientes asociados?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'qa-automation',
      title: 'Automatización con Playwright',
      description: 'UI Testing automatizado',
      level: 'intermediate',
      order: 4,
      estimatedHours: 20,
      prerequisites: ['qa-fundamentals', 'qa-test-design'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'qa-4-1',
          title: 'Introducción a Playwright',
          duration: 30,
          description: 'Setup y primer test automatizado',
          objectives: ['Instalar Playwright', 'Escribir test básico'],
          content: 'Playwright es más rápido y confiable que Selenium. Soporta múltiples browsers. Auto-waiting integrado.',
          exercise: 'Instala Playwright y escribe un test que abra example.com y verifique el título.',
          checkQuestion: '¿Qué es el auto-waiting en Playwright?',
          status: 'locked',
        },
        {
          id: 'qa-4-2',
          title: 'Locators y Acciones',
          duration: 30,
          description: 'Encontrar elementos e interactuar',
          objectives: ['Usar locators resilientes', 'Realizar acciones de usuario'],
          content: 'Mejores locators: get_by_role, get_by_text, get_by_test_id. Evita XPath frágil. Acciones: click, fill, select_option.',
          exercise: 'Escribe un test de login usando get_by_role y aserciones.',
          checkQuestion: '¿Por qué get_by_test_id es mejor que selectores CSS complejos?',
          status: 'locked',
        },
        {
          id: 'qa-4-3',
          title: 'Page Object Model',
          duration: 30,
          description: 'Patrón para mantenibilidad',
          objectives: ['Implementar POM', 'Separar page logic de test logic'],
          content: 'POM encapsula elementos y acciones de una página. Si cambia el UI, solo actualizas la clase Page.',
          exercise: 'Convierte tests inline a Page Object para una página de login.',
          checkQuestion: '¿Cuántos lugares actualizas si cambia un ID con vs sin POM?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'qa-api',
      title: 'API Testing',
      description: 'Pruebas de servicios REST',
      level: 'intermediate',
      order: 5,
      estimatedHours: 12,
      prerequisites: ['qa-sql'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'qa-5-1',
          title: 'Fundamentos REST',
          duration: 30,
          description: 'HTTP, métodos y status codes',
          objectives: ['Entender REST', 'Usar métodos HTTP correctamente'],
          content: 'Métodos: GET (leer), POST (crear), PUT/PATCH (actualizar), DELETE (borrar). Status: 2xx éxito, 4xx error cliente, 5xx error servidor.',
          exercise: 'Asigna métodos y status codes esperados para escenarios de API.',
          checkQuestion: '¿Cuál es la diferencia entre PUT y PATCH?',
          status: 'locked',
        },
        {
          id: 'qa-5-2',
          title: 'Postman para Testing',
          duration: 30,
          description: 'Collections y tests automatizados',
          objectives: ['Crear collections', 'Escribir tests en Postman'],
          content: 'Postman permite: organizar requests, guardar variables de entorno, escribir tests en JavaScript, chaining de requests.',
          exercise: 'Crea una collection para User API con CRUD y tests automatizados.',
          checkQuestion: '¿Por qué usar variables de entorno vs hardcodear URLs?',
          status: 'locked',
        },
      ],
    },
  ],
};

// =============================================================================
// DEVELOPER LEARNING PATH
// =============================================================================

const developerPath: LearningPath = {
  id: 'developer',
  title: 'Developer',
  description: 'Desarrollador de software full-stack. Construye aplicaciones web completas.',
  icon: 'code',
  color: '#00f0ff',
  estimatedWeeks: 24,
  skills: [
    {
      id: 'dev-basics',
      title: 'Fundamentos de Programación',
      description: 'Python/JavaScript esenciales',
      level: 'beginner',
      order: 1,
      estimatedHours: 20,
      prerequisites: [],
      status: 'available',
      progress: 0,
      modules: [
        {
          id: 'dev-1-1',
          title: 'Variables y Tipos de Datos',
          duration: 25,
          description: 'Declaración y uso de variables',
          objectives: ['Declarar variables', 'Entender tipos de datos'],
          content: 'Variables: contenedores de datos. Tipos: strings, numbers, booleans, null/undefined. Python es dinámicamente tipado.',
          exercise: 'Crea una calculadora simple que sume, reste, multiplique y divida.',
          checkQuestion: '¿Por qué 5 + "5" es diferente en JavaScript vs Python?',
          status: 'available',
        },
        {
          id: 'dev-1-2',
          title: 'Control de Flujo',
          duration: 25,
          description: 'Condicionales y loops',
          objectives: ['Usar if/else', 'Usar for y while loops'],
          content: 'Condicionales: if/elif/else. Loops: for (iteraciones definidas), while (condicionales). Break y continue para control.',
          exercise: 'Crea un juego de adivinar números con hints (too high/too low).',
          checkQuestion: '¿Cuándo usar while en vez de for?',
          status: 'locked',
        },
        {
          id: 'dev-1-3',
          title: 'Funciones',
          duration: 25,
          description: 'Definir y llamar funciones',
          objectives: ['Crear funciones', 'Usar parámetros y return'],
          content: 'Funciones: bloques reutilizables. Parámetros vs argumentos. Return vs print. Docstrings para documentación.',
          exercise: 'Crea una función calculate_area(shape, ...) que maneje rectángulos, círculos y triángulos.',
          checkQuestion: '¿Diferencia entre función que print vs una que return?',
          status: 'locked',
        },
        {
          id: 'dev-1-4',
          title: 'Estructuras de Datos',
          duration: 25,
          description: 'Listas, diccionarios y objetos',
          objectives: ['Usar listas/arrays', 'Usar diccionarios/objetos'],
          content: 'Listas: colecciones ordenadas. Diccionarios: pares key-value. JSON: formato de intercambio.',
          exercise: 'Crea una libreta de contactos con nombre, teléfono y email.',
          checkQuestion: '¿Qué es la complejidad de lookup por key en un diccionario?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'dev-oop',
      title: 'Programación Orientada a Objetos',
      description: 'Clases, objetos y herencia',
      level: 'intermediate',
      order: 2,
      estimatedHours: 12,
      prerequisites: ['dev-basics'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'dev-2-1',
          title: 'Clases y Objetos',
          duration: 30,
          description: 'Crear y usar clases',
          objectives: ['Definir clases', 'Crear instancias'],
          content: 'Clase: blueprint. Objeto: instancia. __init__/constructor. Self/this. Atributos y métodos de instancia.',
          exercise: 'Crea una clase BankAccount con deposit, withdraw y check_balance.',
          checkQuestion: '¿Diferencia entre clase y objeto?',
          status: 'locked',
        },
        {
          id: 'dev-2-2',
          title: 'Herencia y Polimorfismo',
          duration: 25,
          description: 'Reutilización de código',
          objectives: ['Usar herencia', 'Sobreescribir métodos'],
          content: 'Herencia: clase hija hereda de padre. Super() para llamar método padre. Method overriding.',
          exercise: 'Crea clase Vehicle y deriva Car, Motorcycle, Truck con comportamientos específicos.',
          checkQuestion: '¿Cuándo usar composición en vez de herencia?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'dev-git',
      title: 'Git y Control de Versiones',
      description: 'Manejo de código fuente',
      level: 'beginner',
      order: 3,
      estimatedHours: 8,
      prerequisites: [],
      status: 'available',
      progress: 0,
      modules: [
        {
          id: 'dev-3-1',
          title: 'Git Básico',
          duration: 30,
          description: 'Commits, branches y merges',
          objectives: ['Inicializar repos', 'Hacer commits'],
          content: 'Git: sistema de control de versiones. Commands: clone, status, add, commit, push, pull. Branching para features.',
          exercise: 'Crea un proyecto, inicializa git, haz 3 commits con mensajes descriptivos.',
          checkQuestion: '¿Diferencia entre git pull y git fetch?',
          status: 'available',
        },
        {
          id: 'dev-3-2',
          title: 'Colaboración con Git',
          duration: 25,
          description: 'Pull requests y code review',
          objectives: ['Resolver merge conflicts', 'Usar Pull Requests'],
          content: 'Feature branches. Pull requests para code review. Merge conflicts: causas y resolución.',
          exercise: 'Simula un merge conflict y resuélvelo paso a paso.',
          checkQuestion: '¿Cuándo usar git rebase vs git merge?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'dev-web',
      title: 'Desarrollo Web Full-Stack',
      description: 'Frontend y Backend',
      level: 'intermediate',
      order: 4,
      estimatedHours: 40,
      prerequisites: ['dev-basics', 'dev-git'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'dev-4-1',
          title: 'HTTP y APIs',
          duration: 25,
          description: 'Protocolo y REST',
          objectives: ['Entender HTTP', 'Diseñar endpoints REST'],
          content: 'HTTP: request/response. Métodos: GET, POST, PUT, DELETE. Status codes. REST: arquitectura de APIs.',
          exercise: 'Diseña una API REST para un blog (posts, comments, users).',
          checkQuestion: '¿Diferencia entre 401 y 403?',
          status: 'locked',
        },
        {
          id: 'dev-4-2',
          title: 'Backend con Flask/Express',
          duration: 30,
          description: 'Servidores y rutas',
          objectives: ['Crear servidor', 'Definir rutas'],
          content: 'Flask (Python) o Express (Node). Routing. Request/response. Middleware. Validación de datos.',
          exercise: 'Crea una API de TODO list con CRUD completo.',
          checkQuestion: '¿Qué es middleware y cuándo usarlo?',
          status: 'locked',
        },
        {
          id: 'dev-4-3',
          title: 'Frontend con React',
          duration: 30,
          description: 'Componentes y estado',
          objectives: ['Crear componentes', 'Manejar estado'],
          content: 'React: librería UI. JSX. Componentes funcionales. useState, useEffect. Props drilling.',
          exercise: 'Crea una app de TODOs con componentes: TodoList, TodoItem, AddTodoForm.',
          checkQuestion: '¿Diferencia entre props y state?',
          status: 'locked',
        },
        {
          id: 'dev-4-4',
          title: 'Bases de Datos',
          duration: 30,
          description: 'SQL y modelado',
          objectives: ['Diseñar schemas', 'Escribir queries SQL'],
          content: 'SQL: tablas, relaciones, joins. Normalización. Índices. ORM básico.',
          exercise: 'Diseña una base de datos de e-commerce normalizada (3NF).',
          checkQuestion: '¿Por qué normalizar? ¿Cuándo desnormalizar?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'dev-testing',
      title: 'Testing de Software',
      description: 'Unit tests y TDD',
      level: 'intermediate',
      order: 5,
      estimatedHours: 10,
      prerequisites: ['dev-web'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'dev-5-1',
          title: 'Unit Testing',
          duration: 30,
          description: 'pytest y Jest',
          objectives: ['Escribir unit tests', 'Usar assertions'],
          content: 'pytest (Python) / Jest (JS). Arrange-Act-Assert. Mocks y stubs. Cobertura de código.',
          exercise: 'Escribe tests unitarios completos para tu clase BankAccount.',
          checkQuestion: '¿Diferencia entre unit e integration tests?',
          status: 'locked',
        },
        {
          id: 'dev-5-2',
          title: 'Test Driven Development',
          duration: 25,
          description: 'Red-Green-Refactor',
          objectives: ['Aplicar ciclo TDD', 'Escribir tests primero'],
          content: 'TDD: escribir test que falla (red), hacer pasar (green), refactorizar. Beneficios: diseño, confianza.',
          exercise: 'Implementa un validador de passwords usando TDD.',
          checkQuestion: '¿Beneficios de escribir tests primero?',
          status: 'locked',
        },
      ],
    },
  ],
};

// =============================================================================
// DATA ANALYST LEARNING PATH
// =============================================================================

const dataAnalystPath: LearningPath = {
  id: 'data-analyst',
  title: 'Data Analyst',
  description: 'Analista de datos. Extrae insights y crea visualizaciones para decisiones de negocio.',
  icon: 'bar-chart',
  color: '#ffb000',
  estimatedWeeks: 24,
  skills: [
    {
      id: 'data-basics',
      title: 'Fundamentos de Análisis',
      description: 'Excel y estadística básica',
      level: 'beginner',
      order: 1,
      estimatedHours: 15,
      prerequisites: [],
      status: 'available',
      progress: 0,
      modules: [
        {
          id: 'data-1-1',
          title: 'Excel para Análisis',
          duration: 30,
          description: 'Fórmulas y tablas dinámicas',
          objectives: ['Usar fórmulas avanzadas', 'Crear pivot tables'],
          content: 'Excel: herramienta fundamental. Fórmulas: VLOOKUP, INDEX/MATCH, SUMIF, COUNTIF. Tablas dinámicas para resumen.',
          exercise: 'Analiza un dataset de ventas: total por región, promedio por producto, tendencias mensuales.',
          checkQuestion: '¿Ventaja de INDEX/MATCH sobre VLOOKUP?',
          status: 'available',
        },
        {
          id: 'data-1-2',
          title: 'Estadística Descriptiva',
          duration: 30,
          description: 'Medidas de tendencia central',
          objectives: ['Calcular media, mediana, moda', 'Entender percentiles'],
          content: 'Media: promedio. Mediana: valor central. Moda: más frecuente. Percentiles: posición relativa.',
          exercise: 'Calcula estadísticas descriptivas de un dataset de salarios.',
          checkQuestion: '¿Cuándo la mediana es mejor que la media?',
          status: 'locked',
        },
        {
          id: 'data-1-3',
          title: 'Limpieza de Datos',
          duration: 30,
          description: 'Data quality y preparación',
          objectives: ['Identificar datos faltantes', 'Estandarizar formatos'],
          content: 'Data cleaning: 80% del trabajo. Missing values, duplicados, outliers, formatos inconsistentes.',
          exercise: 'Limpia un dataset messy: maneja nulls, estandariza fechas, corrige typos.',
          checkQuestion: '¿Qué hacer con outliers: eliminar, transformar o mantener?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'data-sql',
      title: 'SQL para Análisis',
      description: 'Extracción y manipulación de datos',
      level: 'beginner',
      order: 2,
      estimatedHours: 15,
      prerequisites: [],
      status: 'available',
      progress: 0,
      modules: [
        {
          id: 'data-2-1',
          title: 'SQL Básico',
          duration: 30,
          description: 'SELECT, WHERE, ORDER BY',
          objectives: ['Escribir queries básicas', 'Filtrar y ordenar datos'],
          content: 'SQL: lenguaje para datos. SELECT: elegir columnas. WHERE: filtrar filas. ORDER BY: ordenar. LIMIT: paginar.',
          exercise: 'Escribe queries para: top 10 clientes por gasto, órdenes del último mes, productos sin stock.',
          checkQuestion: '¿Diferencia entre WHERE y HAVING?',
          status: 'available',
        },
        {
          id: 'data-2-2',
          title: 'Agregaciones y GROUP BY',
          duration: 30,
          description: 'SUM, COUNT, AVG, MAX, MIN',
          objectives: ['Usar funciones de agregación', 'Agrupar datos'],
          content: 'Agregaciones: resumen de datos. GROUP BY: agrupar por categoría. HAVING: filtrar grupos.',
          exercise: 'Calcula: ventas por categoría, promedio de órdenes por cliente, conteo por mes.',
          checkQuestion: '¿Por qué no puedes usar WHERE con funciones de agregación?',
          status: 'locked',
        },
        {
          id: 'data-2-3',
          title: 'JOINs Avanzados',
          duration: 35,
          description: 'Múltiples tablas y subqueries',
          objectives: ['Combinar tablas complejas', 'Usar subqueries'],
          content: 'JOINs: INNER, LEFT, RIGHT, FULL. Self-joins. Subqueries: queries dentro de queries. CTEs (WITH clause).',
          exercise: 'Escribe queries con: múltiples joins, subquery en WHERE, CTE para legibilidad.',
          checkQuestion: '¿Cuándo usar CTE vs subquery?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'data-python',
      title: 'Python para Data Analysis',
      description: 'pandas y numpy',
      level: 'intermediate',
      order: 3,
      estimatedHours: 20,
      prerequisites: ['data-sql'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'data-3-1',
          title: 'Introducción a pandas',
          duration: 30,
          description: 'DataFrames y Series',
          objectives: ['Cargar datos', 'Manipular DataFrames'],
          content: 'pandas: librería #1 para datos. DataFrame: tabla. Series: columna. read_csv, head, info, describe.',
          exercise: 'Carga un CSV, explora sus columnas, filtra filas, selecciona columnas específicas.',
          checkQuestion: '¿Diferencia entre loc e iloc?',
          status: 'locked',
        },
        {
          id: 'data-3-2',
          title: 'Manipulación de Datos',
          duration: 35,
          description: 'Filtrado, grouping y aggregations',
          objectives: ['Filtrar datos', 'Agrupar y agregar'],
          content: 'Filtrado booleano. groupby: split-apply-combine. merge: joins. pivot tables.',
          exercise: 'Replica tu análisis SQL de ventas usando pandas.',
          checkQuestion: '¿Cómo pandas groupby compara con SQL GROUP BY?',
          status: 'locked',
        },
        {
          id: 'data-3-3',
          title: 'numpy y Cálculos',
          duration: 30,
          description: 'Arrays y operaciones numéricas',
          objectives: ['Usar arrays de numpy', 'Realizar operaciones vectorizadas'],
          content: 'numpy: computación numérica. Arrays n-dimensionales. Operaciones vectorizadas (más rápidas que loops).',
          exercise: 'Calcula estadísticas avanzadas usando numpy: correlación, desviación estándar, percentiles.',
          checkQuestion: '¿Por qué numpy es más rápido que Python puro?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'data-viz',
      title: 'Visualización de Datos',
      description: 'Matplotlib, Seaborn y Dashboards',
      level: 'intermediate',
      order: 4,
      estimatedHours: 15,
      prerequisites: ['data-python'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'data-4-1',
          title: 'Matplotlib y Seaborn',
          duration: 35,
          description: 'Gráficos estáticos',
          objectives: ['Crear gráficos básicos', 'Personalizar visualizaciones'],
          content: 'Matplotlib: gráficos personalizables. Seaborn: estadísticos y estéticos. Tipos: line, bar, scatter, heatmap, boxplot.',
          exercise: 'Crea un dashboard con 4 visualizaciones de un dataset de ventas.',
          checkQuestion: '¿Cuándo usar bar chart vs line chart?',
          status: 'locked',
        },
        {
          id: 'data-4-2',
          title: 'Dashboards Interactivos',
          duration: 35,
          description: 'Tableau o PowerBI',
          objectives: ['Crear dashboards', 'Agregar filtros e interacciones'],
          content: 'Dashboards: visualizaciones interactivas. Filtros, drill-down, tooltips. Storytelling con datos.',
          exercise: 'Crea un dashboard interactivo con al menos 3 filtros y 5 visualizaciones.',
          checkQuestion: '¿Qué hace un buen dashboard vs uno malo?',
          status: 'locked',
        },
      ],
    },
    {
      id: 'data-stats',
      title: 'Estadística para Negocios',
      description: 'A/B Testing y modelado',
      level: 'advanced',
      order: 5,
      estimatedHours: 20,
      prerequisites: ['data-viz'],
      status: 'locked',
      progress: 0,
      modules: [
        {
          id: 'data-5-1',
          title: 'A/B Testing',
          duration: 40,
          description: 'Diseño y análisis de experimentos',
          objectives: ['Diseñar experimentos', 'Calcular tamaño de muestra'],
          content: 'A/B testing: comparar variantes. Hipótesis nula y alternativa. p-values. Significancia estadística. Tamaño de muestra.',
          exercise: 'Analiza resultados de un A/B test: calcula p-value, intervalo de confianza, conclusión.',
          checkQuestion: '¿Qué es el p-value y qué significa p < 0.05?',
          status: 'locked',
        },
        {
          id: 'data-5-2',
          title: 'Regresión Lineal',
          duration: 40,
          description: 'Modelado predictivo básico',
          objectives: ['Entender regresión', 'Interpretar coeficientes'],
          content: 'Regresión lineal: predecir números. R-cuadrado. Coeficientes. Assumptions. Predicciones.',
          exercise: 'Construye un modelo de regresión para predecir ventas basado en gasto en marketing.',
          checkQuestion: '¿Qué significa R² = 0.85?',
          status: 'locked',
        },
      ],
    },
  ],
};

// Export all paths
export const LEARNING_PATHS: Record<string, LearningPath> = {
  qa: qaPath,
  developer: developerPath,
  'data-analyst': dataAnalystPath,
};

// Helper functions
export function getPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS[id];
}

export function getAllPaths(): LearningPath[] {
  return Object.values(LEARNING_PATHS);
}

export function calculatePathProgress(path: LearningPath): number {
  const allModules = path.skills.flatMap(s => s.modules);
  if (allModules.length === 0) return 0;
  
  const completed = allModules.filter(m => m.status === 'completed').length;
  return Math.round((completed / allModules.length) * 100);
}

export function getNextModule(path: LearningPath): MicroModule | null {
  for (const skill of path.skills) {
    for (const module of skill.modules) {
      if (module.status === 'available' || module.status === 'in_progress') {
        return module;
      }
    }
  }
  return null;
}
