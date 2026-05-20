// @ts-check

import { relative } from "path";

/**
 * @param {import('vitest/node').TestCollection} children
 * @returns {{ passed: number, failed: number, skipped: number }}
 */
export function collectCounts(children) {
  let passed = 0,
    failed = 0,
    skipped = 0;
  for (const task of children) {
    if (task.type === "test") {
      const state = task.result()?.state;
      if (state === "passed") passed++;
      else if (state === "failed") failed++;
      else skipped++;
    } else if (task.type === "suite" && task.children) {
      const c = collectCounts(task.children);
      passed += c.passed;
      failed += c.failed;
      skipped += c.skipped;
    }
  }
  return { passed, failed, skipped };
}

/**
 * @param {import('vitest/node').TestModule[]} modules
 * @param {string} projectDir
 */
export function printTestSummary(modules, projectDir) {
  let passed = 0,
    failed = 0,
    skipped = 0;
  /** @type {string[]} */
  const failedPaths = [];

  for (const m of modules) {
    const counts = collectCounts(m.children);
    passed += counts.passed;
    failed += counts.failed;
    skipped += counts.skipped;
    if (!m.ok()) failedPaths.push(relative(projectDir, m.moduleId));
  }

  const total = passed + failed + skipped;
  const skipPart = skipped > 0 ? `, ${skipped} skipped` : "";
  console.log(`\nTest Summary: ${passed} passed, ${failed} failed${skipPart} (${total} total)`);

  for (const p of failedPaths) {
    console.log(`  ✗ ${p}`);
  }
}
