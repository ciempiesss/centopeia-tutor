import React from 'react';
import { InputLine } from '../InputLine';

interface TerminalInputProps {
  onSubmit: (input: string) => Promise<void>;
  isDisabled: boolean;
  placeholder: string;
}

export function TerminalInput({ onSubmit, isDisabled, placeholder }: TerminalInputProps) {
  const handleSubmit = (input: string) => {
    onSubmit(input);
  };

  return (
    <div className="relative">
      {/* Typing indicator overlay */}
      {isDisabled && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex items-center gap-1 text-hacker-primary motion-safe:animate-pulse">
            <span className="text-xs uppercase tracking-wider">Procesando</span>
            <span className="flex gap-0.5">
              <span className="motion-safe:animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
              <span className="motion-safe:animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
              <span className="motion-safe:animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
            </span>
          </div>
        </div>
      )}
      
      <InputLine 
        onSubmit={handleSubmit}
        isDisabled={isDisabled}
        placeholder={placeholder}
      />
    </div>
  );
}
