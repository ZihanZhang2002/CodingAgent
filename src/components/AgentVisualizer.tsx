import React from 'react';
import { AgentRole, AgentStatus, OrchestrationMode, SingleAgentType } from '../types';
import { Brain, FileCode, CheckCircle, Search, Terminal, Zap, User, GitGraph, Box } from 'lucide-react';

interface AgentVisualizerProps {
  statuses: AgentStatus[];
  mode: OrchestrationMode;
  singleAgentType?: SingleAgentType;
  onSetSingleAgentType?: (type: SingleAgentType) => void;
}

const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ 
  statuses, 
  mode,
  singleAgentType,
  onSetSingleAgentType
}) => {
  // Filter statuses based on mode
  const visibleStatuses = mode === OrchestrationMode.SINGLE
    ? statuses.filter(s => s.role === AgentRole.ORCHESTRATOR || s.role === AgentRole.CODER)
    : statuses;

  const getIcon = (role: AgentRole) => {
    switch (role) {
      case AgentRole.ORCHESTRATOR: return <Brain className="w-5 h-5" />;
      case AgentRole.PLANNER: return <Search className="w-5 h-5" />;
      case AgentRole.CODER: return mode === OrchestrationMode.SINGLE ? <Terminal className="w-5 h-5" /> : <FileCode className="w-5 h-5" />;
      case AgentRole.CRITIC: return <CheckCircle className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getLabel = (role: AgentRole) => {
      if (mode === OrchestrationMode.SINGLE) {
          if (role === AgentRole.ORCHESTRATOR) {
              return singleAgentType === SingleAgentType.LANGCHAIN ? 'LANGCHAIN AGENT' : 'REACT AGENT';
          }
          if (role === AgentRole.CODER) {
             return singleAgentType === SingleAgentType.LANGCHAIN ? 'TOOL NODE' : 'EXECUTOR';
          }
      }
      return role;
  };

  const getColor = (role: AgentRole, isActive: boolean) => {
    if (!isActive) return 'border-slate-800 bg-slate-900/50 text-slate-600';
    switch (role) {
      case AgentRole.ORCHESTRATOR: return 'border-purple-500 bg-purple-900/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      case AgentRole.PLANNER: return 'border-blue-500 bg-blue-900/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      case AgentRole.CODER: return 'border-emerald-500 bg-emerald-900/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
      case AgentRole.CRITIC: return 'border-amber-500 bg-amber-900/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      default: return 'border-slate-700';
    }
  };

  const gridCols = mode === OrchestrationMode.SINGLE ? 'grid-cols-2 max-w-lg mx-auto' : 'grid-cols-4';

  return (
    <div className="flex flex-col items-center">
      
      {/* Selector for Single Agent Type */}
      {mode === OrchestrationMode.SINGLE && onSetSingleAgentType && (
        <div className="flex gap-4 mb-6 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
           <button 
             onClick={() => onSetSingleAgentType(SingleAgentType.REACT)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
               singleAgentType === SingleAgentType.REACT 
               ? 'bg-purple-600 text-white shadow-lg' 
               : 'text-slate-500 hover:text-slate-300'
             }`}
           >
             <Box size={14} />
             ReAct-Style
           </button>
           <button 
             onClick={() => onSetSingleAgentType(SingleAgentType.LANGCHAIN)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
               singleAgentType === SingleAgentType.LANGCHAIN 
               ? 'bg-blue-600 text-white shadow-lg' 
               : 'text-slate-500 hover:text-slate-300'
             }`}
           >
             <GitGraph size={14} />
             LangChain/LangGraph
           </button>
        </div>
      )}

      <div className={`grid ${gridCols} gap-4 mb-6 transition-all duration-300 w-full`}>
        {visibleStatuses.map((agent) => (
          <div 
            key={agent.role}
            className={`relative border rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-500 ${getColor(agent.role, agent.isActive)} min-h-[100px]`}
          >
            {agent.isActive && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
            )}
            
            <div className="mb-3 p-2 rounded-full bg-slate-950/30 border border-white/5">
              {getIcon(agent.role)}
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1">{getLabel(agent.role)}</h3>
            <p className="text-[10px] text-center w-full opacity-80 h-4 truncate px-1">
              {agent.isActive ? agent.currentAction : 'Idle'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentVisualizer;