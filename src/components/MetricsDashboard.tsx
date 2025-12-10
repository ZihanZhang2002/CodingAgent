import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Play, CheckCircle2, User, Users, X } from 'lucide-react';
import { DEMO_TASKS } from '../data/demoTasks';
import { DemoTask, OrchestrationMode } from '../types';

const SUCCESS_DATA = [
  { name: 'Task 1', single: 40, multi: 85 },
  { name: 'Task 2', single: 30, multi: 90 },
  { name: 'Task 3', single: 55, multi: 88 },
  { name: 'Task 4', single: 20, multi: 95 },
  { name: 'Task 5', single: 45, multi: 82 },
];

const STEPS_DATA = [
  { name: 'Task 1', steps: 12 },
  { name: 'Task 2', steps: 8 },
  { name: 'Task 3', steps: 15 },
  { name: 'Task 4', steps: 5 },
  { name: 'Task 5', steps: 22 },
];

interface MetricsDashboardProps {
  onRunDemo: (task: DemoTask, mode: OrchestrationMode) => void;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ onRunDemo }) => {
  const [selectedTask, setSelectedTask] = useState<DemoTask | null>(null);

  const handleModeSelect = (mode: OrchestrationMode) => {
    if (selectedTask) {
      onRunDemo(selectedTask, mode);
      setSelectedTask(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 relative">
      
      {/* Mode Selection Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl max-w-md w-full m-4 transform transition-all scale-100 relative">
                <button 
                    onClick={() => setSelectedTask(null)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-2">Select Agent Architecture</h3>
                <p className="text-slate-400 text-sm mb-6">
                    How should the system solve <strong>"{selectedTask.title}"</strong>?
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleModeSelect(OrchestrationMode.SINGLE)}
                        className="flex flex-col items-center p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-xl transition-all group hover:shadow-lg hover:shadow-blue-900/10 text-left"
                    >
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full mb-3 group-hover:scale-110 transition-transform">
                            <User size={28} />
                        </div>
                        <span className="font-bold text-slate-200">Single Agent</span>
                        <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">ReAct / LangChain</span>
                    </button>

                    <button 
                        onClick={() => handleModeSelect(OrchestrationMode.MULTI)}
                        className="flex flex-col items-center p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 rounded-xl transition-all group hover:shadow-lg hover:shadow-purple-900/10 text-left"
                    >
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-full mb-3 group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <span className="font-bold text-slate-200">Multi-Agent</span>
                        <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Swarm Orchestration</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Evaluation Dashboard</h1>
        <p className="text-slate-400">Comparing Single-Agent vs. Multi-Agent Performance on Course Tasks</p>
      </header>

      {/* Task List Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={20} />
            Evaluation Tasks (Dataset)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_TASKS.map((task) => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-purple-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${task.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' : task.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                            {task.difficulty}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1">{task.title}</h3>
                    <p className="text-xs text-slate-500 mb-4 min-h-[40px]">{task.description}</p>
                    
                    <button 
                        onClick={() => setSelectedTask(task)}
                        className="w-full py-2 bg-slate-800 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all group-hover:shadow-lg group-hover:shadow-purple-900/20"
                    >
                        <Play size={14} />
                        Run Auto-Evaluation
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Success Rate Comparison (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUCCESS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="single" name="Single-Agent (LangChain)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="multi" name="Multi-Agent (Ours)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Tool Calls per Task (Multi-Agent)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={STEPS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                   itemStyle={{ color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;