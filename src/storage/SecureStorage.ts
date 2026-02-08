import { Preferences } from '@capacitor/preferences';

/**
 * Secure Storage for sensitive data
 * 
 * NOTE: This is a best-effort implementation. On web, Preferences uses
 * localStorage which is not truly secure. For production mobile apps,
 * consider using @capacitor-community/sqlite with encryption or
 * a dedicated secure storage plugin.
 * 
 * Current implementation:
 * - Web: Uses localStorage with simple XOR obfuscation
 * - Android/iOS: Uses native SharedPreferences/UserDefaults
 * 
 * Future: Migrate to @capacitor-community/secure-storage or similar
 */

const API_KEY_PREFIX = 'centopeia_key_';

// Simple obfuscation - NOT encryption, just prevents casual inspection
// In production, use proper encryption or native secure storage
function obfuscate(text: string): string {
  const key = 'centopeia_v1'; // In production, derive from device ID
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

function deobfuscate(obfuscated: string): string | null {
  try {
    const key = 'centopeia_v1';
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

export class SecureStorage {
  private static instance: SecureStorage;

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Store API key securely
  async setApiKey(apiKey: string): Promise<void> {
    const obfuscated = obfuscate(apiKey);
    await Preferences.set({
      key: `${API_KEY_PREFIX}groq`,
      value: obfuscated,
    });
  }

  // Retrieve API key
  async getApiKey(): Promise<string | null> {
    const { value } = await Preferences.get({ key: `${API_KEY_PREFIX}groq` });
    if (!value) return null;
    return deobfuscate(value);
  }

  // Remove API key
  async removeApiKey(): Promise<void> {
    await Preferences.remove({ key: `${API_KEY_PREFIX}groq` });
  }

  // Check if API key exists
  async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return key !== null && key.length > 0;
  }

  // Generic secure setter with obfuscation
  async setSecure(key: string, value: string): Promise<void> {
    const obfuscated = obfuscate(value);
    await Preferences.set({
      key: `${API_KEY_PREFIX}${key}`,
      value: obfuscated,
    });
  }

  // Generic secure getter
  async getSecure(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key: `${API_KEY_PREFIX}${key}` });
    if (!value) return null;
    return deobfuscate(value);
  }

  // Clear all secure data
  async clearAll(): Promise<void> {
    const { keys } = await Preferences.keys();
    const secureKeys = keys.filter(k => k.startsWith(API_KEY_PREFIX));
    for (const key of secureKeys) {
      await Preferences.remove({ key });
    }
  }
}

// Singleton export
export const secureStorage = SecureStorage.getInstance();
