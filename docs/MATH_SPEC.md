# MathGraphs — Mathematical Specification (`MATH_SPEC.md`)

## 1. Mathematical Philosophy and Principles

Mathematical correctness is the supreme priority of MathGraphs:
1. **Explicit Global Assumptions:** No mathematical proposition or relationship holds in a vacuum. Every puzzle declares an explicit context and hypothesis set $\mathcal{H}$ (e.g., $A \in M_n(\mathbb{R}), n \ge 1$). These assumptions define the immutable universe of discourse. They are **never** movable tiles.
2. **Universal Validity of Relations:** An implication $P \implies Q$ asserted on an edge must be universally true for *all* mathematical objects satisfying $\mathcal{H}$. It cannot merely happen to hold for a particular chosen matrix.
3. **Distinction Between Truth and Knowledge:** The game operates on a curated, finite catalog of verified mathematical relationships. The absence of an entry in the catalog is **not evidence of mathematical falsehood**.
4. **Open-World Interpretation with Finite Catalog Support:** Uncataloged relations must be classified as `not_verified`, reserving `invalid` only for assertions backed by verified counterexamples valid under $\mathcal{H}$.
5. **Separation of Presentation and Semantics:** Mathematical formulas are identified by unique semantic string keys (e.g., `matrix_idempotent`), never by their KaTeX/LaTeX formatting.

---

## 2. Formal Data Model

### 2.1 Mathematical Context and Assumptions
A puzzle defines a mathematical context specifying the universe of discourse:

```typescript
export type AssumptionId = string;

export interface MathematicalAssumption {
  id: AssumptionId;        // e.g., "matrix_real_square"
  latex: string;           // e.g., "A \\in M_n(\\mathbb{R}), \\, n \\ge 1"
  description: string;     // e.g., "A is a finite-dimensional real square matrix"
  implies?: AssumptionId[]; // Finite curated assumption hierarchy
}

export interface PuzzleContext {
  id: string;
  name: string;
  assumptions: AssumptionId[]; // Array of global assumption IDs active in this puzzle
}
```

#### Curated Assumption Hierarchy
Some mathematical hypotheses naturally subsume others (e.g., $A \in M_n(\mathbb{R})$ implies $A \in M_n(\mathbb{K})$ for an arbitrary field $\mathbb{K}$ of characteristic 0, and implies finite-dimensionality).
- Rather than running a general-purpose theorem prover, the catalog defines a static, finite hierarchy graph of assumptions.
- An assumption set $\mathcal{H}$ satisfies requirement $a$ if $a \in \mathcal{H}$ or $a$ is reachable in the curated assumption hierarchy from some $h \in \mathcal{H}$.

### 2.2 Mathematical Statements and Physical Tiles

```typescript
export interface Statement {
  id: string;              // Semantic ID, e.g., "matrix_idempotent"
  latex: string;           // Presentation form, e.g., "A^2 = A"
  description: string;     // Human explanation of the statement
}

export interface Tile {
  id: string;              // Unique physical token ID, e.g., "tile_1"
  statementId: string;     // Reference to the statement represented
}
```

### 2.3 Mathematical Relations (Verified and Refuted)

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
  requiredAssumptions: AssumptionId[]; // Assumptions necessary for validity
  symmetric: boolean;                 // True if relation holds in both directions
  justification?: string;             // Rigorous proof or textbook reference
}

export interface RefutedRelation {
  id: string;
  relation: RelationType;
  sourceStatementId: string;
  targetStatementId: string;
  contextAssumptions: AssumptionId[];  // Context under which refutation holds
  counterexample: string;             // Explicit counterexample (e.g., explicit matrix)
  justification?: string;             // Explanation of why counterexample refutes relation
}
```

### 2.4 Catalog Integrity and Contradiction Prevention
A curated catalog $\mathcal{K}$ must never contain contradictory entries under compatible assumptions:
- **Integrity Rule:** For any ordered pair $(S_i, S_j)$ and relation $R$, the catalog cannot contain both a `VerifiedRelation` and a `RefutedRelation` whose required assumptions are simultaneously satisfied by the same context $\mathcal{H}$.
- Any detected contradiction during catalog initialization throws a fatal `CatalogIntegrityException`. Contradictions are not resolved silently via lookup order.

---

## 3. Puzzle Definition and Graph Topology

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
  tiles: Tile[];                 // Set of physical tiles provided
  initialAssignment: Record<string, string>; // slotId -> tileId (bijection)
}
```

---

## 4. Multi-Premise Relations and Initial Architectural Boundaries

In university mathematics, many deductions cannot be decomposed into isolated binary implications $P \implies Q$. For example:
$$\left( A \text{ is diagonalizable over } \mathbb{R} \;\land\; \sigma(A) \subseteq \{0, 1\} \right) \implies A^2 = A$$
Neither premise individually implies idempotence.

### Modeling Limitations for MVP:
- The initial prototype uses strictly **binary constraint edges** connecting two slots $(u, v)$.
- Edges cannot represent multi-premise antecedent conjunctions directly without intermediate nodes.

### Future Architectural Extensions (Post-MVP):
1. **Compound Proposition Nodes:** Creating explicit statement tiles representing conjunctions (e.g., $P_3 \land P_2$).
2. **Directed Hyperedges:** Edges with multiple source slots $\{u_1, u_2, \dots, u_k\} \to v$.
3. **Explicit Multi-Premise Constraints:** A constraint record specifying an array of antecedent slot IDs.

The data schemas are isolated so that extending `ConstraintEdge` to support multi-premise constraints in future milestones will not alter the UI-agnostic validation contract.

---

## 5. Validation Engine Semantics and Performance

### 5.1 Evaluation of an Edge
Given a candidate assignment bijection $\sigma: \text{Slot} \to \text{Tile}$, and statement lookup $\tau(t) = \text{statement}(t)$:
For each edge $e = (u, v, R)$:
1. Retrieve tiles $t_u = \sigma(u)$ and $t_v = \sigma(v)$. If either slot is empty, status is `incomplete`.
2. Retrieve statements $s_u = \tau(t_u)$ and $s_v = \tau(t_v)$.
3. Evaluate against catalog $\mathcal{K}$ under puzzle assumptions $\mathcal{H}$:
   - **`verified`:** A verified relation exists matching $(s_u, s_v, R)$ (or reverse match if $R$ is symmetric) such that `requiredAssumptions` $\subseteq \operatorname{Closure}(\mathcal{H})$.
   - **`invalid`:** An explicit refutation exists matching $(s_u, s_v, R)$ such that `contextAssumptions` $\subseteq \operatorname{Closure}(\mathcal{H})$.
   - **`not_verified`:** No verified relation or refutation matches under $\mathcal{H}$.

```typescript
export type EdgeValidationStatus = 
  | "verified"      // Proven true under puzzle hypotheses in curated catalog
  | "not_verified"  // Unknown / unrecorded in current catalog
  | "invalid"       // Explicitly refuted by counterexample in catalog
  | "incomplete";   // Missing one or both tiles
```

### 5.2 Algorithmic Performance
- To achieve $\mathcal{O}(|E|)$ validation complexity, the catalog must be indexed in a composite hash map:
  $$\text{Index Key} = (\text{relation}, \text{sourceStatementId}, \text{targetStatementId})$$
- Linear scanning of catalog arrays would result in $\mathcal{O}(|E| \cdot |\mathcal{K}|)$ complexity. The engine will build or consume pre-indexed lookup maps.

---

## 6. Mathematical Analysis of the Reference Statement Set

### 6.1 Global Context
$$\mathcal{H} = \{ A \in M_n(\mathbb{R}), \, n \ge 1 \}$$
All propositions are interpreted as properties of a real square matrix $A$.

### 6.2 The Five Statements
- $P_1$: $A^2 = A$ (Idempotence)
- $P_2$: $\sigma(A) \subseteq \{0, 1\}$ (Spectrum restricted to $\{0, 1\}$ over $\mathbb{R}$)
- $P_3$: $A$ is diagonalizable over $\mathbb{R}$
- $P_4$: $\operatorname{tr}(A) = \operatorname{rank}(A)$
- $P_5$: $(I - A)^2 = I - A$ (Complement matrix is idempotent)

---

### 6.3 Comprehensive Implication Analysis ($P_i \implies P_j$)

#### Implication Table

| Antecedent $\downarrow$ \ Consequent $\rightarrow$ | $P_1$ ($A^2=A$) | $P_2$ ($\sigma \subseteq \{0,1\}$) | $P_3$ (Diag over $\mathbb{R}$) | $P_4$ ($\operatorname{tr}=\operatorname{rank}$) | $P_5$ ($(I-A)^2=I-A$) |
|---|---|---|---|---|---|
| **$P_1$ ($A^2=A$)** | — | **TRUE** | **TRUE** | **TRUE** | **TRUE** |
| **$P_2$ ($\sigma \subseteq \{0,1\}$)** | FALSE | — | FALSE | FALSE | FALSE |
| **$P_3$ (Diag over $\mathbb{R}$)** | FALSE | FALSE | — | FALSE | FALSE |
| **$P_4$ ($\operatorname{tr}=\operatorname{rank}$)** | FALSE | FALSE | FALSE | — | FALSE |
| **$P_5$ ($(I-A)^2=I-A$)** | **TRUE** | **TRUE** | **TRUE** | **TRUE** | — |

---

#### Rigorous Proofs of Valid Implications (TRUE)

1. **$P_1 \implies P_2$:**
   - *Proof:* Let $\lambda \in \sigma(A)$ with eigenvector $v \neq 0$, so $A v = \lambda v$. Since $A^2 = A$, we have $A^2 v = A v \implies \lambda^2 v = \lambda v \implies (\lambda^2 - \lambda) v = 0$. Since $v \neq 0$, $\lambda(\lambda - 1) = 0 \implies \lambda \in \{0, 1\}$.
2. **$P_1 \implies P_3$:**
   - *Proof:* $A^2 - A = 0$, so the polynomial $p(x) = x(x - 1)$ annihilates $A$. The minimal polynomial $m_A(x)$ divides $p(x)$. Thus $m_A(x)$ factors into distinct linear factors over $\mathbb{R}$ (namely $x$, $x-1$, or $x(x-1)$). Hence, $A$ is diagonalizable over $\mathbb{R}$.
3. **$P_1 \implies P_4$:**
   - *Proof:* Since $P_1 \implies P_3$ and $P_1 \implies P_2$, $A$ is diagonalizable with eigenvalues in $\{0, 1\}$. There exists invertible $P \in M_n(\mathbb{R})$ such that $A = P \operatorname{diag}(1, \dots, 1, 0, \dots, 0) P^{-1}$. Then $\operatorname{rank}(A) = k$ (the multiplicity of eigenvalue 1), and $\operatorname{tr}(A) = \operatorname{tr}(P D P^{-1}) = \operatorname{tr}(D) = k \cdot 1 + (n - k) \cdot 0 = k$. Thus $\operatorname{tr}(A) = \operatorname{rank}(A)$.
4. **$P_1 \iff P_5$:**
   - *Proof:* $(I - A)^2 = I - 2A + A^2$. Therefore, $(I - A)^2 = I - A \iff I - 2A + A^2 = I - A \iff A^2 - A = 0 \iff A^2 = A$. This is a universal logical equivalence under $\mathcal{H}$.
5. **$P_5 \implies P_2, P_3, P_4$:**
   - Follows directly by transitivity from $P_5 \iff P_1$ and the implications $P_1 \implies P_2, P_3, P_4$.

---

#### Explicit Counterexamples for Refuted Implications (FALSE)

1. **$P_2 \not\implies P_1$, $P_2 \not\implies P_3$, $P_2 \not\implies P_4$, $P_2 \not\implies P_5$:**
   - *Counterexample:* Let $n = 2$, $A = \begin{pmatrix} 0 & 1 \\ 0 & 0 \end{pmatrix}$.
   - *Check:* Characteristic polynomial is $\det(\lambda I - A) = \lambda^2 \implies \sigma(A) = \{0\} \subseteq \{0, 1\}$ (Satisfies $P_2$).
   - But $A^2 = \begin{pmatrix} 0 & 0 \\ 0 & 0 \end{pmatrix} \neq A$ (Fails $P_1$ and $P_5$).
   - The minimal polynomial is $m_A(x) = x^2$ (non-square-free), so $A$ is not diagonalizable over $\mathbb{R}$ (Fails $P_3$).
   - $\operatorname{tr}(A) = 0 + 0 = 0$, while $\operatorname{rank}(A) = 1$. Thus $\operatorname{tr}(A) \neq \operatorname{rank}(A)$ (Fails $P_4$).

2. **$P_3 \not\implies P_1$, $P_3 \not\implies P_2$, $P_3 \not\implies P_4$, $P_3 \not\implies P_5$:**
   - *Counterexample:* Let $n = 1$ (or $n=2$), $A = (2)$.
   - *Check:* $A$ is already diagonal, hence diagonalizable over $\mathbb{R}$ (Satisfies $P_3$).
   - $\sigma(A) = \{2\} \not\subseteq \{0, 1\}$ (Fails $P_2$).
   - $A^2 = (4) \neq (2)$ (Fails $P_1$ and $P_5$).
   - $\operatorname{tr}(A) = 2$, but $\operatorname{rank}(A) = 1$ (Fails $P_4$).

3. **$P_4 \not\implies P_1$, $P_4 \not\implies P_2$, $P_4 \not\implies P_3$, $P_4 \not\implies P_5$:**
   - *Counterexample:* Let $n = 2$, $A = \begin{pmatrix} 1 & 1 \\ 0 & 0 \end{pmatrix}$. Wait, that matrix has $A^2 = A$! Let's choose a non-idempotent matrix where $\operatorname{tr}(A) = \operatorname{rank}(A)$.
   - *Valid Counterexample:* Let $n = 3$, $A = \begin{pmatrix} 2 & 0 & 0 \\ 0 & 0 & 1 \\ 0 & 0 & 0 \end{pmatrix}$.
     - $\operatorname{tr}(A) = 2 + 0 + 0 = 2$.
     - $\operatorname{rank}(A) = 2$ (rows 1 and 2 are linearly independent).
     - Thus $\operatorname{tr}(A) = \operatorname{rank}(A) = 2$ (Satisfies $P_4$).
     - However, $\sigma(A) = \{2, 0\} \not\subseteq \{0, 1\}$ (Fails $P_2$).
     - $A$ has a non-trivial Jordan block $\begin{pmatrix} 0 & 1 \\ 0 & 0 \end{pmatrix}$, so $A$ is not diagonalizable over $\mathbb{R}$ (Fails $P_3$).
     - $A^2 = \begin{pmatrix} 4 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix} \neq A$ (Fails $P_1$ and $P_5$).

4. **Multi-Premise Synthesis:**
   - $(P_2 \land P_3) \implies P_1$: If $A$ is diagonalizable over $\mathbb{R}$ and $\sigma(A) \subseteq \{0, 1\}$, then in its eigenbasis $D = \operatorname{diag}(\lambda_1, \dots, \lambda_n)$ where $\lambda_i \in \{0, 1\}$. Since each $\lambda_i^2 = \lambda_i$, $D^2 = D \implies A^2 = A$. Neither $P_2$ nor $P_3$ alone suffices.

---

## 7. Candidate First Puzzle Specification

### 7.1 Concept
We construct a 5-node directed graph incorporating statements $P_1, P_2, P_3, P_4, P_5$ under global context $\mathcal{H} = \{ A \in M_n(\mathbb{R}), n \ge 1 \}$.

### 7.2 Graph Topology
- **Slots:** $V = \{s_1, s_2, s_3, s_4, s_5\}$
  - $s_1$: Center-left position $(100, 200)$
  - $s_2$: Top-right $(400, 50)$
  - $s_3$: Mid-right $(400, 200)$
  - $s_4$: Bottom-right $(400, 350)$
  - $s_5$: Far-left $(100, 50)$
- **Constraint Edges:**
  - $e_{15}$: $s_1 \iff s_5$ (`equivalent`)
  - $e_{12}$: $s_1 \implies s_2$ (`implies`)
  - $e_{13}$: $s_1 \implies s_3$ (`implies`)
  - $e_{14}$: $s_1 \implies s_4$ (`implies`)

### 7.3 Canonical Intended Solution Assignment $\sigma^*$
- $s_1 \mapsto P_1$ ($A^2 = A$)
- $s_5 \mapsto P_5$ ($(I - A)^2 = I - A$)
- $s_2 \mapsto P_2$ ($\sigma(A) \subseteq \{0, 1\}$)
- $s_3 \mapsto P_3$ ($A \text{ es diagonalizable sobre } \mathbb{R}$)
- $s_4 \mapsto P_4$ ($\operatorname{tr}(A) = \operatorname{rank}(A)$)

#### Mathematical Verification of Edges:
- $e_{15}$: $P_1 \iff P_5$ holds universally (Proven in 6.3).
- $e_{12}$: $P_1 \implies P_2$ holds universally.
- $e_{13}$: $P_1 \implies P_3$ holds universally.
- $e_{14}$: $P_1 \implies P_4$ holds universally.

### 7.4 Solution Multiplicity Analysis
Notice the inherent mathematical symmetry:
1. Since $P_1 \iff P_5$, swapping $s_1$ and $s_5$ also satisfies $e_{15}$. Moreover, because $P_5 \implies P_2, P_3, P_4$ are also valid mathematical truths, if $s_5$ is placed at $s_1$ and $s_1$ at $s_5$, all four constraints are satisfied!
2. Furthermore, $s_2, s_3, s_4$ are symmetric targets of $s_1$: any permutation of $\{P_2, P_3, P_4\}$ across $\{s_2, s_3, s_4\}$ will evaluate to `verified` because $s_1$ implies all three!
   - Total valid solutions in this candidate graph: $2 \times 3! = 12$ valid solutions out of $5! = 120$ possible permutations.
   - **Game Design Tradeoff:** While mathematically sound and rewarding, 12 solutions out of 120 gives a 10% chance of random success.
   - **Alternative Tightened Topology:** Adding a directed or equivalence edge between branches (e.g., $(P_2 \land P_3)$ multi-premise, or restricting targets) will be systematically analyzed with the test solver in the first implementation step.
   - For MVP, having 12 valid solutions is completely acceptable and serves as an ideal test case for proving that the engine accepts alternative valid configurations without hardcoding an author's answer.
