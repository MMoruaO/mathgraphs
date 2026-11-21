import React, { useState, useEffect } from "react";
import { masterCatalog } from "./data/masterCatalog.js";
import { puzzleRegistry, getDefaultPuzzle, getPuzzleById } from "./data/puzzleRegistry.js";
import {
  dailySchedule,
  getDailyEntryForDate,
  getUtcDateKey,
} from "./data/dailySchedule.js";
import { useGameState } from "./state/useGameState.js";
import { PuzzleHeader } from "./components/PuzzleHeader.js";
import { GraphBoard } from "./components/GraphBoard.js";
import { GameControls } from "./components/GameControls.js";
import { ValidationFeedback } from "./components/ValidationFeedback.js";
import { VictoryModal } from "./components/VictoryModal.js";
import { LevelSelectorModal } from "./components/LevelSelectorModal.js";
import { DailyArchiveModal } from "./components/DailyArchiveModal.js";
import { getInitialLanguage, localizePuzzle, messages } from "./i18n.js";

export const App: React.FC = () => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isDailyArchiveOpen, setIsDailyArchiveOpen] = useState(false);
  const [language, setLanguage] = useState(getInitialLanguage);
  const [today, setToday] = useState(getUtcDateKey);
  const todayEntry = getDailyEntryForDate(today);
  const initialPuzzle = (todayEntry?.puzzleId ? getPuzzleById(todayEntry.puzzleId) : undefined)
    ?? getDefaultPuzzle();
  const [selectedDailyDate, setSelectedDailyDate] = useState<string | null>(
    todayEntry?.puzzleId ? todayEntry.date : null
  );
  const availablePuzzles = puzzleRegistry.filter((candidate) => {
    const scheduledFor = dailySchedule.find((entry) => entry.puzzleId === candidate.id);
    return !scheduledFor || scheduledFor.date <= today;
  });

  const {
    state,
    puzzle,
    setPuzzle,
    selectSlot,
    undo,
    reset,
    check,
    clearSelection,
  } = useGameState(initialPuzzle, masterCatalog);

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const currentUtcDate = getUtcDateKey();
      setToday((previousDate) => previousDate === currentUtcDate ? previousDate : currentUtcDate);
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

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
    if (selectedDailyDate) {
      const nextDailyEntry = dailySchedule.find(
        (entry) => entry.date > selectedDailyDate && entry.date <= getUtcDateKey()
      );
      const nextDailyPuzzle = nextDailyEntry?.puzzleId
        ? getPuzzleById(nextDailyEntry.puzzleId)
        : undefined;
      if (nextDailyEntry && nextDailyPuzzle) {
        setPuzzle(nextDailyPuzzle);
        setSelectedDailyDate(nextDailyEntry.date);
        return;
      }
    }

    const currentIndex = availablePuzzles.findIndex((p) => p.id === puzzle.id);
    const nextIndex = (currentIndex + 1) % availablePuzzles.length;
    setPuzzle(availablePuzzles[nextIndex] ?? getDefaultPuzzle());
    setSelectedDailyDate(null);
  };

  const handleSelectDailyPuzzle = (entry: (typeof dailySchedule)[number], selectedPuzzle: (typeof puzzleRegistry)[number]) => {
    setPuzzle(selectedPuzzle);
    setSelectedDailyDate(entry.date);
    setIsDailyArchiveOpen(false);
  };

  const handleSelectPracticePuzzle = (selectedPuzzle: (typeof puzzleRegistry)[number]) => {
    setPuzzle(selectedPuzzle);
    setSelectedDailyDate(null);
  };

  return (
    <div className="app-container">
      <PuzzleHeader
        puzzle={displayPuzzle}
        catalog={masterCatalog}
        language={language}
        onLanguageChange={setLanguage}
        onOpenSelector={() => setIsSelectorOpen(true)}
        onOpenDailyArchive={() => setIsDailyArchiveOpen(true)}
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
        puzzles={availablePuzzles}
        currentPuzzleId={puzzle.id}
        language={language}
        onSelectPuzzle={handleSelectPracticePuzzle}
        onClose={() => setIsSelectorOpen(false)}
      />

      <DailyArchiveModal
        isOpen={isDailyArchiveOpen}
        entries={dailySchedule}
        puzzles={puzzleRegistry}
        currentDate={selectedDailyDate}
        language={language}
        onSelect={handleSelectDailyPuzzle}
        onClose={() => setIsDailyArchiveOpen(false)}
      />
    </div>
  );
};
