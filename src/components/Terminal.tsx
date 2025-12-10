import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine } from '../types';

interface TerminalProps {
  lines: TerminalLine[];
  onCommand: (cmd: string) => void;
  isReady: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ lines, onCommand, isReady }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onCommand(input);
    setInput('');
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="h-full bg-slate-950 p-2 font-mono text-xs overflow-hidden flex flex-col"
      onClick={handleContainerClick}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 mb-2">
        {!isReady && (
          <div className="text-amber-400">Initializing Python Runtime Environment...</div>
        )}
        {lines.map((line) => (
          <div key={line.id} className={`${
            line.type === 'error' ? 'text-red-400' : 
            line.type === 'input' ? 'text-white font-bold' : 
            line.type === 'info' ? 'text-blue-400' : 'text-slate-300'
          } whitespace-pre-wrap break-all`}>
            {line.type === 'input' ? '> ' : ''}{line.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-800 pt-2">
        <span className="text-purple-500 font-bold">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!isReady}
          className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600"
          placeholder={isReady ? "python main.py" : "Loading..."}
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default Terminal;