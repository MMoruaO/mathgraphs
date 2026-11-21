# MathGraphs

MathGraphs is a browser-based deductive puzzle game built around university-level mathematics.

## Project Structure

- `docs/`: Specifications, project handoff, and daily-puzzle editorial workflow.
- `src/core/`: Deterministic, UI-independent mathematical validation engine.
  - `types.ts`: Domain models (assumptions, statements, tiles, slots, edges, catalogs).
  - `catalog.ts`: Pre-indexed knowledge catalog and integrity contradiction checker.
  - `validator.ts`: Pure $O(|E|)$ assignment and edge constraint validator.
  - `solver.ts`: Exhaustive permutation solver for verification and test suites.
  - `fixture.ts`: Reference linear algebra catalog and prototype 5-node puzzle.
- `src/data/`: Curated master catalog, puzzle registry, and declarative puzzle JSON.
- `src/data/dailySchedule.ts`: UTC date mapping for the temporary daily-puzzle pilot.
- `src/state/` and `src/components/`: React game state and browser interface.
- `src/components/DailyArchiveModal.tsx`: Daily challenge calendar and playable archive.
- `docs/DAILY_PUZZLE_EDITORIAL.md`: Pilot schedule, references, and content-review workflow.
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

The daily calendar is a fixed November 2026 preview with an archive, today's challenge, and five locked upcoming dates. Unreleased puzzles and catalog additions stay in the local, Git-ignored `daily-drafts/` directory and are excluded from the public app bundle. The preview is not a production publishing schedule; see `docs/DAILY_PUZZLE_EDITORIAL.md` for the manual release workflow.
