import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getParentDirectory } from '../../src/getParentDirectory.js';

const testData = JSON.parse(
  readFileSync(join(__dirname, '../../test-data/unit/getParentDirectory.json'), 'utf8')
);

describe('getParentDirectory', () => {
  testData.cases.forEach(({ name, input, expected }) => {
    it(name, () => {
      const result = getParentDirectory(...input);
      expect(result).toEqual(expected);
    });
  });
});