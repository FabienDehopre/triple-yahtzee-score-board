---
name: e2e-gap-finder
description: Compares app components and user flows to existing Playwright e2e tests. Reports flows with no e2e coverage, prioritized by user impact.
---

1. Read all component files under src/app to identify user-visible flows and interactions (scored categories, dice input, game start, game over, undo, suggestions, column management, etc.)
2. Read all files under e2e/ to map what Playwright currently covers
3. Produce a gap table:

| Flow | Component | Covered? | Priority |
|------|-----------|----------|----------|

Priority scale:
- HIGH: game-critical path (scoring a cell, game completion, data persistence)
- MEDIUM: secondary interactions (undo, suggestions, multi-game)
- LOW: edge cases and error states

End with a ranked list of the top 3 flows to add e2e tests for first.
