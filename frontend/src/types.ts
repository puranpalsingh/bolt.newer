export enum StepType {
  CreateFolder = 'CreateFolder',
  CreateFile = 'CreateFile',
  RunScript = 'RunScript'
}

export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: 'pending' | 'completed' | 'failed';
  code?: string;
  path?: string;
}

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileItem[];
} 