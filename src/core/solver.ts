import {
  PuzzleDefinition,
  PuzzleAssignment,
  KnowledgeCatalog,
  PuzzleValidationResult,
} from "./types.js";
import {
  IndexedKnowledgeCatalog,
  createIndexedCatalog,
} from "./catalog.js";
import { validatePuzzle } from "./validator.js";

export interface SolverResult {
  puzzleId: string;
  totalPermutationsEvaluated: number;
  totalSolutions: number;
  solutions: PuzzleAssignment[];
  isSolvable: boolean;
  hasUniqueSolution: boolean;
}

/**
 * Generates all permutations of an array.
 */
function permute<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr.slice()];
  const result: T[][] = [];

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
    const subPerms = permute(remaining);
    for (const sub of subPerms) {
      result.push([current, ...sub]);
    }
  }

  return result;
}

/**
 * Deterministic exhaustive solver that evaluates all permutations of tiles across slots.
 * Intended for offline analysis, verification of test fixtures, and puzzle integrity checks.
 * Does NOT mutate the input puzzle definition.
 */
export function solvePuzzleExhaustively(
  puzzle: PuzzleDefinition,
  catalogOrIndexed: KnowledgeCatalog | IndexedKnowledgeCatalog,
  onProgress?: (evaluated: number, total: number) => void
): SolverResult {
  const indexedCatalog =
    "verifiedMap" in catalogOrIndexed
      ? catalogOrIndexed
      : createIndexedCatalog(catalogOrIndexed);

  const slotIds = puzzle.slots.map((s) => s.id);
  const tileIds = puzzle.tiles.map((t) => t.id);

  if (slotIds.length !== tileIds.length) {
    return {
      puzzleId: puzzle.id,
      totalPermutationsEvaluated: 0,
      totalSolutions: 0,
      solutions: [],
      isSolvable: false,
      hasUniqueSolution: false,
    };
  }

  const tilePermutations = permute(tileIds);
  const solutions: PuzzleAssignment[] = [];
  let evaluated = 0;
  const total = tilePermutations.length;

  for (const perm of tilePermutations) {
    evaluated++;
    const assignment: PuzzleAssignment = {};
    for (let i = 0; i < slotIds.length; i++) {
      assignment[slotIds[i]] = perm[i];
    }

    const validation: PuzzleValidationResult = validatePuzzle(
      puzzle,
      assignment,
      indexedCatalog
    );

    if (validation.isSolved) {
      // Clone assignment to guarantee pure immutability
      solutions.push({ ...assignment });
    }

    if (onProgress && evaluated % 20 === 0) {
      onProgress(evaluated, total);
    }
  }

  return {
    puzzleId: puzzle.id,
    totalPermutationsEvaluated: evaluated,
    totalSolutions: solutions.length,
    solutions,
    isSolvable: solutions.length > 0,
    hasUniqueSolution: solutions.length === 1,
  };
}
