# FLEET Experiment

The ForgeGrid experiment is a distributed implementation exercise that operates from a single public repository named `Eleven-Realms`.

## Purpose

Create a small but real distributed-development signal where workers implement one slice of a shared HTML Canvas game. The target is intentionally simple enough to test the discipline of parallel integration.

## Mission Success Criterion

The repository must contain:

- a Vite + TypeScript + Canvas baseline,
- `FORGEGRID.md` with contract and workflow guidance,
- mission files for `round-001` and `round-002-review`,
- a working GitHub Actions workflow,
- a deterministic tick and RNG scaffold,
- a minimal playable canvas grid and UI.

## Metrics

- Install command: `npm install`
- Test command: `npm test`
- Typecheck command: `npm run typecheck`
- Build command: `npm run build`
- CI badge: expected to turn green on the default branch.

## Review Theory

Every statement in the experiment must point to an artifact: tests, source files, generated logs, or CI outputs. Speculative claims are not accepted as evidence.
