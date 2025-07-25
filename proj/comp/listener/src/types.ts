export interface ListenerConfig {
  filePath: string;
  debounceMs?: number;
  outputFilename?: string;
  debug?: boolean;
}

export interface ListenerHandle {
  id: string;
  filePath: string;
  stop: () => Promise<void>;
}

export interface ListenerState {
  lastExecutedHash: string;
  isProcessing: boolean;
  outputPath: string;
  actionSchema?: Map<string, ActionDefinition>;
  debug?: boolean;
}

export interface ActionDefinition {
  type: 'read' | 'write' | 'meta' | 'git' | 'dynamic';
  description: string;
  output_display?: 'always' | 'never' | 'conditional';
  primary_param?: string;
  parameters: Record<string, ParameterDef>;
  returns: Record<string, any>;
}

export interface ParameterDef {
  type: string;
  required: boolean;
  format?: string;
  values?: string[];
  default?: any;
}

export interface SizeCheckResult {
  valid: boolean;
  totalSize: number;
  errors: any[]; // ExecutionResult[] but avoiding circular dependency
}