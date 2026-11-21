import React from "react";
import { KnowledgeCatalog, PuzzleDefinition } from "../core/types.js";
import { MathRenderer } from "./MathRenderer.js";
import { Language, messages } from "../i18n.js";

export interface PuzzleHeaderProps {
  puzzle: PuzzleDefinition;
  catalog: KnowledgeCatalog;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onOpenSelector: () => void;
  onOpenDailyArchive: () => void;
}

export const PuzzleHeader: React.FC<PuzzleHeaderProps> = ({
  puzzle,
  catalog,
  language,
  onLanguageChange,
  onOpenSelector,
  onOpenDailyArchive,
}) => {
  const text = messages[language];

  return (
    <header className="puzzle-header">
      <div className="header-brand">
        <div className="brand-logo">
          <span className="logo-symbol">∇</span>
          <span className="brand-name">MathGraphs</span>
        </div>
        <span className="brand-tag">{text.topics[puzzle.topic]}</span>
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          onClick={onOpenDailyArchive}
          title={text.dailyChallenge}
        >
          <span className="btn-icon">▦</span> {text.dailyChallenge}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          onClick={onOpenSelector}
          title={text.puzzleLibrary}
        >
          <span className="btn-icon">▦</span> {text.puzzleLibrary}
        </button>
        <div className="language-switch" role="group" aria-label={text.language}>
          <button
            type="button"
            aria-label="Español"
            title={language === "en" ? text.switchTo : "Español"}
            aria-pressed={language === "es"}
            className={language === "es" ? "language-option language-option-active" : "language-option"}
            onClick={() => onLanguageChange("es")}
          >
            ES
          </button>
          <button
            type="button"
            aria-label="English"
            title={language === "es" ? text.switchTo : "English"}
            aria-pressed={language === "en"}
            className={language === "en" ? "language-option language-option-active" : "language-option"}
            onClick={() => onLanguageChange("en")}
          >
            EN
          </button>
        </div>
      </div>

      <div className="header-puzzle-info">
        <h1 className="puzzle-title">{puzzle.title}</h1>
        <div className="puzzle-context-banner">
          <span className="context-label">{text.globalContext}</span>
          <div className="context-math">
            <MathRenderer
              math={puzzle.context.assumptions
                .map((assumptionId) => {
                  const assumption = catalog.assumptions[assumptionId];
                  return assumption?.translations?.[language]?.latex ?? assumption?.latex ?? assumptionId;
                })
                .join(", ")}
            />
          </div>
          <span className="context-note">
            {text.universalContextNote}
          </span>
        </div>
      </div>
    </header>
  );
};
