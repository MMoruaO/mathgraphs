import React from "react";
import { MathRenderer } from "./MathRenderer.js";

export interface VictoryModalProps {
  isOpen: boolean;
  moveCount: number;
  checkCount: number;
  onReset: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  moveCount,
  checkCount,
  onReset,
}) => {
  if (!isOpen) return null;

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

        <div className="modal-explanation">
          <h3>Estructura Matemática del Grafo:</h3>
          <ul>
            <li>
              <strong>Equivalencia central:</strong>{" "}
              <MathRenderer math="A^2 = A \iff (I - A)^2 = I - A" />{" "}
              (la idempotencia de una matriz y la de su proyección complementaria son equivalentes).
            </li>
            <li>
              <strong>Implicaciones universales:</strong> Toda matriz idempotente real tiene autovalores en{" "}
              <MathRenderer math="\{0, 1\}" />, es diagonalizable sobre <MathRenderer math="\mathbb{R}" /> y satisface{" "}
              <MathRenderer math="\operatorname{tr}(A) = \operatorname{rank}(A)" />.
            </li>
            <li>
              <strong>Simetría del puzzle:</strong> Existen 12 permutaciones matemáticamente válidas para este grafo; tu deducción es una de ellas.
            </li>
          </ul>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary btn-large" onClick={onReset}>
            Reintentar / Explorar Otra Solución
          </button>
        </div>
      </div>
    </div>
  );
};
