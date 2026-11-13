import React from "react";
import { PuzzleDefinition } from "../core/types.js";
import { MathRenderer } from "./MathRenderer.js";

export interface PuzzleHeaderProps {
  puzzle: PuzzleDefinition;
}

export const PuzzleHeader: React.FC<PuzzleHeaderProps> = ({ puzzle }) => {
  return (
    <header className="puzzle-header">
      <div className="header-brand">
        <div className="brand-logo">
          <span className="logo-symbol">∇</span>
          <span className="brand-name">MathGraphs</span>
        </div>
        <span className="brand-tag">Álgebra Lineal</span>
      </div>

      <div className="header-puzzle-info">
        <h1 className="puzzle-title">{puzzle.title}</h1>
        <div className="puzzle-context-banner">
          <span className="context-label">Contexto Global (Axiomas):</span>
          <div className="context-math">
            <MathRenderer math="A \in M_n(\mathbb{R}), \quad n \ge 1" />
          </div>
          <span className="context-note">
            (Las relaciones deben cumplirse universalmente para toda matriz en este universo)
          </span>
        </div>
      </div>
    </header>
  );
};
