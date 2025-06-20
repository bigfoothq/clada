```ts
import { execFileSync } from 'child_process';
import { realpathSync, existsSync } from 'fs';
import * as path from 'path';
import { parse as shellParse } from 'shell-quote';
import yargsParser from 'yargs-parser';

/**
 * Secure command executor for LLM-generated filesystem operations.
 * 
 * Threat model: LLM mistakes (wrong paths, bad syntax, command confusion).
 * Not designed for malicious actors - that's out of scope.
 * 
 * Purpose: Allow LLMs to run common shell commands without shell injection vulnerabilities.
 * Instead of using shell=true which interprets metacharacters, we use execFile to spawn
 * processes directly, preventing command chaining, glob expansion, and other shell tricks.
 * 
 * Security model:
 * - Whitelist of allowed commands with per-command configuration
 * - No shell interpretation - commands execute directly via execFile
 * - Path validation prevents accidental directory traversal
 * - Resource limits prevent runaway processes (5s timeout, 10MB output)
 * - Argument parsing validates flags and argument counts
 * 
 * Trade-offs:
 * - No pipes, redirects, or shell features (by design)
 * - Limited command set (expandable via COMMAND_SPECS)
 * - Some conveniences lost (e.g. can't use "grep -r pattern *")
 * 
 * Commands here handle most filesystem operations. The exception is search/replace
 * editing - commands like sed/awk are error-prone for LLMs, so file edits must use
 * our XML CML syntax instead.
 * 
 * Why not just use XML for everything?
 * - LLMs trained on vastly more shell examples than custom XML
 * - Read operations are inherently safer than writes
 * - Less cognitive overhead for LLMs to remember command syntax
 */

const COMMAND_SPECS = {
  cat: { maxPaths: 1 },
  head: { maxPaths: 1, flags: { n: 'number' } },
  tail: { maxPaths: 1, flags: { n: 'number' } },
  grep: { maxPaths: Infinity, flags: { r: 'boolean', i: 'boolean', n: 'boolean', v: 'boolean' }, minArgs: 2 },
  find: { maxPaths: Infinity, flags: { name: 'string', type: 'string', maxdepth: 'number' } },
  ls: { maxPaths: 1, flags: { l: 'boolean', a: 'boolean' } },
  pwd: { maxPaths: 0 },
  tree: { maxPaths: 1, flags: { L: 'number', a: 'boolean' } },
  rm: { maxPaths: Infinity },
  mv: { exactPaths: 2 },
  cp: { exactPaths: 2 },
  mkdir: { maxPaths: 1, flags: { p: 'boolean' } },
  touch: { maxPaths: 1 },
  wc: { maxPaths: 1, flags: { l: 'boolean', w: 'boolean', c: 'boolean' } },
  diff: { exactPaths: 2 },
  file: { maxPaths: 1 },
  stat: { maxPaths: 1 },
  realpath: { maxPaths: 1 },
  xxd: { maxPaths: 1, flags: { l: 'number' } },
  git: {
    subcommands: {
      status: {},
      diff: { maxPaths: Infinity },
      log: { flags: { n: 'number', oneline: 'boolean' } },
      show: { maxPaths: 1 },
      branch: { flags: { a: 'boolean' } },
      stash: {},
      'ls-files': {}
    }
  }
};

function executeCommand(cmd: string, workingDir: string) {
  // Parse shell syntax
  let parsed;
  try {
    parsed = shellParse(cmd);
  } catch (e) {
    return { ok: false, error: 'Invalid shell syntax' };
  }

  // Check for shell operators
  if (parsed.some(arg => typeof arg === 'object')) {
    return { ok: false, error: 'Shell operators not allowed' };
  }

  const command = String(parsed[0]);
  const rawArgs = parsed.slice(1).map(String);

  const spec = COMMAND_SPECS[command];
  if (!spec) return { ok: false, error: `Command not allowed: ${command}` };

  // Handle git specially
  if (command === 'git') {
    if (rawArgs.length === 0) return { ok: false, error: 'Git requires subcommand' };
    const subcommand = rawArgs[0];
    const subSpec = spec.subcommands[subcommand];
    if (!subSpec) return { ok: false, error: `Git subcommand not allowed: ${subcommand}` };

    // Parse remaining git args
    const gitArgs = yargsParser(rawArgs.slice(1), {
      boolean: Object.keys(subSpec.flags || {}).filter(k => subSpec.flags[k] === 'boolean'),
      number: Object.keys(subSpec.flags || {}).filter(k => subSpec.flags[k] === 'number'),
      string: Object.keys(subSpec.flags || {}).filter(k => subSpec.flags[k] === 'string')
    });

    const paths = gitArgs._;
    if (subSpec.maxPaths !== undefined && paths.length > subSpec.maxPaths) {
      return { ok: false, error: 'Too many paths' };
    }

    // Validate paths
    for (const p of paths) {
      if (!validatePath(String(p), workingDir)) {
        return { ok: false, error: `Invalid path: ${p}` };
      }
    }

    return execute(command, rawArgs, workingDir);
  }
  // Parse args for non-git commands
  const argsParser = yargsParser(rawArgs, {
    boolean: Object.keys(spec.flags || {}).filter(k => spec.flags[k] === 'boolean'),
    number: Object.keys(spec.flags || {}).filter(k => spec.flags[k] === 'number'),
    string: Object.keys(spec.flags || {}).filter(k => spec.flags[k] === 'string'),
    '--': true
  });

  // Check for unknown flags
  const knownFlags = new Set(Object.keys(spec.flags || {}));
  for (const flag of Object.keys(argsParser)) {
    if (flag !== '_' && flag !== '--' && !knownFlags.has(flag)) {
      return { ok: false, error: `Unknown flag: --${flag}` };
    }
  }
  // Extract positional arguments
  let paths = argsParser._;

  // Handle grep specially - first positional is pattern, rest are paths
  if (command === 'grep') {
    if (paths.length < 1) return { ok: false, error: 'grep requires pattern' };
    paths = paths.slice(1);
  }

  // Handle ls default
  if (command === 'ls' && paths.length === 0) {
    paths = ['.'];
  }

  // Skip validation for commands with no paths
  if (command === 'pwd' && paths.length === 0) {
    return execute(command, rawArgs, workingDir);
  }

  // Validate path count
  if (spec.exactPaths !== undefined && paths.length !== spec.exactPaths) {
    return { ok: false, error: `${command} requires exactly ${spec.exactPaths} paths` };
  }
  if (spec.maxPaths !== undefined && paths.length > spec.maxPaths) {
    return { ok: false, error: `Too many paths for ${command}` };
  }
  if (spec.minArgs !== undefined && rawArgs.length < spec.minArgs) {
    return { ok: false, error: `Not enough arguments for ${command}` };
  }

  // Validate paths (skip glob patterns)
  for (let i = 0; i < paths.length; i++) {
    const p = String(paths[i]);

    // Skip glob patterns in find -name
    if (command === 'find' && argsParser.name && p === argsParser.name) {
      continue;
    }

    if (!validatePath(p, workingDir)) {
      return { ok: false, error: `Invalid path: ${p}` };
    }
  }

  return execute(command, rawArgs, workingDir);
}

function validatePath(p: string, workingDir: string): boolean {
  const absPath = path.resolve(workingDir, p);

  // For existing paths, check they don't escape via symlinks
  if (existsSync(absPath)) {
    try {
      const realPath = realpathSync(absPath);
      return realPath.startsWith(realpathSync(workingDir));
    } catch {
      return false;
    }
  }

  // For non-existent paths, check parent directory
  return absPath.startsWith(workingDir);
}

function execute(command: string, args: string[], workingDir: string) {
  try {
    const output = execFileSync(command, args, {
      cwd: workingDir,
      timeout: 5000,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8'
    });
    return { ok: true, output };
  } catch (e: any) {
    if (e.code === 'ETIMEDOUT') return { ok: false, error: 'Command timed out' };
    if (e.signal === 'SIGTERM') return { ok: false, error: 'Output too large' };
    return { ok: false, error: e.message };
  }
}
```