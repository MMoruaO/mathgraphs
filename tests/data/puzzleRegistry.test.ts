import { describe, it, expect } from "vitest";
import { puzzleRegistry } from "../../src/data/puzzleRegistry.js";
import { masterCatalog } from "../../src/data/masterCatalog.js";
import { validatePuzzleDefinition, validatePuzzle } from "../../src/core/validator.js";
import { solvePuzzleExhaustively } from "../../src/core/solver.js";
import { validateCatalogIntegrity } from "../../src/core/catalog.js";

describe("Declarative Puzzle Registry & Catalog Verification", () => {
  it("validates the master catalog integrity without errors or contradictions", () => {
    expect(() => validateCatalogIntegrity(masterCatalog)).not.toThrow();
  });

  it("contains between 3 and 5 registered declarative puzzles", () => {
    expect(puzzleRegistry.length).toBeGreaterThanOrEqual(3);
    expect(puzzleRegistry.length).toBeLessThanOrEqual(5);
  });

  it("has unique IDs for all registered puzzles", () => {
    const ids = new Set<string>();
    for (const puzzle of puzzleRegistry) {
      expect(ids.has(puzzle.id)).toBe(false);
      ids.add(puzzle.id);
    }
  });

  puzzleRegistry.forEach((puzzle) => {
    describe(`Puzzle: [${puzzle.id}] "${puzzle.title}"`, () => {
      it("passes schema and static integrity verification", () => {
        expect(() =>
          validatePuzzleDefinition(puzzle, masterCatalog)
        ).not.toThrow();
      });

      it("starts in an unsolved initial configuration", () => {
        const initialResult = validatePuzzle(
          puzzle,
          puzzle.initialAssignment,
          masterCatalog
        );
        expect(initialResult.isSolved).toBe(false);
      });

    it("has at least one catalog-verified solution", () => {
        const solverResult = solvePuzzleExhaustively(puzzle, masterCatalog);

        expect(solverResult.isSolvable).toBe(true);
        expect(solverResult.totalSolutions).toBeGreaterThanOrEqual(1);

        // Verify that the solver's discovered solutions all pass the validator directly
        for (const solution of solverResult.solutions) {
          const check = validatePuzzle(puzzle, solution, masterCatalog);
          expect(check.isSolved).toBe(true);
        }

        console.log(
        `Puzzle [${puzzle.id}]: ${solverResult.totalSolutions} catalog-verified solution(s) found across ${solverResult.totalPermutationsEvaluated} permutations.`
        );
      });
    });
  });

  it("keeps reviewed catalog solution counts for the full library", () => {
    const expectedSolutions: Record<string, { permutations: number; solutions: number }> = {
      "linear-algebra-01": { permutations: 120, solutions: 12 },
      "analysis-hierarchy-01": { permutations: 24, solutions: 1 },
      "linear-algebra-invertibility-02": { permutations: 24, solutions: 6 },
      "topology-compactness-01": { permutations: 24, solutions: 4 },
    };

    for (const puzzle of puzzleRegistry) {
      const expected = expectedSolutions[puzzle.id];
      if (!expected) throw new Error(`Missing reviewed count for ${puzzle.id}`);
      const result = solvePuzzleExhaustively(puzzle, masterCatalog);
      expect(result.totalPermutationsEvaluated).toBe(expected.permutations);
      expect(result.totalSolutions).toBe(expected.solutions);
    }

    expect(Object.keys(expectedSolutions)).toHaveLength(puzzleRegistry.length);

    const refutation = masterCatalog.refutations?.find(
      (relation) => relation.id === "ref_inv_not_implies_orthogonal"
    );
    expect(refutation?.counterexample).toContain("[[2, 0], [0, 1]]");
  });
});
