#!/usr/bin/env node
// @ts-check

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

/**
 * Extract new content being written (for test-skip detection).
 * @returns {string}
 */
function getNewContent() {
  if (toolName === "createFile") return toolInput.content ?? "";
  if (toolName === "replace_string_in_file") return toolInput.newString ?? "";
  // editFiles: new content not available in PreToolUse input
  return "";
}

const filePaths = getFilePaths();
const newContent = getNewContent();

for (const filePath of filePaths) {
  if (filePath.includes("pnpm-lock")) {
    console.log("BLOCKED: edit pnpm-lock.yaml via pnpm commands only");
    process.exit(2);
  }
}

if (/\bit\.only|\bdescribe\.only|\bit\.skip|\bdescribe\.skip|\bxit\(|\bxdescribe\(/.test(newContent)) {
  console.log("BLOCKED: test-skip syntax forbidden. Delete the test or fix it.");
  process.exit(2);
}
