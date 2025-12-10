import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquareCode, Settings, Activity, GitBranch, Layers, Search, Play, Terminal as TerminalIcon } from 'lucide-react';
import { AgentRole, AgentStatus, ToolLog, ViewMode, FileNode, TerminalLine, OrchestrationMode, SingleAgentType, DemoTask } from './types';
import ChatInterface from './components/ChatInterface';
import AgentVisualizer from './components/AgentVisualizer';
import RepoTree from './components/RepoTree';
import MetricsDashboard from './components/MetricsDashboard';
import CodeEditor from './components/CodeEditor';
import Terminal from './components/Terminal';
import ConfirmationModal from './components/ConfirmationModal';
import InputModal from './components/InputModal';
import ApiKeyModal from './components/ApiKeyModal';
import { initializePyodide, syncFileSystem, runPythonCode } from './services/pyodideService';

// Initial Template
const INITIAL_REPO: FileNode = {
  name: 'project-root',
  type: 'folder',
  children: [
    { name: 'README.md', type: 'file', language: 'markdown', content: '# New Project\nUpload a folder to begin or create a file.' },
    { name: 'main.py', type: 'file', language: 'python', content: 'print("Hello from the Agent Editor!")\n' }
  ]
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CHAT);
  const [orchMode, setOrchMode] = useState<OrchestrationMode>(OrchestrationMode.MULTI);
  const [singleAgentType, setSingleAgentType] = useState<SingleAgentType>(SingleAgentType.REACT);
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'agent'>('terminal');
  
  // File System State
  const [files, setFiles] = useState<FileNode>(INITIAL_REPO);
  const [activeFile, setActiveFile] = useState<FileNode | null>(INITIAL_REPO.children![1]);

  // Agent States
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { role: AgentRole.ORCHESTRATOR, isActive: false, currentAction: '' },
    { role: AgentRole.PLANNER, isActive: false, currentAction: '' },
    { role: AgentRole.CODER, isActive: false, currentAction: '' },
    { role: AgentRole.CRITIC, isActive: false, currentAction: '' },
  ]);

  // Tool Logs & Terminal
  const [toolLogs, setToolLogs] = useState<ToolLog[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: '1', type: 'info', content: 'System initialized. Waiting for Python...' }
  ]);
  const [isPythonReady, setIsPythonReady] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Modals State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Demo State
  const [demoPromptTrigger, setDemoPromptTrigger] = useState<string | null>(null);

  const [inputModal, setInputModal] = useState<{ isOpen: boolean; type: 'file' | 'folder' }>({
    isOpen: false,
    type: 'file'
  });

  useEffect(() => {
    // Load API Key from LocalStorage
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
        setApiKey(storedKey);
    }

    // Initialize Pyodide on mount
    initializePyodide()
      .then(() => {
        setIsPythonReady(true);
        addTerminalLine('info', 'Python 3.11 Runtime Ready.');
      })
      .catch((err) => {
        addTerminalLine('error', `Failed to load Python: ${err}`);
      });
  }, []);

  const handleSaveApiKey = (key: string) => {
      setApiKey(key);
      localStorage.setItem('gemini_api_key', key);
  };

  const handleRemoveApiKey = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
  };

  const addTerminalLine = (type: 'input' | 'output' | 'error' | 'info', content: string) => {
    setTerminalLines(prev => [...prev, { id: Math.random().toString(), type, content }]);
  };

  const handleAgentStateChange = (role: AgentRole, isActive: boolean, action: string) => {
    setAgentStatuses(prev => prev.map(a => 
      a.role === role ? { ...a, isActive, currentAction: action } : a
    ));
  };

  const handleAddToolLog = (log: ToolLog) => {
    setToolLogs(prev => [log, ...prev]);
  };

  const handleFileContentChange = (newContent: string) => {
    if (!activeFile) return;
    activeFile.content = newContent;
    setFiles({ ...files }); 
  };

  const findParentNode = (root: FileNode, target: FileNode): FileNode | null => {
    if (!root.children) return null;
    for (const child of root.children) {
      if (child === target) return root;
      if (child.type === 'folder') {
        const found = findParentNode(child, target);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCreateFileClick = () => {
    setInputModal({ isOpen: true, type: 'file' });
  };

  const handleCreateFolderClick = () => {
    setInputModal({ isOpen: true, type: 'folder' });
  };

  const handleInputSubmit = (name: string) => {
    try {
      let targetFolder: FileNode = files;
      if (activeFile) {
          if (activeFile.type === 'folder') {
              targetFolder = activeFile;
          } else {
              const parent = findParentNode(files, activeFile);
              if (parent) {
                  targetFolder = parent;
              } else {
                  console.warn("Could not find parent folder for active file, defaulting to root.");
              }
          }
      }
      if (!targetFolder.children) targetFolder.children = [];
      if (targetFolder.children.find(c => c.name === name)) {
        alert(`${inputModal.type === 'file' ? 'File' : 'Folder'} already exists!`);
        return;
      }

      if (inputModal.type === 'file') {
        const newFile: FileNode = {
          name,
          type: 'file',
          content: '',
          language: name.endsWith('.py') ? 'python' : 'text'
        };
        targetFolder.children.push(newFile);
        setActiveFile(newFile);
      } else {
        const newFolder: FileNode = {
          name,
          type: 'folder',
          children: []
        };
        targetFolder.children.push(newFolder);
      }
      setFiles({ ...files });
    } catch (e) {
      console.error("Error creating item:", e);
      alert("Failed to create item.");
    }
  };

  const handleCodeSuggestion = (code: string, explanation: string) => {
    if (!activeFile) {
        alert("Received code suggestion but no file is active to apply it to.");
        return;
    }
    setPendingCode(code);
    setConfirmMessage(`${explanation} (Target: ${activeFile.name})`);
    setIsConfirmModalOpen(true);
  };

  const confirmCodeApplication = () => {
    if (activeFile && pendingCode) {
       handleFileContentChange(pendingCode);
       handleAddToolLog({
         id: Math.random().toString(),
         toolName: 'apply_patch',
         status: 'success',
         args: `Updated ${activeFile.name}`,
         timestamp: Date.now()
       });
       addTerminalLine('info', `Successfully updated ${activeFile.name} with agent's suggestion.`);
    }
    setPendingCode(null);
  };

  const handleCommand = async (cmd: string) => {
    addTerminalLine('input', cmd);
    setLastError(null); 

    if (!isPythonReady) {
      addTerminalLine('error', 'Python is still loading...');
      return;
    }

    const args = cmd.trim().split(' ');
    if (args[0] === 'python' && args[1]) {
      const fileName = args[1];
      
      let targetFile: FileNode | undefined;
      const findFile = (node: FileNode): FileNode | undefined => {
        if (node.name === fileName && node.type === 'file') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findFile(child);
            if (found) return found;
          }
        }
        return undefined;
      };

      targetFile = findFile(files);

      if (!targetFile) {
        addTerminalLine('error', `File '${fileName}' not found in virtual workspace.`);
        return;
      }

      addTerminalLine('info', `Running ${fileName}...`);
      
      try {
        const pyodide = await initializePyodide();
        syncFileSystem(pyodide, files, '.');
        
        await runPythonCode(
          targetFile.content || '',
          (out) => addTerminalLine('output', out),
          (err) => {
            addTerminalLine('error', err);
            setLastError(err);
          }
        );
      } catch (e: any) {
        setLastError(e.toString());
        addTerminalLine('error', e.toString());
      }
    } else if (args[0] === 'clear') {
        setTerminalLines([]);
    } else if (args[0] === 'ls') {
        const listDir = (node: FileNode, indent = '') => {
           let output = '';
           if (node.children) {
             node.children.forEach(c => {
               output += `${indent}${c.name}${c.type === 'folder' ? '/' : ''}\n`;
             });
           }
           return output;
        };
        addTerminalLine('output', listDir(files));
    } else {
      addTerminalLine('error', 'Command not recognized. Try: python <filename>');
    }
  };

  const handleFileUpload = async (fileList: FileList) => {
    const newRoot: FileNode = { ...files }; 
    if (!newRoot.children) newRoot.children = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const pathParts = file.webkitRelativePath.split('/');
      let currentLevel = newRoot.children;
      for (let j = 0; j < pathParts.length - 1; j++) {
         const part = pathParts[j];
         let existingFolder = currentLevel.find(n => n.name === part && n.type === 'folder');
         if (!existingFolder) {
           existingFolder = { name: part, type: 'folder', children: [] };
           currentLevel.push(existingFolder);
         }
         currentLevel = existingFolder.children!;
      }
      const fileName = pathParts[pathParts.length - 1];
      const text = await file.text();
      const existingFileIndex = currentLevel.findIndex(n => n.name === fileName && n.type === 'file');
      if (existingFileIndex >= 0) {
        currentLevel[existingFileIndex].content = text;
      } else {
        currentLevel.push({
          name: fileName,
          type: 'file',
          content: text,
          language: fileName.endsWith('.py') ? 'python' : 'text'
        });
      }
    }
    setFiles(newRoot);
    setActiveFile(null);
    addTerminalLine('info', `Imported ${fileList.length} files successfully.`);
  };

  const handleRunDemo = async (task: DemoTask, mode: OrchestrationMode) => {
      setOrchMode(mode);
      setViewMode(ViewMode.CHAT);
      
      const clonedFiles = JSON.parse(JSON.stringify(task.files)); 
      setFiles(clonedFiles);
      setTerminalLines([{ id: 'init', type: 'info', content: `Initializing Evaluation Task: ${task.title}` }]);
      
      if (clonedFiles.children && clonedFiles.children.length > 0) {
          const firstFile = clonedFiles.children.find((c: any) => c.type === 'file');
          if (firstFile) setActiveFile(firstFile);
      }

      setDemoPromptTrigger(null);

      setTimeout(async () => {
          await handleCommand(task.initialCommand);
          setTimeout(() => {
             setDemoPromptTrigger(task.userPrompt);
          }, 2500);
      }, 1000);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      <ConfirmationModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmCodeApplication}
        title="Apply Agent Fix?"
        message={confirmMessage}
        codeSnippet={pendingCode || ''}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal({ ...inputModal, isOpen: false })}
        onSubmit={handleInputSubmit}
        type={inputModal.type}
      />

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSubmit={handleSaveApiKey}
        onRemove={handleRemoveApiKey}
        currentKey={apiKey}
      />

      <aside className="w-12 flex flex-col items-center py-4 border-r border-slate-800 bg-slate-900 z-20">
        <div className="mb-6">
          <Layers size={24} className="text-purple-500" />
        </div>
        <nav className="flex flex-col gap-4 w-full items-center">
          <button onClick={() => setViewMode(ViewMode.CHAT)} className={`p-2 rounded ${viewMode === ViewMode.CHAT ? 'text-white border-l-2 border-white' : 'text-slate-500 hover:text-slate-300'}`}>
            <MessageSquareCode size={20} />
          </button>
          <button onClick={() => setViewMode(ViewMode.DASHBOARD)} className={`p-2 rounded ${viewMode === ViewMode.DASHBOARD ? 'text-white border-l-2 border-white' : 'text-slate-500 hover:text-slate-300'}`}>
            <LayoutDashboard size={20} />
          </button>
        </nav>
        <div className="mt-auto pb-2">
          <button 
            onClick={() => setIsApiKeyModalOpen(true)}
            className="p-2 text-slate-500 hover:text-white"
            title="API Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </aside>

      {viewMode === ViewMode.CHAT ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col">
            <RepoTree 
              files={files} 
              onSelectFile={setActiveFile} 
              activeFile={activeFile} 
              onUpload={handleFileUpload}
              onCreateFile={handleCreateFileClick}
              onCreateFolder={handleCreateFolderClick}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
            <div className="flex-1 overflow-hidden border-r border-slate-800">
              <CodeEditor file={activeFile} onChange={handleFileContentChange} />
            </div>
            
            <div className="h-72 border-t border-slate-800 bg-slate-900 flex flex-col">
              <div className="flex items-center px-4 bg-slate-950 border-b border-slate-800 gap-1 text-xs font-medium">
                <button 
                  onClick={() => setActiveBottomTab('terminal')}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeBottomTab === 'terminal' ? 'border-purple-500 text-purple-400 bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  <TerminalIcon size={14} />
                  TERMINAL
                </button>
                <button 
                  onClick={() => setActiveBottomTab('agent')}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeBottomTab === 'agent' ? 'border-purple-500 text-purple-400 bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  <Activity size={14} />
                  AGENT STATUS
                </button>
              </div>
              
              <div className="flex-1 flex overflow-hidden bg-slate-900 relative">
                 {activeBottomTab === 'terminal' && (
                    <div className="w-full h-full">
                        <Terminal 
                          lines={terminalLines} 
                          onCommand={handleCommand} 
                          isReady={isPythonReady}
                        />
                    </div>
                 )}

                 {activeBottomTab === 'agent' && (
                    <div className="w-full h-full p-4 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                          <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4 font-semibold text-center border-b border-slate-800 pb-2 flex items-center justify-center gap-2">
                             Active Agents 
                             <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                                {orchMode === OrchestrationMode.MULTI 
                                  ? 'Multi-Agent Swarm' 
                                  : `Single Agent (${singleAgentType})`}
                             </span>
                          </h3>
                          <AgentVisualizer 
                            statuses={agentStatuses} 
                            mode={orchMode} 
                            singleAgentType={singleAgentType}
                            onSetSingleAgentType={setSingleAgentType}
                          />
                          
                          <div className="mt-6 border-t border-slate-800 pt-4">
                              <h4 className="text-[10px] text-slate-500 mb-2 uppercase">Recent Tool Trace</h4>
                              <div className="space-y-1">
                                {toolLogs.slice(0, 5).map((log) => (
                                  <div key={log.id} className="text-xs font-mono text-slate-400 flex gap-2 items-center bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                    <span className="text-slate-600 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span className={`px-1.5 rounded text-[10px] uppercase font-bold ${log.status === 'success' ? 'bg-emerald-900/30 text-emerald-400' : log.status === 'running' ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'}`}>
                                        {log.status}
                                    </span>
                                    <span className="text-purple-400 font-semibold">{log.toolName}</span>
                                    <span className="text-slate-500 truncate flex-1">{log.args}</span>
                                  </div>
                                ))}
                                {toolLogs.length === 0 && (
                                    <div className="text-slate-600 italic text-xs">No tools executed yet.</div>
                                )}
                              </div>
                          </div>
                        </div>
                    </div>
                 )}
              </div>
            </div>
          </div>

          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col">
            <ChatInterface 
              onStateChange={handleAgentStateChange}
              addToolLog={handleAddToolLog}
              activeFile={activeFile}
              projectStructure={files}
              lastError={lastError}
              onCodeSuggestion={handleCodeSuggestion}
              orchestrationMode={orchMode}
              setOrchestrationMode={setOrchMode}
              singleAgentType={singleAgentType}
              demoPrompt={demoPromptTrigger}
              apiKey={apiKey}
              onRequestApiKey={() => setIsApiKeyModalOpen(true)}
            />
          </div>

        </div>
      ) : (
        <div className="flex-1 bg-slate-950 p-6 overflow-auto">
           <MetricsDashboard onRunDemo={handleRunDemo} />
        </div>
      )}
    </div>
  );
};

export default App;