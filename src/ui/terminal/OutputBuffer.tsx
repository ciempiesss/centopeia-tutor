import React, { useRef, useEffect, useMemo, useCallback, type RefObject } from 'react';
import type { TerminalMessage } from '../../types';
import { User, Bot, Terminal, AlertCircle } from 'lucide-react';

interface OutputBufferProps {
  messages: TerminalMessage[];
  isTyping: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

// Maximum messages to render for performance
const MAX_VISIBLE_MESSAGES = 100;
const MESSAGE_TRUNCATE_LENGTH = 5000;

// Simple HTML escape to prevent XSS
function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Memoized message formatter to prevent re-processing
function useFormattedMessages(messages: TerminalMessage[]) {
  return useMemo(() => {
    // Keep only last N messages for performance
    const visibleMessages = messages.length > MAX_VISIBLE_MESSAGES 
      ? messages.slice(-MAX_VISIBLE_MESSAGES)
      : messages;

    return visibleMessages.map(msg => ({
      ...msg,
      // Truncate very long messages
      content: msg.content.length > MESSAGE_TRUNCATE_LENGTH
        ? msg.content.substring(0, MESSAGE_TRUNCATE_LENGTH) + '\n\n[dim]... (mensaje truncado)[/dim]'
        : msg.content,
      // Pre-format timestamp
      formattedTime: new Date(msg.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, [messages]);
}

export function OutputBuffer({ messages, isTyping, messagesEndRef }: OutputBufferProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const formattedMessages = useFormattedMessages(messages);
  const shouldAutoScroll = useRef(true);

  // Track user scroll to disable auto-scroll when reading history
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // User is near bottom if within 100px
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      shouldAutoScroll.current = isNearBottom;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart scroll to bottom - only when user is already at bottom
  useEffect(() => {
    if (shouldAutoScroll.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping, messagesEndRef]);

  const formatContent = useCallback((content: string, type?: string) => {
    // Apply syntax highlighting for code blocks
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const code = part.slice(3, -3);
        const [lang, ...codeLines] = code.split('\n');
        return (
          <pre 
            key={`code-${index}`}
            className="my-2 p-3 bg-hacker-bgTertiary rounded border border-hacker-border
                       overflow-x-auto text-sm"
          >
            {lang && (
              <div className="text-hacker-textMuted text-xs mb-2 border-b border-hacker-border pb-1">
                {escapeHtml(lang)}
              </div>
            )}
            <code className="text-hacker-secondary">{codeLines.join('\n')}</code>
          </pre>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        // Inline code
        return (
          <code 
            key={`inline-${index}`}
            className="px-1.5 py-0.5 bg-hacker-bgTertiary rounded text-hacker-secondary text-sm
                       border border-hacker-border/50"
          >
            {escapeHtml(part.slice(1, -1))}
          </code>
        );
      } else {
        // Regular text with color codes
        const lines = part.split('\n');
        return lines.map((line, lineIndex) => {
          const escapedLine = escapeHtml(line);
          const formattedLine = escapedLine
            .replace(/\[green\](.*?)\[\/green\]/g, '<span class="text-hacker-primary">$1</span>')
            .replace(/\[red\](.*?)\[\/red\]/g, '<span class="text-hacker-error">$1</span>')
            .replace(/\[yellow\](.*?)\[\/yellow\]/g, '<span class="text-hacker-accent">$1</span>')
            .replace(/\[blue\](.*?)\[\/blue\]/g, '<span class="text-hacker-secondary">$1</span>')
            .replace(/\[dim\](.*?)\[\/dim\]/g, '<span class="text-hacker-textMuted">$1</span>');
          
          return (
            <span key={`line-${index}-${lineIndex}`}>
              <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
              {lineIndex < lines.length - 1 && <br />}
            </span>
          );
        });
      }
    });
  }, []);

  const getMessageStyles = useCallback((role: string, type?: string) => {
    const baseStyles = "mb-3 p-3 rounded-lg border scroll-mt-4";
    
    switch (role) {
      case 'user':
        return `${baseStyles} bg-hacker-bgSecondary border-hacker-border ml-8 sm:ml-12`;
      case 'system':
        return `${baseStyles} bg-hacker-bgTertiary border-hacker-primary/30`;
      case 'assistant':
        switch (type) {
          case 'error':
            return `${baseStyles} bg-hacker-error/5 border-hacker-error/30 mr-8 sm:mr-12`;
          case 'success':
            return `${baseStyles} bg-hacker-primary/5 border-hacker-primary/30 mr-8 sm:mr-12`;
          case 'warning':
            return `${baseStyles} bg-hacker-accent/5 border-hacker-accent/30 mr-8 sm:mr-12`;
          default:
            return `${baseStyles} bg-hacker-bgSecondary border-hacker-border mr-8 sm:mr-12`;
        }
      default:
        return baseStyles;
    }
  }, []);

  const getIcon = useCallback((role: string) => {
    const iconClass = "w-4 h-4 flex-shrink-0";
    switch (role) {
      case 'user':
        return <User className={`${iconClass} text-hacker-secondary`} />;
      case 'system':
        return <Terminal className={`${iconClass} text-hacker-primary`} />;
      case 'assistant':
        return <Bot className={`${iconClass} text-hacker-primary`} />;
      default:
        return null;
    }
  }, []);

  const getLabel = useCallback((role: string) => {
    switch (role) {
      case 'user': return 'tú';
      case 'system': return 'sistema';
      case 'assistant': return 'centopeia';
      default: return '';
    }
  }, []);

  const getTypeIcon = useCallback((type?: string) => {
    if (type === 'error') {
      return <AlertCircle className="w-3 h-3 text-hacker-error" />;
    }
    return null;
  }, []);

  // Show truncation warning if messages were hidden
  const hiddenMessageCount = messages.length - formattedMessages.length;

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1
                 overscroll-contain touch-pan-y"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Truncation warning */}
      {hiddenMessageCount > 0 && (
        <div className="mb-4 p-2 bg-hacker-accent/10 border border-hacker-accent/30 rounded text-center text-sm text-hacker-accent">
          {hiddenMessageCount} mensajes anteriores ocultos por rendimiento. 
          <button 
            onClick={() => window.location.reload()}
            className="underline ml-1 hover:text-hacker-accentDim"
          >
            Recargar para ver todo
          </button>
        </div>
      )}

      {formattedMessages.map((msg) => (
        <div
          key={msg.id}
          className={getMessageStyles(msg.role, msg.type)}
        >
          <div className="flex items-center gap-2 mb-2 text-xs text-hacker-textMuted">
            {getIcon(msg.role)}
            <span className="font-bold uppercase tracking-wider">{getLabel(msg.role)}</span>
            {getTypeIcon(msg.type)}
            <span className="text-hacker-textDim ml-auto">
              {msg.formattedTime}
            </span>
          </div>
          
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {formatContent(msg.content, msg.type)}
          </div>
        </div>
      ))}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 text-hacker-primary motion-safe:animate-pulse py-2">
          <Bot className="w-4 h-4" />
          <span className="text-sm">Centopeia está escribiendo</span>
          <span className="flex gap-0.5">
            <span className="motion-safe:animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="motion-safe:animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="motion-safe:animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </span>
        </div>
      )}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}
