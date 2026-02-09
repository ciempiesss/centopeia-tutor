import React from 'react';
import type { RefObject } from 'react';
import { OutputBuffer } from '../OutputBuffer';
import type { TerminalMessage } from '../../../types';

interface TerminalOutputProps {
  messages: TerminalMessage[];
  isTyping: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function TerminalOutput({ messages, isTyping, messagesEndRef }: TerminalOutputProps) {
  return (
    <OutputBuffer 
      messages={messages}
      isTyping={isTyping}
      messagesEndRef={messagesEndRef}
    />
  );
}
