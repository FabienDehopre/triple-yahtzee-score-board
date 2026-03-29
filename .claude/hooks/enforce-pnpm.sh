#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Normalize: replace newlines/tabs with spaces so multi-line commands are handled uniformly
NORMALIZED=$(echo "$COMMAND" | tr '\n\t' '  ')

# Match npm used as a command (after start-of-string, shell separators, or subshell openers)
if echo "$NORMALIZED" | grep -qE '(^|&&|\|\||;|\(|`|\$\()\s*npm\s'; then
  echo "❌ Use pnpm instead of npm in this project." >&2
  echo "" >&2
  echo "  npm install       → pnpm install" >&2
  echo "  npm install <pkg> → pnpm add <pkg>" >&2
  echo "  npm run <script>  → pnpm <script>" >&2
  exit 2
fi

# Match npx used as a command
if echo "$NORMALIZED" | grep -qE '(^|&&|\|\||;|\(|`|\$\()\s*npx\s'; then
  echo "❌ Use pnpm dlx instead of npx in this project." >&2
  echo "" >&2
  echo "  npx <tool> → pnpm dlx <tool>" >&2
  exit 2
fi

exit 0
