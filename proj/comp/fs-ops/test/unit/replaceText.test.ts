import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { load as loadYaml } from 'js-yaml';
import { replaceText } from '../../src/replaceText.js';

const testData = loadYaml(
  readFileSync(join(__dirname, '../../test-data/unit/replaceText.yaml'), 'utf8')
) as any;

describe('replaceText', () => {
  testData.cases.forEach(({ name, input, expected }) => {
    it(name, () => {
      const result = replaceText(...input);
      expect(result).toEqual(expected);
    });
  });
});