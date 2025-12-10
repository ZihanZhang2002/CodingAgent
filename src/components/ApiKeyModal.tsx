import React, { useState, useEffect, useRef } from 'react';
import { Key, X, Check, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (key: string) => void;
  onRemove?: () => void;
  currentKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSubmit, onRemove, currentKey }) => {
  const [value, setValue] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(currentKey);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full m-4 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-2">
             <Key size={18} className="text-yellow-400" />
             <h3 className="text-sm font-semibold text-white">Configure API Key</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            To use the Agent features, you need a Google Gemini API key. 
            The key is stored locally in your browser.
          </p>

          <label className="block text-xs text-slate-300 mb-2 font-medium">Gemini API Key</label>
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type={showKey ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex flex-col gap-2">
                <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                >
                Get a key <ExternalLink size={10} />
                </a>
                
                {currentKey && onRemove && (
                    <button
                        type="button"
                        onClick={() => { onRemove(); onClose(); }}
                        className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 hover:underline"
                    >
                        <Trash2 size={10} />
                        Remove Key
                    </button>
                )}
            </div>

            <div className="flex gap-2">
                <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={!value.trim()}
                className="px-4 py-2 text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20"
                >
                <Check size={14} />
                Save Key
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;