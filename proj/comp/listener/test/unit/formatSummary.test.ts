import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { formatSummary } from '../../src/formatters.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('formatSummary', async () => {
  const testDataPath = join(__dirname, '../../test-data/unit/formatSummary.json');
  const testData = JSON.parse(await readFile(testDataPath, 'utf-8'));

  for (const testCase of testData.cases) {
    it(testCase.name, () => {
      const [parseResult, execResults, timestamp] = testCase.input;
      const result = formatSummary(parseResult, execResults, new Date(timestamp));
      expect(result).toBe(testCase.expected);
    });
  }
});