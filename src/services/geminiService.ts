import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Agent Core" of a Multi-Agent Coding Assistant designed for course-scale repositories. 
Your architecture consists of:
1. Orchestrator (You): Coordinate the workflow.
2. Planner: Decompose tasks into sub-tasks.
3. Coder: Write code and apply patches.
4. Critic: Run tests and review diffs.

You are integrated into a Web IDE. The user's current code context (active file and project structure) is provided.
You also have access to the "Last Runtime Output/Error" from the user's terminal. 

If the user reports an error or asks for a fix:
1. Analyze the "Last Runtime Error".
2. Explain what caused the error in the context of the code.
3. Provide the corrected code or specific changes to apply.

When the user asks a coding question:
1. Analyze the provided code context.
2. Briefly acknowledge the complexity.
3. Pretend to delegate to the Planner, Coder, and Critic.
4. Summarize the changes made.

Keep your final response concise and professional.
`;

let chatInstance: Chat | null = null;
let currentApiKey: string | null = null;

export const initializeChat = (apiKey: string): Chat => {
  // If we already have a chat instance with the same key, reuse it.
  if (chatInstance && currentApiKey === apiKey) return chatInstance;

  try {
    const ai = new GoogleGenAI({ apiKey });
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    currentApiKey = apiKey;
    return chatInstance;
  } catch (error) {
    console.error("Failed to initialize Gemini chat", error);
    throw error;
  }
};

export const sendMessageToGemini = async (
  apiKey: string,
  message: string, 
  context?: string, 
  lastError?: string
): Promise<string> => {
  if (!apiKey) {
      return "Error: API Key is missing. Please configure it in settings.";
  }

  try {
    const chat = initializeChat(apiKey);
    let fullMessage = message;
    
    if (context) {
      fullMessage += `\n\n--- CURRENT IDE CONTEXT ---\n${context}`;
    }
    
    if (lastError) {
      fullMessage += `\n\n--- LAST RUNTIME ERROR/OUTPUT ---\n${lastError}`;
      fullMessage += `\n\nINSTRUCTION: The user encountered the error above. Analyze it and fix the code.`;
    }
      
    const result: GenerateContentResponse = await chat.sendMessage({ message: fullMessage });
    return result.text || "I processed the request but returned no text.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the Agent Core. Please check your API Key and quota.";
  }
};