import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { formatFullOutput } from '../../src/formatters.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('formatFullOutput', async () => {
  const testDataPath = join(__dirname, '../../test-data/unit/formatFullOutput.json');
  const testData = JSON.parse(await readFile(testDataPath, 'utf-8'));

  for (const testCase of testData.cases) {
    it(testCase.name, () => {
      const [parseResult, execResults, actionSchemaObj] = testCase.input;
      
      // Convert schema object to Map
      const actionSchema = new Map(Object.entries(actionSchemaObj));
      
      const result = formatFullOutput(parseResult, execResults, actionSchema);
      expect(result).toBe(testCase.expected);
    });
  }
});