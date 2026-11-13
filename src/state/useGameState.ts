import { useState, useCallback } from "react";
import {
  PuzzleDefinition,
  PuzzleAssignment,
  KnowledgeCatalog,
  PuzzleValidationResult,
} from "../core/types.js";
import { validatePuzzle } from "../core/validator.js";
import { createIndexedCatalog } from "../core/catalog.js";

export interface GameState {
  assignment: PuzzleAssignment;
  history: PuzzleAssignment[];
  selectedSlotId: string | null;
  moveCount: number;
  checkCount: number;
  validationResult: PuzzleValidationResult | null;
  isStaleValidation: boolean;
  isSolved: boolean;
}

export interface UseGameStateReturn {
  state: GameState;
  selectSlot: (slotId: string) => void;
  undo: () => void;
  reset: () => void;
  check: () => void;
  clearSelection: () => void;
}

export function useGameState(
  puzzle: PuzzleDefinition,
  catalog: KnowledgeCatalog
): UseGameStateReturn {
  const indexedCatalog = createIndexedCatalog(catalog);

  const [state, setState] = useState<GameState>(() => ({
    assignment: { ...puzzle.initialAssignment },
    history: [{ ...puzzle.initialAssignment }],
    selectedSlotId: null,
    moveCount: 0,
    checkCount: 0,
    validationResult: null,
    isStaleValidation: false,
    isSolved: false,
  }));

  const selectSlot = useCallback(
    (slotId: string) => {
      setState((prev) => {
        if (prev.isSolved) return prev; // Puzzle is solved, disable further moves

        // If clicking the currently selected slot, deselect
        if (prev.selectedSlotId === slotId) {
          return {
            ...prev,
            selectedSlotId: null,
          };
        }

        // If no slot is selected yet, select this slot
        if (prev.selectedSlotId === null) {
          return {
            ...prev,
            selectedSlotId: slotId,
          };
        }

        // Swapping two different slots: prev.selectedSlotId and slotId
        const sourceSlot = prev.selectedSlotId;
        const targetSlot = slotId;

        const currentSourceTile = prev.assignment[sourceSlot];
        const currentTargetTile = prev.assignment[targetSlot];

        const nextAssignment: PuzzleAssignment = {
          ...prev.assignment,
          [sourceSlot]: currentTargetTile,
          [targetSlot]: currentSourceTile,
        };

        return {
          ...prev,
          assignment: nextAssignment,
          history: [...prev.history, nextAssignment],
          selectedSlotId: null,
          moveCount: prev.moveCount + 1,
          // When a swap occurs, clear or mark validation stale
          validationResult: null,
          isStaleValidation: true,
        };
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedSlotId: null,
    }));
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.history.length <= 1) return prev;

      const nextHistory = prev.history.slice(0, -1);
      const previousAssignment = nextHistory[nextHistory.length - 1];

      return {
        ...prev,
        assignment: { ...previousAssignment },
        history: nextHistory,
        selectedSlotId: null,
        moveCount: Math.max(0, prev.moveCount - 1),
        validationResult: null,
        isStaleValidation: true,
        isSolved: false,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      assignment: { ...puzzle.initialAssignment },
      history: [{ ...puzzle.initialAssignment }],
      selectedSlotId: null,
      moveCount: 0,
      checkCount: 0,
      validationResult: null,
      isStaleValidation: false,
      isSolved: false,
    });
  }, [puzzle.initialAssignment]);

  const check = useCallback(() => {
    setState((prev) => {
      const result = validatePuzzle(puzzle, prev.assignment, indexedCatalog);
      return {
        ...prev,
        checkCount: prev.checkCount + 1,
        validationResult: result,
        isStaleValidation: false,
        isSolved: result.isSolved,
      };
    });
  }, [puzzle, indexedCatalog]);

  return {
    state,
    selectSlot,
    undo,
    reset,
    check,
    clearSelection,
  };
}
