import { describe, it, expect } from "vitest";
import { puzzleRegistry } from "../../src/data/puzzleRegistry.js";
import { masterCatalog } from "../../src/data/masterCatalog.js";
import { validatePuzzleDefinition, validatePuzzle } from "../../src/core/validator.js";
import { solvePuzzleExhaustively } from "../../src/core/solver.js";
import { validateCatalogIntegrity } from "../../src/core/catalog.js";
import { dailySchedule, getDailyEntryStatus } from "../../src/data/dailySchedule.js";

describe("Declarative Puzzle Registry & Catalog Verification", () => {
  it("validates the master catalog integrity without errors or contradictions", () => {
    expect(() => validateCatalogIntegrity(masterCatalog)).not.toThrow();
  });

  it("contains the practice library and the curated daily pilot", () => {
    expect(puzzleRegistry.length).toBeGreaterThanOrEqual(3);
    expect(puzzleRegistry.length).toBe(10);
  });

  it("has unique IDs for all registered puzzles", () => {
    const ids = new Set<string>();
    for (const puzzle of puzzleRegistry) {
      expect(ids.has(puzzle.id)).toBe(false);
      ids.add(puzzle.id);
    }
  });

  it("has a continuous 12-day pilot schedule with past, current, and locked future dates", () => {
    expect(dailySchedule).toHaveLength(12);
    expect(dailySchedule[1].date).toBe("2026-11-16");
    expect(dailySchedule[6].date).toBe("2026-11-21");
    expect(dailySchedule[11].date).toBe("2026-11-26");

    for (let index = 1; index < dailySchedule.length; index += 1) {
      const previous = Date.parse(`${dailySchedule[index - 1].date}T00:00:00Z`);
      const current = Date.parse(`${dailySchedule[index].date}T00:00:00Z`);
      expect(current - previous).toBe(86_400_000);
    }

    const publishedEntries = dailySchedule.filter((entry) => entry.puzzleId !== null);
    expect(publishedEntries.every((entry) =>
      puzzleRegistry.some((puzzle) => puzzle.id === entry.puzzleId)
    )).toBe(true);
    expect(dailySchedule.slice(7).every((entry) => entry.puzzleId === null)).toBe(true);
    expect(getDailyEntryStatus(dailySchedule[1], "2026-11-21")).toBe("archived");
    expect(getDailyEntryStatus(dailySchedule[6], "2026-11-21")).toBe("today");
    expect(getDailyEntryStatus(dailySchedule[11], "2026-11-21")).toBe("upcoming");
    expect(getDailyEntryStatus(dailySchedule[7], "2026-11-23")).toBe("unavailable");
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
      if (!expected) continue;
      const result = solvePuzzleExhaustively(puzzle, masterCatalog);
      expect(result.totalPermutationsEvaluated).toBe(expected.permutations);
      expect(result.totalSolutions).toBe(expected.solutions);
    }

    expect(Object.keys(expectedSolutions)).toHaveLength(4);

    const refutation = masterCatalog.refutations?.find(
      (relation) => relation.id === "ref_inv_not_implies_orthogonal"
    );
    expect(refutation?.counterexample).toContain("[[2, 0], [0, 1]]");
  });

  it("keeps the reviewed solution multiplicity for every scheduled challenge", () => {
    const expectedDailySolutions: Record<string, number> = {
      "daily-logic-implication-chain": 1,
      "daily-set-difference-inclusion": 1,
      "daily-basis-properties": 2,
      "linear-algebra-invertibility-02": 6,
      "daily-preimage-identities": 4,
      "daily-basis-unique-coordinates": 2,
      "daily-set-intersection-inclusion": 1,
    };

    for (const entry of dailySchedule.filter((scheduled) => scheduled.puzzleId !== null)) {
      if (!entry.puzzleId) continue;
      const puzzle = puzzleRegistry.find((candidate) => candidate.id === entry.puzzleId);
      if (!puzzle) throw new Error(`Missing scheduled puzzle ${entry.puzzleId}`);
      const result = solvePuzzleExhaustively(puzzle, masterCatalog);
      expect(result.totalSolutions, entry.puzzleId).toBe(expectedDailySolutions[entry.puzzleId]);
    }

    expect(Object.keys(expectedDailySolutions)).toHaveLength(7);
  });
});
