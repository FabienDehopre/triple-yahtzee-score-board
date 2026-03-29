#!/usr/bin/env node

const chunks = [];

process.stdin.on('data', (chunk) => {
  chunks.push(chunk);
});

process.stdin.on('end', () => {
  let payload;

  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    process.exit(0);
  }

  const details = getCommandDetails(payload);

  if (!details) {
    process.exit(0);
  }

  const violations = findViolations(details);

  if (violations.length === 0) {
    process.exit(0);
  }

  const uniqueViolations = Array.from(new Set(violations));
  const replacements = uniqueViolations.map((token) => {
    if (token === 'npx') {
      return 'replace npx with pnpm dlx';
    }

    return 'replace npm with pnpm';
  });

  const reason = `This workspace uses pnpm only: ${replacements.join(' and ')}.`;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
        additionalContext:
          'Use pnpm for package commands in this repository. Use pnpm dlx when you would normally run npx.'
      }
    })
  );
});

function getCommandDetails(payload) {
  const candidates = [];

  pushCommandCandidate(candidates, payload?.tool_input?.command);
  pushCommandCandidate(candidates, payload?.tool_input?.task?.command);

  pushArgCandidates(candidates, payload?.tool_input?.args);
  pushArgCandidates(candidates, payload?.tool_input?.task?.args);

  if (candidates.length === 0) {
    return null;
  }

  return candidates;
}

function pushCommandCandidate(candidates, value) {
  if (typeof value === 'string' && value.trim().length > 0) {
    candidates.push(value);
  }
}

function pushArgCandidates(candidates, value) {
  if (!Array.isArray(value)) {
    return;
  }

  for (const item of value) {
    if (typeof item === 'string' && item.trim().length > 0) {
      candidates.push(item);
    }
  }
}

// Matches npm/npx only when used as a command: at the start of a string, after shell
// separators (&&, ||, ;) or subshell openers ((, `, $(), preceded by optional whitespace.
// This avoids false positives for commands like `grep npm package.json`.
const COMMAND_PATTERN = /(?:^|&&|\|\||;|\(|`|\$\()\s*(npm|npx)\s/;

function findViolations(candidates) {
  const violations = [];

  for (const candidate of candidates) {
    // Normalize newlines/tabs so multi-line commands are handled uniformly
    const normalized = candidate.replace(/[\n\t]/g, ' ');
    const match = normalized.match(COMMAND_PATTERN);

    if (match) {
      violations.push(match[1].toLowerCase());
    }
  }

  return violations;
}