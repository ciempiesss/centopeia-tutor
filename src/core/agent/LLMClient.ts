import type { TerminalMessage } from '../../types';
import { 
  buildCompleteSystemPrompt, 
  buildUserContext,
  formatConversationHistory,
  detectModeChange,
  type PromptBuildOptions 
} from './prompts/builder';
import { getFewShotExamples } from './prompts/examples';

interface GroqResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface LLMConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface SendMessageOptions {
  messages: TerminalMessage[];
  role?: string;
  mode?: PromptBuildOptions['mode'];
  context?: PromptBuildOptions['context'];
  stream?: boolean;
}

export class LLMClient {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private abortController: AbortController | null = null;
  private readonly REQUEST_TIMEOUT = 60000; // 60 segundos

  // Modelos disponibles en Groq
  static readonly MODELS = {
    KIMI_K2: 'moonshotai/kimi-k2-instruct-0905',
    LLAMA_33_70B: 'llama-3.3-70b-versatile',
    LLAMA_4_MAVERICK: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    LLAMA_4_SCOUT: 'meta-llama/llama-4-scout-17b-16e-instruct',
    QWEN_32B: 'qwen/qwen3-32b',
    GPT_OSS_120B: 'openai/gpt-oss-120b',
  } as const;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || LLMClient.MODELS.KIMI_K2;
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 4096;
  }

  /**
   * Envía un mensaje al LLM con sistema de prompts adaptativo
   */
  async sendMessage(options: SendMessageOptions): Promise<string> {
    const { messages, role, mode = 'tutoring', context, stream = false } = options;

    // Detectar si debemos cambiar de modo automáticamente
    const lastUserMessage = messages.slice(-1)[0];
    const detectedMode = lastUserMessage ? 
      detectModeChange(lastUserMessage.content, mode) : null;
    const effectiveMode = detectedMode || mode;

    // Construir system prompt dinámico
    const systemPrompt = buildCompleteSystemPrompt({
      role,
      mode: effectiveMode,
      context,
      conversationHistory: messages,
    });

    // Agregar few-shot examples si es necesario
    const fewShotExamples = (effectiveMode === 'anti-paralysis' || messages.length < 3) 
      ? getFewShotExamples(role, 2)
      : '';

    // Construir mensajes para la API
    const groqMessages = [
      { role: 'system', content: systemPrompt + fewShotExamples },
      ...this.formatMessages(messages),
    ];

    // Agregar contexto del usuario al último mensaje si es relevante
    const userContext = buildUserContext(
      lastUserMessage?.content || '',
      messages,
      context
    );
    
    if (userContext && groqMessages.length > 0) {
      const lastMsg = groqMessages[groqMessages.length - 1];
      if (lastMsg.role === 'user') {
        lastMsg.content = `${userContext}\n\n${lastMsg.content}`;
      }
    }

    if (stream) {
      throw new Error('Use streamMessage() for streaming');
    }

    return this.makeRequest(groqMessages);
  }

  /**
   * Streaming response para feedback inmediato
   */
  async *streamMessage(options: SendMessageOptions): AsyncGenerator<string, void, unknown> {
    const { messages, role, mode = 'tutoring', context } = options;

    // Detectar modo
    const lastUserMessage = messages.slice(-1)[0];
    const detectedMode = lastUserMessage ? 
      detectModeChange(lastUserMessage.content, mode) : null;
    const effectiveMode = detectedMode || mode;

    // Construir prompt
    const systemPrompt = buildCompleteSystemPrompt({
      role,
      mode: effectiveMode,
      context,
      conversationHistory: messages,
    });

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...this.formatMessages(messages),
    ];

    this.abortController = new AbortController();
    
    // Timeout para evitar requests colgados
    const timeoutId = setTimeout(() => {
      this.abortController?.abort('Request timeout');
    }, this.REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: groqMessages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: true,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              // Limpiar timeout en cada chunk recibido
              clearTimeout(timeoutId);
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) yield content;
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request aborted');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Request no-streaming
   */
  private async makeRequest(messages: any[]): Promise<string> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: false,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sin respuesta del modelo';
    } catch (error) {
      console.error('LLM Error:', error);
      throw new Error(`Error de comunicación con el tutor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Formatea mensajes para Groq
   */
  private formatMessages(messages: TerminalMessage[]): any[] {
    return messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
  }

  /**
   * Aborta request en curso
   */
  abort(): void {
    this.abortController?.abort();
  }

  /**
   * Cambia el modelo dinámicamente
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Obtiene info del modelo actual
   */
  getModelInfo(): { model: string; temperature: number; maxTokens: number } {
    return {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    };
  }
}

// Exportar tipos
export type { LLMConfig, SendMessageOptions };
