export interface ParseResult {
  actions: CladaAction[];
  errors: ParseError[];
  summary: {
    totalBlocks: number;
    successCount: number;
    errorCount: number;
  };
}

export interface CladaAction {
  action: string;
  parameters: Record<string, any>;
  metadata: {
    blockId: string;
    startLine: number;
    endLine: number;
  };
}

export interface ParseError {
  blockId: string;
  errorType: 'syntax' | 'validation' | 'type';
  message: string;
  line?: number;
  shamContent?: string;
}

export interface ValidationResult {
  valid: boolean;
  actionType?: string;
  errors?: string[];
}

export class TransformError extends Error {
  constructor(
    message: string,
    public parameterName: string,
    public expectedType: string,
    public actualValue: string
  ) {
    super(message);
    this.name = 'TransformError';
  }
}