import React, { useMemo } from 'react';
import { Wifi, WifiOff, Clock, Target, Zap, Brain, MoreHorizontal } from 'lucide-react';
import { useNetworkStatus } from '../../core/audhd/useNetworkStatus';

interface StatusBarProps {
  isFocusActive: boolean;
  timeRemaining: number;
  focusStats: {
    completedToday: number;
    totalMinutes: number;
  };
  messageCount: number;
  llmConnected?: boolean;
}

export function StatusBar({ 
  isFocusActive, 
  timeRemaining, 
  focusStats,
  messageCount,
  llmConnected = false
}: StatusBarProps) {
  const { isOnline, connectionType } = useNetworkStatus();

  const formatTime = useMemo(() => {
    return (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
  }, []);

  // Compact mode for small screens
  const isCompact = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className="bg-hacker-bgSecondary border-b border-hacker-border 
                    pt-safe-t px-4 py-2 sm:py-3">
      {/* Main content - Responsive layout */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Connection & AI Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Online/Offline Indicator */}
          <div 
            className={`flex items-center gap-1.5 px-2 py-1 rounded 
                       ${isOnline ? 'bg-hacker-primary/10 text-hacker-primary' : 'bg-hacker-error/10 text-hacker-error'}`}
            title={isOnline ? `Conectado (${connectionType})` : 'Sin conexión'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="uppercase font-bold text-[10px] sm:text-xs tracking-wider hidden sm:inline">
              {isOnline ? connectionType : 'OFFLINE'}
            </span>
          </div>

          {/* AI Status */}
          <div 
            className={`flex items-center gap-1.5 px-2 py-1 rounded
                       ${llmConnected ? 'bg-hacker-secondary/10 text-hacker-secondary' : 'bg-hacker-textDim/10 text-hacker-textDim'}`}
            title={llmConnected ? 'IA activada' : 'IA desactivada'}
          >
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="uppercase font-bold text-[10px] sm:text-xs tracking-wider hidden sm:inline">
              AI
            </span>
          </div>
          
          {/* Focus Sprint Indicator */}
          {isFocusActive && (
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full 
                          bg-hacker-primary/20 animate-pulse">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-hacker-primary" />
              <span className="text-hacker-primary font-bold text-xs sm:text-sm tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Center: Stats (hidden on very small screens) */}
        <div className="hidden md:flex items-center gap-4 text-hacker-textMuted text-xs">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>{focusStats.completedToday} sprints</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.round(focusStats.totalMinutes)}min</span>
          </div>
        </div>

        {/* Right: Message Count & Mobile Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile-only stats */}
          <div className="flex md:hidden items-center gap-2 text-hacker-textMuted text-xs">
            {focusStats.completedToday > 0 && (
              <span className="bg-hacker-bgTertiary px-2 py-0.5 rounded">
                {focusStats.completedToday}✓
              </span>
            )}
          </div>
          
          {/* Message count */}
          <div className="text-hacker-textMuted text-xs flex items-center gap-1.5">
            <span className="text-hacker-primary font-bold tabular-nums">{messageCount}</span>
            <span className="hidden sm:inline">mensajes</span>
          </div>

          {/* More menu button (mobile) */}
          <button 
            className="sm:hidden p-1.5 rounded hover:bg-hacker-bgTertiary active:bg-hacker-bgTertiary/80
                       min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Más opciones"
          >
            <MoreHorizontal className="w-4 h-4 text-hacker-textMuted" />
          </button>
        </div>
      </div>

      {/* Optional: Progress bar for active sprint */}
      {isFocusActive && (
        <div className="mt-2 h-0.5 bg-hacker-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-hacker-primary transition-all duration-1000 ease-linear"
            style={{ 
              width: `${(timeRemaining / (25 * 60)) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}
