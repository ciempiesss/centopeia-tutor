import React, { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Terminal, ArrowRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface InputLineProps {
  onSubmit: (input: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

const MAX_HISTORY_SIZE = 100;

export function InputLine({ onSubmit, isDisabled, placeholder }: InputLineProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount with mobile-friendly delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDisabled && inputRef.current) {
        inputRef.current.focus();
        console.log('[InputLine] Focused on mount');
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isDisabled]);

  // Keep focus unless disabled (with debounce for mobile)
  useEffect(() => {
    if (!isDisabled && inputRef.current && document.activeElement !== inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        console.log('[InputLine] Re-focused, active element was:', document.activeElement?.tagName);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDisabled, placeholder]); // Re-focus when placeholder changes (view changes)
  
  // Force focus when clicked anywhere in the container
  const handleContainerClick = useCallback(() => {
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDisabled]);

  // Handle keyboard visibility on mobile
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && inputRef.current) {
        // Scroll container into view when keyboard appears
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isDisabled) return;
    
    onSubmit(input);
    setHistory(prev => {
      const newHistory = [...prev, input];
      // Limit history size to prevent memory issues
      return newHistory.length > MAX_HISTORY_SIZE 
        ? newHistory.slice(-MAX_HISTORY_SIZE) 
        : newHistory;
    });
    setHistoryIndex(-1);
    setInput('');
  }, [input, isDisabled, onSubmit]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleSubmit();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setInput(history[history.length - 1 - newIndex]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(history[history.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInput('');
        }
        break;
      case 'Tab':
        e.preventDefault();
        // Future: Implement autocomplete
        break;
      case 'Escape':
        e.preventDefault();
        setInput('');
        setHistoryIndex(-1);
        break;
      case 'l':
        // Ctrl+L to clear (common terminal shortcut)
        if (e.ctrlKey) {
          e.preventDefault();
          setInput('');
        }
        break;
    }
  }, [handleSubmit, history, historyIndex]);

  const handleTouchStart = useCallback(() => {
    // Ensure input stays focused on mobile touch
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDisabled]);

  // Touch target size (44px minimum per Apple HIG)
  const TOUCH_TARGET_SIZE = 'min-h-[44px] min-w-[44px]';

  return (
    <div 
      ref={containerRef}
      className="flex items-center gap-2 px-4 py-3 
                 bg-hacker-bgSecondary border-t border-hacker-border
                 pb-safe-b cursor-text" // Safe area for home indicator
      onTouchStart={handleTouchStart}
      onClick={handleContainerClick}
    >
      {/* Terminal Icon - Touch target sized */}
      <div className={`${TOUCH_TARGET_SIZE} flex items-center justify-center flex-shrink-0`}>
        <Terminal className="w-5 h-5 text-hacker-primary" />
      </div>
      
      {/* Prompt */}
      <span className="text-hacker-primary font-bold select-none">centopeia&gt;</span>
      
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        placeholder={placeholder}
        className={`flex-1 bg-transparent text-hacker-text font-mono text-base
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary/50
                   focus-visible:ring-inset rounded-sm
                   placeholder:text-hacker-textDim
                   disabled:opacity-50 disabled:cursor-not-allowed
                   ${TOUCH_TARGET_SIZE} px-2`}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        enterKeyHint="send"
        inputMode="text"
      />
      
      {/* Submit Button - Large touch target with feedback */}
      <button
        onClick={handleSubmit}
        disabled={isDisabled || !input.trim()}
        className={`${TOUCH_TARGET_SIZE} flex items-center justify-center
                   text-hacker-primary 
                   active:bg-hacker-primary/20 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary
                   focus-visible:ring-offset-2 focus-visible:ring-offset-hacker-bgSecondary
                   transition-colors duration-75 rounded-lg
                   touch-manipulation`}
        aria-label="Enviar mensaje"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
