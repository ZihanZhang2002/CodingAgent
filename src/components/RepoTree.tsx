import React, { useState, useRef } from 'react';
import { Folder, FolderOpen, File, FileJson, FileType2, Upload, FilePlus, FolderPlus } from 'lucide-react';
import { FileNode } from '../types';

interface RepoTreeProps {
  files: FileNode;
  onSelectFile: (file: FileNode) => void;
  activeFile?: FileNode | null;
  onUpload?: (files: FileList) => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}

const FileItem: React.FC<{ 
  node: FileNode; 
  depth: number; 
  onSelect: (node: FileNode) => void;
  activeFile?: FileNode | null;
}> = ({ node, depth, onSelect, activeFile }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  const getIcon = () => {
    if (node.type === 'folder') return isOpen ? <FolderOpen size={14} className="text-blue-400" /> : <Folder size={14} className="text-blue-400" />;
    if (node.name.endsWith('.py')) return <FileType2 size={14} className="text-yellow-400" />;
    if (node.name.endsWith('.json')) return <FileJson size={14} className="text-green-400" />;
    return <File size={14} className="text-slate-400" />;
  };

  const isActive = activeFile?.name === node.name;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 cursor-pointer px-1 transition-colors ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-300'}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="mr-2 opacity-80">{getIcon()}</span>
        <span className="text-sm font-mono truncate">{node.name}</span>
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileItem 
              key={`${child.name}-${idx}`} 
              node={child} 
              depth={depth + 1} 
              onSelect={onSelect}
              activeFile={activeFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RepoTree: React.FC<RepoTreeProps> = ({ 
  files, 
  onSelectFile, 
  activeFile, 
  onUpload, 
  onCreateFile, 
  onCreateFolder 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onUpload) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-2 px-3 py-2 border-b border-slate-800 bg-slate-900 sticky top-0 z-50 shadow-md">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Explorer</h3>
        <div className="flex gap-1">
          <button 
            type="button"
            onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                console.log("Create File Clicked"); 
                if (onCreateFile) onCreateFile(); 
            }}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer pointer-events-auto"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button 
            type="button"
            onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                if (onCreateFolder) onCreateFolder(); 
            }}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer pointer-events-auto"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
          <button 
            type="button"
            onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                handleUploadClick(); 
            }}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer pointer-events-auto"
            title="Upload Folder"
          >
            <Upload size={14} />
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          // @ts-ignore
          webkitdirectory="" 
          directory="" 
          multiple 
          onChange={handleFileChange}
        />
      </div>
      <div className="flex-1 overflow-y-auto z-0">
        <FileItem 
          node={files} 
          depth={0} 
          onSelect={onSelectFile} 
          activeFile={activeFile}
        />
      </div>
    </div>
  );
};

export default RepoTree;