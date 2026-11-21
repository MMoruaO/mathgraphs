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
- `src/data/`: Curated master catalog, puzzle registry, and declarative puzzle JSON.
- `src/state/` and `src/components/`: React game state and browser interface.
- `src/i18n.ts`: Spanish/English interface strings and language preference helpers.
- `tests/`: Vitest core/data/state tests and Playwright browser interaction tests.

## Running Tests Locally

### Prerequisites

Node.js (>= 18.0.0) and npm.

### Installation

```bash
npm install
```

### Running Tests, Browser Checks, and Type Checking

```bash
# Run all unit tests with Vitest
npm test

# Run browser interaction tests with Playwright (Chromium)
npm run test:e2e

# Run TypeScript strict typecheck
npm run typecheck

# Run the production build
npm run build
```

Vitest excludes `tests/e2e/`; Playwright uses `playwright.config.ts` and starts a local Vite server.
The interface and puzzle explanations are available in Spanish and English; the selected language is saved in browser storage.
