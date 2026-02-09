/**
 * PROMPT BUILDER
 * 
 * Construye prompts dinámicos basados en:
 * - Rol del usuario
 * - Modo de interacción
 * - Contexto de conversación
 * - Historial emocional (RSD detection)
 */

import { BASE_IDENTITY, CONTEXT_AWARENESS, FRUSTRATION_HANDLER, ACTIVE_TUTORING, EVALUATION_MODE, MOTIVATION_MODE } from './base';
import { getRolePrompt } from './roles';
import type { TerminalMessage } from '../../../types';

export interface PromptBuildOptions {
  role?: string;
  mode?: 'tutoring' | 'evaluation' | 'motivation' | 'anti-paralysis';
  context?: {
    sessionId?: string;
    userRole?: string;
    currentTopic?: string;
    completedModules?: string[];
    messageCount?: number;
    lastInteraction?: string;
    currentStreak?: number;
  };
  conversationHistory?: TerminalMessage[];
  emotionalState?: 'neutral' | 'frustrated' | 'excited' | 'confused' | 'overwhelmed';
}

/**
 * Detecta estado emocional basado en mensajes recientes
 */
function detectEmotionalState(messages: TerminalMessage[]): PromptBuildOptions['emotionalState'] {
  if (!messages || messages.length === 0) return 'neutral';
  
  const recentMessages = messages.slice(-3);
  const userMessages = recentMessages.filter(m => m.role === 'user');
  const text = userMessages.map(m => m.content.toLowerCase()).join(' ');
  
  // Frustration indicators
  const frustrationWords = ['no entiendo', 'imposible', 'odio esto', 'me rindo', 'estúpido', 
    'no puedo', 'fracaso', 'inútil', 'no sirve', 'que difícil'];
  if (frustrationWords.some(w => text.includes(w))) return 'frustrated';
  
  // Confusion indicators
  const confusionWords = ['perdido', 'confundido', 'no sé qué', 'no tengo idea', 
    'no me queda claro', '?', 'complicado'];
  if (confusionWords.some(w => text.includes(w))) return 'confused';
  
  // Overwhelmed indicators
  const overwhelmedWords = ['demasiado', 'abrumado', 'montón', 'mucho', 'no sé por dónde',
    'paralizado', 'bloqueado', 'pereza'];
  if (overwhelmedWords.some(w => text.includes(w))) return 'overwhelmed';
  
  // Excitement indicators
  const excitementWords = ['genial', 'increíble', 'me encanta', 'emocionado', '¡', '!!'];
  if (excitementWords.some(w => text.includes(w))) return 'excited';
  
  return 'neutral';
}

/**
 * Ajusta el tono basado en estado emocional
 */
function getEmotionalAdjustment(state: PromptBuildOptions['emotionalState']): string {
  switch (state) {
    case 'frustrated':
      return `
⚠️ ESTADO EMOCIONAL DETECTADO: FRUSTRACIÓN

AJUSTES INMEDIATOS:
- Usa máximo 2 oraciones cortas por párrafo
- Ofrece break: "¿Quieres pausar 2 min?"
- NO expliques el concepto completo ahora
- Sí ofrece /micro [tarea específica]
- Reconoce esfuerzo explícitamente

EJEMPLO DE TONO:
"Veo que estás poniendo esfuerzo. Esto es normalmente difícil al inicio. 

Solo haz esto: [PASO RIDÍCULAMENTE SIMPLE].

¿Lo intentamos juntos?"`;

    case 'confused':
      return `
⚠️ ESTADO EMOCIONAL DETECTADO: CONFUSIÓN

AJUSTES INMEDIATOS:
- Usa analogía obligatoriamente
- No uses jargon técnico nuevo
- Pregunta qué parte específica confunde
- Ofrece visualización o ejemplo concreto
- Divide en 3 mini-pasos

EJEMPLO DE TONO:
"Vamos a hacerlo más simple. Imagina [ANALOGÍA SIMPLE].

¿Qué parte no cuadra: A, B, o C?"`;

    case 'overwhelmed':
      return `
⚠️ ESTADO EMOCIONAL DETECTADO: ABRUMAMIENTO

AJUSTES INMEDIATOS:
- Activa MODO ANTI-PARÁLISIS inmediatamente
- Un solo micro-paso de 2 minutos
- Elimina TODO contexto adicional
- No menciones "después haremos X"
- Foco 100% en iniciar, no en terminar

EJEMPLO DE TONO:
"No pienses en todo. Solo en ESTE minuto.

Paso 1 (único): [ACCIÓN RIDÍCULAMENTE PEQUEÑA]

Eso es todo. ¿Puedes hacer solo eso?"`;

    case 'excited':
      return `
✅ ESTADO EMOCIONAL DETECTADO: ENTUSIASMO

AJUSTES:
- Aprovecha el momentum
- Ofrece siguiente paso inmediato
- Conecta con meta mayor
- Mantén energía pero estructura

EJEMPLO DE TONO:
"¡Esa energía es perfecta! Vamos a aprovecharla.

Siguiente paso lógico: [SIGUIENTE MICRO-MÓDULO]

¿Lo hacemos ahora mientras está fresco?"`;

    default:
      return '';
  }
}

/**
 * Construye el prompt completo del sistema
 */
export function buildCompleteSystemPrompt(options: PromptBuildOptions): string {
  const { role, mode = 'tutoring', context = {}, conversationHistory = [] } = options;
  
  // 1. Base identity
  let prompt = BASE_IDENTITY + '\n\n';
  
  // 2. Role-specific additions
  const rolePrompt = getRolePrompt(role || '');
  if (rolePrompt) {
    prompt += `=== TU ROL ESPECÍFICO ===\n${rolePrompt}\n\n`;
  }
  
  // 3. Context awareness
  if (Object.keys(context).length > 0) {
    let contextStr = CONTEXT_AWARENESS;
      for (const [key, value] of Object.entries(context)) {
        contextStr = contextStr.replace(`{${key}}`, String(value ?? 'N/A'));
      }
    prompt += contextStr + '\n\n';
  }
  
  // 4. Emotional detection and adjustment
  const emotionalState = detectEmotionalState(conversationHistory);
  const emotionalAdjustment = getEmotionalAdjustment(emotionalState);
  if (emotionalAdjustment) {
    prompt += emotionalAdjustment + '\n\n';
  }
  
  // 5. Mode-specific instructions
  prompt += FRUSTRATION_HANDLER + '\n\n';
  
  switch (mode) {
    case 'evaluation':
      prompt += EVALUATION_MODE;
      break;
    case 'motivation':
      prompt += MOTIVATION_MODE;
      break;
    case 'anti-paralysis':
      prompt += `
=== MODO ANTI-PARÁLISIS ACTIVO ===

El usuario está atascado en "task paralysis". Tu único objetivo es que DE EL PRIMER PASO.

REGLAS ESTRICTAS:
1. NO expliques el concepto completo
2. NO menciones los pasos siguientes
3. Da UN SOLO paso de 1-2 minutos máximo
4. El paso debe sonar ridículamente fácil
5. Celebra cuando complete ese único paso

ESTRUCTURA:
"Vamos a hacerlo más pequeño. Ridículamente pequeño.

SOLO esto: [PASO DE 1-2 MINUTOS]

No pienses en el resto. Solo en eso.

¿Listo?"

EJEMPLOS DE PASOS VÁLIDOS:
- "Abre el archivo. No leas, solo ábrelo."
- "Escribe el nombre de la función. Nada más."
- "Lee el primer párrafo. Solo uno."
- "Escribe un comentario de qué debe hacer el código."
`;
      break;
    default:
      prompt += ACTIVE_TUTORING;
  }
  
  // 6. Final constraints reminder
  prompt += `

=== RECORDATORIOS FINALES ===
• Máximo 20 palabras por oración
• Un concepto a la vez
• Siempre termina con pregunta o siguiente paso
• NUNCA: "deberías", "es fácil", "incorrecto", "obvio"
• SÍ: "podemos", "practiquemos", "ajustemos", "vamos paso a paso"
`;

  return prompt;
}

/**
 * Construye contexto para mensajes de usuario
 * Agrega metadatos útiles para el LLM
 */
export function buildUserContext(
  message: string,
  history: TerminalMessage[],
  context: PromptBuildOptions['context']
): string {
  const parts: string[] = [];
  
  // Detectar tipo de pregunta
  const isCodeQuestion = message.includes('```') || message.includes('def ') || 
    message.includes('function') || message.includes('class');
  const isHelpRequest = message.toLowerCase().includes('ayuda') || 
    message.toLowerCase().includes('no sé') || message.toLowerCase().includes('cómo');
  const isStuck = message.toLowerCase().includes('atascado') || 
    message.toLowerCase().includes('bloqueado') || message.toLowerCase().includes('no puedo');
  
  if (isCodeQuestion) parts.push('[TIPO: Pregunta de código]');
  if (isHelpRequest) parts.push('[TIPO: Solicita ayuda]');
  if (isStuck) parts.push('[TIPO: Usuario atascado - activar modo anti-parálisis]');
  
  // Contexto de progreso
  if (context?.completedModules && context.completedModules.length > 0) {
    parts.push(`[PROGRESO: ${context.completedModules.length} módulos completados]`);
  }
  
  // Tema actual
  if (context?.currentTopic) {
    parts.push(`[TEMA ACTUAL: ${context.currentTopic}]`);
  }
  
  return parts.join('\n');
}

/**
 * Formatea el historial de conversación para el LLM
 * Optimizado para contexto limitado
 */
export function formatConversationHistory(
  messages: TerminalMessage[],
  maxMessages: number = 10
): string {
  const recentMessages = messages.slice(-maxMessages);
  
  return recentMessages.map(m => {
    const role = m.role === 'user' ? 'Usuario' : 'Centopeia';
    return `${role}: ${m.content}`;
  }).join('\n\n');
}

/**
 * Detecta si deberíamos cambiar de modo automáticamente
 */
export function detectModeChange(
  lastMessage: string,
  currentMode: string
): PromptBuildOptions['mode'] | null {
  const lowerMsg = lastMessage.toLowerCase();
  
  // Detectar anti-parálisis
  if (lowerMsg.includes('/micro') || 
      (lowerMsg.includes('no puedo empezar') || 
       lowerMsg.includes('me da pereza') ||
       lowerMsg.includes('estoy abrumado'))) {
    return 'anti-paralysis';
  }
  
  // Detectar evaluación
  if (lowerMsg.includes('/quiz') || lowerMsg.match(/^[a-dA-D][).\s]/) || 
      lowerMsg.includes('mi respuesta es')) {
    return 'evaluation';
  }
  
  // Detectar necesidad de motivación
  if (lowerMsg.includes('no he estudiado') || 
      lowerMsg.includes('desanimado') ||
      lowerMsg.includes('no avanzo')) {
    return 'motivation';
  }
  
  return null;
}

// Export todo
export * from './base';
export * from './roles';
