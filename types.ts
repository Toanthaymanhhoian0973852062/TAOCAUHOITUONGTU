export interface MathProblem {
  question: string;
  solution: string;
}

export interface GeneratedResponse {
  original_text?: string;
  problems: MathProblem[];
}

export interface ProblemConfig {
  level1: number; // Nhận biết - Thay số
  level2: number; // Thông hiểu/Vận dụng
  level3: number; // Vận dụng cao
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  problems: MathProblem[];
  config: ProblemConfig;
}