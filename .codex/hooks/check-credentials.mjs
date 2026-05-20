#!/usr/bin/env node
// @ts-check

import { readFileSync } from "fs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const filePath = input.tool_input?.file_path ?? "";

if (/auth\.json|\.env/.test(filePath)) {
  console.log("BLOCKED: credential file");
  process.exit(2);
}
