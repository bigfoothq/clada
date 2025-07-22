import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { shouldIncludeOutput } from '../../src/formatters.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('shouldIncludeOutput', async () => {
  const testDataPath = join(__dirname, '../../test-data/unit/shouldIncludeOutput.json');
  const testData = JSON.parse(await readFile(testDataPath, 'utf-8'));

  for (const testCase of testData.cases) {
    it(testCase.name, () => {
      const [result, actionSchema] = testCase.input;
      
      // Convert the schema object to a Map as expected by the function
      const schemaMap = new Map(Object.entries(actionSchema));
      
      const includeOutput = shouldIncludeOutput(result, schemaMap);
      expect(includeOutput).toBe(testCase.expected);
    });
  }
});