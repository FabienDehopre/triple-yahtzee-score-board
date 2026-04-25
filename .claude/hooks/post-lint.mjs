#!/usr/bin/env node
import { spawnSync } from "child_process";
import { join } from "path";

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const result = spawnSync("pnpm", ["lint"], {
  cwd: projectDir,
  encoding: "utf-8",
  shell: process.platform === "win32",
});

const output = ((result.stdout ?? "") + (result.stderr ?? "")).trimEnd();
const lines = output.split("\n");
console.log(lines.slice(-20).join("\n"));

if (result.status !== 0) process.exit(result.status ?? 1);
