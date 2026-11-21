# MathGraphs — System Architecture (`ARCHITECTURE.md`)

## 1. Architectural Philosophy and Constraints

MathGraphs is architected as an offline-first, client-rendered static web application:
- **Zero Runtime Backend:** All game logic, state transitions, KaTeX rendering, and validation run purely in the browser.
- **Strict Separation of Concerns:** The core validation engine is completely decoupled from UI rendering, browser events, DOM APIs, and graph visualization libraries.
- **Declarative and Deterministic:** State flows unidirectionally. Mathematical evaluations are pure functions of the board assignment, the puzzle hypotheses, and the knowledge catalog.

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

## 3. Layered Architecture and Performance Guarantees

```
┌────────────────────────────────────────────────────────┐
│                   UI Layer (React)                     │
│  - App.tsx, puzzle selector, language switch, controls  │
│    (Check/Reset/Undo)                                   │
│  - GraphView (@xyflow/react canvas)                    │
│  - StatementNode (KaTeX math display + selection halo) │
└──────────────────────────┬─────────────────────────────┘
                           │ Dispatches actions (swap, check, reset, undo)
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Game State Layer                      │
│  - useGameState hook: tracks current slot assignment,  │
│    selection state, history stack, validation status.  │
│  - Enforces Bijection Invariant: \sigma: V -> T        │
└──────────────────────────┬─────────────────────────────┘
                           │ Invokes pure validator
                           ▼
┌────────────────────────────────────────────────────────┐
│             Core Mathematical Engine (Pure TS)         │
│  - validator.ts: evaluates assignment against catalog  │
│    (O(|E|) complexity via indexed HashMaps)            │
│  - solver.ts: exhaustively checks valid permutations   │
│  - types.ts: formal TypeScript domain interfaces       │
└──────────────────────────┬─────────────────────────────┘
                           │ Consumes indexed catalog
                           ▼
┌────────────────────────────────────────────────────────┐
│           Data & Knowledge Catalog Layer (JSON/TS)     │
│  - Puzzle registry, curated relations, statements,      │
│    hypotheses, bilingual content, and puzzle JSON       │
│  - Pre-indexed lookup maps: (rel, src, tgt) -> Record  │
│  - Integrity validator: detects contradictory entries  │
└────────────────────────────────────────────────────────┘
```

### Module Boundaries and Performance Guarantees:
- `src/core/`: Contains **zero imports** from `react`, `react-dom`, `@xyflow/react`, or `katex`.
- **Validation Complexity:** Edge relation lookup is $\mathcal{O}(1)$ through pre-indexed composite HashMaps. Full validation, including puzzle schema and assignment checks, is $\mathcal{O}(|V| + |E| + |T|)$:
  $$\text{Key} = `${relation}:${sourceStatementId}:${targetStatementId}`$$
  Linear scanning of arrays ($\mathcal{O}(|E| \cdot |\mathcal{K}|)$) is explicitly avoided.
- **Catalog Integrity Check:** Upon initialization, the catalog verifies that no pair of statements has both a `VerifiedRelation` and a `RefutedRelation` active under compatible hypotheses.

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
│   ├── core/                  # Pure TypeScript Engine (Independent of UI)
│   │   ├── types.ts           # Shared data interfaces (Assumptions, Tiles, Slots, Edges)
│   │   ├── catalog.ts         # Curated domain knowledge and indexing logic
│   │   ├── validator.ts       # Deterministic O(|E|) constraint checker
│   │   └── solver.ts          # Permutation solver for test verification
│   ├── data/
│   │   ├── masterCatalog.ts  # Shared assumptions, statements, relations
│   │   ├── puzzleRegistry.ts # Puzzle lookup and default selection
│   │   └── puzzles/          # Declarative JSON puzzle definitions
│   ├── state/
│   │   └── useGameState.ts    # React hook managing board state, bijection & undo history
│   ├── components/            # React UI components
│   │   ├── GraphBoard.tsx     # XYFlow canvas wrapper
│   │   ├── StatementNode.tsx  # Custom React Flow node with KaTeX
│   │   ├── MathRenderer.tsx   # Isolated KaTeX component
│   │   ├── GameControls.tsx   # Buttons: Check, Undo, Reset
│   │   ├── VictoryModal.tsx   # Success summary and puzzle progression
│   │   └── LevelSelectorModal.tsx # Puzzle library and switching
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── core/
│   │   ├── validator.test.ts  # Verification of edge evaluation and hypotheses
│   │   ├── solver.test.ts     # Verification of solutions and alternative configurations
│   │   └── catalog.test.ts    # Integrity check and contradiction detection
│   ├── data/                  # Puzzle schema and solution-count tests
│   ├── state/                 # Game-state hook tests
│   └── e2e/                   # Playwright browser interaction tests
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 5. Data Flow and Interaction Lifecycle

1. **Initialization and puzzle selection:**
   - `App.tsx` loads the default definition from `puzzleRegistry.ts`.
   - `useGameState` initializes the assignment and resets its counters, history, and validation state whenever a different puzzle is selected.
   - Initializes history stack `[initialAssignment]`, `selectedSlotId = null`, `validationResult = null`.
2. **Player Interaction (Click-to-Swap):**
   - Click on Slot $A$ $\to$ `selectedSlotId = "slot_A"`. UI renders selected halo.
   - Click on Slot $B$ $\to$ Swap tile assignments of Slot $A$ and Slot $B$.
   - Preserves bijection: every slot contains exactly one valid tile.
   - Pushes new assignment to `history`.
   - Clears `selectedSlotId` and invalidates any stale `validationResult`.
3. **Validation Request ("Check"):**
   - Player clicks "Check".
   - `useGameState` invokes `validatePuzzle(puzzleDef, currentAssignment, indexedCatalog)`.
   - `validator.ts` checks the bijection invariants and evaluates each edge in $\mathcal{O}(1)$ via index.
   - Returns `PuzzleValidationResult` with statuses (`verified`, `not_verified`, `invalid`, `incomplete`).
   - UI updates edge visual styling (green / amber / red / grey).
   - If all invariants pass and all edges are `verified`, trigger `FeedbackModal`.
4. **Undo / Reset:**
   - Undo pops the top of `history` stack and restores previous assignment $\sigma_{k-1}$.
   - Reset restores `history[0]`, clearing selection and validation results.

---

## 6. Testing Strategy

1. **Core Validator Tests (`tests/core/validator.test.ts`):**
   - Verify directed edge validation: $P_1 \implies P_2$ is `verified`, while $P_2 \implies P_1$ evaluates to `invalid` (backed by explicit nilpotence counterexample).
   - Verify symmetric edges: $P_1 \iff P_5$ evaluates to `verified` in both directions.
   - Verify hypothesis closure: theorems requiring complex field or invertibility fail under real singular matrix context.
   - Verify incomplete and non-bijective assignments.
2. **Catalog Integrity Tests (`tests/core/catalog.test.ts`):**
   - Assert that no contradiction exists between `relations` and `refutations`.
   - Assert all assumption references resolve within the assumption hierarchy.
3. **Solver & Solution Multiplicity Tests (`tests/core/solver.test.ts`):**
   - Run permutation solver on `linear-algebra-01.json`.
   - Assert that candidate puzzle has $\ge 1$ solution.
   - Enumerate and document all valid permutations (e.g., verifying the predicted 12 symmetric solutions).
4. **Puzzle Data Tests (`tests/data/`):**
   - Validate registered puzzle definitions, confirm solvability, and assert reviewed solution counts where catalog coverage is complete.
5. **Browser Interaction Tests (`tests/e2e/`):**
   - Run separately with Playwright to verify mouse and keyboard selection, swapping, validation feedback, victory, and puzzle switching.

---

## 7. Deferred Infrastructure and Future Extensibility

- **Multi-Premise Constraints:** Hyperedges or multi-antecedent constraint models are documented in `MATH_SPEC.md` Section 4 and deferred for post-MVP.
- **Python Generation Tooling:** Offline generator will emit JSON adhering directly to `PuzzleDefinition` schema.
- **Persistence, Accounts, and Monetization:** Strictly out of scope for MVP.
