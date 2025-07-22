import { createHash } from 'crypto';
import type { SizeCheckResult } from './types.js';

export function checkOutputSizes(execResults: any[]): SizeCheckResult {
  const MAX_SINGLE_OUTPUT = 50_000;
  const MAX_TOTAL_OUTPUT = 200_000;
  let totalSize = 0;
  const errors: any[] = [];
  
  for (const result of execResults) {
    if (!result.result.success) continue;
    
    const outputSize = getOutputSize(result);
    if (outputSize > MAX_SINGLE_OUTPUT) {
      // Convert to error result
      errors.push({
        action: result.action,
        result: {
          success: false,
          error: `Output too large: ${outputSize} bytes (max ${MAX_SINGLE_OUTPUT})`
        }
      });
    } else {
      totalSize += outputSize;
    }
  }
  
  return {
    valid: totalSize <= MAX_TOTAL_OUTPUT && errors.length === 0,
    totalSize,
    errors
  };
}

export function computeContentHash(parseResult: any): string {
  const hashData = JSON.stringify({
    actions: parseResult.actions,
    errors: parseResult.errors
  });
  return createHash('sha256').update(hashData).digest('hex');
}

export function getOutputSize(result: any): number {
  let size = 0;
  if (result.result.content) size += result.result.content.length;
  if (result.result.stdout) size += result.result.stdout.length;
  if (result.result.stderr) size += result.result.stderr.length;
  if (result.result.data) {
    // Use compact JSON serialization (no spacing)
    size += JSON.stringify(result.result.data).length;
  }
  return size;
}