import { PuzzleDefinition } from "../core/types.js";
import puzzleLinearAlgebra01 from "./puzzles/linear-algebra-01.json";
import puzzleLinearAlgebra02 from "./puzzles/linear-algebra-invertibility-02.json";
import puzzleAnalysis01 from "./puzzles/analysis-hierarchy-01.json";
import puzzleTopology01 from "./puzzles/topology-compactness-01.json";

export const puzzleRegistry: PuzzleDefinition[] = [
  puzzleLinearAlgebra01 as unknown as PuzzleDefinition,
  puzzleAnalysis01 as unknown as PuzzleDefinition,
  puzzleLinearAlgebra02 as unknown as PuzzleDefinition,
  puzzleTopology01 as unknown as PuzzleDefinition,
];

export function getPuzzleById(id: string): PuzzleDefinition | undefined {
  return puzzleRegistry.find((p) => p.id === id);
}

export function getDefaultPuzzle(): PuzzleDefinition {
  return puzzleRegistry[0];
}
