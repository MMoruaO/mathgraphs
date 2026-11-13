# MathGraphs — Mathematical Specification (`MATH_SPEC.md`)

## 1. Mathematical Philosophy and Principles

Mathematical correctness is the supreme priority of MathGraphs:
1. **Explicit Assumptions:** No mathematical proposition or relationship holds in a vacuum. Every puzzle declares an explicit context and hypothesis set (e.g., matrix dimension, base field, topology).
2. **Distinction Between Truth and Knowledge:** The game operates on a curated, finite catalog of verified mathematical relationships. The absence of an entry in the catalog is **not evidence of mathematical falsehood**.
3. **Open-World Interpretation with Finite Catalog Support:** Uncataloged relations must be classified as `not_verified`, reserving `invalid` only for assertions backed by verified counterexamples or domain contradictions.
4. **Separation of Presentation and Semantics:** Mathematical formulas are identified by unique semantic string keys (e.g., `matrix_idempotent`), never by their KaTeX/LaTeX formatting.

---

## 2. Formal Data Model

### 2.1 Mathematical Context and Assumptions
A puzzle defines a mathematical context specifying the universe of discourse:

```typescript
export interface MathematicalAssumption {
  id: string;              // e.g., "square_matrix_real"
  latex: string;           // e.g., "A \\in \\mathbb{R}^{n \\times n}"
  description: string;     // e.g., "A is an n x n square matrix over the real numbers"
}

export interface PuzzleContext {
  id: string;
  name: string;
  assumptions: string[];   // Array of assumption IDs active in this puzzle
}
```

### 2.2 Mathematical Statements (Tiles)
A statement represents a mathematical proposition, property, or identity:

```typescript
export interface Statement {
  id: string;              // Unique semantic ID, e.g., "idempotent_def"
  latex: string;           // Presentation form, e.g., "A^2 = A"
  description: string;     // Human explanation of the statement
}
```

### 2.3 Mathematical Relations
Relations connect statements and carry formal semantics:

```typescript
export type RelationType = 
  | "implies"      // Antecedent implies consequent (directed, P => Q)
  | "equivalent"   // Logical equivalence (symmetric, P <=> Q)
  | "equals"       // Algebraic or structural identity (symmetric, A = B)
  | "subset_of"    // Set inclusion (directed, S \subseteq T)
  | "member_of";   // Set membership (directed, x \in S)

export interface VerifiedRelation {
  id: string;
  relation: RelationType;
  sourceStatementId: string;
  targetStatementId: string;
  requiredAssumptions: string[]; // Assumption IDs necessary for validity
  symmetric: boolean;            // True if relation holds in both directions
  justification?: string;        // Proof reference or mathematical explanation
}

export interface RefutedRelation {
  id: string;
  relation: RelationType;
  sourceStatementId: string;
  targetStatementId: string;
  counterexample?: string;       // Explicit counterexample proving falsity
}
```

### 2.4 Curated Knowledge Catalog
The catalog serves as the bounded ground truth for validation:

```typescript
export interface KnowledgeCatalog {
  assumptions: Record<string, MathematicalAssumption>;
  statements: Record<string, Statement>;
  relations: VerifiedRelation[];
  refutations?: RefutedRelation[];
}
```

---

## 3. Puzzle Definition and Graph Topology

A puzzle specifies the graph layout and the required relations:

```typescript
export interface Slot {
  id: string;                    // e.g., "slot_1"
  position: { x: number; y: number };
}

export interface ConstraintEdge {
  id: string;                    // e.g., "edge_1_2"
  sourceSlotId: string;
  targetSlotId: string;
  relation: RelationType;
}

export interface PuzzleDefinition {
  id: string;                    // e.g., "linear-algebra-idempotent-01"
  title: string;
  topic: "linear_algebra" | "calculus" | "abstract_algebra" | "topology";
  context: PuzzleContext;
  slots: Slot[];
  edges: ConstraintEdge[];
  tiles: string[];               // Statement IDs provided as movable tiles
  initialAssignment: Record<string, string>; // slotId -> statementId
}
```

---

## 4. Validation Engine Semantics

### 4.1 State of an Edge
Given an assignment mapping $\sigma: \text{Slot} \to \text{Statement}$:
For each edge $e = (u, v, R)$:
- Let $s_u = \sigma(u)$ and $s_v = \sigma(v)$.
- If $s_u = \text{null}$ or $s_v = \text{null}$, status is `incomplete`.
- The engine searches the catalog for an entry matching $(s_u, s_v, R)$ such that `requiredAssumptions` $\subseteq$ `puzzle.context.assumptions`:
  - **Match Found:** Status is `verified`.
  - **Symmetric Match Found:** If $R$ is marked symmetric (or reverse entry has `symmetric: true`), status is `verified`.
  - **Refutation Match Found:** If an explicit counterexample exists in `catalog.refutations`, status is `invalid`.
  - **No Entry Found:** Status is `not_verified`.

```typescript
export type EdgeValidationStatus = 
  | "verified"      // Proven true under puzzle assumptions in curated catalog
  | "not_verified"  // Unknown / unrecorded in current catalog
  | "invalid"       // Explicitly refuted by counterexample in catalog
  | "incomplete";   // Missing one or both tiles

export interface EdgeValidationResult {
  edgeId: string;
  status: EdgeValidationStatus;
  message?: string;
}

export interface PuzzleValidationResult {
  isSolved: boolean;
  edges: Record<string, EdgeValidationResult>;
  summary: {
    totalEdges: number;
    verifiedEdges: number;
    notVerifiedEdges: number;
    invalidEdges: number;
    incompleteEdges: number;
  };
}
```

### 4.2 Handling Transitivity and Inferences
- In the MVP, validation is performed strictly by lookup in the curated catalog (direct facts + direct symmetry).
- Automatic transitive inference (e.g., $P \implies Q \land Q \implies R \vdash P \implies R$) is **intentionally disabled** in the client engine to guarantee $O(|E|)$ deterministic execution and avoid unverified deductions in domains where intermediate hypotheses may shift.
- Transitive relationships intended to be accepted in puzzles must be explicitly populated into the curated catalog after expert verification.

---

## 5. Reference Prototype: Linear Algebra (Idempotent Matrices)

### 5.1 Context and Hypotheses
- **Domain:** Real square matrices of order $n \ge 1$.
- **Active Assumptions:** `["square_matrix_real", "dimension_finite"]`
  - $A \in \mathbb{R}^{n \times n}$.

### 5.2 Curated Statements for Prototype
1. $S_1$ (`matrix_idempotent`): $A^2 = A$
2. $S_2$ (`matrix_eigenvalues_0_1`): $\sigma(A) \subseteq \{0, 1\}$
3. $S_3$ (`matrix_diagonalizable`): $A \text{ es diagonalizable sobre } \mathbb{R}$
4. $S_4$ (`trace_equals_rank`): $\operatorname{tr}(A) = \operatorname{rank}(A)$
5. $S_5$ (`complement_idempotent`): $(I - A)^2 = I - A$

### 5.3 Curated Relations (True under Hypotheses)
- $S_1 \implies S_2$: If $A^2 = A$, and $A v = \lambda v$ ($v \neq 0$), then $A^2 v = \lambda^2 v = \lambda v \implies \lambda(\lambda - 1) = 0 \implies \lambda \in \{0, 1\}$.
- $S_1 \implies S_3$: The minimal polynomial $m_A(x)$ divides $x^2 - x = x(x - 1)$, which factors completely into distinct linear factors over $\mathbb{R}$. Therefore, $A$ is diagonalizable.
- $S_1 \implies S_4$: Since $A$ is diagonalizable with eigenvalues in $\{0, 1\}$, $\operatorname{tr}(A) = \sum \lambda_i = 1 \cdot (\text{multiplicity of 1}) = \operatorname{rank}(A)$.
- $S_1 \iff S_5$: $(I - A)^2 = I - 2A + A^2$. Thus $(I - A)^2 = I - A \iff I - 2A + A^2 = I - A \iff A^2 = A$.

### 5.4 Refutations / Counterexamples (Non-Implications)
- $S_2 \not\implies S_1$: A matrix can have eigenvalues in $\{0, 1\}$ without being idempotent (e.g., $A = \begin{pmatrix} 0 & 1 \\ 0 & 0 \end{pmatrix}$; $\sigma(A) = \{0\}$, but $A^2 = 0 \neq A$).
- $S_3 \not\implies S_1$: A diagonal matrix with eigenvalues outside $\{0, 1\}$ (e.g., $A = 2I$) is diagonalizable but $A^2 = 4I \neq 2I$.

---

## 6. Solver Responsibilities and Boundaries

The engine includes an offline/test solver (`solver.ts`) that systematically checks all permutations of tiles across slots ($\mathcal{O}(|V|!)$):
1. **Solvability Check:** Verifies that at least one assignment $\sigma^*$ exists such that all edges are `verified`.
2. **Uniqueness Report:** Counts the total number of valid assignments relative to the catalog.
3. **Equivalence Detection:** When multiple solutions exist, the solver documents whether they originate from automorphism symmetries of the graph or from interchangeable equivalent statements.
4. **Boundary:** The solver does not prove universal mathematical validity; it computes satisfying assignments relative to the provided catalog.
