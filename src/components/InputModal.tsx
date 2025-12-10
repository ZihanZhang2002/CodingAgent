import React, { useState, useEffect, useRef } from 'react';
import { X, Check, FilePlus, FolderPlus } from 'lucide-react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  type: 'file' | 'folder';
}

const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSubmit, type }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      // Slight delay to ensure render is complete before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    onClose();
  };

  const title = type === 'file' ? 'Create New File' : 'Create New Folder';
  const placeholder = type === 'file' ? 'e.g., script.py' : 'e.g., utils';
  const Icon = type === 'file' ? FilePlus : FolderPlus;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-96 overflow-hidden transform transition-all scale-100">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-2">
             <Icon size={18} className="text-purple-400" />
             <h3 className="text-sm font-semibold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <label className="block text-xs text-slate-400 mb-2 font-medium">Name</label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all mb-4"
          />
          <div className="flex justify-end gap-2">
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
              className="px-3 py-2 text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20"
            >
              <Check size={14} />
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal;