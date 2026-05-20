#!/usr/bin/env node
// @ts-check

import { spawnSync } from "child_process";
import { startVitest } from "vitest/node";
import { printTestSummary } from "./helpers.mjs";

const input = JSON.parse(
  await new Promise((res) => {
    let buf = "";
    process.stdin.on("data", (d) => (buf += d));
    process.stdin.on("end", () => res(buf || "{}"));
  }),
);

if (input.stop_hook_active) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const gitStatus = spawnSync("git", ["status", "--porcelain"], {
  cwd: projectDir,
  encoding: "utf-8",
});

const modifiedFiles = (gitStatus.stdout ?? "").split("\n").filter(Boolean);
const hasTsChanges = modifiedFiles.some((line) => line.match(/\.ts$/));

if (!hasTsChanges) process.exit(0);

const vitest = await startVitest("test", [], {
  watch: false,
  root: projectDir,
  reporters: ["dot"],
});

if (!vitest) process.exit(1);

const modules = vitest.state.getTestModules();
printTestSummary(modules, projectDir);

const failed = modules.some((m) => !m.ok());

if (failed) {
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: "Unit tests are failing. Fix them before stopping.",
    }),
  );
}

process.exit(0);
