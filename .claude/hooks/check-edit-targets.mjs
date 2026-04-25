#!/usr/bin/env node
import { readFileSync } from "fs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const filePath = input.tool_input?.file_path ?? "";
const newContent = input.tool_input?.new_string ?? input.tool_input?.content ?? "";

if (filePath.includes("pnpm-lock")) {
  console.log("BLOCKED: edit pnpm-lock.yaml via pnpm commands only");
  process.exit(1);
}

if (/it\.only|describe\.only|it\.skip|describe\.skip|xit\(|xdescribe\(/.test(newContent)) {
  console.log("BLOCKED: test-skip syntax forbidden. Delete the test or fix it.");
  process.exit(1);
}
