import { PuzzleDefinition, PuzzleTopic, SupportedLanguage } from "./core/types.js";

export type Language = SupportedLanguage;

export interface UiMessages {
  language: string;
  switchTo: string;
  documentTitle: string;
  puzzleLibrary: string;
  puzzleLibraryTitle: string;
  puzzleLibraryDescription: string;
  choosePuzzle: string;
  nodesAndConstraints: (nodes: number, constraints: number) => string;
  current: string;
  close: string;
  globalContext: string;
  universalContextNote: string;
  moves: string;
  checks: string;
  selectedSlot: (slot: string) => string;
  selectAnotherSlot: string;
  undo: string;
  undoTitle: string;
  reset: string;
  resetTitle: string;
  check: string;
  checkTitle: string;
  idleFeedback: string;
  staleFeedback: string;
  solvedFeedback: string;
  verified: string;
  verifiedTitle: string;
  notVerified: string;
  notVerifiedTitle: string;
  refuted: string;
  refutedTitle: string;
  incomplete: string;
  incompleteTitle: string;
  slot: string;
  victoryTitle: string;
  victorySubtitle: string;
  explanationTitle: string;
  retry: string;
  nextPuzzle: string;
  topics: Record<PuzzleTopic, string>;
  difficulties: Record<"easy" | "medium" | "hard", string>;
}

export const messages: Record<Language, UiMessages> = {
  es: {
    language: "Idioma",
    switchTo: "Cambiar idioma a inglés",
    documentTitle: "MathGraphs — Rompecabezas matemáticos",
    puzzleLibrary: "Puzzles",
    puzzleLibraryTitle: "Biblioteca de puzzles matemáticos",
    puzzleLibraryDescription: "Selecciona un reto lógico universitario para resolver.",
    choosePuzzle: "Seleccionar puzzle",
    nodesAndConstraints: (nodes, constraints) => `${nodes} nodos · ${constraints} restricciones`,
    current: "Actual",
    close: "Cerrar",
    globalContext: "Contexto global:",
    universalContextNote: "(Las relaciones deben cumplirse universalmente en este universo)",
    moves: "Movimientos",
    checks: "Comprobaciones",
    selectedSlot: (slot) => `Espacio seleccionado: ${slot}`,
    selectAnotherSlot: "Toca otro espacio para intercambiar las fichas.",
    undo: "Deshacer",
    undoTitle: "Deshacer último movimiento (Ctrl+Z)",
    reset: "Reiniciar",
    resetTitle: "Reiniciar el tablero a la posición inicial",
    check: "Verificar",
    checkTitle: "Verificar la validez matemática de todas las aristas",
    idleFeedback: "Selecciona un espacio y luego otro para intercambiar sus fichas. Pulsa Verificar para revisar las relaciones.",
    staleFeedback: "El tablero cambió desde la última comprobación. Pulsa Verificar para actualizar los resultados.",
    solvedFeedback: "¡Todas las relaciones están verificadas! El puzzle está resuelto.",
    verified: "Verificadas",
    verifiedTitle: "Relaciones respaldadas por el catálogo",
    notVerified: "No verificadas",
    notVerifiedTitle: "Relaciones no registradas en el catálogo; no necesariamente falsas",
    refuted: "Refutadas",
    refutedTitle: "Relaciones refutadas con un contraejemplo explícito",
    incomplete: "Incompletas",
    incompleteTitle: "Relaciones con espacios sin ficha",
    slot: "Espacio",
    victoryTitle: "¡Configuración matemática válida!",
    victorySubtitle: "Organizaste todas las proposiciones y satisfaciste las relaciones del grafo.",
    explanationTitle: "Estructura matemática del grafo:",
    retry: "Reintentar",
    nextPuzzle: "Siguiente puzzle",
    topics: {
      linear_algebra: "Álgebra lineal",
      calculus: "Análisis matemático",
      abstract_algebra: "Álgebra abstracta",
      topology: "Topología",
      logic: "Lógica",
    },
    difficulties: { easy: "Fácil", medium: "Intermedio", hard: "Difícil" },
  },
  en: {
    language: "Language",
    switchTo: "Switch language to Spanish",
    documentTitle: "MathGraphs — Deductive Mathematical Puzzles",
    puzzleLibrary: "Puzzles",
    puzzleLibraryTitle: "Mathematical puzzle library",
    puzzleLibraryDescription: "Choose a university-level logic challenge to solve.",
    choosePuzzle: "Select puzzle",
    nodesAndConstraints: (nodes, constraints) => `${nodes} nodes · ${constraints} constraints`,
    current: "Current",
    close: "Close",
    globalContext: "Global context:",
    universalContextNote: "(Relationships must hold universally in this universe)",
    moves: "Moves",
    checks: "Checks",
    selectedSlot: (slot) => `Selected slot: ${slot}`,
    selectAnotherSlot: "Select another slot to swap the tiles.",
    undo: "Undo",
    undoTitle: "Undo last move (Ctrl+Z)",
    reset: "Reset",
    resetTitle: "Reset the board to its initial arrangement",
    check: "Check",
    checkTitle: "Check the mathematical validity of every edge",
    idleFeedback: "Select one slot, then another to swap their tiles. Press Check to evaluate the relationships.",
    staleFeedback: "The board has changed since the last check. Press Check to update the results.",
    solvedFeedback: "All relationships are verified! The puzzle is solved.",
    verified: "Verified",
    verifiedTitle: "Relationships supported by the catalog",
    notVerified: "Not verified",
    notVerifiedTitle: "Relationships not listed in the catalog; they are not necessarily false",
    refuted: "Refuted",
    refutedTitle: "Relationships refuted by an explicit counterexample",
    incomplete: "Incomplete",
    incompleteTitle: "Relationships with an empty slot",
    slot: "Slot",
    victoryTitle: "Valid mathematical arrangement!",
    victorySubtitle: "You arranged every statement and satisfied the graph relationships.",
    explanationTitle: "Mathematical structure of the graph:",
    retry: "Try again",
    nextPuzzle: "Next puzzle",
    topics: {
      linear_algebra: "Linear algebra",
      calculus: "Real analysis",
      abstract_algebra: "Abstract algebra",
      topology: "Topology",
      logic: "Logic",
    },
    difficulties: { easy: "Easy", medium: "Medium", hard: "Hard" },
  },
};

export function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "es";
  try {
    const saved = window.localStorage.getItem("mathgraphs-language");
    return saved === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

export function localizePuzzle(puzzle: PuzzleDefinition, language: Language): PuzzleDefinition {
  if (language === "es") return puzzle;
  const translation = puzzle.translations?.[language];
  if (!translation) return puzzle;
  return {
    ...puzzle,
    title: translation.title,
    description: translation.description ?? puzzle.description,
    explanation: translation.explanation ?? puzzle.explanation,
  };
}
