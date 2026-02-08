import { useMemo } from 'react';
import { Wifi, WifiOff, Target, Zap, Brain, Home } from 'lucide-react';
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
  onHomeClick?: () => void;
  totalTime?: number;
}

// Visual time blocks for focus mode (AUDHD-friendly)
function VisualTimeBlocks({ timeRemaining, totalTime }: { timeRemaining: number; totalTime: number }) {
  const totalBlocks = 8;
  const filledBlocks = Math.max(0, Math.min(totalBlocks, Math.ceil((timeRemaining / totalTime) * totalBlocks)));
  
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: totalBlocks }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-1000
                     ${i < filledBlocks 
                       ? i < totalBlocks / 2 
                         ? 'bg-hacker-primary'      // Green for first half
                         : 'bg-hacker-accent'        // Yellow for second half
                       : 'bg-hacker-bgTertiary'      // Empty
                     }`}
        />
      ))}
    </div>
  );
}

export function StatusBar({ 
  isFocusActive, 
  timeRemaining, 
  focusStats,
  messageCount,
  llmConnected = false,
  onHomeClick,
  totalTime = 25 * 60
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
        
        {/* Left: Connection & AI Status + Home Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Home Button */}
          {onHomeClick && (
            <button
              onClick={onHomeClick}
              className="p-1.5 rounded hover:bg-hacker-bgTertiary active:bg-hacker-bgTertiary/80
                         text-hacker-textDim hover:text-hacker-primary
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                         transition-colors"
              title="Volver al inicio"
              aria-label="Volver al inicio"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

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
                          bg-hacker-primary/20 motion-safe:animate-pulse">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-hacker-primary" />
              <span className="text-hacker-primary font-bold text-xs sm:text-sm tabular-nums">
                {formatTime(timeRemaining)}
              </span>
              <span className="text-hacker-textDim text-xs hidden sm:inline">
                / {formatTime(totalTime)}
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
            <span className="text-hacker-primary font-bold">{Math.round(focusStats.totalMinutes)}min</span>
            <span>focus</span>
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
        </div>
      </div>

      {/* Visual Time Blocks for active sprint */}
      {isFocusActive && (
        <VisualTimeBlocks timeRemaining={timeRemaining} totalTime={totalTime} />
      )}
    </div>
  );
}
