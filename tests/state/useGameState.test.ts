import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameState } from "../../src/state/useGameState.js";
import {
  linearAlgebraCatalog,
  linearAlgebraPuzzle01,
} from "../../src/core/fixture.js";

describe("useGameState Hook Integration", () => {
  it("initializes with the initial scrambled assignment and zero counters", () => {
    const { result } = renderHook(() =>
      useGameState(linearAlgebraPuzzle01, linearAlgebraCatalog)
    );

    expect(result.current.state.assignment).toEqual(
      linearAlgebraPuzzle01.initialAssignment
    );
    expect(result.current.state.moveCount).toBe(0);
    expect(result.current.state.checkCount).toBe(0);
    expect(result.current.state.selectedSlotId).toBeNull();
    expect(result.current.state.isSolved).toBe(false);
  });

  it("handles slot selection and deselection", () => {
    const { result } = renderHook(() =>
      useGameState(linearAlgebraPuzzle01, linearAlgebraCatalog)
    );

    // Select s1
    act(() => {
      result.current.selectSlot("s1");
    });
    expect(result.current.state.selectedSlotId).toBe("s1");

    // Click s1 again to deselect
    act(() => {
      result.current.selectSlot("s1");
    });
    expect(result.current.state.selectedSlotId).toBeNull();
  });

  it("swaps tiles when two distinct slots are selected in sequence", () => {
    const { result } = renderHook(() =>
      useGameState(linearAlgebraPuzzle01, linearAlgebraCatalog)
    );

    const initialS1 = result.current.state.assignment.s1;
    const initialS2 = result.current.state.assignment.s2;

    act(() => {
      result.current.selectSlot("s1");
    });
    act(() => {
      result.current.selectSlot("s2");
    });

    expect(result.current.state.assignment.s1).toBe(initialS2);
    expect(result.current.state.assignment.s2).toBe(initialS1);
    expect(result.current.state.moveCount).toBe(1);
    expect(result.current.state.selectedSlotId).toBeNull();
    expect(result.current.state.history.length).toBe(2);
  });

  it("supports undo and reverts to the previous assignment", () => {
    const { result } = renderHook(() =>
      useGameState(linearAlgebraPuzzle01, linearAlgebraCatalog)
    );

    const initialAssignment = { ...result.current.state.assignment };

    // Swap s1 and s2
    act(() => {
      result.current.selectSlot("s1");
      result.current.selectSlot("s2");
    });
    expect(result.current.state.moveCount).toBe(1);

    // Undo swap
    act(() => {
      result.current.undo();
    });

    expect(result.current.state.assignment).toEqual(initialAssignment);
    expect(result.current.state.moveCount).toBe(0);
    expect(result.current.state.history.length).toBe(1);
  });

  it("resets the board completely", () => {
    const { result } = renderHook(() =>
      useGameState(linearAlgebraPuzzle01, linearAlgebraCatalog)
    );

    // Perform multiple swaps and a check
    act(() => {
      result.current.selectSlot("s1");
      result.current.selectSlot("s2");
      result.current.check();
    });

    expect(result.current.state.moveCount).toBe(1);
    expect(result.current.state.checkCount).toBe(1);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.state.assignment).toEqual(
      linearAlgebraPuzzle01.initialAssignment
    );
    expect(result.current.state.moveCount).toBe(0);
    expect(result.current.state.checkCount).toBe(0);
    expect(result.current.state.validationResult).toBeNull();
    expect(result.current.state.isSolved).toBe(false);
  });

  it("marks validation stale when a swap occurs after checking", () => {
    const { result } = renderHook(() =>
      useGameState(linearAlgebraPuzzle01, linearAlgebraCatalog)
    );

    // Check
    act(() => {
      result.current.check();
    });
    expect(result.current.state.validationResult).not.toBeNull();
    expect(result.current.state.isStaleValidation).toBe(false);

    // Swap
    act(() => {
      result.current.selectSlot("s1");
      result.current.selectSlot("s3");
    });

    expect(result.current.state.isStaleValidation).toBe(true);
    expect(result.current.state.validationResult).toBeNull();
  });

  it("detects solved state when all constraints are verified", () => {
    const { result } = renderHook(() =>
      useGameState(linearAlgebraPuzzle01, linearAlgebraCatalog)
    );

    // Canonical solution mapping:
    // s1: tile_1 (P1)
    // s5: tile_5 (P5)
    // s2: tile_2 (P2)
    // s3: tile_3 (P3)
    // s4: tile_4 (P4)

    // Initial assignment is:
    // s1: tile_2
    // s2: tile_1
    // s3: tile_5
    // s4: tile_3
    // s5: tile_4

    // Swap 1: s1 (tile_2) <-> s2 (tile_1) => s1 has tile_1, s2 has tile_2 (s1 and s2 correct!)
    act(() => {
      result.current.selectSlot("s1");
      result.current.selectSlot("s2");
    });

    // Current: s1: tile_1, s2: tile_2, s3: tile_5, s4: tile_3, s5: tile_4
    // Swap 2: s3 (tile_5) <-> s5 (tile_4) => s3 has tile_4, s5 has tile_5 (s5 correct!)
    act(() => {
      result.current.selectSlot("s3");
      result.current.selectSlot("s5");
    });

    // Current: s3: tile_4, s4: tile_3
    // Swap 3: s3 (tile_4) <-> s4 (tile_3) => s3 has tile_3, s4 has tile_4 (all correct!)
    act(() => {
      result.current.selectSlot("s3");
      result.current.selectSlot("s4");
    });

    // Perform check
    act(() => {
      result.current.check();
    });

    expect(result.current.state.isSolved).toBe(true);
    expect(result.current.state.validationResult?.isSolved).toBe(true);
    expect(result.current.state.validationResult?.summary.verifiedEdges).toBe(4);
  });
});
