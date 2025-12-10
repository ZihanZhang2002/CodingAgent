import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2, Bot, User, Hammer, Users, User as UserIcon, Key } from 'lucide-react';
import { Message, MessageType, AgentRole, ToolLog, FileNode, OrchestrationMode, SingleAgentType } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatInterfaceProps {
  onStateChange: (role: AgentRole, isActive: boolean, action: string) => void;
  addToolLog: (log: ToolLog) => void;
  activeFile: FileNode | null;
  projectStructure: FileNode;
  lastError: string | null;
  onCodeSuggestion?: (code: string, explanation: string) => void;
  orchestrationMode: OrchestrationMode;
  setOrchestrationMode: (mode: OrchestrationMode) => void;
  singleAgentType?: SingleAgentType;
  demoPrompt?: string | null;
  apiKey: string;
  onRequestApiKey: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onStateChange, 
  addToolLog,
  activeFile,
  projectStructure,
  lastError,
  onCodeSuggestion,
  orchestrationMode,
  setOrchestrationMode,
  singleAgentType,
  demoPrompt,
  apiKey,
  onRequestApiKey
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: MessageType.AGENT,
      content: "I'm ready. Upload your code or run a script in the terminal. If it fails, I can help fix it.",
      role: AgentRole.ORCHESTRATOR,
      timestamp: Date.now(),
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (demoPrompt && !isProcessing) {
        const triggerDemo = async () => {
             const userMsg: Message = {
                id: Math.random().toString(36).substring(2, 15),
                type: MessageType.USER,
                content: demoPrompt,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, userMsg]);
            await simulateAgentWorkflow(demoPrompt);
        };
        triggerDemo();
    }
  }, [demoPrompt]);

  const uuid = () => Math.random().toString(36).substring(2, 15);

  const simulateAgentWorkflow = async (userPrompt: string) => {
    if (!apiKey) {
        onRequestApiKey();
        setMessages(prev => [...prev, {
            id: uuid(),
            type: MessageType.SYSTEM,
            content: "Please add an API key to continue.",
            timestamp: Date.now()
        }]);
        return;
    }

    setIsProcessing(true);
    
    // ... Existing simulation logic ...
    
    if (orchestrationMode === OrchestrationMode.MULTI) {
        // --- MULTI-AGENT WORKFLOW ---
        onStateChange(AgentRole.ORCHESTRATOR, true, "Reading IDE Context...");
        await new Promise(r => setTimeout(r, 600));
        
        onStateChange(AgentRole.ORCHESTRATOR, false, "");
        onStateChange(AgentRole.PLANNER, true, "Analyzing Code & Errors");
        
        if (lastError) {
            addToolLog({
                id: uuid(),
                toolName: 'analyze_error',
                status: 'running',
                args: 'Processing traceback...',
                timestamp: Date.now()
            });
        }

        await new Promise(r => setTimeout(r, 800));
        
        onStateChange(AgentRole.PLANNER, false, "");
        onStateChange(AgentRole.CODER, true, "Formulating Fix");
        await new Promise(r => setTimeout(r, 1000));
        
        onStateChange(AgentRole.CODER, false, "");
        onStateChange(AgentRole.CRITIC, true, "Reviewing Logic");
        await new Promise(r => setTimeout(r, 800));

        onStateChange(AgentRole.CRITIC, false, "");
        onStateChange(AgentRole.ORCHESTRATOR, true, "Generating Response");

    } else {
        // --- SINGLE-AGENT WORKFLOWS ---
        
        if (singleAgentType === SingleAgentType.LANGCHAIN) {
            onStateChange(AgentRole.ORCHESTRATOR, true, "AgentExecutor: Invoking Chain");
            await new Promise(r => setTimeout(r, 700));

            onStateChange(AgentRole.ORCHESTRATOR, true, "AgentExecutor: Formatting Prompt");
             addToolLog({
                id: uuid(),
                toolName: 'LangChain',
                status: 'running',
                args: 'Retrieving tool schemas...',
                timestamp: Date.now()
            });
            await new Promise(r => setTimeout(r, 800));

            onStateChange(AgentRole.ORCHESTRATOR, true, "AgentExecutor: Selecting Tool");
            onStateChange(AgentRole.CODER, true, "ToolNode: Ready"); 
            await new Promise(r => setTimeout(r, 600));
            
            if (lastError) {
                 addToolLog({
                    id: uuid(),
                    toolName: 'ToolNode',
                    status: 'running',
                    args: 'Executing python_repl_ast...',
                    timestamp: Date.now()
                });
            }
            onStateChange(AgentRole.CODER, true, "ToolNode: Executing");
            await new Promise(r => setTimeout(r, 1000));

            onStateChange(AgentRole.CODER, false, "");
            onStateChange(AgentRole.ORCHESTRATOR, true, "AgentExecutor: Parsing Output");

        } else {
            onStateChange(AgentRole.ORCHESTRATOR, true, "ReAct: Reasoning...");
            await new Promise(r => setTimeout(r, 800));

            if (lastError) {
                 addToolLog({
                    id: uuid(),
                    toolName: 'analyze_error',
                    status: 'running',
                    args: 'Self-correction trace...',
                    timestamp: Date.now()
                });
            }

            onStateChange(AgentRole.ORCHESTRATOR, true, "ReAct: Action -> Executing Tools");
            onStateChange(AgentRole.CODER, true, "System: Execution Phase"); 
            await new Promise(r => setTimeout(r, 1000));
            
            onStateChange(AgentRole.CODER, false, "");
            onStateChange(AgentRole.ORCHESTRATOR, true, "ReAct: Observation -> Finalizing");
        }
    }

    const contextString = `
Current Mode: ${orchestrationMode} Agent
Specific Architecture: ${orchestrationMode === OrchestrationMode.SINGLE ? singleAgentType : 'Multi-Agent Swarm'}
Project Structure JSON:
${JSON.stringify(projectStructure, (key, value) => (key === 'content' ? undefined : value), 2)}

Currently Open File: ${activeFile ? activeFile.name : 'None'}
File Content:
${activeFile ? activeFile.content : 'N/A'}

Instruction to Model:
If Single Agent LangChain mode is active, structure your response as if you are a LangChain AgentExecutor (e.g., "Thought: ..., Action: ..., Observation: ...").
If Single Agent ReAct mode is active, use standard ReAct prompting style.
If Multi-Agent, act as the Orchestrator summarizing the swarm's work.
    `;

    const effectiveLastError = lastError || undefined;

    // --- EXECUTE API CALL ---
    const aiResponse = await sendMessageToGemini(apiKey, userPrompt, contextString, effectiveLastError);

    setMessages(prev => [
      ...prev,
      {
        id: uuid(),
        type: MessageType.AGENT,
        content: aiResponse,
        role: AgentRole.ORCHESTRATOR,
        timestamp: Date.now()
      }
    ]);

    const codeBlockRegex = /```(?:python|bash|javascript|typescript)?\s*([\s\S]*?)```/;
    const match = aiResponse.match(codeBlockRegex);

    if (match && match[1] && onCodeSuggestion) {
      const code = match[1];
      const explanation = "The Agent generated code changes to fix the issue. Do you want to apply them to the current file?";
      onCodeSuggestion(code, explanation);
    }

    onStateChange(AgentRole.ORCHESTRATOR, false, "");
    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    if (!apiKey) {
      onRequestApiKey();
      return;
    }

    const userMsg: Message = {
      id: uuid(),
      type: MessageType.USER,
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    await simulateAgentWorkflow(currentInput);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 shadow-xl overflow-hidden">
      <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-purple-400" />
          <h2 className="text-xs font-semibold text-white uppercase tracking-wide">Assistant</h2>
        </div>
        
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
           <button 
             onClick={() => setOrchestrationMode(OrchestrationMode.SINGLE)}
             className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
               orchestrationMode === OrchestrationMode.SINGLE 
               ? 'bg-slate-800 text-white shadow-sm' 
               : 'text-slate-500 hover:text-slate-300'
             }`}
             title="Single Agent (ReAct)"
           >
             <UserIcon size={10} />
             Single
           </button>
           <button 
             onClick={() => setOrchestrationMode(OrchestrationMode.MULTI)}
             className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
               orchestrationMode === OrchestrationMode.MULTI
               ? 'bg-purple-900/40 text-purple-200 shadow-sm border border-purple-500/30' 
               : 'text-slate-500 hover:text-slate-300'
             }`}
             title="Multi-Agent (Orchestrator, Planner, Coder, Critic)"
           >
             <Users size={10} />
             Multi
           </button>
        </div>
      </div>
      
      {lastError && (
         <div className="px-3 py-1 bg-red-900/10 border-b border-red-900/20">
             <span className="text-[10px] text-red-400 flex items-center gap-1 animate-pulse">
                <Hammer size={10} /> Needs Fix
             </span>
         </div>
      )}

      {/* API Key Missing Banner */}
      {!apiKey && (
        <div className="bg-amber-900/20 border-b border-amber-900/30 p-2 text-center">
            <button onClick={onRequestApiKey} className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-2 hover:underline">
                <Key size={10} />
                Please add an API key. Click to Configure.
            </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.type === MessageType.USER ? 'justify-end' : msg.type === MessageType.SYSTEM ? 'justify-center' : 'justify-start'}`}
          >
             {msg.type === MessageType.SYSTEM ? (
                 <div className="bg-slate-950 border border-slate-800 text-slate-500 text-[10px] rounded-full px-3 py-1">
                     {msg.content}
                 </div>
             ) : (
                <div className={`max-w-[90%] rounded-lg p-3 ${
                msg.type === MessageType.USER 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                {msg.role && msg.type !== MessageType.USER && (
                    <div className="flex items-center gap-2 mb-1 pb-1 border-b border-slate-700/50">
                    <span className="text-[10px] font-bold uppercase text-purple-300">{msg.role}</span>
                    </div>
                )}
                <div className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</div>
                </div>
             )}
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start">
             <div className="bg-slate-800/50 rounded-lg p-2 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-purple-400" />
                <span className="text-[10px] text-slate-400 italic">Thinking...</span>
             </div>
           </div>
        )}
      </div>

      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={!apiKey ? "Please add an API key..." : "Ask or say 'Fix it'..."}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded pl-3 pr-10 py-2 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isProcessing}
            className="absolute right-1 top-1 p-1 text-purple-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;