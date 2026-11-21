import React from "react";
import { PuzzleDefinition } from "../core/types.js";
import { Language, localizePuzzle, messages } from "../i18n.js";

export interface LevelSelectorModalProps {
  isOpen: boolean;
  puzzles: PuzzleDefinition[];
  currentPuzzleId: string;
  language: Language;
  onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
  onClose: () => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  isOpen,
  puzzles,
  currentPuzzleId,
  language,
  onSelectPuzzle,
  onClose,
}) => {
  if (!isOpen) return null;
  const text = messages[language];

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="selector-title"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("modal-backdrop")) {
          onClose();
        }
      }}
    >
      <div className="modal-card modal-card-wide">
        <div className="modal-header">
          <div className="selector-icon">▤</div>
          <h2 id="selector-title" className="victory-title">
            {text.puzzleLibraryTitle}
          </h2>
          <p className="victory-subtitle">
            {text.puzzleLibraryDescription}
          </p>
        </div>

        <div className="puzzle-cards-grid">
          {puzzles.map((p) => {
            const displayPuzzle = localizePuzzle(p, language);
            const isCurrent = p.id === currentPuzzleId;
            const diffClass =
              p.difficulty === "easy"
                ? "diff-easy"
                : p.difficulty === "hard"
                ? "diff-hard"
                : "diff-medium";

            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`${text.choosePuzzle}: ${displayPuzzle.title}`}
                className={`puzzle-card ${isCurrent ? "puzzle-card-active" : ""}`}
                onClick={() => {
                  onSelectPuzzle(p);
                  onClose();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectPuzzle(p);
                    onClose();
                  }
                }}
              >
                <div className="puzzle-card-header">
                  <span className="card-topic">{text.topics[p.topic]}</span>
                  <span className={`card-difficulty ${diffClass}`}>
                    {text.difficulties[p.difficulty ?? "medium"]}
                  </span>
                </div>
                <h3 className="puzzle-card-title">{displayPuzzle.title}</h3>
                <p className="puzzle-card-desc">{displayPuzzle.description}</p>
                <div className="puzzle-card-footer">
                  <span className="card-nodes">
                    {text.nodesAndConstraints(p.slots.length, p.edges.length)}
                  </span>
                  {isCurrent && <span className="card-current-badge">{text.current}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {text.close}
          </button>
        </div>
      </div>
    </div>
  );
};
