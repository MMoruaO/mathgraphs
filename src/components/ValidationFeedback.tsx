import React from "react";
import { PuzzleValidationResult } from "../core/types.js";

export interface ValidationFeedbackProps {
  validationResult: PuzzleValidationResult | null;
  isStale: boolean;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validationResult,
  isStale,
}) => {
  if (!validationResult) {
    return (
      <div className="feedback-banner feedback-banner-idle">
        <span>Haz clic en una ficha y luego en otra para intercambiarlas. Pulsa <strong>Verificar</strong> para comprobar las restricciones lógicas.</span>
      </div>
    );
  }

  if (isStale) {
    return (
      <div className="feedback-banner feedback-banner-stale">
        <span className="feedback-icon">⚠️</span>
        <span>El tablero ha cambiado desde la última comprobación. Pulsa <strong>Verificar</strong> para actualizar.</span>
      </div>
    );
  }

  const { isSolved, summary } = validationResult;

  if (isSolved) {
    return (
      <div className="feedback-banner feedback-banner-success">
        <span className="feedback-icon">🎉</span>
        <span>¡Todas las relaciones han sido verificadas con éxito! El puzzle está resuelto.</span>
      </div>
    );
  }

  return (
    <div className="feedback-banner feedback-banner-evaluating">
      <div className="status-chips">
        <span className="chip chip-verified" title="Relaciones demostradas en catálogo">
          ✓ {summary.verifiedEdges} Verificadas
        </span>
        {summary.notVerifiedEdges > 0 && (
          <span className="chip chip-not-verified" title="Relaciones no registradas en catálogo (no necesariamente falsas)">
            ? {summary.notVerifiedEdges} No Verificadas
          </span>
        )}
        {summary.invalidEdges > 0 && (
          <span className="chip chip-invalid" title="Relaciones refutadas con contraejemplo explícito">
            ✗ {summary.invalidEdges} Refutadas
          </span>
        )}
        {summary.incompleteEdges > 0 && (
          <span className="chip chip-incomplete" title="Slots sin ficha">
            ○ {summary.incompleteEdges} Incompletas
          </span>
        )}
      </div>
    </div>
  );
};
