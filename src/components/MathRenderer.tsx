import React, { useMemo } from "react";
import katex from "katex";

export interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  displayMode = false,
  className = "",
  ariaLabel,
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      console.error("KaTeX rendering error:", e);
      return `<span>${math}</span>`;
    }
  }, [math, displayMode]);

  return (
    <span
      className={`math-rendered ${className}`}
      aria-label={ariaLabel ?? math}
      role="math"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
