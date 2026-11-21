import React from "react";
import { MathRenderer } from "./MathRenderer.js";
import { PuzzleDefinition } from "../core/types.js";

export interface VictoryModalProps {
  isOpen: boolean;
  puzzle: PuzzleDefinition;
  moveCount: number;
  checkCount: number;
  onReset: () => void;
  onNextPuzzle?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  puzzle,
  moveCount,
  checkCount,
  onReset,
  onNextPuzzle,
}) => {
  if (!isOpen) return null;

  const explanation = puzzle.explanation;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="victory-title">
      <div className="modal-card">
        <div className="modal-header">
          <div className="victory-icon">∇</div>
          <h2 id="victory-title" className="victory-title">
            ¡Configuración Matemática Válida!
          </h2>
          <p className="victory-subtitle">
            Has organizado todas las proposiciones satisfaciendo el 100% de las restricciones lógicas.
          </p>
        </div>

        <div className="modal-stats">
          <div className="modal-stat-box">
            <span className="modal-stat-number">{moveCount}</span>
            <span className="modal-stat-label">Movimientos</span>
          </div>
          <div className="modal-stat-box">
            <span className="modal-stat-number">{checkCount}</span>
            <span className="modal-stat-label">Comprobaciones</span>
          </div>
        </div>

        {explanation && (
          <div className="modal-explanation">
            <h3>Estructura Matemática del Grafo:</h3>
            <p className="explanation-summary">{explanation.summary}</p>
            <ul>
              {explanation.items.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.title}:</strong>{" "}
                  {item.math && <MathRenderer math={item.math} />}{" "}
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-actions gap-2">
          <button className="btn btn-secondary" onClick={onReset}>
            Reintentar
          </button>
          {onNextPuzzle && (
            <button className="btn btn-primary btn-large" onClick={onNextPuzzle}>
              Siguiente Puzzle ➜
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
