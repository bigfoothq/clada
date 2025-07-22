/**
 * Extract and number specific lines from content
 * @param content - Full file content
 * @param lineSpec - Line specification ("4" for single line, "23-43" for range)
 * @param delimiter - Delimiter between line number and content
 * @returns Object with numbered lines and total line count
 * @throws Error for invalid line specifications
 */
export function extractNumberedLines(
  content: string,
  lineSpec: string | undefined,
  delimiter: string = ": "
): { result: string; lineCount: number; outOfRange?: { requested: string; actual: number } } {
  // Handle empty content
  if (content === '') {
    return { result: '', lineCount: 0 };
  }

  // Split content into lines
  const lines = content.split('\n');
  const totalLines = lines.length;

  // Parse line specification
  let startLine: number;
  let endLine: number;
  let requestedSpec: string;

  // If no lineSpec provided, read all lines
  if (!lineSpec) {
    startLine = 1;
    endLine = totalLines;
    requestedSpec = `1-${totalLines}`;
  } else {
    requestedSpec = lineSpec;

    if (lineSpec.includes('-')) {
      // Range format: "23-43"
      const parts = lineSpec.split('-');
      if (parts.length !== 2) {
        throw new Error(`Invalid line specification '${lineSpec}'`);
      }

      startLine = parseInt(parts[0], 10);
      endLine = parseInt(parts[1], 10);

      if (isNaN(startLine) || isNaN(endLine)) {
        throw new Error(`Invalid line specification '${lineSpec}'`);
      }

      if (startLine < 1 || endLine < 1) {
        throw new Error(`Invalid line specification '${lineSpec}' (line numbers must be positive)`);
      }

      if (startLine > endLine) {
        throw new Error(`Invalid line range '${lineSpec}' (start must be <= end)`);
      }
    } else {
      // Single line format: "4"
      startLine = parseInt(lineSpec, 10);
      if (isNaN(startLine) || startLine < 1) {
        throw new Error(`Invalid line specification '${lineSpec}'`);
      }
      endLine = startLine;
    }
  }

  // Check if request is out of range
  const originalStartLine = startLine;
  const originalEndLine = endLine;
  const isOutOfRange = startLine > totalLines || endLine > totalLines;

  // If start line is beyond file, return empty
  if (startLine > totalLines) {
    const result = {
      result: '',
      lineCount: totalLines
    };
    
    if (isOutOfRange) {
      result.outOfRange = {
        requested: requestedSpec,
        actual: totalLines
      };
    }
    
    return result;
  }

  // Clamp end line to available lines
  endLine = Math.min(endLine, totalLines);

  // Extract lines and format with numbers
  const numberedLines: string[] = [];
  const maxLineNum = Math.min(originalEndLine, totalLines);
  const numWidth = maxLineNum.toString().length;

  for (let i = startLine; i <= endLine && i <= totalLines; i++) {
    const lineNum = i.toString().padStart(numWidth + 5, ' ');
    numberedLines.push(`${lineNum}${delimiter}${lines[i - 1]}`);
  }

  const result = {
    result: numberedLines.join('\n'),
    lineCount: totalLines
  };

  if (isOutOfRange) {
    result.outOfRange = {
      requested: requestedSpec,
      actual: totalLines
    };
  }

  return result;
}