# MathGraphs

MathGraphs is a browser-based deductive puzzle game built around university-level mathematics.

## Project Structure

- `docs/`: Formal specifications (`GAME_RULES.md`, `MATH_SPEC.md`, `ARCHITECTURE.md`).
- `src/core/`: Deterministic, UI-independent mathematical validation engine.
  - `types.ts`: Domain models (assumptions, statements, tiles, slots, edges, catalogs).
  - `catalog.ts`: Pre-indexed knowledge catalog and integrity contradiction checker.
  - `validator.ts`: Pure $O(|E|)$ assignment and edge constraint validator.
  - `solver.ts`: Exhaustive permutation solver for verification and test suites.
  - `fixture.ts`: Reference linear algebra catalog and prototype 5-node puzzle.
- `tests/core/`: Vitest automated test suite.

## Running Tests Locally

### Prerequisites

Node.js (>= 18.0.0) and npm.

### Installation

```bash
npm install
```

### Running Tests and Type Checking

```bash
# Run all unit tests with Vitest
npm test

# Run TypeScript strict typecheck
npm run typecheck
```
