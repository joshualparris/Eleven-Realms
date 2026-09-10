# ForgeGrid Foundation

ForgeGrid is a distributed development target for an eleven-agent collaborative build.

## Mission

Create a minimal playable HTML Canvas project with clear contracts and strong evidence-based review rules. Keep the implementation intentionally small so that work can be split across eleven independent agent units without creating a brittle central coordinator.

## Lifecycle

1. Seed the shared repo with a Vite + TypeScript + Canvas + Vitest baseline.
2. Publish mission files describing eleven parallel implementation tracks.
3. Execute missions independently, keeping all artifacts reviewable.
4. Hold a review round with evidence requirements and deterministic checks.
5. Use CI to enforce install, test, typecheck, and build success.

## Rules

- No hidden coordination files.
- Contracts live in `src/core` and feature modules should import from them.
- Canvas rendering and game logic must remain deterministic when seeded.
- Review must use artifacts, tests, and evidence instead of hand-wavy claims.
- Every implemented feature must carry a simple test or validation hook.
