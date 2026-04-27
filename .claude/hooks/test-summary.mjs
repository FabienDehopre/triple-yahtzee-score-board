#!/usr/bin/env node
// @ts-check

import { spawnSync } from "child_process";
import { startVitest } from "vitest/node";

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

const failed = vitest.state.getTestModules().some((m) => !m.ok());
process.exit(failed ? 1 : 0);
