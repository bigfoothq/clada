export const cases = [
  {
    name: "extract single line",
    input: ["Line 1\nLine 2\nLine 3", "2", ": "],
    expected: {
      result: "     2: Line 2",
      lineCount: 3
    }
  },
  {
    name: "extract line range",
    input: ["First\nSecond\nThird\nFourth", "2-3", ": "],
    expected: {
      result: "     2: Second\n     3: Third",
      lineCount: 4
    }
  },
  {
    name: "custom delimiter",
    input: ["A\nB\nC", "1-2", "    "],
    expected: {
      result: "     1    A\n     2    B",
      lineCount: 3
    }
  },
  {
    name: "empty delimiter",
    input: ["One\nTwo\nThree", "2", ""],
    expected: {
      result: "     2Two",
      lineCount: 3
    }
  },
  {
    name: "out of range line",
    input: ["Only\nTwo", "5", ": "],
    expected: {
      result: "",
      lineCount: 2,
      outOfRange: {
        requested: "5",
        actual: 2
      }
    }
  },
  {
    name: "out of range end",
    input: ["One\nTwo\nThree", "2-10", ": "],
    expected: {
      result: "     2: Two\n     3: Three",
      lineCount: 3,
      outOfRange: {
        requested: "2-10",
        actual: 3
      }
    }
  },
  {
    name: "empty content",
    input: ["", "1", ": "],
    expected: {
      result: "",
      lineCount: 0
    }
  },
  {
    name: "single line content",
    input: ["Just one line", "1", ": "],
    expected: {
      result: "     1: Just one line",
      lineCount: 1
    }
  },
  {
    name: "large line numbers",
    input: [Array.from({length: 12}, (_, i) => `Line ${i + 1}`).join('\n'), "9-11", ": "],
    expected: {
      result: "      9: Line 9\n     10: Line 10\n     11: Line 11",
      lineCount: 12
    }
  },
  {
    name: "invalid line spec - not a number",
    input: ["content", "abc", ": "],
    throws: "Invalid line specification 'abc'"
  },
  {
    name: "invalid line spec - negative",
    input: ["content", "-5", ": "],
    throws: "Invalid line specification '-5'"
  },
  {
    name: "invalid range - reversed",
    input: ["content", "5-3", ": "],
    throws: "Invalid line range '5-3' (start must be <= end)"
  },
  {
    name: "invalid range - negative start",
    input: ["content", "-1-5", ": "],
    throws: "Invalid line specification '-1-5'"
  },
  {
    name: "invalid range - too many parts",
    input: ["content", "1-2-3", ": "],
    throws: "Invalid line specification '1-2-3'"
  },
  {
    name: "undefined lineSpec - read all",
    input: ["Line A\nLine B\nLine C", undefined, ": "],
    expected: {
      result: "     1: Line A\n     2: Line B\n     3: Line C",
      lineCount: 3
    }
  },
  {
    name: "undefined lineSpec - empty file",
    input: ["", undefined, ": "],
    expected: {
      result: "",
      lineCount: 0
    }
  }
];