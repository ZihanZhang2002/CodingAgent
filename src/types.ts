export enum AgentRole {
  ORCHESTRATOR = 'ORCHESTRATOR',
  PLANNER = 'PLANNER',
  CODER = 'CODER',
  CRITIC = 'CRITIC',
}

export enum MessageType {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system', // For logs/tool outputs
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  role?: AgentRole;
  timestamp: number;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface ToolLog {
  id: string;
  toolName: string;
  status: 'running' | 'success' | 'error';
  args: string;
  result?: string;
  timestamp: number;
}

export enum ViewMode {
  CHAT = 'CHAT',
  DASHBOARD = 'DASHBOARD',
}

export enum OrchestrationMode {
  SINGLE = 'SINGLE',
  MULTI = 'MULTI',
}

export enum SingleAgentType {
  REACT = 'REACT',
  LANGCHAIN = 'LANGCHAIN',
}

export interface AgentStatus {
  role: AgentRole;
  isActive: boolean;
  currentAction: string;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
}

export interface DemoTask {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  files: FileNode;
  initialCommand: string; // The command to run that shows the failure
  userPrompt: string; // The natural language request to fix it
}