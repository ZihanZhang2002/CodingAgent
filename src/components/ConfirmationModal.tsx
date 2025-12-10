import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  codeSnippet?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  codeSnippet
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full m-4 overflow-hidden transform transition-all scale-100">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900">
          <div className="p-2 bg-purple-900/30 rounded-full">
             <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        <div className="p-6 bg-slate-950/50">
          <p className="text-slate-300 mb-4 text-sm leading-relaxed">{message}</p>
          
          {codeSnippet && (
            <div className="bg-slate-950 rounded-lg border border-slate-800 mb-2 overflow-hidden">
                <div className="bg-slate-900 px-3 py-1 border-b border-slate-800 text-[10px] text-slate-500 uppercase font-mono">
                    Proposed Change
                </div>
                <div className="p-3 overflow-x-auto">
                    <pre className="text-xs font-mono text-emerald-400 whitespace-pre">
                        {codeSnippet.slice(0, 400)}
                        {codeSnippet.length > 400 && '\n... (truncated)'}
                    </pre>
                </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium border border-transparent hover:border-slate-700"
          >
            <X size={16} />
            Discard
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2 text-sm font-medium border border-transparent"
          >
            <Check size={16} />
            Apply Fix
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;