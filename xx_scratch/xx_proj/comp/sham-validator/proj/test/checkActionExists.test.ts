import { checkActionExists } from '../src/index.js';
import testData from '../test-data/checkActionExists.json' assert { type: 'json' };

describe('checkActionExists', () => {
  testData.cases.forEach((testCase) => {
    it(testCase.name, () => {
      const [action, schemas] = testCase.input;
      const result = checkActionExists(action, schemas);
      expect(result).toBe(testCase.expected);
    });
  });
});