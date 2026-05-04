#!/usr/bin/env node
// @ts-check

import { ESLint } from "eslint";
import { readFileSync } from "fs";

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
if (filePaths.length === 0) process.exit(0);

const projectDir = input.cwd ?? process.cwd();
const eslint = new ESLint({ fix: true, cwd: projectDir });

let totalErrors = 0;

for (const filePath of filePaths) {
  if (await eslint.isPathIgnored(filePath)) continue;

  const results = await eslint.lintFiles([filePath]);
  await ESLint.outputFixes(results);

  const formatter = await eslint.loadFormatter("stylish");
  const output = await formatter.format(results);
  if (output) console.log(output);

  totalErrors += results.reduce((n, r) => n + r.errorCount, 0);
}

if (totalErrors > 0) process.exit(1);
