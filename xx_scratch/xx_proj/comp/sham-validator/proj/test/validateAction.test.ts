import { validateAction } from '../src/index.js';
import testData from '../test-data/validateAction.json' assert { type: 'json' };

describe('validateAction', () => {
  testData.cases.forEach((testCase) => {
    it(testCase.name, () => {
      const [block, schemas] = testCase.input;
      const result = validateAction(block, schemas);
      expect(result).toEqual(testCase.expected);
    });
  });
});