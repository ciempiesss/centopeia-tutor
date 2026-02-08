import { useState, useEffect, useCallback, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';

const SPRINT_STATE_KEY = 'focus_sprint_active_state';

interface FocusSprintState {
  isActive: boolean;
  timeRemaining: number;
  totalTime: number;
  isBreak: boolean;
  stats: {
    completedToday: number;
    totalMinutes: number;
  };
}

const DEFAULT_WORK_MINUTES = 15;
const DEFAULT_BREAK_MINUTES = 5;
const STORAGE_KEY = 'focus_sprint_stats';

interface PersistedSprintState {
  isActive: boolean;
  isBreak: boolean;
  endTime: number; // timestamp when sprint should end
  totalTime: number;
  type: 'work' | 'break';
}

export function useFocusSprint() {
  const [state, setState] = useState<FocusSprintState>({
    isActive: false,
    timeRemaining: DEFAULT_WORK_MINUTES * 60,
    totalTime: DEFAULT_WORK_MINUTES * 60,
    isBreak: false,
    stats: {
      completedToday: 0,
      totalMinutes: 0,
    },
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load stats on mount and restore any active sprint
  useEffect(() => {
    loadStats();
    restoreSprintState();
    
    // Request notification permissions
    LocalNotifications.requestPermissions();
    
    // Listen for app state changes
    const appStateListener = App.addListener('appStateChange', async ({ isActive }: { isActive: boolean }) => {
      if (isActive) {
        // App came to foreground - restore state
        await restoreSprintState();
      } else {
        // App went to background - persist state
        await persistSprintState();
      }
    });
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      appStateListener.then((listener: { remove: () => void }) => listener.remove());
    };
  }, []);

  // Persist state whenever it changes
  useEffect(() => {
    persistSprintState();
  }, [state.isActive, state.isBreak, state.timeRemaining]);

  const loadStats = async () => {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      if (value) {
        const stats = JSON.parse(value);
        // Check if stats are from today
        const today = new Date().toDateString();
        if (stats.date === today) {
          setState(prev => ({
            ...prev,
            stats: {
              completedToday: stats.completedToday || 0,
              totalMinutes: stats.totalMinutes || 0,
            },
          }));
        } else {
          // Reset for new day
          await saveStats(0, 0);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveStats = async (completed: number, minutes: number) => {
    try {
      const today = new Date().toDateString();
      await Preferences.set({
        key: STORAGE_KEY,
        value: JSON.stringify({
          date: today,
          completedToday: completed,
          totalMinutes: minutes,
        }),
      });
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  // Persist active sprint state for app background/foreground
  const persistSprintState = async () => {
    if (!state.isActive) {
      await Preferences.remove({ key: SPRINT_STATE_KEY });
      return;
    }
    const endTime = Date.now() + (state.timeRemaining * 1000);
    const persisted: PersistedSprintState = {
      isActive: state.isActive,
      isBreak: state.isBreak,
      endTime,
      totalTime: state.totalTime,
      type: state.isBreak ? 'break' : 'work',
    };
    await Preferences.set({
      key: SPRINT_STATE_KEY,
      value: JSON.stringify(persisted),
    });
  };

  // Restore sprint state after app comes to foreground
  const restoreSprintState = async () => {
    try {
      const { value } = await Preferences.get({ key: SPRINT_STATE_KEY });
      if (!value) return;

      const persisted: PersistedSprintState = JSON.parse(value);
      if (!persisted.isActive) return;

      const now = Date.now();
      const remainingMs = persisted.endTime - now;

      if (remainingMs <= 0) {
        // Sprint completed while app was in background
        await Preferences.remove({ key: SPRINT_STATE_KEY });
        if (!persisted.isBreak) {
          // Count as completed work sprint
          const newCompleted = state.stats.completedToday + 1;
          const newMinutes = state.stats.totalMinutes + (persisted.totalTime / 60);
          await saveStats(newCompleted, newMinutes);
          setState(prev => ({
            ...prev,
            isActive: false,
            stats: { completedToday: newCompleted, totalMinutes: newMinutes },
          }));
          await sendNotification('✅ Sprint Completado', 'Completaste tu sprint mientras estabas fuera.');
        }
      } else {
        // Restore active sprint
        const remainingSeconds = Math.floor(remainingMs / 1000);
        setState(prev => ({
          ...prev,
          isActive: true,
          isBreak: persisted.isBreak,
          timeRemaining: remainingSeconds,
          totalTime: persisted.totalTime,
        }));
        // Restart the timer
        startTimer(remainingSeconds);
      }
    } catch (error) {
      console.error('Error restoring sprint state:', error);
    }
  };

  // Start timer helper
  const startTimer = (seconds: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Use functional update to get latest state
          if (prev.isBreak) {
            // Break completed
            stopSprint();
          } else {
            // Work sprint completed
            completeSprint();
          }
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  };

  const sendNotification = async (title: string, body: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            sound: 'default',
          },
        ],
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  };

  const playSound = (type: 'start' | 'complete' | 'break') => {
    // TODO: Implement sound effects
    // For now, just vibrate if available
    if (navigator.vibrate) {
      navigator.vibrate(type === 'complete' ? [200, 100, 200] : 100);
    }
  };

  const startSprint = useCallback(async (minutes: number = DEFAULT_WORK_MINUTES) => {
    const totalSeconds = minutes * 60;
    
    setState(prev => ({
      ...prev,
      isActive: true,
      timeRemaining: totalSeconds,
      totalTime: totalSeconds,
      isBreak: false,
    }));

    playSound('start');
    await sendNotification(
      '🔥 Focus Sprint Iniciado',
      `Modo concentración: ${minutes} minutos. ¡A trabajar!`
    );

    // Start timer
    startTimer(totalSeconds);
  }, []);

  const completeSprint = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const wasBreak = state.isBreak;
    
    if (!wasBreak) {
      // Work sprint completed
      const newCompleted = state.stats.completedToday + 1;
      const newMinutes = state.stats.totalMinutes + (state.totalTime / 60);
      
      await saveStats(newCompleted, newMinutes);
      
      setState(prev => ({
        ...prev,
        isActive: true,
        isBreak: true,
        timeRemaining: DEFAULT_BREAK_MINUTES * 60,
        totalTime: DEFAULT_BREAK_MINUTES * 60,
        stats: {
          completedToday: newCompleted,
          totalMinutes: newMinutes,
        },
      }));

      playSound('complete');
      await sendNotification(
        '✅ Sprint Completado',
        '¡Bien hecho! Toma un descanso de 5 minutos.'
      );

      // Start break timer
      startTimer(DEFAULT_BREAK_MINUTES * 60);
    } else {
      // Break completed
      stopSprint();
    }
  }, [state.isBreak, state.stats, state.totalTime]);

  const stopSprint = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      isBreak: false,
      timeRemaining: DEFAULT_WORK_MINUTES * 60,
    }));

    await sendNotification(
      '⏹️ Sprint Detenido',
      'Focus sprint finalizado.'
    );
  }, []);

  const extendSprint = useCallback(async (additionalMinutes: number) => {
    if (!state.isActive || state.isBreak) return;

    const additionalSeconds = additionalMinutes * 60;
    
    setState(prev => ({
      ...prev,
      timeRemaining: prev.timeRemaining + additionalSeconds,
      totalTime: prev.totalTime + additionalSeconds,
    }));

    await sendNotification(
      '⏱️ Sprint Extendido',
      `+${additionalMinutes} minutos de focus.`
    );
  }, [state.isActive, state.isBreak]);

  return {
    isActive: state.isActive,
    isBreak: state.isBreak,
    timeRemaining: state.timeRemaining,
    totalTime: state.totalTime,
    stats: state.stats,
    startSprint,
    stopSprint,
    extendSprint,
  };
}
