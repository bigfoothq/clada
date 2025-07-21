import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getByteLength } from '../../src/getByteLength.js';

const testData = JSON.parse(
  readFileSync(join(__dirname, '../../test-data/unit/getByteLength.cases.json'), 'utf8')
);

describe('getByteLength', () => {
  testData.cases.forEach(({ name, input, expected }) => {
    it(name, () => {
      const result = getByteLength(...input);
      expect(result).toEqual(expected);
    });
  });
});