#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const input = JSON.parse(readFileSync(0, "utf-8"));
const command = input.tool_input?.command ?? "";

if (!command.includes("git commit")) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const srcDir = join(projectDir, "src");

function hasConsoleLog(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (hasConsoleLog(full)) return true;
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      if (readFileSync(full, "utf-8").includes("console.log")) return true;
    }
  }
  return false;
}

try {
  if (hasConsoleLog(srcDir)) {
    console.log("BLOCKED: console.log found in src/. Remove before committing.");
    process.exit(1);
  }
} catch {
  // src/ missing or unreadable — allow
}
