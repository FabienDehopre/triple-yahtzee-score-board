#!/usr/bin/env node
/**
 * Stop hook: shows compact test summary when .ts files have uncommitted changes.
 * Skips silently if no TS changes exist (avoids running on every response).
 */
import { spawnSync } from "child_process";

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const gitStatus = spawnSync("git", ["status", "--porcelain"], {
  cwd: projectDir,
  encoding: "utf-8",
});

const modifiedFiles = (gitStatus.stdout ?? "").split("\n").filter(Boolean);
const hasTsChanges = modifiedFiles.some((line) => line.match(/\.ts$/));

if (!hasTsChanges) process.exit(0);

const result = spawnSync("pnpm", ["test", "--run", "--reporter=dot"], {
  cwd: projectDir,
  encoding: "utf-8",
  shell: process.platform === "win32",
  timeout: 30_000,
});

const output = ((result.stdout ?? "") + (result.stderr ?? "")).trim();
const lines = output.split("\n");

// Extract summary lines (Tests:, Test Files:, Duration:)
const summary = lines.filter((l) =>
  /^\s*(Tests?|Test Files?|Duration)\s*:/i.test(l),
);

console.log("\n── Test Summary " + "─".repeat(44));
if (summary.length > 0) {
  console.log(summary.join("\n"));
} else {
  // Fallback: last 5 lines
  console.log(lines.slice(-5).join("\n"));
}
