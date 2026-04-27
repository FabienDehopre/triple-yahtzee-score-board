#!/usr/bin/env node
import { spawnSync } from "child_process";
import { readFileSync } from "fs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const filePath = input.tool_input?.file_path ?? "";

if (!filePath) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const result = spawnSync(
  "pnpm",
  ["exec", "eslint", "--fix", "--pass-on-no-patterns", filePath],
  {
    cwd: projectDir,
    encoding: "utf-8",
    shell: process.platform === "win32",
  },
);

const output = ((result.stdout ?? "") + (result.stderr ?? "")).trimEnd();
if (output) console.log(output);

if (result.status !== 0) process.exit(result.status ?? 1);
