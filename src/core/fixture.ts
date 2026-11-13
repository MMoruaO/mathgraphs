import {
  KnowledgeCatalog,
  PuzzleDefinition,
} from "./types.js";

/**
 * Curated knowledge catalog for Linear Algebra:
 * Real square matrices A in M_n(R), n >= 1, and idempotent matrix properties.
 */
export const linearAlgebraCatalog: KnowledgeCatalog = {
  assumptions: {
    matrix_real_square: {
      id: "matrix_real_square",
      latex: "A \\in M_n(\\mathbb{R}), \\, n \\ge 1",
      description: "A is a finite-dimensional real square matrix",
      implies: ["dimension_finite"],
    },
    dimension_finite: {
      id: "dimension_finite",
      latex: "n < \\infty",
      description: "Dimension of the underlying vector space is finite",
    },
  },
  statements: {
    P1: {
      id: "P1",
      latex: "A^2 = A",
      description: "A is an idempotent matrix",
    },
    P2: {
      id: "P2",
      latex: "\\sigma(A) \\subseteq \\{0, 1\\}",
      description: "The spectrum of A over R is a subset of {0, 1}",
    },
    P3: {
      id: "P3",
      latex: "A \\text{ is diagonalizable over } \\mathbb{R}",
      description: "A is diagonalizable over the field of real numbers",
    },
    P4: {
      id: "P4",
      latex: "\\operatorname{tr}(A) = \\operatorname{rank}(A)",
      description: "The trace of A equals its rank",
    },
    P5: {
      id: "P5",
      latex: "(I - A)^2 = I - A",
      description: "The complementary projection I - A is idempotent",
    },
  },
  relations: [
    // P1 <=> P5 (Symmetric equivalence)
    {
      id: "rel_P1_equiv_P5",
      relation: "equivalent",
      sourceStatementId: "P1",
      targetStatementId: "P5",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: true,
      justification:
        "(I - A)^2 = I - 2A + A^2. Thus (I - A)^2 = I - A <=> I - 2A + A^2 = I - A <=> A^2 = A.",
    },
    // Direct implications from P1
    {
      id: "rel_P1_implies_P2",
      relation: "implies",
      sourceStatementId: "P1",
      targetStatementId: "P2",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "If A^2 = A and Av = lambda v (v != 0), then lambda^2 v = lambda v => lambda(lambda - 1) = 0 => lambda in {0, 1}.",
    },
    {
      id: "rel_P1_implies_P3",
      relation: "implies",
      sourceStatementId: "P1",
      targetStatementId: "P3",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "The polynomial p(x) = x(x - 1) annihilates A. Since p(x) has distinct linear factors over R, the minimal polynomial divides p(x), so A is diagonalizable over R.",
    },
    {
      id: "rel_P1_implies_P4",
      relation: "implies",
      sourceStatementId: "P1",
      targetStatementId: "P4",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "Since A is diagonalizable with eigenvalues in {0, 1}, tr(A) = sum lambda_i = 1 * (multiplicity of 1) = rank(A).",
    },
    // Direct implications from P5 (explicitly curated, no automatic transitivity required)
    {
      id: "rel_P5_implies_P2",
      relation: "implies",
      sourceStatementId: "P5",
      targetStatementId: "P2",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "Since P5 <=> P1 and P1 implies P2, P5 implies P2.",
    },
    {
      id: "rel_P5_implies_P3",
      relation: "implies",
      sourceStatementId: "P5",
      targetStatementId: "P3",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "Since P5 <=> P1 and P1 implies P3, P5 implies P3.",
    },
    {
      id: "rel_P5_implies_P4",
      relation: "implies",
      sourceStatementId: "P5",
      targetStatementId: "P4",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "Since P5 <=> P1 and P1 implies P4, P5 implies P4.",
    },
  ],
  refutations: [
    // P2 does not imply P1
    {
      id: "ref_P2_not_implies_P1",
      relation: "implies",
      sourceStatementId: "P2",
      targetStatementId: "P1",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = [[0, 1], [0, 0]] in M_2(R)",
      justification:
        "sigma(A) = {0} <= {0, 1}, but A^2 = 0 != A.",
    },
    // P2 does not imply P3
    {
      id: "ref_P2_not_implies_P3",
      relation: "implies",
      sourceStatementId: "P2",
      targetStatementId: "P3",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = [[0, 1], [0, 0]] in M_2(R)",
      justification:
        "sigma(A) = {0} <= {0, 1}, but minimal polynomial is x^2, so A is not diagonalizable.",
    },
    // P2 does not imply P4
    {
      id: "ref_P2_not_implies_P4",
      relation: "implies",
      sourceStatementId: "P2",
      targetStatementId: "P4",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = [[0, 1], [0, 0]] in M_2(R)",
      justification:
        "tr(A) = 0, but rank(A) = 1, so tr(A) != rank(A).",
    },
    // P3 does not imply P1
    {
      id: "ref_P3_not_implies_P1",
      relation: "implies",
      sourceStatementId: "P3",
      targetStatementId: "P1",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = (2) in M_1(R)",
      justification:
        "A is diagonal hence diagonalizable, but A^2 = 4 != 2 = A.",
    },
    // P4 does not imply P1
    {
      id: "ref_P4_not_implies_P1",
      relation: "implies",
      sourceStatementId: "P4",
      targetStatementId: "P1",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = [[2, 0, 0], [0, 0, 1], [0, 0, 0]] in M_3(R)",
      justification:
        "tr(A) = 2 and rank(A) = 2, so tr(A) = rank(A), but A^2 = [[4, 0, 0], [0, 0, 0], [0, 0, 0]] != A.",
    },
  ],
};

/**
 * Reference first puzzle: Linear Algebra - Idempotent Matrices (5 nodes, 4 constraints).
 */
export const linearAlgebraPuzzle01: PuzzleDefinition = {
  id: "linear-algebra-idempotent-01",
  title: "Idempotent Matrices and Projections",
  topic: "linear_algebra",
  context: {
    id: "ctx_real_square",
    name: "Real Square Matrices",
    assumptions: ["matrix_real_square"],
  },
  slots: [
    { id: "s1", position: { x: 100, y: 200 } },
    { id: "s2", position: { x: 400, y: 50 } },
    { id: "s3", position: { x: 400, y: 200 } },
    { id: "s4", position: { x: 400, y: 350 } },
    { id: "s5", position: { x: 100, y: 50 } },
  ],
  edges: [
    {
      id: "e_s1_equiv_s5",
      sourceSlotId: "s1",
      targetSlotId: "s5",
      relation: "equivalent",
    },
    {
      id: "e_s1_implies_s2",
      sourceSlotId: "s1",
      targetSlotId: "s2",
      relation: "implies",
    },
    {
      id: "e_s1_implies_s3",
      sourceSlotId: "s1",
      targetSlotId: "s3",
      relation: "implies",
    },
    {
      id: "e_s1_implies_s4",
      sourceSlotId: "s1",
      targetSlotId: "s4",
      relation: "implies",
    },
  ],
  tiles: [
    { id: "tile_1", statementId: "P1" },
    { id: "tile_2", statementId: "P2" },
    { id: "tile_3", statementId: "P3" },
    { id: "tile_4", statementId: "P4" },
    { id: "tile_5", statementId: "P5" },
  ],
  // Initial scrambled assignment (valid bijection, not solved)
  initialAssignment: {
    s1: "tile_2", // P2 in s1 (cannot imply P3 or P4, will fail)
    s2: "tile_1",
    s3: "tile_5",
    s4: "tile_3",
    s5: "tile_4",
  },
};
