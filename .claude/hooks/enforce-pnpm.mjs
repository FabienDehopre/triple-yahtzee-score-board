#!/usr/bin/env node
// @ts-check

import { readFileSync } from "fs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const command = input.tool_input?.command ?? "";
const normalized = command.replace(/[\n\t]/g, " ");

const shellBoundary = /(^|&&|\|\||;|\(|`|\$\()\s*/;

if (new RegExp(shellBoundary.source + "npm\\s").test(normalized)) {
  process.stderr.write("❌ Use pnpm instead of npm in this project.\n\n");
  process.stderr.write("  npm install       → pnpm install\n");
  process.stderr.write("  npm install <pkg> → pnpm add <pkg>\n");
  process.stderr.write("  npm run <script>  → pnpm <script>\n");
  process.exit(2);
}

if (new RegExp(shellBoundary.source + "npx\\s").test(normalized)) {
  process.stderr.write("❌ Use pnpm dlx instead of npx in this project.\n\n");
  process.stderr.write("  npx <tool> → pnpm dlx <tool>\n");
  process.exit(2);
}
