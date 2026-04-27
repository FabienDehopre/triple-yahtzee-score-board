#!/usr/bin/env node
// @ts-check

import { readFileSync } from "fs";
import { startVitest } from "vitest/node";
import { printTestSummary } from "./helpers.mjs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const filePath = input.tool_input?.file_path ?? "";

if (!filePath.endsWith(".spec.ts")) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const vitest = await startVitest("test", [], {
  watch: false,
  root: projectDir,
});

if (!vitest) process.exit(1);

const modules = vitest.state.getTestModules();
printTestSummary(modules, projectDir);

const failed = modules.some((m) => !m.ok());
process.exit(failed ? 1 : 0);
