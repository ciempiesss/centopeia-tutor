import { Preferences } from '@capacitor/preferences';
import type { TerminalMessage, UserProfile, KnowledgeState, StudySession } from '../types';

// Check if Preferences is available (native or web polyfill)
const isPreferencesAvailable = typeof window !== 'undefined' && 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  !!(window as any).Capacitor?.Preferences;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoragePlugin = {
  set: (opts: { key: string; value: string }) => Promise<void>;
  get: (opts: { key: string }) => Promise<{ value: string | null }>;
  remove: (opts: { key: string }) => Promise<void>;
  keys: () => Promise<{ keys: string[] }>;
  clear: () => Promise<void>;
};

class LocalStorageDB implements StoragePlugin {
  async set(opts: { key: string; value: string }): Promise<void> {
    localStorage.setItem(opts.key, opts.value);
  }

  async get(opts: { key: string }): Promise<{ value: string | null }> {
    return { value: localStorage.getItem(opts.key) };
  }

  async remove(opts: { key: string }): Promise<void> {
    localStorage.removeItem(opts.key);
  }

  async keys(): Promise<{ keys: string[] }> {
    return { keys: Object.keys(localStorage) as string[] };
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

const storage: StoragePlugin = isPreferencesAvailable ? Preferences : new LocalStorageDB();

// Simple storage wrapper using Capacitor Preferences or localStorage fallback
// Works on Web, iOS, and Android

export class Database {
  async initialize(): Promise<void> {
    // Storage no necesita inicialización
  }

  async set<T>(key: string, value: T): Promise<void> {
    await storage.set({
      key,
      value: JSON.stringify(value),
    });
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    const { value } = await storage.get({ key });
    if (!value) return defaultValue ?? null;
    try {
      return JSON.parse(value) as T;
    } catch {
      await this.remove(key);
      return defaultValue ?? null;
    }
  }

  async remove(key: string): Promise<void> {
    await storage.remove({ key });
  }

  async keys(): Promise<string[]> {
    const { keys } = await storage.keys();
    return keys;
  }

  async clear(): Promise<void> {
    await storage.clear();
  }
}

// Specialized methods for Centopeia
export class CentopeiaDatabase extends Database {
  private static instance: CentopeiaDatabase;

  static getInstance(): CentopeiaDatabase {
    if (!CentopeiaDatabase.instance) {
      CentopeiaDatabase.instance = new CentopeiaDatabase();
    }
    return CentopeiaDatabase.instance;
  }

  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    return this.get<UserProfile>('user_profile');
  }

  async setUserProfile(profile: UserProfile): Promise<void> {
    const updatedProfile: UserProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    return this.set('user_profile', updatedProfile);
  }

  async getOrCreateUserProfile(): Promise<UserProfile> {
    const existing = await this.getUserProfile();
    if (existing) return existing;

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      id: Date.now(),
      name: 'User',
      roleFocus: 'exploring',
      audhdConfig: {
        pomodoroWorkMinutes: 15,
        pomodoroBreakMinutes: 5,
        prefersBodyDoubling: false,
        rsdSensitivity: 'medium',
        hyperfocusMode: 'channel',
        sensoryPreferences: {
          theme: 'hacker',
          fontSize: 14,
          animations: 'full',
          sounds: true,
        },
      },
      customPrompts: {
        systemPersonality: '',
        feedbackStyle: '',
        motivationStyle: '',
      },
      createdAt: now,
      updatedAt: now,
    };

    await this.setUserProfile(newProfile);
    return newProfile;
  }

  // Conversations
  async getConversations(sessionId: string): Promise<TerminalMessage[]> {
    const result = await this.get<TerminalMessage[]>(`conv:${sessionId}`, []);
    return result || [];
  }

  async addConversation(sessionId: string, message: TerminalMessage): Promise<void> {
    const conversations = await this.getConversations(sessionId);
    conversations.push(message);
    await this.set(`conv:${sessionId}`, conversations);
  }

  async clearConversations(sessionId: string): Promise<void> {
    await this.remove(`conv:${sessionId}`);
  }

  // Study Sessions
  async getStudySession(sessionId: string): Promise<StudySession | null> {
    return this.get<StudySession>(`session:${sessionId}`);
  }

  async saveStudySession(session: StudySession): Promise<void> {
    await this.set(`session:${session.id}`, session);
  }

  async getAllSessions(): Promise<StudySession[]> {
    const keys = await this.keys();
    const sessionKeys = keys.filter(k => k.startsWith('session:'));
    
    // Parallel fetching for better performance (N+1 fix)
    const sessions = await Promise.all(
      sessionKeys.map(key => this.get<StudySession>(key))
    );
    
    const validSessions = sessions.filter((s): s is StudySession => s !== null);
    
    return validSessions.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  // Knowledge State
  async getKnowledgeState(skillId: string): Promise<KnowledgeState | null> {
    return this.get<KnowledgeState>(`knowledge:${skillId}`);
  }

  async setKnowledgeState(state: KnowledgeState): Promise<void> {
    await this.set(`knowledge:${state.skillId}`, state);
  }

  async getAllKnowledgeStates(): Promise<KnowledgeState[]> {
    const keys = await this.keys();
    const knowledgeKeys = keys.filter(k => k.startsWith('knowledge:'));
    
    // Parallel fetching for better performance (N+1 fix)
    const states = await Promise.all(
      knowledgeKeys.map(key => this.get<KnowledgeState>(key))
    );
    
    return states.filter((s): s is KnowledgeState => s !== null);
  }

  // Sync Queue (for offline-first)
  async addToSyncQueue(operation: { table: string; id: string; action: string; data: unknown; timestamp?: number }): Promise<void> {
    const queue = await this.get<typeof operation[]>('sync_queue', []) || [];
    queue.push({ ...operation, timestamp: Date.now() });
    await this.set('sync_queue', queue);
  }

  async getSyncQueue(): Promise<unknown[]> {
    const result = await this.get<unknown[]>('sync_queue', []);
    return result || [];
  }

  async clearSyncQueue(): Promise<void> {
    await this.remove('sync_queue');
  }

  // Focus Sprint Stats
  async getFocusStats(): Promise<{ completedToday: number; totalMinutes: number; date: string }> {
    const today = new Date().toDateString();
    const stats = await this.get<{ completedToday: number; totalMinutes: number; date: string }>('focus_stats');
    
    if (!stats || stats.date !== today) {
      return { completedToday: 0, totalMinutes: 0, date: today };
    }
    
    return stats;
  }

  async saveFocusStats(stats: { completedToday: number; totalMinutes: number }): Promise<void> {
    await this.set('focus_stats', {
      ...stats,
      date: new Date().toDateString(),
    });
  }

  // Module Progress Tracking
  async getModuleProgress(moduleId: string): Promise<ModuleProgress | null> {
    return this.get<ModuleProgress>(`module:${moduleId}`);
  }

  async saveModuleProgress(progress: ModuleProgress): Promise<void> {
    // Save individual module progress
    await this.set(`module:${progress.moduleId}`, progress);
    
    // Update modules index
    const allModules = await this.get<string[]>('modules:all', []) || [];
    if (!allModules.includes(progress.moduleId)) {
      allModules.push(progress.moduleId);
      await this.set('modules:all', allModules);
    }
  }

  async getAllModuleProgress(): Promise<ModuleProgress[]> {
    const moduleIds = await this.get<string[]>('modules:all', []) || [];
    
    // Parallel fetching for better performance (N+1 fix)
    const progresses = await Promise.all(
      moduleIds.map(id => this.getModuleProgress(id))
    );
    
    return progresses.filter((p): p is ModuleProgress => p !== null);
  }

  async getPathProgress(pathId: string): Promise<ModuleProgress[]> {
    const allProgress = await this.getAllModuleProgress();
    return allProgress.filter(p => p.pathId === pathId);
  }

  async getCompletedModulesCount(): Promise<number> {
    const allProgress = await this.getAllModuleProgress();
    return allProgress.filter(p => p.status === 'completed').length;
  }

  async getTotalStudyTime(): Promise<number> {
    const allProgress = await this.getAllModuleProgress();
    return allProgress.reduce((total, p) => total + (p.timeSpentMinutes || 0), 0);
  }
}

// Module Progress Interface
export interface ModuleProgress {
  moduleId: string;
  skillId: string;
  pathId: string;
  completedAt?: string;
  startedAt?: string;
  score?: number; // for quizzes
  timeSpentMinutes?: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}
