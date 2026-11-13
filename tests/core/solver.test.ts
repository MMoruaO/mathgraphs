import { describe, it, expect } from "vitest";
import {
  linearAlgebraCatalog,
  linearAlgebraPuzzle01,
} from "../../src/core/fixture.js";
import { solvePuzzleExhaustively } from "../../src/core/solver.js";
import { PuzzleDefinition } from "../../src/core/types.js";

describe("Exhaustive Solver & Solution Multiplicity", () => {
  it("evaluates all 120 permutations of the reference 5-node puzzle and finds exactly 12 solutions", () => {
    const result = solvePuzzleExhaustively(
      linearAlgebraPuzzle01,
      linearAlgebraCatalog
    );

    // 5! = 120 permutations
    expect(result.totalPermutationsEvaluated).toBe(120);

    // Exactly 12 solutions satisfy every constraint
    expect(result.totalSolutions).toBe(12);
    expect(result.isSolvable).toBe(true);
    expect(result.hasUniqueSolution).toBe(false);

    // The remaining 108 permutations are NOT solutions
    const nonSolutions =
      result.totalPermutationsEvaluated - result.totalSolutions;
    expect(nonSolutions).toBe(108);

    // Mathematical verification of the 12 solutions:
    // In every valid solution:
    // - Either s1 is tile_1 (P1) and s5 is tile_5 (P5), OR s1 is tile_5 (P5) and s5 is tile_1 (P1).
    // - The set of tiles in {s2, s3, s4} must be {tile_2, tile_3, tile_4} (P2, P3, P4).
    for (const sol of result.solutions) {
      const s1 = sol.s1;
      const s5 = sol.s5;

      const p1p5Pairs =
        (s1 === "tile_1" && s5 === "tile_5") ||
        (s1 === "tile_5" && s5 === "tile_1");
      expect(p1p5Pairs).toBe(true);

      const branchTiles = new Set([sol.s2, sol.s3, sol.s4]);
      expect(branchTiles.has("tile_2")).toBe(true);
      expect(branchTiles.has("tile_3")).toBe(true);
      expect(branchTiles.has("tile_4")).toBe(true);
    }
  });

  it("handles puzzles with zero valid solutions (unsatisfiable)", () => {
    // Modify puzzle edges to require an impossible relation (e.g. s2 => s1 which is refuted)
    const impossiblePuzzle: PuzzleDefinition = {
      ...linearAlgebraPuzzle01,
      id: "impossible-puzzle",
      edges: [
        ...linearAlgebraPuzzle01.edges,
        {
          id: "e_impossible",
          sourceSlotId: "s2",
          targetSlotId: "s1",
          relation: "implies",
        },
      ],
    };

    const result = solvePuzzleExhaustively(
      impossiblePuzzle,
      linearAlgebraCatalog
    );

    // Because in all 12 solutions s1 in {P1, P5} and s2 in {P2, P3, P4},
    // and neither P2, P3, nor P4 implies P1 or P5, no solution exists.
    expect(result.totalSolutions).toBe(0);
    expect(result.isSolvable).toBe(false);
    expect(result.hasUniqueSolution).toBe(false);
  });

  it("does not mutate the puzzle definition during solving", () => {
    const slotsBefore = JSON.stringify(linearAlgebraPuzzle01.slots);
    const edgesBefore = JSON.stringify(linearAlgebraPuzzle01.edges);

    solvePuzzleExhaustively(linearAlgebraPuzzle01, linearAlgebraCatalog);

    expect(JSON.stringify(linearAlgebraPuzzle01.slots)).toBe(slotsBefore);
    expect(JSON.stringify(linearAlgebraPuzzle01.edges)).toBe(edgesBefore);
  });
});
