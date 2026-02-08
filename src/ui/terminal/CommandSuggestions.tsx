import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Command, CornerDownLeft } from 'lucide-react';

/**
 * Command suggestion item with metadata for AUDHD-friendly display
 */
export interface CommandSuggestion {
  /** Command trigger (e.g., "/help") */
  command: string;
  /** Brief description of what the command does */
  description: string;
  /** Optional category for grouping */
  category?: string;
  /** Alternative commands that do the same thing (e.g., "/ayuda") */
  aliases?: string[];
}

interface CommandSuggestionsProps {
  /** Current input value */
  input: string;
  /** List of available command suggestions */
  suggestions: CommandSuggestion[];
  /** Called when user selects a suggestion */
  onSelect: (command: string) => void;
  /** Called when suggestions should be closed */
  onClose: () => void;
  /** Whether the suggestions dropdown is visible */
  isVisible: boolean;
}

/**
 * AUDHD-friendly command autocomplete dropdown
 * 
 * Features:
 * - Clear visual hierarchy with high contrast
 * - Keyboard navigation (Arrow keys + Enter/Tab)
 * - Shows command description for context
 * - Limited visible options to reduce overwhelm (max 6)
 * - Clear selection indicator
 */
export function CommandSuggestions({
  input,
  suggestions,
  onSelect,
  onClose,
  isVisible,
}: CommandSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!input.startsWith('/')) return [];
    
    const query = input.toLowerCase();
    return suggestions.filter((suggestion) =>
      suggestion.command.toLowerCase().startsWith(query) ||
      suggestion.aliases?.some((alias) => alias.toLowerCase().startsWith(query))
    );
  }, [input, suggestions]);

  // Reset selection when filtered suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredSuggestions.length]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isVisible || filteredSuggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        case 'Tab':
          e.preventDefault();
          if (filteredSuggestions[selectedIndex]) {
            onSelect(filteredSuggestions[selectedIndex].command);
          }
          break;
        case 'Enter':
          // Only handle if suggestions are visible and user has navigated
          if (filteredSuggestions[selectedIndex]) {
            e.preventDefault();
            onSelect(filteredSuggestions[selectedIndex].command);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isVisible, filteredSuggestions, selectedIndex, onSelect, onClose]
  );

  // Attach/detach keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Don't render if not visible or no matches
  if (!isVisible || filteredSuggestions.length === 0 || !input.startsWith('/')) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-2 mx-4
                 bg-hacker-bgSecondary border border-hacker-border
                 rounded-lg shadow-lg shadow-black/50
                 max-h-64 overflow-y-auto scrollbar-hide
                 z-50"
      role="listbox"
      aria-label="Sugerencias de comandos"
    >
      {/* Header with hint */}
      <div className="px-3 py-2 border-b border-hacker-border/50 bg-hacker-bgTertiary/50">
        <div className="flex items-center gap-2 text-hacker-textMuted text-xs">
          <Command className="w-3 h-3" />
          <span>
            {filteredSuggestions.length} comando{filteredSuggestions.length !== 1 ? 's' : ''} disponible{filteredSuggestions.length !== 1 ? 's' : ''}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-hacker-bg rounded text-hacker-text text-[10px]">↑↓</kbd>
            <span>navegar</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-hacker-bg rounded text-hacker-text text-[10px]">Tab</kbd>
            <span>o</span>
            <kbd className="px-1.5 py-0.5 bg-hacker-bg rounded text-hacker-text text-[10px]">↵</kbd>
            <span>seleccionar</span>
          </span>
        </div>
      </div>

      {/* Suggestions list */}
      <div className="py-1">
        {filteredSuggestions.map((suggestion, index) => {
          const isSelected = index === selectedIndex;
          
          return (
            <button
              key={suggestion.command}
              ref={(el) => { itemRefs.current[index] = el; }}
              onClick={() => onSelect(suggestion.command)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-3 py-2.5 text-left
                         flex items-start gap-3
                         transition-colors duration-75
                         focus:outline-none
                         ${isSelected 
                           ? 'bg-hacker-primary/10 border-l-2 border-l-hacker-primary' 
                           : 'border-l-2 border-l-transparent hover:bg-hacker-bgTertiary/50'
                         }`}
              role="option"
              aria-selected={isSelected}
            >
              {/* Command icon/indicator */}
              <div className={`flex-shrink-0 mt-0.5
                             ${isSelected ? 'text-hacker-primary' : 'text-hacker-textMuted'}`}>
                {isSelected ? (
                  <CornerDownLeft className="w-4 h-4" />
                ) : (
                  <span className="font-mono text-sm">/</span>
                )}
              </div>

              {/* Command info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-medium truncate
                                 ${isSelected ? 'text-hacker-primary' : 'text-hacker-text'}`}>
                    {suggestion.command}
                  </span>
                  
                  {/* Show aliases if any */}
                  {suggestion.aliases && suggestion.aliases.length > 0 && (
                    <span className="text-hacker-textDim text-xs truncate">
                      ({suggestion.aliases.join(', ')})
                    </span>
                  )}
                </div>
                
                {/* Description */}
                <p className={`text-xs mt-0.5 truncate
                             ${isSelected ? 'text-hacker-text' : 'text-hacker-textMuted'}`}>
                  {suggestion.description}
                </p>
              </div>

              {/* Category badge if present */}
              {suggestion.category && isSelected && (
                <span className="flex-shrink-0 px-1.5 py-0.5 
                               bg-hacker-accent/10 text-hacker-accentDim
                               text-[10px] rounded uppercase tracking-wide">
                  {suggestion.category}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer hint for AUDHD users */}
      <div className="px-3 py-1.5 border-t border-hacker-border/50 bg-hacker-bgTertiary/30">
        <p className="text-[10px] text-hacker-textDim">
          💡 <span className="text-hacker-textMuted">Tip:</span> Escribe{' '}
          <kbd className="px-1 bg-hacker-bg rounded text-hacker-primary">/</kbd>{' '}
          y presiona Tab para ver todos los comandos
        </p>
      </div>
    </div>
  );
}

/**
 * Pre-defined command suggestions for the Centopeia terminal
 * Organized by category for better cognitive load management
 */
export const DEFAULT_COMMAND_SUGGESTIONS: CommandSuggestion[] = [
  // 📚 Learning commands
  { command: '/help', description: 'Muestra todos los comandos disponibles', category: 'apoyo', aliases: ['/ayuda'] },
  { command: '/learn', description: 'Inicia aprendizaje de un tema (sql, python, js)', category: 'aprendizaje', aliases: ['/aprender'] },
  { command: '/practice', description: 'Ejercicios prácticos con código interactivo', category: 'aprendizaje', aliases: ['/practica'] },
  { command: '/quiz', description: 'Quiz de conocimientos (5 preguntas)', category: 'aprendizaje', aliases: ['/test'] },
  { command: '/role', description: 'Cambia tu rol principal (qa/dev/data)', category: 'config', aliases: ['/rol'] },
  
  // 🎯 Focus & Productivity (AUDHD)
  { command: '/focus', description: 'Inicia sprint de concentración (15 min default)', category: 'focus', aliases: ['/sprint'] },
  { command: '/stop', description: 'Detiene el sprint de concentración actual', category: 'focus' },
  { command: '/micro', description: 'Modo anti-parálisis: descompone tareas grandes', category: 'focus', aliases: ['/paso'] },
  
  // ⚙️ Configuration & Stats
  { command: '/home', description: 'Vuelve al inicio del terminal', category: 'navegación' },
  { command: '/stats', description: 'Muestra tus estadísticas de aprendizaje', category: 'config', aliases: ['/estadisticas'] },
  { command: '/config', description: 'Configura API keys, pomodoro, breaks', category: 'config', aliases: ['/configuracion'] },
  { command: '/unlock', description: 'Desbloquea el input si se atasca', category: 'apoyo' },
  { command: '/random', description: 'Muestra un concepto aleatorio para aprender', category: 'aprendizaje', aliases: ['/aleatorio'] },
  { command: '/hint', description: 'Obtén pistas durante ejercicios', category: 'apoyo', aliases: ['/pista'] },
];
