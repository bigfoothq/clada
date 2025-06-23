#!/usr/bin/env node

import { promises as fs } from 'fs';
import { parse } from 'csl-parser';

/**
 * The main entry point for the clada CLI application.
 * It reads a file path from command-line arguments, parses the file's
 * CSL content, and prints the resulting JSON to standard output.
 */
(async () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: clada <file.csl>');
    process.exit(1);
  }

  try {
    // Read the file content from the provided path
    const cslContent = await fs.readFile(filePath, 'utf-8');

    // Parse the content using the csl-parser library
    const parsedResult = parse(cslContent);

    // Output the result as a pretty-printed JSON string
    console.log(JSON.stringify(parsedResult, null, 2));

  } catch (error: any) {
    // Handle errors (e.g., file not found, parsing errors)
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();