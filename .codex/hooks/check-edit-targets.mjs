#!/usr/bin/env node
// @ts-check

import { readFileSync } from "fs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const filePath = input.tool_input?.file_path ?? "";
const newContent = input.tool_input?.new_string ?? input.tool_input?.content ?? "";

if (filePath.includes("pnpm-lock")) {
  console.log("BLOCKED: edit pnpm-lock.yaml via pnpm commands only");
  process.exit(2);
}

if (/\bit\.only|\bdescribe\.only|\bit\.skip|\bdescribe\.skip|\bxit\(|\bxdescribe\(/.test(newContent)) {
  console.log("BLOCKED: test-skip syntax forbidden. Delete the test or fix it.");
  process.exit(2);
}
