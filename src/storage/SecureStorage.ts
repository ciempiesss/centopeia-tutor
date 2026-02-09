import { Preferences } from '@capacitor/preferences';

/**
 * Secure Storage for sensitive data
 * 
 * Hybrid implementation:
 * - Web: Uses localStorage with simple XOR obfuscation (reliable)
 * - Mobile: Uses Capacitor Preferences (native)
 * 
 * NOTE: This is a best-effort implementation. For production apps
 * requiring high security, use @capacitor-community/secure-storage
 */

const API_KEY_PREFIX = 'centopeia_key_';
const LOCAL_STORAGE_KEY = 'centopeia_secure_storage';

// Detect if running in Capacitor native app
function isNative(): boolean {
  return typeof (window as any).Capacitor !== 'undefined' && 
         (window as any).Capacitor?.isNativePlatform?.() === true;
}

// Simple obfuscation - NOT encryption, just prevents casual inspection
function getObfuscationKey(): string {
  const fingerprint = `${navigator.userAgent}:${screen.width}x${screen.height}:${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `centopeia_${Math.abs(hash).toString(36)}`;
}

function obfuscate(text: string): string {
  const key = getObfuscationKey();
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

function deobfuscate(obfuscated: string): string | null {
  try {
    const key = getObfuscationKey();
    const text = atob(obfuscated);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return null;
  }
}

// Web storage using localStorage (more reliable for web)
class WebSecureStorage {
  async set(key: string, value: string): Promise<void> {
    const obfuscated = obfuscate(value);
    localStorage.setItem(`${API_KEY_PREFIX}${key}`, obfuscated);
  }

  async get(key: string): Promise<string | null> {
    const value = localStorage.getItem(`${API_KEY_PREFIX}${key}`);
    if (!value) return null;
    return deobfuscate(value);
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(`${API_KEY_PREFIX}${key}`);
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(`${API_KEY_PREFIX}${key}`) !== null;
  }
}

// Native storage using Capacitor Preferences
class NativeSecureStorage {
  async set(key: string, value: string): Promise<void> {
    const obfuscated = obfuscate(value);
    await Preferences.set({
      key: `${API_KEY_PREFIX}${key}`,
      value: obfuscated,
    });
  }

  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key: `${API_KEY_PREFIX}${key}` });
    if (!value) return null;
    return deobfuscate(value);
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key: `${API_KEY_PREFIX}${key}` });
  }

  async has(key: string): Promise<boolean> {
    const { value } = await Preferences.get({ key: `${API_KEY_PREFIX}${key}` });
    return value !== null;
  }
}

export class SecureStorage {
  private static instance: SecureStorage;
  private storage: WebSecureStorage | NativeSecureStorage;

  private constructor() {
    this.storage = isNative() ? new NativeSecureStorage() : new WebSecureStorage();
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Store API key securely
  async setApiKey(apiKey: string): Promise<void> {
    await this.storage.set('groq', apiKey);
    console.log('[SecureStorage] API key saved successfully');
  }

  // Retrieve API key
  async getApiKey(): Promise<string | null> {
    const key = await this.storage.get('groq');
    console.log('[SecureStorage] API key retrieved:', key ? 'Found' : 'Not found');
    return key;
  }

  // Remove API key
  async removeApiKey(): Promise<void> {
    await this.storage.remove('groq');
    console.log('[SecureStorage] API key removed');
  }

  // Check if API key exists
  async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return key !== null && key.length > 0;
  }

  // Generic secure setter with obfuscation
  async setSecure(key: string, value: string): Promise<void> {
    await this.storage.set(key, value);
  }

  // Generic secure getter
  async getSecure(key: string): Promise<string | null> {
    return await this.storage.get(key);
  }

  // Clear all secure data
  async clearAll(): Promise<void> {
    if (isNative()) {
      const { keys } = await Preferences.keys();
      const secureKeys = keys.filter(k => k.startsWith(API_KEY_PREFIX));
      for (const key of secureKeys) {
        await Preferences.remove({ key });
      }
    } else {
      // Clear localStorage keys with our prefix
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(API_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    }
  }
}

// Singleton export
export const secureStorage = SecureStorage.getInstance();
