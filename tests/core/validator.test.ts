import { describe, it, expect } from "vitest";
import {
  linearAlgebraCatalog,
  linearAlgebraPuzzle01,
} from "../../src/core/fixture.js";
import {
  validatePuzzle,
  validateAssignmentIntegrity,
  validatePuzzleDefinition,
  PuzzleSchemaError,
} from "../../src/core/validator.js";
import { createIndexedCatalog } from "../../src/core/catalog.js";
import { PuzzleAssignment, PuzzleDefinition } from "../../src/core/types.js";

describe("Mathematical Validation Engine", () => {
  const indexedCatalog = createIndexedCatalog(linearAlgebraCatalog);

  it("validates the canonical intended assignment as solved", () => {
    // Canonical: s1 -> tile_1 (P1), s5 -> tile_5 (P5), s2 -> tile_2 (P2), s3 -> tile_3 (P3), s4 -> tile_4 (P4)
    const canonicalAssignment: PuzzleAssignment = {
      s1: "tile_1",
      s5: "tile_5",
      s2: "tile_2",
      s3: "tile_3",
      s4: "tile_4",
    };

    const result = validatePuzzle(
      linearAlgebraPuzzle01,
      canonicalAssignment,
      indexedCatalog
    );

    expect(result.assignmentDiagnostic.isValidBijection).toBe(true);
    expect(result.summary.totalEdges).toBe(4);
    expect(result.summary.verifiedEdges).toBe(4);
    expect(result.summary.invalidEdges).toBe(0);
    expect(result.summary.notVerifiedEdges).toBe(0);
    expect(result.isSolved).toBe(true);
  });

  it("validates alternative assignment swapping P1 and P5 as solved", () => {
    // Alternative: s1 -> tile_5 (P5), s5 -> tile_1 (P1)
    const alternativeAssignment: PuzzleAssignment = {
      s1: "tile_5",
      s5: "tile_1",
      s2: "tile_2",
      s3: "tile_3",
      s4: "tile_4",
    };

    const result = validatePuzzle(
      linearAlgebraPuzzle01,
      alternativeAssignment,
      indexedCatalog
    );

    expect(result.isSolved).toBe(true);
    expect(result.summary.verifiedEdges).toBe(4);
  });

  it("rejects initial scrambled assignment and identifies invalid/not_verified edges", () => {
    const result = validatePuzzle(
      linearAlgebraPuzzle01,
      linearAlgebraPuzzle01.initialAssignment,
      indexedCatalog
    );

    expect(result.isSolved).toBe(false);
    expect(result.summary.verifiedEdges).toBeLessThan(4);
    // In initialAssignment: s1 has tile_2 (P2), s3 has tile_5 (P5).
    // Edge e_s1_implies_s3 is P2 => P5, which is not verified
    expect(result.edges["e_s1_implies_s3"].status).toBe("not_verified");
  });

  it("detects explicitly refuted relations as 'invalid' with counterexamples", () => {
    // Create an assignment where s1 has P2 and s2 has P1
    // e_s1_implies_s2 requires s1 => s2, i.e., P2 => P1, which is explicitly refuted
    const assignmentWithRefutation: PuzzleAssignment = {
      s1: "tile_2", // P2
      s2: "tile_1", // P1
      s3: "tile_3",
      s4: "tile_4",
      s5: "tile_5",
    };

    const result = validatePuzzle(
      linearAlgebraPuzzle01,
      assignmentWithRefutation,
      indexedCatalog
    );

    const edge = result.edges["e_s1_implies_s2"];
    expect(edge.status).toBe("invalid");
    expect(edge.counterexample).toBeDefined();
    expect(edge.counterexample).toContain("[[0, 1], [0, 0]]");
  });

  it("marks edges as 'incomplete' when slots are unassigned", () => {
    const partialAssignment: PuzzleAssignment = {
      s1: "tile_1",
      // s2, s3, s4, s5 missing
    };

    const result = validatePuzzle(
      linearAlgebraPuzzle01,
      partialAssignment,
      indexedCatalog
    );

    expect(result.isSolved).toBe(false);
    expect(result.edges["e_s1_implies_s2"].status).toBe("incomplete");
    expect(result.assignmentDiagnostic.isValidBijection).toBe(false);
  });

  it("fails verification if required mathematical assumptions are not met", () => {
    // Puzzle with context lacking matrix_real_square
    const unassumedPuzzle: PuzzleDefinition = {
      ...linearAlgebraPuzzle01,
      id: "unassumed-puzzle",
      context: {
        id: "ctx_empty",
        name: "Empty Context",
        assumptions: ["dimension_finite"], // does NOT have matrix_real_square
      },
    };

    const canonicalAssignment: PuzzleAssignment = {
      s1: "tile_1",
      s5: "tile_5",
      s2: "tile_2",
      s3: "tile_3",
      s4: "tile_4",
    };

    const result = validatePuzzle(
      unassumedPuzzle,
      canonicalAssignment,
      indexedCatalog
    );

    // All relations required matrix_real_square, so under dimension_finite alone, they are not_verified
    expect(result.isSolved).toBe(false);
    expect(result.summary.verifiedEdges).toBe(0);
    expect(result.summary.notVerifiedEdges).toBe(4);
  });
});

describe("Puzzle Definition Schema Integrity", () => {
  it("detects duplicate edge IDs in puzzle definition", () => {
    const badPuzzle: PuzzleDefinition = {
      ...linearAlgebraPuzzle01,
      id: "dup-edge-puzzle",
      edges: [
        {
          id: "e_duplicate",
          sourceSlotId: "s1",
          targetSlotId: "s2",
          relation: "implies",
        },
        {
          id: "e_duplicate",
          sourceSlotId: "s1",
          targetSlotId: "s3",
          relation: "implies",
        },
      ],
    };

    expect(() =>
      validatePuzzleDefinition(badPuzzle, linearAlgebraCatalog)
    ).toThrow(PuzzleSchemaError);
  });

  it("detects invalid initialAssignment in puzzle definition", () => {
    const badInitPuzzle: PuzzleDefinition = {
      ...linearAlgebraPuzzle01,
      id: "bad-init-puzzle",
      initialAssignment: {
        s1: "tile_1",
        s2: "tile_1", // duplicate!
      },
    };

    expect(() =>
      validatePuzzleDefinition(badInitPuzzle, linearAlgebraCatalog)
    ).toThrow(PuzzleSchemaError);
  });
});

describe("Assignment Integrity and Bijection Checking", () => {
  it("detects duplicate tile assignments", () => {
    const duplicateAssignment: PuzzleAssignment = {
      s1: "tile_1",
      s2: "tile_1", // duplicate tile_1!
      s3: "tile_3",
      s4: "tile_4",
      s5: "tile_5",
    };

    const diag = validateAssignmentIntegrity(
      linearAlgebraPuzzle01,
      duplicateAssignment
    );
    expect(diag.isValidBijection).toBe(false);
    expect(
      diag.errors.some((e) => e.includes("assigned more than once"))
    ).toBe(true);
    expect(diag.errors.some((e) => e.includes("tile_2"))).toBe(true);
  });

  it("detects unknown tile and slot IDs", () => {
    const invalidAssignment: PuzzleAssignment = {
      s1: "tile_1",
      s2: "tile_unknown",
      slot_unknown: "tile_3",
      s4: "tile_4",
      s5: "tile_5",
    };

    const diag = validateAssignmentIntegrity(
      linearAlgebraPuzzle01,
      invalidAssignment
    );
    expect(diag.isValidBijection).toBe(false);
    expect(diag.errors.some((e) => e.includes("Unknown tile ID"))).toBe(true);
    expect(diag.errors.some((e) => e.includes("Unknown slot ID"))).toBe(true);
  });
});
