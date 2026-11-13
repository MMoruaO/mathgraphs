export type AssumptionId = string;

export interface MathematicalAssumption {
  id: AssumptionId;
  latex: string;
  description: string;
  implies?: AssumptionId[];
}

export interface PuzzleContext {
  id: string;
  name: string;
  assumptions: AssumptionId[];
}

export interface Statement {
  id: string;
  latex: string;
  description: string;
}

export interface Tile {
  id: string;
  statementId: string;
}

export interface Slot {
  id: string;
  position: { x: number; y: number };
}

export type RelationType =
  | "implies"
  | "equivalent"
  | "equals"
  | "subset_of"
  | "member_of";

export interface VerifiedRelation {
  id: string;
  relation: RelationType;
  sourceStatementId: string;
  targetStatementId: string;
  requiredAssumptions: AssumptionId[];
  symmetric: boolean;
  justification?: string;
}

export interface RefutedRelation {
  id: string;
  relation: RelationType;
  sourceStatementId: string;
  targetStatementId: string;
  contextAssumptions: AssumptionId[];
  counterexample: string;
  justification?: string;
}

export interface KnowledgeCatalog {
  assumptions: Record<string, MathematicalAssumption>;
  statements: Record<string, Statement>;
  relations: VerifiedRelation[];
  refutations?: RefutedRelation[];
}

export interface ConstraintEdge {
  id: string;
  sourceSlotId: string;
  targetSlotId: string;
  relation: RelationType;
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  topic: "linear_algebra" | "calculus" | "abstract_algebra" | "topology";
  context: PuzzleContext;
  slots: Slot[];
  edges: ConstraintEdge[];
  tiles: Tile[];
  initialAssignment: Record<string, string>; // slotId -> tileId
}

export type PuzzleAssignment = Record<string, string>; // slotId -> tileId

export type EdgeValidationStatus =
  | "verified"
  | "not_verified"
  | "invalid"
  | "incomplete";

export interface EdgeValidationResult {
  edgeId: string;
  status: EdgeValidationStatus;
  relation: RelationType;
  sourceSlotId: string;
  targetSlotId: string;
  sourceStatementId?: string;
  targetStatementId?: string;
  justification?: string;
  counterexample?: string;
}

export interface AssignmentDiagnostic {
  isValidBijection: boolean;
  errors: string[];
}

export interface PuzzleValidationResult {
  isSolved: boolean;
  assignmentDiagnostic: AssignmentDiagnostic;
  edges: Record<string, EdgeValidationResult>;
  summary: {
    totalEdges: number;
    verifiedEdges: number;
    notVerifiedEdges: number;
    invalidEdges: number;
    incompleteEdges: number;
  };
}
