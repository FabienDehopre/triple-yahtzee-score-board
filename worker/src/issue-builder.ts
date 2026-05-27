import type { ReportPayload } from './schema';

/** Builds the Markdown body for a GitHub issue from a validated report payload. */
export function buildIssueBody(payload: ReportPayload): string {
  const label = payload.type === 'bug' ? '🐛 Bug Report' : '✨ Enhancement Request';
  const contact = payload.contact ? `\n**Contact:** ${payload.contact}` : '';
  const gameState = payload.gameState
    ? `\n\n<details>\n<summary>Game state snapshot</summary>\n\n\`\`\`json\n${JSON.stringify(payload.gameState, undefined, 2)}\n\`\`\`\n</details>`
    : '';

  return `## ${label}${contact}

${payload.description}${gameState}

---
*Submitted via in-app report.*`;
}

/** Derives a GitHub issue title with type prefix. */
export function buildIssueTitle(payload: ReportPayload): string {
  const prefix = payload.type === 'bug' ? '[Bug]' : '[Enhancement]';
  return `${prefix} ${payload.title}`;
}
