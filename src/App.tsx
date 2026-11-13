import React, { useEffect } from "react";
import { linearAlgebraPuzzle01, linearAlgebraCatalog } from "./core/fixture.js";
import { useGameState } from "./state/useGameState.js";
import { PuzzleHeader } from "./components/PuzzleHeader.js";
import { GraphBoard } from "./components/GraphBoard.js";
import { GameControls } from "./components/GameControls.js";
import { ValidationFeedback } from "./components/ValidationFeedback.js";
import { VictoryModal } from "./components/VictoryModal.js";

export const App: React.FC = () => {
  const {
    state,
    selectSlot,
    undo,
    reset,
    check,
    clearSelection,
  } = useGameState(linearAlgebraPuzzle01, linearAlgebraCatalog);

  // Keyboard shortcut support: Ctrl+Z for Undo, Space/Enter for Check
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  return (
    <div className="app-container">
      <PuzzleHeader puzzle={linearAlgebraPuzzle01} />

      <main className="board-main">
        <GraphBoard
          puzzle={linearAlgebraPuzzle01}
          catalog={linearAlgebraCatalog}
          assignment={state.assignment}
          selectedSlotId={state.selectedSlotId}
          validationResult={state.validationResult}
          onSelectSlot={selectSlot}
          onClearSelection={clearSelection}
        />
      </main>

      <footer className="bottom-bar">
        <ValidationFeedback
          validationResult={state.validationResult}
          isStale={state.isStaleValidation}
        />
        <GameControls
          onCheck={check}
          onUndo={undo}
          onReset={reset}
          canUndo={state.history.length > 1}
          moveCount={state.moveCount}
          checkCount={state.checkCount}
          selectedSlotId={state.selectedSlotId}
        />
      </footer>

      <VictoryModal
        isOpen={state.isSolved}
        moveCount={state.moveCount}
        checkCount={state.checkCount}
        onReset={reset}
      />
    </div>
  );
};
