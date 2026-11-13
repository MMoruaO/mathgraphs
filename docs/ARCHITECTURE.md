# MathGraphs — System Architecture (`ARCHITECTURE.md`)

## 1. Architectural Philosophy and Constraints

MathGraphs is architected as an offline-first, client-rendered static web application:
- **Zero Runtime Backend:** All game logic, state transitions, KaTeX rendering, and validation run purely in the browser.
- **Strict Separation of Concerns:** The core validation engine is completely decoupled from UI rendering, browser events, DOM APIs, and graph visualization libraries.
- **Declarative and Deterministic:** State flows unidirectionally. Mathematical evaluations are pure functions of the board assignment and the knowledge catalog.

---

## 2. Technology Stack

| Layer | Chosen Technology | Rationale |
|---|---|---|
| **Build & Tooling** | Vite + TypeScript | Instant HMR, strict type checking, minimal bundle overhead. |
| **UI Framework** | React 18+ | Declarative component tree, stable ecosystem. |
| **Mathematical Typesetting** | KaTeX | High performance, pure CSS/HTML output, zero network dependency at runtime. |
| **Graph Visualization** | React Flow (`@xyflow/react`) | Declarative node/edge rendering, customizable nodes, responsive viewport. |
| **Test Suite** | Vitest | Fast execution, compatible with Vite TypeScript config, pure headless unit testing. |
| **Hosting & CI/CD** | Cloudflare Pages + GitHub Actions | Free global edge CDN, zero maintenance cost, static bundle hosting. |

---

## 3. Layered Architecture

```
┌────────────────────────────────────────────────────────┐
│                   UI Layer (React)                     │
│  - App.tsx, Layout, Controls (Check, Reset, Undo)      │
│  - GraphView (@xyflow/react canvas)                    │
│  - StatementNode (KaTeX math display + selection halo) │
└──────────────────────────┬─────────────────────────────┘
                           │ Dispatches actions (swap, check, reset, undo)
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Game State Layer                      │
│  - useGameState hook: tracks current slot assignment,  │
│    selection state, history stack, validation status.  │
└──────────────────────────┬─────────────────────────────┘
                           │ Invokes pure validator
                           ▼
┌────────────────────────────────────────────────────────┐
│             Core Mathematical Engine (Pure TS)         │
│  - validator.ts: evaluates assignment against catalog  │
│  - solver.ts: exhaustively checks valid permutations   │
│  - types.ts: formal TypeScript domain interfaces       │
└──────────────────────────┬─────────────────────────────┘
                           │ Consumes static data
                           ▼
┌────────────────────────────────────────────────────────┐
│           Data & Knowledge Catalog Layer (JSON/TS)     │
│  - Curated relations, statements, hypotheses           │
│  - Puzzle definition schemas and fixtures              │
└────────────────────────────────────────────────────────┘
```

### Module Boundaries:
- `src/core/`: Contains **zero imports** from `react`, `react-dom`, `@xyflow/react`, or `katex`. Can be executed in pure Node.js/Vitest or shared with future CLI tools.
- `src/components/`: Responsible only for rendering and capturing click interactions.
- `src/state/`: Encapsulates board history for undo/reset and holds the latest `PuzzleValidationResult`.

---

## 4. Repository Structure

Standardized, non-monorepo structure for MVP:

```text
mathgraphs/
├── AGENTS.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── GAME_RULES.md
│   └── MATH_SPEC.md
├── src/
│   ├── core/                  # Pure TypeScript Engine
│   │   ├── types.ts           # Shared data interfaces
│   │   ├── validator.ts       # Deterministic constraint checker
│   │   ├── solver.ts          # Permutation solver for test verification
│   │   └── catalog.ts         # Curated domain knowledge
│   ├── data/
│   │   └── puzzles/           # Declarative JSON puzzles
│   │       └── linear-algebra-01.json
│   ├── state/
│   │   └── useGameState.ts    # React hook managing board state & undo history
│   ├── components/            # React UI components
│   │   ├── GraphBoard.tsx     # XYFlow canvas wrapper
│   │   ├── StatementNode.tsx  # Custom React Flow node with KaTeX
│   │   ├── MathRenderer.tsx   # Isolated KaTeX component
│   │   ├── GameControls.tsx   # Buttons: Check, Undo, Reset
│   │   └── FeedbackModal.tsx  # Victory / validation summary dialog
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── core/
│   │   ├── validator.test.ts  # Verification of edge evaluation and hypotheses
│   │   ├── solver.test.ts     # Proof that linear-algebra-01 has valid solution(s)
│   │   └── catalog.test.ts    # Integrity of semantic IDs and assumptions
│   └── fixtures/
│       └── test-catalog.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 5. Data Flow and Interaction Lifecycle

1. **Initialization:**
   - `App.tsx` loads `linear-algebra-01.json`.
   - `useGameState` initializes:
     - `assignment`: initial mapping `{ slotId: statementId }`.
     - `history`: `[initialAssignment]`.
     - `selectedSlotId`: `null`.
     - `validationResult`: `null`.
2. **Player Interaction (Click-to-Swap):**
   - Click on Slot $A$ $\to$ `selectedSlotId = "slot_A"`. UI renders selected outline.
   - Click on Slot $B$ $\to$ Swap values of Slot $A$ and Slot $B$.
   - Push new assignment to `history`.
   - Clear `selectedSlotId`.
   - If prior `validationResult` existed, invalidate or mark as stale.
3. **Validation Request ("Check"):**
   - Player clicks "Check".
   - `useGameState` invokes `validatePuzzle(puzzleDef, currentAssignment, catalog)`.
   - `validator.ts` iterates over all puzzle edges, evaluates against `catalog` and `puzzle.context.assumptions`, and returns `PuzzleValidationResult`.
   - React components update edge colors/badges:
     - `verified` $\to$ Green
     - `not_verified` $\to$ Amber / Dashed
     - `invalid` $\to$ Red
     - `incomplete` $\to$ Muted Grey
   - If `isSolved === true`, trigger `FeedbackModal`.
4. **Undo / Reset:**
   - Undo pops the top of `history` stack and sets `assignment = history.peek()`.
   - Reset restores `history[0]`, clearing selection and validation results.

---

## 6. Testing Strategy

1. **Pure Core Tests (`tests/core/validator.test.ts`):**
   - Verify directed edge validation: $A \implies B$ is `verified`, $B \implies A$ evaluates to `not_verified` (or `invalid` if refuted).
   - Verify symmetric edges ($A \iff B$ and $B \iff A$ both evaluate to `verified`).
   - Verify assumption filtering: an entry requiring `square_matrix_complex` fails when the puzzle context only specifies `square_matrix_real`.
   - Verify incomplete board detection.
2. **Catalog Integrity Tests (`tests/core/catalog.test.ts`):**
   - Check that every statement referenced in relations exists in `catalog.statements`.
   - Check that every required assumption is defined in `catalog.assumptions`.
3. **Solver & Solution Uniqueness Tests (`tests/core/solver.test.ts`):**
   - Compute all valid assignments for `linear-algebra-01.json`.
   - Assert that the number of solutions $\ge 1$.
   - Record and assert the uniqueness of the solution.

---

## 7. Deferred Infrastructure and Future Extensibility

- **Future Python Puzzle Pipeline:** Will output JSON conforming directly to `PuzzleDefinition` and `KnowledgeCatalog` schemas.
- **Backend / Cloud Persistence:** Not required for MVP. Local storage will suffice for post-MVP progress saving.
- **Analytics, Ads, and Accounts:** Strictly deferred.
