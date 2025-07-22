import type { ActionDefinition } from './types.js';

export function shouldIncludeOutput(result: any, actionSchema: Map<string, ActionDefinition>): boolean {
  const actionDef = actionSchema.get(result.action.action);
  if (!actionDef) return false;
  
  if (actionDef.output_display === 'always') return true;
  if (actionDef.output_display === 'never') return false;
  if (actionDef.output_display === 'conditional') {
    return result.action.parameters.return_output !== false;
  }
  return false;
}

export function formatSummary(parseResult: any, execResults: any[], timestamp: Date): string {
  throw new Error('Not implemented');
}

export function formatFullOutput(parseResult: any, execResults: any[], actionSchema: Map<string, ActionDefinition>): string {
  throw new Error('Not implemented');
}