// ============================================
// CENTOPEIA TUTOR - Type Definitions
// ============================================

export interface UserProfile {
  id: number;
  name: string;
  roleFocus: 'qa_tester' | 'analyst' | 'developer' | 'exploring';
  audhdConfig: AudhdConfig;
  customPrompts: CustomPrompts;
  createdAt: string;
  updatedAt: string;
}

export interface AudhdConfig {
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  prefersBodyDoubling: boolean;
  rsdSensitivity: 'low' | 'medium' | 'high';
  hyperfocusMode: 'channel' | 'prevent' | 'ignore';
  // SECURITY NOTE: llmApiKey is deprecated in this interface.
  // Use SecureStorage for API keys instead to prevent accidental exposure
  llmApiKey?: never;
  sensoryPreferences: SensoryPreferences;
}

export interface SensoryPreferences {
  theme: string;
  fontSize: number;
  animations: 'none' | 'minimal' | 'full';
  sounds: boolean;
}

export interface CustomPrompts {
  systemPersonality: string;
  feedbackStyle: string;
  motivationStyle: string;
}

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  focusSprintCount: number;
  totalFocusMinutes: number;
  breaksTaken: number;
  breaksSkipped: number;
  moodBefore?: number;
  moodAfter?: number;
  frustrationEvents: number;
  conceptsCovered: string[];
  exercisesCompleted: number;
  exercisesCorrect: number;
  lastTopic?: string;
  lastCode?: string;
  checkpoint?: Record<string, unknown>;
}

export interface Conversation {
  id: number;
  sessionId: string;
  timestamp: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  embedding?: Uint8Array;
  topicTags?: string[];
  importanceScore?: number;
}

export interface Skill {
  id: string;
  role: 'qa_tester' | 'analyst' | 'developer';
  domain: 'sql' | 'python' | 'javascript' | 'testing' | 'data';
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  prerequisites: string[];
  microModules: MicroModule[];
  resources?: Record<string, string>;
  adhdFriendlyNotes?: string;
  commonStickingPoints?: string[];
  alternativeExplanations?: string[];
}

export interface MicroModule {
  id: string;
  title: string;
  durationMinutes: number;
  type: 'concept' | 'practice' | 'quiz' | 'project';
  content?: string;
  codeExample?: string;
  checkUnderstanding?: string;
}

export interface KnowledgeState {
  skillId: string;
  masteryLevel: number;
  confidence: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';
  progressPercent: number;
  // Spaced Repetition (SM-2)
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate?: string;
  lastReviewDate?: string;
  // Metrics
  attemptsTotal: number;
  attemptsSuccessful: number;
  timeSpentMinutes: number;
  // AUDHD tracking
  hyperfocusSessions: number;
  strugglePoints?: string[];
  preferredLearningModes?: string[];
}

export interface FocusSprint {
  id: string;
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  workMinutes: number;
  breakMinutes: number;
  type: 'learning' | 'practice' | 'review';
  completed: boolean;
  extended: boolean;
  extensionMinutes?: number;
}

export interface TerminalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type?: 'text' | 'code' | 'error' | 'success' | 'warning';
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[]) => Promise<string>;
}
