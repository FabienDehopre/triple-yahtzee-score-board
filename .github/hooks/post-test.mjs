#!/usr/bin/env node
// @ts-check

import { readFileSync } from "fs";
import { startVitest } from "vitest/node";
import { printTestSummary } from "./helpers.mjs";

const input = JSON.parse(readFileSync(0, "utf-8"));

// Matcher: only act on write/edit tools
const WRITE_TOOLS = new Set(["editFiles", "createFile", "replace_string_in_file"]);
if (!WRITE_TOOLS.has(input.tool_name)) process.exit(0);

const toolName = input.tool_name;
const toolInput = input.tool_input ?? {};

/**
 * Extract all file paths from the tool input depending on the tool.
 * @returns {string[]}
 */
function getFilePaths() {
  if (toolName === "editFiles") {
    return Array.isArray(toolInput.files) ? toolInput.files : [];
  }
  if (toolName === "createFile") {
    return toolInput.path ? [toolInput.path] : [];
  }
  if (toolName === "replace_string_in_file") {
    return toolInput.filePath ? [toolInput.filePath] : [];
  }
  return [];
}

const filePaths = getFilePaths();
const hasSpecFile = filePaths.some((f) => f.endsWith(".spec.ts"));
if (!hasSpecFile) process.exit(0);

const projectDir = input.cwd ?? process.cwd();

const vitest = await startVitest("test", [], {
  watch: false,
  root: projectDir,
});

if (!vitest) process.exit(1);

const modules = vitest.state.getTestModules();
printTestSummary(modules, projectDir);

const failed = modules.some((m) => !m.ok());
process.exit(failed ? 1 : 0);
