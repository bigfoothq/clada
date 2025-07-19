import { getMissingParams } from '../src/index.js';
import testData from '../test-data/getMissingParams.json' assert { type: 'json' };

describe('getMissingParams', () => {
  testData.cases.forEach((testCase) => {
    it(testCase.name, () => {
      const [properties, requiredParams] = testCase.input;
      const result = getMissingParams(properties, requiredParams);
      expect(result).toEqual(testCase.expected);
    });
  });
});