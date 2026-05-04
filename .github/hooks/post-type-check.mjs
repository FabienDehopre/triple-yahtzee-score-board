#!/usr/bin/env node
// @ts-check

import ts from 'typescript';
import { dirname } from 'node:path';
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf-8'));

// Matcher: only act on write/edit tools
const WRITE_TOOLS = new Set(['editFiles', 'createFile', 'replace_string_in_file']);
if (!WRITE_TOOLS.has(input.tool_name)) process.exit(0);

const toolName = input.tool_name;
const toolInput = input.tool_input ?? {};

/**
 * Extract all file paths from the tool input depending on the tool.
 * @returns {string[]}
 */
function getFilePaths() {
  if (toolName === 'editFiles') {
    return Array.isArray(toolInput.files) ? toolInput.files : [];
  }
  if (toolName === 'createFile') {
    return toolInput.path ? [toolInput.path] : [];
  }
  if (toolName === 'replace_string_in_file') {
    return toolInput.filePath ? [toolInput.filePath] : [];
  }
  return [];
}

const filePaths = getFilePaths();
// Only run type-check if at least one .ts (non-spec) file was touched
const hasTsFile = filePaths.some((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'));
if (!hasTsFile) process.exit(0);

const projectDir = input.cwd ?? process.cwd();

const formatHost = {
  getCanonicalFileName: (f) => (ts.sys.useCaseSensitiveFileNames ? f : f.toLowerCase()),
  getCurrentDirectory: () => projectDir,
  getNewLine: () => ts.sys.newLine,
};

const configPath = ts.findConfigFile(projectDir, ts.sys.fileExists, 'tsconfig.json');
if (!configPath) {
  console.error('Could not find tsconfig.json in', projectDir);
  process.exit(2);
}

const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
if (readResult.error) {
  ts.sys.write(ts.formatDiagnosticsWithColorAndContext([readResult.error], formatHost));
  process.exit(1);
}

const parsed = ts.parseJsonConfigFileContent(
  readResult.config,
  ts.sys,
  dirname(configPath),
  undefined,
  configPath,
);
if (parsed.errors.length > 0) {
  ts.sys.write(ts.formatDiagnosticsWithColorAndContext(parsed.errors, formatHost));
  process.exit(1);
}

const program = ts.createProgram({
  rootNames: parsed.fileNames,
  options: { ...parsed.options, noEmit: true },
  projectReferences: parsed.projectReferences,
});

const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length > 0) {
  ts.sys.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
}

const hasErrors = diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error);
process.exit(hasErrors ? 2 : 0);
