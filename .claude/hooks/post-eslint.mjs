#!/usr/bin/env node
// @ts-check

import { ESLint } from "eslint";
import { readFileSync } from "fs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const filePath = input.tool_input?.file_path ?? "";

if (!filePath) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const eslint = new ESLint({ fix: true, cwd: projectDir });

if (await eslint.isPathIgnored(filePath)) process.exit(0);

const results = await eslint.lintFiles([filePath]);
await ESLint.outputFixes(results);

const formatter = await eslint.loadFormatter("stylish");
const output = await formatter.format(results);
if (output) console.log(output);

const errorCount = results.reduce((n, r) => n + r.errorCount, 0);
if (errorCount > 0) process.exit(1);
