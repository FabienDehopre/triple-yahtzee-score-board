#!/usr/bin/env node
// @ts-check

import { readFileSync } from "fs";

const input = JSON.parse(readFileSync(0, "utf-8"));

// Matcher: only act on read/write/edit tools
const FILE_TOOLS = new Set(["readFiles", "editFiles", "createFile", "replace_string_in_file"]);
if (!FILE_TOOLS.has(input.tool_name)) process.exit(0);

const toolName = input.tool_name;
const toolInput = input.tool_input ?? {};

/**
 * Extract all file paths from the tool input depending on the tool.
 * @returns {string[]}
 */
function getFilePaths() {
  if (toolName === "readFiles" || toolName === "editFiles") {
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

for (const filePath of getFilePaths()) {
  if (/auth\.json|\.env/.test(filePath)) {
    console.log("BLOCKED: credential file");
    process.exit(2);
  }
}
