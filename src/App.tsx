import React, { useState, useEffect } from "react";
import { masterCatalog } from "./data/masterCatalog.js";
import { puzzleRegistry, getDefaultPuzzle } from "./data/puzzleRegistry.js";
import { useGameState } from "./state/useGameState.js";
import { PuzzleHeader } from "./components/PuzzleHeader.js";
import { GraphBoard } from "./components/GraphBoard.js";
import { GameControls } from "./components/GameControls.js";
import { ValidationFeedback } from "./components/ValidationFeedback.js";
import { VictoryModal } from "./components/VictoryModal.js";
import { LevelSelectorModal } from "./components/LevelSelectorModal.js";
import { getInitialLanguage, localizePuzzle, messages } from "./i18n.js";

export const App: React.FC = () => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [language, setLanguage] = useState(getInitialLanguage);

  const {
    state,
    puzzle,
    setPuzzle,
    selectSlot,
    undo,
    reset,
    check,
    clearSelection,
  } = useGameState(getDefaultPuzzle(), masterCatalog);

  const displayPuzzle = localizePuzzle(puzzle, language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = messages[language].documentTitle;
    try {
      window.localStorage.setItem("mathgraphs-language", language);
    } catch {
      // The language remains usable for this session if browser storage is unavailable.
    }
  }, [language]);

  // Keyboard shortcut support: Ctrl+Z for Undo
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

  const handleNextPuzzle = () => {
    const currentIndex = puzzleRegistry.findIndex((p) => p.id === puzzle.id);
    const nextIndex = (currentIndex + 1) % puzzleRegistry.length;
    setPuzzle(puzzleRegistry[nextIndex]);
  };

  return (
    <div className="app-container">
      <PuzzleHeader
        puzzle={displayPuzzle}
        catalog={masterCatalog}
        language={language}
        onLanguageChange={setLanguage}
        onOpenSelector={() => setIsSelectorOpen(true)}
      />

      <main className="board-main">
        <GraphBoard
          puzzle={puzzle}
          catalog={masterCatalog}
          language={language}
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
          language={language}
        />
        <GameControls
          onCheck={check}
          onUndo={undo}
          onReset={reset}
          canUndo={state.history.length > 1}
          moveCount={state.moveCount}
          checkCount={state.checkCount}
          selectedSlotId={state.selectedSlotId}
          language={language}
        />
      </footer>

      <VictoryModal
        isOpen={state.isSolved}
        puzzle={displayPuzzle}
        language={language}
        moveCount={state.moveCount}
        checkCount={state.checkCount}
        onReset={reset}
        onNextPuzzle={handleNextPuzzle}
      />

      <LevelSelectorModal
        isOpen={isSelectorOpen}
        puzzles={puzzleRegistry}
        currentPuzzleId={puzzle.id}
        language={language}
        onSelectPuzzle={setPuzzle}
        onClose={() => setIsSelectorOpen(false)}
      />
    </div>
  );
};
