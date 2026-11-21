import React from "react";
import { PuzzleValidationResult } from "../core/types.js";
import { Language, messages } from "../i18n.js";

export interface ValidationFeedbackProps {
  validationResult: PuzzleValidationResult | null;
  isStale: boolean;
  language: Language;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validationResult,
  isStale,
  language,
}) => {
  const text = messages[language];

  if (!validationResult) {
    return (
      <div className="feedback-banner feedback-banner-idle">
        <span>{text.idleFeedback}</span>
      </div>
    );
  }

  if (isStale) {
    return (
      <div className="feedback-banner feedback-banner-stale">
        <span className="feedback-icon">!</span>
        <span>{text.staleFeedback}</span>
      </div>
    );
  }

  const { isSolved, summary } = validationResult;

  if (isSolved) {
    return (
      <div className="feedback-banner feedback-banner-success">
        <span className="feedback-icon">✓</span>
        <span>{text.solvedFeedback}</span>
      </div>
    );
  }

  return (
    <div className="feedback-banner feedback-banner-evaluating">
      <div className="status-chips">
        <span className="chip chip-verified" title={text.verifiedTitle}>
          ✓ {summary.verifiedEdges} {text.verified}
        </span>
        {summary.notVerifiedEdges > 0 && (
          <span className="chip chip-not-verified" title={text.notVerifiedTitle}>
            ? {summary.notVerifiedEdges} {text.notVerified}
          </span>
        )}
        {summary.invalidEdges > 0 && (
          <span className="chip chip-invalid" title={text.refutedTitle}>
            ✗ {summary.invalidEdges} {text.refuted}
          </span>
        )}
        {summary.incompleteEdges > 0 && (
          <span className="chip chip-incomplete" title={text.incompleteTitle}>
            ○ {summary.incompleteEdges} {text.incomplete}
          </span>
        )}
      </div>
    </div>
  );
};
