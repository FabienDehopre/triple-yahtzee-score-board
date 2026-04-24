import { joinSession } from "@github/copilot-sdk/extension";

// Matches npm/npx when used as a command — after shell separators or at start of string.
// Mirrors the logic in .claude/hooks/enforce-pnpm.sh.
const NPM_RE = /(^|&&|\|\||;|\(|`|\$\()\s*npm\s/;
const NPX_RE = /(^|&&|\|\||;|\(|`|\$\()\s*npx\s/;

await joinSession({
    hooks: {
        onPreToolUse: async (input) => {
            if (input.toolName !== "bash") return;

            const command = String(input.toolArgs?.command ?? "").replaceAll(/[\n\t]/g, " ");

            if (NPM_RE.test(command)) {
                return {
                    permissionDecision: "deny",
                    permissionDecisionReason: [
                        "❌ Use pnpm instead of npm in this project.",
                        "",
                        "  npm install       → pnpm install",
                        "  npm install <pkg> → pnpm add <pkg>",
                        "  npm run <script>  → pnpm <script>",
                    ].join("\n"),
                };
            }

            if (NPX_RE.test(command)) {
                return {
                    permissionDecision: "deny",
                    permissionDecisionReason: [
                        "❌ Use pnpm dlx instead of npx in this project.",
                        "",
                        "  npx <tool> → pnpm dlx <tool>",
                    ].join("\n"),
                };
            }
        },
    },
    tools: [],
});
