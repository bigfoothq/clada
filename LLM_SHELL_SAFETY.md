# LLM Code Execution Safety: A Pragmatic Approach

## Executive Summary

This document outlines a safety-focused approach to restricting commands that LLMs can execute autonomously. Unlike traditional security measures designed to prevent malicious attacks, this system targets the specific failure modes of LLM-generated code: hallucinations, syntax errors, and destructive mistakes.

## Core Philosophy

**We're not fighting attackers - we're preventing accidents.**

**Primary safety boundaries:**
1. **Filesystem isolation**: No changes outside working directory
2. **Git remote protection**: No autonomous pushes to remote repositories

LLMs consistently fail at:
- Complex command syntax (sed, awk)
- Destructive operations with undefined variables
- Accidental publishing/deployment
- Unintended system modifications

## Implementation Strategy

### 1. XML Wrapper for Complex Edits

```xml
<edit path="file.js">
  <search>old text</search>
  <replace>new text</replace>
  <count>1</count>  <!-- expected matches -->
</edit>
```

**Rationale**: LLMs consistently generate broken sed/awk patterns. XML provides clear semantic intent while enabling fuzzy matching behind the scenes.

### 2. Minimal Blocklist for Dangerous Patterns

```javascript
const BLOCKED_PATTERNS = [
  // Git remote operations - NEVER allow autonomous remote changes
  /git\s+push/,                     // all git push variants blocked
  /git\s+remote\s+add/,             // prevent adding remotes
  /git\s+fetch\s+.*--unshallow/,    // prevent repository manipulation
  
  // Path escapes - enforce working directory boundary
  /^\//,                            // absolute paths
  /\.\.\//,                         // parent directory traversal
  /~\//,                            // home directory access
  /\$HOME/,                         // environment variable escape
  
  // Catastrophic deletions
  /rm\s+.*-rf\s*\/($|\s)/,          // rm -rf / 
  /rm\s+.*-rf.*\$\{?\w*\}?\/*/,     // rm -rf ${undefined}/
  
  // Publishing/deployment
  /npm\s+publish/,                  // accidental package release
  /pip\s+upload/,                   // PyPI upload
  /gem\s+push/,                     // RubyGems upload
  /cargo\s+publish/,                // Rust crate upload
  
  // Remote code execution
  /curl.*\|\s*(bash|sh)/,           // curl | sh pattern
  /wget.*\|\s*(bash|sh)/,           // wget | bash
  
  // System damage
  />\s*\/dev\/(sda|null|zero)/,     // overwriting devices
  /dd\s+(if|of)=\/dev/,             // disk operations
  /:(){ :|:& };:/,                  // fork bomb
  
  // Database destruction
  /drop\s+(database|schema)\s+(?!if\s+exists)/i,
  /truncate\s+table.*(?!where)/i,
];
```

### 3. Allowlist for Common Safe Operations

```javascript
const ALLOWED_OPERATIONS = {
  // File reading
  'cat': /^cat\s+[\w\.\/-]+$/,
  'head': /^head(\s+-n\s+\d{1,4})?\s+[\w\.\/-]+$/,
  'tail': /^tail(\s+-n\s+\d{1,4})?\s+[\w\.\/-]+$/,
  
  // Directory operations
  'ls': /^ls(\s+-la?)?(\s+[\w\.\/-]+)?$/,
  'find': /^find\s+\.(\s+-name\s+"[^"]*")?$/,
  
  // Safe modifications (within working directory only)
  'mkdir': /^mkdir(\s+-p)?\s+[\w\.\/-]+$/,
  'touch': /^touch\s+[\w\.\/-]+$/,
  'cp': /^cp(\s+-r)?\s+[\w\.\/-]+\s+[\w\.\/-]+$/,
  'mv': /^mv\s+[\w\.\/-]+\s+[\w\.\/-]+$/,
  
  // Development tools
  'npm': /^npm\s+(install|test|run|ls)/,
  'git': /^git\s+(status|diff|add|commit|log|branch|checkout|pull|fetch|merge)/,  // NO push
  'python': /^python\s+[\w\.\/-]+$/,
};
```

## Key Design Decisions

### Why Not Full Containerization?
Developers resist container overhead for iterative coding tasks. This approach provides 80% of the safety with minimal friction.

### Why Block Some Commands But Not Others?
- **Block**: Operations where LLMs consistently generate dangerous patterns
- **Allow**: Operations where LLMs generate valid syntax reliably
- **Wrap in XML**: Operations where syntax complexity causes consistent failures

### Resource Limits Without Containers

```javascript
const SAFETY_LIMITS = {
  timeout: 30000,              // 30 second max per command
  maxOutput: 10 * 1024 * 1024, // 10MB output buffer
  maxProcesses: 50,            // Prevent fork bombs
  workingDir: process.cwd(),   // Restrict to project directory
};

// Path validation - CRITICAL for filesystem isolation
function validatePath(requestedPath) {
  const resolved = path.resolve(requestedPath);
  const workingDir = path.resolve(process.cwd());
  
  if (!resolved.startsWith(workingDir)) {
    throw new Error(`Path escape blocked: ${requestedPath}`);
  }
  
  // Additional checks for symlinks that might escape
  const realPath = fs.realpathSync(resolved);
  if (!realPath.startsWith(workingDir)) {
    throw new Error(`Symlink escape blocked: ${requestedPath}`);
  }
  
  return resolved;
}
```

## Evidence-Based Rationale

1. **LLMs struggle with escaping/delimiters**: Research shows semantic errors and syntactic errors are the two main categories of LLM code generation failures

2. **Hallucinations less dangerous in code**: "The moment you run LLM generated code, any hallucinated methods will be instantly obvious: you'll get an error"

3. **Common destructive patterns**: LLMs can be manipulated to produce "unintended, hostile, or outright malicious output" through prompt injection

## Implementation Considerations

### Error Messages Guide Learning
```
Error: Command blocked - 'rm -rf /'
Suggestion: Use specific paths: 'rm -rf ./temp/'

Error: sed not allowed for safety
Suggestion: Use <edit> tags for file modifications
```

### Progressive Enhancement
Start minimal, log blocked attempts, expand based on actual usage:
1. Week 1-2: Core blocklist only
2. Week 3-4: Add allowlist for common operations  
3. Month 2+: Refine based on usage patterns

### Monitoring Without Privacy Violation
```javascript
// Log patterns, not content
logBlockedCommand({
  pattern: 'rm -rf',
  timestamp: Date.now(),
  // NOT the full command or file paths
});
```

## Critical Limitations

1. **Not Security**: A determined user can bypass these restrictions
2. **Learning Curve**: LLMs must adapt to restrictions through trial/error
3. **Maintenance Burden**: New dangerous patterns emerge as LLMs evolve
4. **False Positives**: Some legitimate commands will be blocked

## Success Metrics

- **Accident Prevention Rate**: % of dangerous commands blocked
- **Developer Friction**: Time spent working around restrictions
- **LLM Adaptation Speed**: Iterations needed to generate valid commands
- **False Positive Rate**: Legitimate commands incorrectly blocked

## Conclusion

This approach acknowledges that perfect safety is impossible without full containerization. Instead, it provides practical guardrails against the most common LLM failure modes while maintaining developer productivity. The system should evolve based on real-world usage patterns rather than theoretical risks.