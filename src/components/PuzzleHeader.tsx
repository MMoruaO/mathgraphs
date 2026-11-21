import React from "react";
import { KnowledgeCatalog, PuzzleDefinition } from "../core/types.js";
import { MathRenderer } from "./MathRenderer.js";

export interface PuzzleHeaderProps {
  puzzle: PuzzleDefinition;
  catalog: KnowledgeCatalog;
  onOpenSelector: () => void;
}

export const PuzzleHeader: React.FC<PuzzleHeaderProps> = ({
  puzzle,
  catalog,
  onOpenSelector,
}) => {
  return (
    <header className="puzzle-header">
      <div className="header-brand">
        <div className="brand-logo">
          <span className="logo-symbol">∇</span>
          <span className="brand-name">MathGraphs</span>
        </div>
        <span className="brand-tag">{puzzle.topic.replace("_", " ")}</span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenSelector}
          title="Cambiar puzzle o ver biblioteca"
        >
          <span className="btn-icon">📚</span> Puzzles
        </button>
      </div>

      <div className="header-puzzle-info">
        <h1 className="puzzle-title">{puzzle.title}</h1>
        <div className="puzzle-context-banner">
          <span className="context-label">Contexto Global (Axiomas):</span>
          <div className="context-math">
            <MathRenderer
              math={puzzle.context.assumptions
                .map((assumptionId) => catalog.assumptions[assumptionId]?.latex ?? assumptionId)
                .join(", ")}
            />
          </div>
          <span className="context-note">
            (Las relaciones deben cumplirse universalmente en este universo)
          </span>
        </div>
      </div>
    </header>
  );
};
