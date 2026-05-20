#!/usr/bin/env node
// @ts-check

import ts from 'typescript';
import { dirname } from 'node:path';
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf-8'));
const filePath = input.tool_input?.file_path ?? '';

if (!filePath.endsWith('.ts') || filePath.endsWith('.spec.ts')) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

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
