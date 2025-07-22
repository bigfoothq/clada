import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { computeContentHash } from '../../src/utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('computeContentHash', async () => {
  const testDataPath = join(__dirname, '../../test-data/unit/computeContentHash.json');
  const testData = JSON.parse(await readFile(testDataPath, 'utf-8'));

  for (const testCase of testData.cases) {
    it(testCase.name, () => {
      const [parseResult] = testCase.input;
      const result = computeContentHash(parseResult);
      
      // Verify it's a valid SHA-256 hash (64 hex characters)
      expect(result).toMatch(/^[a-f0-9]{64}$/);
      
      // Verify that same input produces same hash
      const result2 = computeContentHash(parseResult);
      expect(result2).toBe(result);
      
      // For empty parse result specifically, verify it's consistent
      if (testCase.name === 'empty parse result') {
        const emptyHash = computeContentHash({actions: [], errors: []});
        expect(result).toBe(emptyHash);
      }
    });
  }
});