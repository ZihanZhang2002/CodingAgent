import { FileNode } from '../types';

let pyodideInstance: any = null;

export const initializePyodide = async () => {
  if (pyodideInstance) return pyodideInstance;
  
  if (!(window as any).loadPyodide) {
    throw new Error("Pyodide script not loaded");
  }

  // @ts-ignore
  pyodideInstance = await (window as any).loadPyodide();
  return pyodideInstance;
};

// Sync the React state file tree to Pyodide's virtual filesystem
export const syncFileSystem = (pyodide: any, root: FileNode, basePath: string = '.') => {
  if (!pyodide) return;

  if (root.type === 'file') {
    // Write file content to virtual FS
    const path = `${basePath}/${root.name}`;
    try {
        pyodide.FS.writeFile(path, root.content || '');
    } catch (e) {
        console.error(`Failed to write ${path}`, e);
    }
  } else if (root.children) {
    // Create directory
    const path = `${basePath}/${root.name}`;
    try {
      if (path !== './root' && path !== '.') { // Avoid root
         // Pyodide FS createFolder might throw if exists, check first or try/catch
         try { pyodide.FS.mkdir(path); } catch(e) {} 
      }
      root.children.forEach(child => syncFileSystem(pyodide, child, path));
    } catch (e) {
      console.error(`Failed to mkdir ${path}`, e);
    }
  }
};

export const runPythonCode = async (
  code: string, 
  onOutput: (text: string) => void,
  onError: (text: string) => void
) => {
  const pyodide = await initializePyodide();

  // Redirect stdout/stderr
  pyodide.setStdout({ batched: (msg: string) => onOutput(msg) });
  pyodide.setStderr({ batched: (msg: string) => onError(msg) });

  try {
    await pyodide.runPythonAsync(code);
  } catch (err: any) {
    onError(err.toString());
    throw err;
  }
};