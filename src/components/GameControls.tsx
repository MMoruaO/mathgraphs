import React from "react";
import { Language, messages } from "../i18n.js";

export interface GameControlsProps {
  onCheck: () => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  moveCount: number;
  checkCount: number;
  selectedSlotId: string | null;
  language: Language;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onCheck,
  onUndo,
  onReset,
  canUndo,
  moveCount,
  checkCount,
  selectedSlotId,
  language,
}) => {
  const text = messages[language];

  return (
    <div className="game-controls">
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">{text.moves}</span>
          <span className="stat-value">{moveCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{text.checks}</span>
          <span className="stat-value">{checkCount}</span>
        </div>
        {selectedSlotId && (
          <div className="stat-item selection-indicator">
            <span className="selection-dot"></span>
            <span>{text.selectedSlot(selectedSlotId)}. {text.selectAnotherSlot}</span>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-secondary"
          onClick={onUndo}
          disabled={!canUndo}
          title={text.undoTitle}
        >
          <span className="btn-icon">↺</span> {text.undo}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onReset}
          title={text.resetTitle}
        >
          <span className="btn-icon">⟲</span> {text.reset}
        </button>

        <button
          className="btn btn-primary"
          onClick={onCheck}
          title={text.checkTitle}
        >
          <span className="btn-icon">✓</span> {text.check}
        </button>
      </div>
    </div>
  );
};
