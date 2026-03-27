#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Check if the command starts with "npm" (as a command, not just mentioned in a string)
if echo "$COMMAND" | grep -qE '(^|&&|\|\||;)\s*npm\s'; then
  echo "❌ Use pnpm instead of npm in this project." >&2
  echo "" >&2
  echo "  npm install       → pnpm install" >&2
  echo "  npm install <pkg> → pnpm add <pkg>" >&2
  echo "  npm run <script>  → pnpm <script>" >&2
  exit 2
fi

# Check if the command starts with "npx" (as a command, not just mentioned in a string)
if echo "$COMMAND" | grep -qE '(^|&&|\|\||;)\s*npx\s'; then
  echo "❌ Use pnpm dlx instead of npx in this project." >&2
  echo "" >&2
  echo "  npx <tool> → pnpm dlx <tool>" >&2
  exit 2
fi

exit 0
