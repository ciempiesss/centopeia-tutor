// RSD (Rejection Sensitive Dysphoria) Safe Feedback System
// Para usuarios AUDHD - evita disparar sensibilidad al rechazo

export interface FeedbackContext {
  attemptNumber: number;
  isFirstTime: boolean;
  userMood?: 'frustrated' | 'neutral' | 'confident';
  previousErrors: string[];
}

export interface FeedbackResult {
  message: string;
  tone: 'supportive' | 'neutral' | 'encouraging';
  includeHint: boolean;
  nextAction: string;
}

// Frases PROHIBIDAS - NUNCA usar estas
export const FORBIDDEN_PHRASES = [
  'eso está mal',
  'incorrecto',
  'te equivocaste',
  'deberías saber esto',
  'es fácil',
  'es simple',
  'cualquiera puede hacerlo',
  'no es difícil',
  'obvio',
  'claramente',
  'obviamente',
  'como deberías saber',
  'por qué no entiendes',
  'te lo expliqué antes',
  'no prestaste atención',
];

// Frases PERMITIDAS y RECOMENDADAS
export const RECOMMENDED_PHRASES = {
  effortAcknowledgment: [
    'Veo que intentaste...',
    'Aprecio que hayas probado...',
    'Noto que le estás poniendo esfuerzo a...',
    'Gracias por intentar...',
  ],
  specificPraise: [
    'Esta parte la hiciste bien: {detail}',
    'Lo que funcionó fue: {detail}',
    'Acertaste en: {detail}',
    'Esto está correcto: {detail}',
  ],
  normalizingMistakes: [
    'Ese error es común cuando se empieza con {topic}',
    'Muchos se confunden con {topic} al principio',
    'Ese bug es clásico en {topic}',
    'Esa confusión es normal en {topic}',
    'Yo también me confundía con {topic} al inicio',
  ],
  growthFraming: [
    'Próximo paso para mejorar: {action}',
    'Podemos ajustar esto así: {action}',
    'Una pequeña corrección: {action}',
    'Vamos a refinar esto: {action}',
  ],
  processOverOutcome: [
    'El proceso es más importante que el resultado ahora',
    'Estás construyendo la intuición paso a paso',
    'Cada intento cuenta, no solo el correcto',
    'El cerebro aprende de los errores también',
  ],
};

export class RSDSafeFeedback {
  // Analizar si el mensaje contiene frases prohibidas
  static containsForbiddenPhrases(text: string): boolean {
    const lowerText = text.toLowerCase();
    return FORBIDDEN_PHRASES.some(phrase => lowerText.includes(phrase.toLowerCase()));
  }

  // Sanitizar mensaje reemplazando frases prohibidas
  static sanitize(text: string): string {
    let sanitized = text;
    const replacements: Record<string, string> = {
      'incorrecto': 'no funciona como esperamos',
      'incorrecta': 'no funciona como esperamos',
      'mal': 'puede mejorar',
      'error': 'oportunidad de ajuste',
      'te equivocaste': 'hagamos un ajuste',
      'deberías saber': 'vamos a revisar',
      'es fácil': 'requiere práctica',
      'es simple': 'tiene su complejidad',
    };

    Object.entries(replacements).forEach(([bad, good]) => {
      sanitized = sanitized.replace(new RegExp(bad, 'gi'), good);
    });

    return sanitized;
  }

  // Generar feedback para código incorrecto
  static generateCodeFeedback(
    code: string,
    error: string,
    context: FeedbackContext
  ): FeedbackResult {
    const isRepeatedError = context.previousErrors.includes(error);
    
    if (isRepeatedError) {
      return {
        message: `Veo que seguimos con el mismo tema. No hay problema, a veces necesita otro ángulo.

${this.normalizeError(error)}

¿Te gustaría que lo explique de otra forma o prefieres ver un ejemplo?`,
        tone: 'supportive',
        includeHint: true,
        nextAction: 'Intenta con una explicación diferente o ejemplo',
      };
    }

    const messageParts: string[] = [];

    // 1. Acknowledge effort
    messageParts.push(this.getRandomPhrase(RECOMMENDED_PHRASES.effortAcknowledgment));

    // 2. Find something to praise (even if small)
    const praiseDetail = this.findPraiseworthyElement(code);
    if (praiseDetail) {
      messageParts.push(
        this.getRandomPhrase(RECOMMENDED_PHRASES.specificPraise).replace('{detail}', praiseDetail)
      );
    }

    // 3. Normalize the error
    messageParts.push(
      this.getRandomPhrase(RECOMMENDED_PHRASES.normalizingMistakes).replace('{topic}', this.extractTopic(error))
    );

    // 4. Growth framing
    const correction = this.suggestCorrection(error);
    messageParts.push(
      this.getRandomPhrase(RECOMMENDED_PHRASES.growthFraming).replace('{action}', correction)
    );

    return {
      message: messageParts.join('\n\n'),
      tone: 'encouraging',
      includeHint: context.attemptNumber > 1,
      nextAction: correction,
    };
  }

  // Generar feedback para respuesta conceptual
  static generateConceptualFeedback(
    userAnswer: string,
    correctConcept: string,
    context: FeedbackContext
  ): FeedbackResult {
    const messageParts: string[] = [];

    // Si está parcialmente correcto
    if (this.isPartiallyCorrect(userAnswer, correctConcept)) {
      messageParts.push('Vas por buen camino. Hay partes que captaste bien.');
      messageParts.push(`Específicamente: ${this.extractCorrectParts(userAnswer)}`);
      messageParts.push(`Refinemos: ${this.getGapExplanation(userAnswer, correctConcept)}`);
    } else {
      // Completamente incorrecto pero RSD-safe
      messageParts.push('Gracias por compartir tu razonamiento.');
      messageParts.push(
        this.getRandomPhrase(RECOMMENDED_PHRASES.normalizingMistakes).replace('{topic}', 'este concepto')
      );
      messageParts.push(`Otra forma de verlo: ${this.reframeConcept(correctConcept)}`);
    }

    return {
      message: messageParts.join('\n\n'),
      tone: 'supportive',
      includeHint: true,
      nextAction: 'Revisar el concepto desde otro ángulo',
    };
  }

  // Generar celebración de logro (sin condescendencia)
  static generateAchievementFeedback(achievement: string, isMajor: boolean): string {
    if (isMajor) {
      const majorCelebrations = [
        `✅ ${achievement} - Completado. Tu trabajo constante dio resultados.`,
        `✅ ${achievement} - Hecho. Esto muestra tu capacidad de seguir hasta el final.`,
        `✅ ${achievement} - Logrado. El progreso real se mide en terminar cosas.`,
      ];
      return majorCelebrations[Math.floor(Math.random() * majorCelebrations.length)];
    }

    const minorCelebrations = [
      `✅ ${achievement} - Listo.`,
      `✅ ${achievement} - Hecho.`,
      `✅ ${achievement} - Completado.`,
    ];
    return minorCelebrations[Math.floor(Math.random() * minorCelebrations.length)];
  }

  // Helper: Obtener frase aleatoria
  private static getRandomPhrase(phrases: string[]): string {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  // Helper: Normalizar error técnico
  private static normalizeError(error: string): string {
    // Quitar tecnicismos intimidantes
    return error
      .replace('SyntaxError', 'pequeño detalle de sintaxis')
      .replace('TypeError', 'tipo de dato')
      .replace('ReferenceError', 'referencia')
      .replace('undefined', 'no definido')
      .replace('null', 'vacío');
  }

  // Helper: Extraer tema del error
  private static extractTopic(error: string): string {
    // Simplificar para no sonar técnico
    if (error.includes('function') || error.includes('()')) return 'funciones';
    if (error.includes('variable') || error.includes('let') || error.includes('const')) return 'variables';
    if (error.includes('if') || error.includes('else')) return 'condicionales';
    if (error.includes('for') || error.includes('while')) return 'loops';
    if (error.includes('array') || error.includes('[]')) return 'arrays';
    if (error.includes('object') || error.includes('{}')) return 'objetos';
    return 'este tema';
  }

  // Helper: Encontrar algo elogiable
  private static findPraiseworthyElement(code: string): string | null {
    if (code.includes('//')) return 'usar comentarios para aclarar';
    if (code.includes('console.log')) return 'usar logs para debuggear';
    if (code.includes('function') || code.includes('=>')) return 'definir una función';
    if (code.includes('const') || code.includes('let')) return 'usar declaraciones modernas';
    if (code.includes('return')) return 'retornar un valor';
    if (code.length > 50) return 'intentar una solución completa';
    return 'intentar resolverlo';
  }

  // Helper: Sugerir corrección
  private static suggestCorrection(error: string): string {
    if (error.includes('syntax')) return 'revisar los paréntesis y llaves';
    if (error.includes('undefined')) return 'verificar que la variable esté definida antes de usarla';
    if (error.includes('type')) return 'confirmar el tipo de dato que esperamos';
    return 'revisar paso a paso el flujo del código';
  }

  // Helper: Verificar si es parcialmente correcto
  private static isPartiallyCorrect(userAnswer: string, correctConcept: string): boolean {
    const userWords = userAnswer.toLowerCase().split(' ');
    const correctWords = correctConcept.toLowerCase().split(' ');
    const matches = userWords.filter(w => correctWords.includes(w));
    return matches.length >= correctWords.length * 0.3;
  }

  // Helper: Extraer partes correctas
  private static extractCorrectParts(userAnswer: string): string {
    return 'captaste la estructura general';
  }

  // Helper: Explicar brecha
  private static getGapExplanation(userAnswer: string, correctConcept: string): string {
    return 'solo falta ajustar el detalle específico';
  }

  // Helper: Reformular concepto
  private static reframeConcept(concept: string): string {
    return `pensemos en ${concept} como un proceso paso a paso`;
  }
}

// Función para verificar respuestas del tutor antes de enviar
export function validateTutorResponse(response: string): { valid: boolean; sanitized?: string; issues: string[] } {
  const issues: string[] = [];
  
  if (RSDSafeFeedback.containsForbiddenPhrases(response)) {
    issues.push('Contiene frases potencialmente dañinas para RSD');
  }

  // Verificar condescendencia
  const condescendingPatterns = [
    /solo tienes que/i,
    /simplemente/i,
    /nada más que/i,
    /basta con/i,
  ];

  condescendingPatterns.forEach(pattern => {
    if (pattern.test(response)) {
      issues.push('Puede sonar condescendiente');
    }
  });

  if (issues.length > 0) {
    return {
      valid: false,
      sanitized: RSDSafeFeedback.sanitize(response),
      issues,
    };
  }

  return { valid: true, issues: [] };
}
