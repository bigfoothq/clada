import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkOutputSizes } from '../../src/utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper to expand @REPEAT patterns in test data
function expandRepeats(obj: any): any {
  if (typeof obj === 'string' && obj.startsWith('@REPEAT:')) {
    const [, char, count] = obj.match(/@REPEAT:(.):(\d+)/) || [];
    return char.repeat(parseInt(count));
  }
  if (Array.isArray(obj)) {
    return obj.map(expandRepeats);
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = expandRepeats(value);
    }
    return result;
  }
  return obj;
}

describe('checkOutputSizes', async () => {
  const testDataPath = join(__dirname, '../../test-data/unit/checkOutputSizes.json');
  const rawData = JSON.parse(await readFile(testDataPath, 'utf-8'));
  const testData = expandRepeats(rawData);

  for (const testCase of testData.cases) {
    it(testCase.name, () => {
      const [execResults] = testCase.input;
      const result = checkOutputSizes(execResults);
      
      expect(result.valid).toBe(testCase.expected.valid);
      expect(result.totalSize).toBe(testCase.expected.totalSize);
      expect(result.errors).toEqual(testCase.expected.errors);
    });
  }
});