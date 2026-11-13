# MathGraphs — Gameplay Rules Specification (`GAME_RULES.md`)

## 1. Game Objective

MathGraphs is a deductive puzzle game based on university-level mathematics. The player's goal is to arrange a given set of mathematical statement tiles onto fixed positions (slots) of a graph such that all mathematical constraints defined by the graph's edges are simultaneously satisfied under the puzzle's explicit hypotheses.

The game emphasizes logical reasoning, conceptual connection, and deduction rather than arithmetic calculation or memorization.

---

## 2. Board Structure

### 2.1 Graph Layout
- The puzzle board is represented as a static graph $G = (V, E)$, where:
  - $V$ is a finite set of fixed board positions (**Slots**).
  - $E$ is a finite set of constrained relationships (**Edges**).
- Positions on the board are geometric coordinates $(x, y)$ that remain stationary during gameplay. Players do not add, remove, or rewire edges or slots.

### 2.2 Slots and Tiles
- **Slot ($s \in V$):** A designated receptacle on the board that can hold at most one tile at any time.
- **Tile ($t \in T$):** A movable item presenting a mathematical statement (rendered in KaTeX). In a standard puzzle, the number of tiles $|T|$ matches the number of slots $|V|$ ($|T| = |V|$), defining a bijection in any complete configuration.
- **Initial State:** The puzzle begins with all tiles placed on slots in a predetermined shuffled or initial configuration, or with an initial assignment where some tiles are in slots and others may be in an unassigned staging rack (for the MVP, all tiles reside in slots).

### 2.3 Edges and Relations
Edges connect pairs of slots $(u, v)$ and are annotated with a mathematical relation $R$:
- **Directed Edges:** Represent asymmetric relations such as logical implication ($\implies$), set membership ($\in$), or proper subset inclusion ($\subset$). The direction strictly identifies the antecedent/source ($u$) and the consequent/target ($v$).
- **Undirected Edges:** Represent symmetric relations such as logical equivalence ($\iff$), algebraic equality ($=$), or isomorphism ($\cong$). The constraint holds regardless of whether it is evaluated from $u$ to $v$ or from $v$ to $u$.

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
  - The game state maintains a history stack of board assignments $\sigma_0, \sigma_1, \dots, \sigma_k$.
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
When the player requests validation, each edge $e = (u, v, R)$ is evaluated against the puzzle's explicit hypotheses and the curated mathematical catalog. To maintain mathematical integrity without claiming omniscience:
1. **Verified (`verified`):** The relationship is explicitly confirmed by the curated catalog (or direct symmetry) under the puzzle's hypotheses. Visualized with an affirmative indicator (e.g., green tint / check icon).
2. **Not Verified (`not_verified`):** The relationship is not present in the catalog under the given hypotheses. **The interface must not present this as definitively false or refuted**, but rather as "Unverified / Not established in catalog". Visualized with a neutral/warning indicator (e.g., amber tint or subtle dashed state).
3. **Refuted / Invalid (`invalid`):** The relationship is known to be false by an explicit counterexample or recorded refutation in the catalog. Visualized with a distinct negative indicator (e.g., red tint). *(Note: For MVP, uncataloged relations default to `not_verified` unless an explicit refutation entry exists).*
4. **Incomplete (`incomplete`):** One or both incident slots $(u, v)$ do not contain a tile.

### 4.3 Victory Condition
A puzzle is declared **Solved** (`SOLVED`) if and only if:
1. Every slot $s \in V$ contains exactly one tile ($|\sigma| = |V|$).
2. Every edge constraint $e \in E$ evaluates to `verified`.
3. No edge evaluates to `invalid`, `not_verified`, or `incomplete`.

Upon solving, the player is presented with a success notification, move statistics (total swaps, checks performed), and optional explanations for the mathematical deductions.

---

## 5. Handling Alternative Solutions

A puzzle is defined by its mathematical constraints, **not by an author-mandated target permutation**.
- If two mathematical statements are logically equivalent or satisfy the edge constraints identically in symmetric positions, any assignment $\sigma$ where 100% of the edges are `verified` is an authentic winning solution.
- The system must celebrate and accept alternative solutions without penalizing the player.
- The solver must analyze candidate puzzles prior to publication to report whether alternative valid configurations exist.

---

## 6. MVP Scope and Guardrails

### Included in MVP:
- Exactly one fixed linear algebra graph puzzle (4–5 nodes) focusing on real idempotent matrices ($A \in \mathbb{R}^{n \times n}, A^2 = A$).
- Click-to-swap tile interaction.
- Undo and Reset controls.
- Explicit manual "Check" validation with granular edge status (`verified`, `not_verified`, `incomplete`).
- Victory modal upon satisfying all constraints.

### Explicitly Deferred:
- Timers, countdowns, and time-pressure scoring.
- Drag-and-drop animation physics.
- Global leaderboards and user accounts.
- Automated hint systems or solvers running in client gameplay (solvers are used for offline verification and testing).
