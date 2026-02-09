/**
 * SimpleStorage - Almacenamiento simple y directo para API keys
 * Sin ofuscación, sin complicaciones. Funciona 100% en web.
 */

const API_KEY_STORAGE_KEY = 'centopeia_api_key_v1';

export const SimpleStorage = {
  // Guardar API key
  setApiKey(apiKey: string): void {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      console.log('[SimpleStorage] ✅ API key guardada');
    } catch (e) {
      console.error('[SimpleStorage] ❌ Error guardando:', e);
    }
  },

  // Leer API key
  getApiKey(): string | null {
    try {
      const key = localStorage.getItem(API_KEY_STORAGE_KEY);
      console.log('[SimpleStorage] 🔍 API key leída:', key ? 'Encontrada' : 'No encontrada');
      return key;
    } catch (e) {
      console.error('[SimpleStorage] ❌ Error leyendo:', e);
      return null;
    }
  },

  // Verificar si existe
  hasApiKey(): boolean {
    return !!this.getApiKey();
  },

  // Eliminar
  removeApiKey(): void {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  },

  // Debug - ver todo el localStorage
  debug(): void {
    console.log('[SimpleStorage] === DEBUG ===');
    console.log('[SimpleStorage] localStorage keys:', Object.keys(localStorage));
    const key = localStorage.getItem(API_KEY_STORAGE_KEY);
    console.log('[SimpleStorage] API key value:', key ? `${key.substring(0, 10)}...` : 'null');
    console.log('[SimpleStorage] =================');
  }
};
