import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { formatNodeError } from '../../src/formatNodeError.js';

const testData = JSON.parse(
  readFileSync(join(__dirname, '../../test-data/unit/formatNodeError.json'), 'utf8')
);

describe('formatNodeError', () => {
  testData.cases.forEach(({ name, input, expected }) => {
    it(name, () => {
      const result = formatNodeError(...input);
      expect(result).toEqual(expected);
    });
  });
});