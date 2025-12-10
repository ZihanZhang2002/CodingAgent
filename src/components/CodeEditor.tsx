import React from 'react';
import { FileNode } from '../types';

interface CodeEditorProps {
  file: FileNode | null;
  onChange: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, onChange }) => {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-slate-600 bg-slate-900/50">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No file open</p>
          <p className="text-sm">Select a file from the explorer to view code.</p>
        </div>
      </div>
    );
  }

  const lines = (file.content || '').split('\n');

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Tab Header */}
      <div className="flex bg-slate-900 border-b border-slate-800">
        <div className="px-4 py-2 bg-slate-800 border-t-2 border-purple-500 text-sm text-slate-200 flex items-center gap-2">
           <span className="opacity-80 font-mono">{file.name}</span>
           <button className="hover:text-white ml-2">×</button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-sm">
        {/* Line Numbers */}
        <div className="w-12 bg-slate-900/50 border-r border-slate-800 text-slate-600 text-right py-4 px-2 select-none overflow-hidden">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <textarea
          className="flex-1 bg-transparent text-slate-300 p-4 resize-none focus:outline-none leading-6 whitespace-pre"
          value={file.content}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>
      
      {/* Footer Status */}
      <div className="bg-purple-900 text-white text-[10px] px-3 py-1 flex justify-between items-center">
        <div className="flex gap-4">
          <span>main*</span>
          <span>{file.language || 'text'}</span>
        </div>
        <div>
           Ln {lines.length}, Col 1
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;