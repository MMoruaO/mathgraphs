import React from "react";
import { PuzzleDefinition } from "../core/types.js";

export interface LevelSelectorModalProps {
  isOpen: boolean;
  puzzles: PuzzleDefinition[];
  currentPuzzleId: string;
  onSelectPuzzle: (puzzle: PuzzleDefinition) => void;
  onClose: () => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  isOpen,
  puzzles,
  currentPuzzleId,
  onSelectPuzzle,
  onClose,
}) => {
  if (!isOpen) return null;

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
          <div className="selector-icon">📚</div>
          <h2 id="selector-title" className="victory-title">
            Biblioteca de Puzzles Matemáticos
          </h2>
          <p className="victory-subtitle">
            Selecciona un reto lógico universitario para resolver.
          </p>
        </div>

        <div className="puzzle-cards-grid">
          {puzzles.map((p) => {
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
                aria-label={`Seleccionar puzzle: ${p.title}`}
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
                  <span className="card-topic">{p.topic.replace("_", " ")}</span>
                  <span className={`card-difficulty ${diffClass}`}>
                    {p.difficulty ?? "medium"}
                  </span>
                </div>
                <h3 className="puzzle-card-title">{p.title}</h3>
                <p className="puzzle-card-desc">{p.description}</p>
                <div className="puzzle-card-footer">
                  <span className="card-nodes">
                    {p.slots.length} nodos · {p.edges.length} restricciones
                  </span>
                  {isCurrent && <span className="card-current-badge">Actual</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
