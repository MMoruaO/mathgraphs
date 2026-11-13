# MathGraphs — Gameplay Rules Specification (`GAME_RULES.md`)

## 1. Game Objective

MathGraphs is a deductive puzzle game based on university-level mathematics. The player's goal is to arrange a given set of mathematical statement tiles onto fixed positions (slots) of a graph such that all mathematical constraints defined by the graph's edges are simultaneously satisfied under the puzzle's explicit global hypotheses.

The game emphasizes logical reasoning, conceptual connection, and deduction rather than arithmetic calculation or memorization.

---

## 2. Board Structure

### 2.1 Graph Layout
- The puzzle board is represented as a static graph $G = (V, E)$, where:
  - $V$ is a finite set of fixed board positions (**Slots**).
  - $E$ is a finite set of constrained relationships (**Edges**).
- Positions on the board are geometric coordinates $(x, y)$ that remain stationary during gameplay. Players do not add, remove, or rewire edges or slots.

### 2.2 Distinction: Global Context vs. Movable Statements vs. Tiles
To preserve absolute mathematical integrity, we strictly separate three levels of concepts:
1. **Global Context / Assumptions ($\mathcal{H}$):** Immutable ambient mathematical hypotheses established for the entire puzzle (e.g., $A \in M_n(\mathbb{R}), n \ge 1$). They define the universe of discourse. They are *never* movable tiles.
2. **Mathematical Statements ($S$):** Abstract propositions or properties within the mathematical universe (e.g., $P_1: A^2 = A$, $P_2: \sigma(A) \subseteq \{0, 1\}$).
3. **Tiles ($t \in T$):** Physical/visual tokens on the board. Each tile references a statement ID (`statementId`), rendered via KaTeX. 
   - A single puzzle may have multiple tiles displaying the same mathematical statement if intended by design (each having a distinct `tileId`), although in standard puzzles there is a 1-to-1 correspondence.
4. **Slots ($s \in V$):** Fixed board positions. Each slot holds at most one tile at any time.

### 2.3 Edges and Relations
Edges connect ordered pairs of slots $(u, v)$ and are annotated with a mathematical relation $R$:
- **Directed Edges:** Represent asymmetric relations such as logical implication ($\implies$), set membership ($\in$), or proper subset inclusion ($\subset$). The direction strictly identifies the antecedent/source slot ($u$) and the consequent/target slot ($v$). An edge $u \implies v$ asserting $P \implies Q$ requires that $P \implies Q$ holds universally for *all* mathematical objects satisfying the global context $\mathcal{H}$.
- **Undirected Edges:** Represent symmetric relations such as logical equivalence ($\iff$), algebraic equality ($=$), or isomorphism ($\cong$). The constraint holds symmetrically: evaluating from $u$ to $v$ is semantically identical to evaluating from $v$ to $u$.

---

## 3. Player Actions and Interactions

### 3.1 Click-to-Swap Interaction (Approved for MVP)
To ensure full accessibility across desktop (mouse) and mobile/tablet (touch), the primary interaction mechanic is **click-to-swap**:
1. The player clicks/taps an initial slot $s_1$ containing tile $t_1$. Slot $s_1$ becomes visually **selected** (highlighted state).
2. The player clicks/taps a target slot $s_2$ containing tile $t_2$:
   - If $s_2 \neq s_1$, the tiles are swapped: $s_1$ now holds $t_2$, and $s_2$ holds $t_1$. The selection clears.
   - If $s_2 = s_1$, the selection is cancelled (deselected).
3. Clicking on empty space deselects the current slot.
4. *Drag-and-drop* is explicitly deferred for post-MVP enhancements.

### 3.2 State Management: Undo and Reset
- **Undo Move:**
  - The game state maintains a history stack of board assignments $\sigma_0, \sigma_1, \dots, \sigma_k$, where each $\sigma$ is a bijective mapping $\sigma: V \to T$.
  - Executing "Undo" reverts the board assignment to $\sigma_{k-1}$ and decrements the move counter.
  - The undo operation is strictly a game-state rollback; it performs no mathematical evaluation.
- **Reset Board:**
  - Reverts the entire board assignment to the canonical initial configuration $\sigma_0$.
  - Clears any active validation feedback and resets the undo stack.

---

## 4. Validation and Feedback Mechanics

### 4.1 Manual Validation ("Check" Button)
- The game **does not** automatically reveal whether an edge is satisfied after every tile swap.
- Validation is triggered explicitly when the player activates the **Check** (or "Verificar") button.
- This prevents brute-force trial-and-error solving and encourages deliberate mathematical deduction.

### 4.2 Multi-State Validation Outcomes
When the player requests validation, each edge $e = (u, v, R)$ is evaluated against the puzzle's explicit global hypotheses $\mathcal{H}$ and the curated mathematical catalog $\mathcal{K}$. To maintain mathematical integrity without claiming omniscience:
1. **Verified (`verified`):** The relationship is explicitly confirmed by the curated catalog (or direct symmetry) under hypotheses $\mathcal{H}$. Visualized with an affirmative indicator (e.g., green tint / check icon).
2. **Not Verified (`not_verified`):** The relationship is not present in the catalog under hypotheses $\mathcal{H}$. **The interface must not present this as definitively false or refuted**, but rather as "Unverified / Not established in catalog". Visualized with a neutral/warning indicator (e.g., amber tint or subtle dashed state).
3. **Refuted / Invalid (`invalid`):** The relationship is known to be false by an explicit counterexample or recorded refutation in the catalog that is valid within context $\mathcal{H}$. Visualized with a distinct negative indicator (e.g., red tint).
4. **Incomplete (`incomplete`):** One or both incident slots $(u, v)$ do not contain a tile.

### 4.3 Puzzle Assignment Invariants and Victory Condition
A puzzle state is defined as an assignment mapping $\sigma: V \to T$.

#### Strict Board Invariants for Victory:
1. **Bijection:** The assignment $\sigma$ is a valid bijection between the set of slots $V$ and the set of puzzle tiles $T$ ($|\sigma| = |V| = |T|$).
2. **Slot Occupancy:** Every slot $s \in V$ contains exactly one tile.
3. **Tile Consistency:** Every tile $t \in T$ is assigned to exactly one slot (no duplicate placements, no unassigned tiles).
4. **Valid Identifiers:** No unknown tile IDs or statement IDs are present on the board.
5. **Constraint Satisfaction:** Every edge constraint $e \in E$ evaluates to `verified`.
6. **Zero Non-Compliance:** No edge evaluates to `invalid`, `not_verified`, or `incomplete`.

A puzzle is declared **Solved** (`SOLVED`) if and only if all six invariants are simultaneously satisfied. Upon solving, the player is presented with a success notification, move statistics (total swaps, checks performed), and optional explanations for the mathematical deductions.

---

## 5. Handling Alternative Solutions

A puzzle is defined by its mathematical constraints, **not by an author-mandated target permutation**.
- If two mathematical statements are logically equivalent or satisfy the edge constraints identically in symmetric positions, any assignment $\sigma$ where all assignment invariants hold and 100% of the edges are `verified` is an authentic winning solution.
- The system must celebrate and accept alternative solutions without penalizing the player.
- The solver must analyze candidate puzzles prior to publication to report whether alternative valid configurations exist.

---

## 6. MVP Scope and Guardrails

### Included in MVP:
- Exactly one fixed linear algebra graph puzzle (4–5 nodes) focusing on real square matrices ($A \in M_n(\mathbb{R}), n \ge 1$) and properties of idempotent matrices.
- Click-to-swap tile interaction.
- Undo and Reset controls.
- Explicit manual "Check" validation with granular edge status (`verified`, `not_verified`, `invalid`, `incomplete`).
- Victory modal upon satisfying all constraints.

### Explicitly Deferred:
- Compound statements, hyperedges, or multi-premise inference edges (see `MATH_SPEC.md` Section 4).
- Timers, countdowns, and time-pressure scoring.
- Drag-and-drop animation physics.
- Global leaderboards and user accounts.
- Automated hint systems or solvers running in client gameplay (solvers are used for offline verification and testing).
