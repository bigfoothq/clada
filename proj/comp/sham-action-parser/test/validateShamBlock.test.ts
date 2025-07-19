import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { validateShamBlock } from '../src/index';

const testData = JSON.parse(
  readFileSync(join(__dirname, '../test-data/validateShamBlock.json'), 'utf8')
);

describe('validateShamBlock', () => {
  testData.cases.forEach(({ name, input, expected }) => {
    it(name, () => {
      const [block, actionSchema] = input;
      const result = validateShamBlock(block, actionSchema);
      expect(result).toEqual(expected);
    });
  });
});