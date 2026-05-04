# localStorage only — no backend

Game state is persisted exclusively in the browser's localStorage under the key `triple-yahtzee-state`. There is no server, no user accounts, and no cross-device sync. This is intentional, not a gap.

The app is a local scoring tool. Keeping it purely client-side eliminates backend complexity, hosting costs, and auth requirements. Data lives with the player's browser.

## Consequences

State is not recoverable if the user clears browser storage. No cross-device or cross-browser access. Any future cloud-sync feature would require a backend, auth system, and a migration path for existing localStorage data.
