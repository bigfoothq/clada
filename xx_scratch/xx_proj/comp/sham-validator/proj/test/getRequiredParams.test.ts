import { getRequiredParams } from '../src/index.js';
import testData from '../test-data/getRequiredParams.json' assert { type: 'json' };

describe('getRequiredParams', () => {
  testData.cases.forEach((testCase) => {
    it(testCase.name, () => {
      const [actionSchema] = testCase.input;
      const result = getRequiredParams(actionSchema);
      expect(result).toEqual(testCase.expected);
    });
  });
});