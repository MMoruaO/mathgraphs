import { KnowledgeCatalog } from "../core/types.js";

/**
 * Universal Master Knowledge Catalog containing verified and refuted relations
 * across Linear Algebra, Real Analysis, and Mathematical Logic.
 */
export const masterCatalog: KnowledgeCatalog = {
  assumptions: {
    // Linear Algebra Assumptions
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

    // Real Analysis / Calculus Assumptions
    real_function_open_interval: {
      id: "real_function_open_interval",
      latex: "f: I \\to \\mathbb{R}, \\, I = (a, b)",
      description: "f is a real-valued function defined on an open interval I",
    },

    // Topology Assumptions
    metric_space_ambient: {
      id: "metric_space_ambient",
      latex: "(X, d) \\text{ is a metric space}, \\, K \\subseteq X",
      description: "X is a metric space and K is a non-empty subset",
    },
  },

  statements: {
    // --- Topic 1: Linear Algebra (Idempotent Matrices) ---
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

    // --- Topic 2: Linear Algebra (Invertibility and Regularity) ---
    LA_INV: {
      id: "LA_INV",
      latex: "\\det(A) \\neq 0",
      description: "The determinant of A is non-zero (A is invertible)",
    },
    LA_KER: {
      id: "LA_KER",
      latex: "\\ker(A) = \\{0\\}",
      description: "The kernel of A is trivial",
    },
    LA_RANK: {
      id: "LA_RANK",
      latex: "\\operatorname{rank}(A) = n",
      description: "A has full rank n",
    },
    LA_NO_ZERO_EIG: {
      id: "LA_NO_ZERO_EIG",
      latex: "0 \\notin \\sigma(A)",
      description: "Zero is not an eigenvalue of A",
    },
    LA_ORTHOGONAL: {
      id: "LA_ORTHOGONAL",
      latex: "A^{\\mathsf T}A = I",
      description: "A is an orthogonal real matrix",
    },

    // --- Topic 3: Real Analysis (Smoothness & Continuity Hierarchy) ---
    ANA_C1: {
      id: "ANA_C1",
      latex: "f \\in C^1(I)",
      description: "f is continuously differentiable on I",
    },
    ANA_DIFF: {
      id: "ANA_DIFF",
      latex: "f \\text{ is differentiable on } I",
      description: "f'(x) exists for all x in I",
    },
    ANA_CONT: {
      id: "ANA_CONT",
      latex: "f \\in C(I)",
      description: "f is continuous on I",
    },
    ANA_DARBOUX: {
      id: "ANA_DARBOUX",
      latex: "f \\text{ satisfies the Intermediate Value Property on } I",
      description: "f satisfies the Darboux intermediate value property on I",
    },

    // --- Topic 4: Topology (Compactness in Metric Spaces) ---
    TOP_COMPACT: {
      id: "TOP_COMPACT",
      latex: "K \\text{ is compact}",
      description: "Every open cover of K has a finite subcover",
    },
    TOP_SEQ_COMPACT: {
      id: "TOP_SEQ_COMPACT",
      latex: "K \\text{ is sequentially compact}",
      description: "Every sequence in K has a subsequence converging to a point in K",
    },
    TOP_CLOSED_BOUNDED: {
      id: "TOP_CLOSED_BOUNDED",
      latex: "K \\text{ is closed and bounded}",
      description: "K contains all its limit points and has finite diameter",
    },
    TOP_TOTAL_BOUNDED: {
      id: "TOP_TOTAL_BOUNDED",
      latex: "K \\text{ is totally bounded}",
      description: "For every epsilon > 0, K can be covered by finitely many epsilon-balls",
    },
  },

  relations: [
    // === PUZZLE 1: Idempotent Matrices ===
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
        "The polynomial p(x) = x(x - 1) annihilates A. Since p(x) has distinct linear factors over R, A is diagonalizable over R.",
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
    {
      id: "rel_P5_implies_P2",
      relation: "implies",
      sourceStatementId: "P5",
      targetStatementId: "P2",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification: "Since P5 <=> P1 and P1 implies P2, P5 implies P2.",
    },
    {
      id: "rel_P5_implies_P3",
      relation: "implies",
      sourceStatementId: "P5",
      targetStatementId: "P3",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification: "Since P5 <=> P1 and P1 implies P3, P5 implies P3.",
    },
    {
      id: "rel_P5_implies_P4",
      relation: "implies",
      sourceStatementId: "P5",
      targetStatementId: "P4",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification: "Since P5 <=> P1 and P1 implies P4, P5 implies P4.",
    },

    // === Shared invertibility relations ===
    // det(A) != 0 <=> ker(A) = {0} <=> rank(A) = n <=> 0 not in sigma(A)
    {
      id: "rel_inv_equiv_ker",
      relation: "equivalent",
      sourceStatementId: "LA_INV",
      targetStatementId: "LA_KER",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: true,
      justification:
        "By the Invertible Matrix Theorem, A is non-singular iff Ax = 0 has only the trivial solution.",
    },
    {
      id: "rel_ker_equiv_rank",
      relation: "equivalent",
      sourceStatementId: "LA_KER",
      targetStatementId: "LA_RANK",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: true,
      justification:
        "By the Rank-Nullity Theorem, dim(ker A) + rank(A) = n. Thus ker(A) = {0} iff rank(A) = n.",
    },
    {
      id: "rel_inv_equiv_rank",
      relation: "equivalent",
      sourceStatementId: "LA_INV",
      targetStatementId: "LA_RANK",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: true,
      justification:
        "For a square matrix, det(A) != 0 iff A has full rank n, by the Invertible Matrix Theorem.",
    },
    {
      id: "rel_rank_equiv_noeig",
      relation: "equivalent",
      sourceStatementId: "LA_RANK",
      targetStatementId: "LA_NO_ZERO_EIG",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: true,
      justification:
        "0 is an eigenvalue iff there exists v != 0 such that Av = 0 iff ker(A) != {0}. Thus rank(A)=n iff 0 not in sigma(A).",
    },
    {
      id: "rel_noeig_equiv_inv",
      relation: "equivalent",
      sourceStatementId: "LA_NO_ZERO_EIG",
      targetStatementId: "LA_INV",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: true,
      justification:
        "det(A) = product of eigenvalues. Thus det(A) != 0 iff 0 not in sigma(A).",
    },
    {
      id: "rel_orthogonal_implies_inv",
      relation: "implies",
      sourceStatementId: "LA_ORTHOGONAL",
      targetStatementId: "LA_INV",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "If A^T A = I, then A^T is a left inverse of the square matrix A; therefore A is invertible.",
    },
    {
      id: "rel_orthogonal_implies_ker",
      relation: "implies",
      sourceStatementId: "LA_ORTHOGONAL",
      targetStatementId: "LA_KER",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "If A^T A = I and Ax = 0, then x = A^T A x = 0; hence ker(A) = {0}.",
    },
    {
      id: "rel_orthogonal_implies_rank",
      relation: "implies",
      sourceStatementId: "LA_ORTHOGONAL",
      targetStatementId: "LA_RANK",
      requiredAssumptions: ["matrix_real_square"],
      symmetric: false,
      justification:
        "An orthogonal square matrix is invertible, so its rank is n.",
    },

    // === PUZZLE 3: Real Analysis Hierarchy (Directed Chain) ===
    // C^1 => Differentiable => Continuous => Darboux Property
    {
      id: "rel_c1_implies_diff",
      relation: "implies",
      sourceStatementId: "ANA_C1",
      targetStatementId: "ANA_DIFF",
      requiredAssumptions: ["real_function_open_interval"],
      symmetric: false,
      justification:
        "By definition, C^1 functions possess a continuous derivative, hence are differentiable.",
    },
    {
      id: "rel_diff_implies_cont",
      relation: "implies",
      sourceStatementId: "ANA_DIFF",
      targetStatementId: "ANA_CONT",
      requiredAssumptions: ["real_function_open_interval"],
      symmetric: false,
      justification:
        "Differentiability implies continuity: lim_{x -> c} (f(x) - f(c)) = lim (f(x)-f(c))/(x-c) * (x-c) = f'(c) * 0 = 0.",
    },
    {
      id: "rel_cont_implies_darboux",
      relation: "implies",
      sourceStatementId: "ANA_CONT",
      targetStatementId: "ANA_DARBOUX",
      requiredAssumptions: ["real_function_open_interval"],
      symmetric: false,
      justification:
        "By Bolzano's Intermediate Value Theorem, every continuous real function on an interval has the Darboux property.",
    },

    // === PUZZLE 4: Topology in Metric Spaces ===
    // Compact <=> Sequentially Compact
    // Compact => Closed and Bounded
    // Compact => Totally Bounded
    {
      id: "rel_top_compact_equiv_seq",
      relation: "equivalent",
      sourceStatementId: "TOP_COMPACT",
      targetStatementId: "TOP_SEQ_COMPACT",
      requiredAssumptions: ["metric_space_ambient"],
      symmetric: true,
      justification:
        "In any metric space, compactness is equivalent to sequential compactness.",
    },
    {
      id: "rel_top_compact_implies_closed_bounded",
      relation: "implies",
      sourceStatementId: "TOP_COMPACT",
      targetStatementId: "TOP_CLOSED_BOUNDED",
      requiredAssumptions: ["metric_space_ambient"],
      symmetric: false,
      justification:
        "Every compact subset of a metric space is closed and bounded.",
    },
    {
      id: "rel_top_seq_implies_closed_bounded",
      relation: "implies",
      sourceStatementId: "TOP_SEQ_COMPACT",
      targetStatementId: "TOP_CLOSED_BOUNDED",
      requiredAssumptions: ["metric_space_ambient"],
      symmetric: false,
      justification:
        "Since sequentially compact is equivalent to compact, it also implies closed and bounded.",
    },
    {
      id: "rel_top_compact_implies_total_bounded",
      relation: "implies",
      sourceStatementId: "TOP_COMPACT",
      targetStatementId: "TOP_TOTAL_BOUNDED",
      requiredAssumptions: ["metric_space_ambient"],
      symmetric: false,
      justification:
        "Every compact metric space is totally bounded (covering by epsilon-balls has a finite subcover).",
    },
    {
      id: "rel_top_seq_implies_total_bounded",
      relation: "implies",
      sourceStatementId: "TOP_SEQ_COMPACT",
      targetStatementId: "TOP_TOTAL_BOUNDED",
      requiredAssumptions: ["metric_space_ambient"],
      symmetric: false,
      justification:
        "Sequentially compact implies totally bounded.",
    },
  ],

  refutations: [
    // Puzzle 1 refutations
    {
      id: "ref_P2_not_implies_P1",
      relation: "implies",
      sourceStatementId: "P2",
      targetStatementId: "P1",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = [[0, 1], [0, 0]] in M_2(R)",
      justification: "sigma(A) = {0} <= {0, 1}, but A^2 = 0 != A.",
    },
    {
      id: "ref_P3_not_implies_P1",
      relation: "implies",
      sourceStatementId: "P3",
      targetStatementId: "P1",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = (2) in M_1(R)",
      justification: "A is diagonal, but A^2 = 4 != 2.",
    },
    {
      id: "ref_P4_not_implies_P1",
      relation: "implies",
      sourceStatementId: "P4",
      targetStatementId: "P1",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = [[2, 0, 0], [0, 0, 1], [0, 0, 0]] in M_3(R)",
      justification: "tr(A)=2, rank(A)=2, but A^2 != A.",
    },
    {
      id: "ref_inv_not_implies_orthogonal",
      relation: "implies",
      sourceStatementId: "LA_INV",
      targetStatementId: "LA_ORTHOGONAL",
      contextAssumptions: ["matrix_real_square"],
      counterexample: "A = [[2, 0], [0, 1]] in M_2(R)",
      justification:
        "A is invertible, but A^T A = [[4, 0], [0, 1]] != I, so A is not orthogonal.",
    },

    // Puzzle 3 refutations (Strict Hierarchy)
    {
      id: "ref_darboux_not_implies_cont",
      relation: "implies",
      sourceStatementId: "ANA_DARBOUX",
      targetStatementId: "ANA_CONT",
      contextAssumptions: ["real_function_open_interval"],
      counterexample: "f(x) = sin(1/x) for x != 0, f(0) = 0 on (-1, 1)",
      justification:
        "f has the intermediate value property on (-1, 1) but is discontinuous at x = 0.",
    },
    {
      id: "ref_cont_not_implies_diff",
      relation: "implies",
      sourceStatementId: "ANA_CONT",
      targetStatementId: "ANA_DIFF",
      contextAssumptions: ["real_function_open_interval"],
      counterexample: "f(x) = |x| on (-1, 1)",
      justification: "f is continuous everywhere on (-1, 1), but not differentiable at x = 0.",
    },
    {
      id: "ref_diff_not_implies_c1",
      relation: "implies",
      sourceStatementId: "ANA_DIFF",
      targetStatementId: "ANA_C1",
      contextAssumptions: ["real_function_open_interval"],
      counterexample: "f(x) = x^2 sin(1/x) for x != 0, f(0) = 0 on (-1, 1)",
      justification:
        "f is differentiable everywhere on (-1, 1), with f'(0)=0, but f'(x) = 2x sin(1/x) - cos(1/x) oscillates and is not continuous at 0.",
    },

    // Puzzle 4 refutations (General Metric Spaces)
    {
      id: "ref_closed_bounded_not_implies_compact",
      relation: "implies",
      sourceStatementId: "TOP_CLOSED_BOUNDED",
      targetStatementId: "TOP_COMPACT",
      contextAssumptions: ["metric_space_ambient"],
      counterexample: "X = l^2 or discrete metric on an infinite set; unit closed ball B(0, 1)",
      justification:
        "In infinite-dimensional normed spaces (or infinite discrete spaces), closed and bounded sets are generally not compact.",
    },
  ],
};
