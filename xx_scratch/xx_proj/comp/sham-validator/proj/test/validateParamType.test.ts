import { validateParamType } from '../src/index.js';
import testData from '../test-data/validateParamType.json' assert { type: 'json' };

describe('validateParamType', () => {
  testData.cases.forEach((testCase) => {
    it(testCase.name, () => {
      const [value, paramSchema] = testCase.input;
      const result = validateParamType(value, paramSchema);
      expect(result).toBe(testCase.expected);
    });
  });
});