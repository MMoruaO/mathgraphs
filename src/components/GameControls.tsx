import React from "react";

export interface GameControlsProps {
  onCheck: () => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  moveCount: number;
  checkCount: number;
  selectedSlotId: string | null;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onCheck,
  onUndo,
  onReset,
  canUndo,
  moveCount,
  checkCount,
  selectedSlotId,
}) => {
  return (
    <div className="game-controls">
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Movimientos</span>
          <span className="stat-value">{moveCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Verificaciones</span>
          <span className="stat-value">{checkCount}</span>
        </div>
        {selectedSlotId && (
          <div className="stat-item selection-indicator">
            <span className="selection-dot"></span>
            <span>Slot seleccionado: <strong>{selectedSlotId}</strong> (toca otro slot para intercambiar)</span>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-secondary"
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer último movimiento (Ctrl+Z)"
        >
          <span className="btn-icon">↺</span> Deshacer
        </button>

        <button
          className="btn btn-secondary"
          onClick={onReset}
          title="Reiniciar el tablero a la posición inicial"
        >
          <span className="btn-icon">⟲</span> Reiniciar
        </button>

        <button
          className="btn btn-primary"
          onClick={onCheck}
          title="Verificar validez matemática de todas las aristas"
        >
          <span className="btn-icon">✓</span> Verificar
        </button>
      </div>
    </div>
  );
};
