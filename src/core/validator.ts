import {
  PuzzleDefinition,
  PuzzleAssignment,
  KnowledgeCatalog,
  PuzzleValidationResult,
  EdgeValidationResult,
  AssignmentDiagnostic,
} from "./types.js";
import {
  IndexedKnowledgeCatalog,
  createIndexedCatalog,
  indexKey,
} from "./catalog.js";

export class PuzzleSchemaError extends Error {
  constructor(message: string) {
    super(`PuzzleSchemaError: ${message}`);
    this.name = "PuzzleSchemaError";
  }
}

/**
 * Validates the schema and static integrity of a puzzle definition.
 */
export function validatePuzzleDefinition(
  puzzle: PuzzleDefinition,
  catalog: KnowledgeCatalog
): void {
  const slotIds = new Set<string>();
  for (const slot of puzzle.slots) {
    if (slotIds.has(slot.id)) {
      throw new PuzzleSchemaError(`Duplicate slot ID: '${slot.id}'`);
    }
    slotIds.add(slot.id);
  }

  const tileIds = new Set<string>();
  for (const tile of puzzle.tiles) {
    if (tileIds.has(tile.id)) {
      throw new PuzzleSchemaError(`Duplicate tile ID: '${tile.id}'`);
    }
    tileIds.add(tile.id);
    if (!catalog.statements[tile.statementId]) {
      throw new PuzzleSchemaError(
        `Tile '${tile.id}' references unknown statementId '${tile.statementId}'`
      );
    }
  }

  for (const edge of puzzle.edges) {
    if (!slotIds.has(edge.sourceSlotId)) {
      throw new PuzzleSchemaError(
        `Edge '${edge.id}' references unknown sourceSlotId '${edge.sourceSlotId}'`
      );
    }
    if (!slotIds.has(edge.targetSlotId)) {
      throw new PuzzleSchemaError(
        `Edge '${edge.id}' references unknown targetSlotId '${edge.targetSlotId}'`
      );
    }
  }

  for (const assumptionId of puzzle.context.assumptions) {
    if (!catalog.assumptions[assumptionId]) {
      throw new PuzzleSchemaError(
        `Puzzle context references unknown assumptionId '${assumptionId}'`
      );
    }
  }
}

/**
 * Validates whether the given assignment forms a valid bijection between puzzle slots and tiles.
 */
export function validateAssignmentIntegrity(
  puzzle: PuzzleDefinition,
  assignment: PuzzleAssignment
): AssignmentDiagnostic {
  const errors: string[] = [];
  const expectedSlotIds = new Set(puzzle.slots.map((s) => s.id));
  const expectedTileIds = new Set(puzzle.tiles.map((t) => t.id));

  const assignedTiles = new Set<string>();
  const assignedSlots = new Set<string>();

  for (const [slotId, tileId] of Object.entries(assignment)) {
    if (!expectedSlotIds.has(slotId)) {
      errors.push(`Unknown slot ID in assignment: '${slotId}'`);
    }
    if (!expectedTileIds.has(tileId)) {
      errors.push(`Unknown tile ID in assignment: '${tileId}'`);
    }
    if (assignedSlots.has(slotId)) {
      errors.push(`Duplicate slot assignment: '${slotId}'`);
    }
    assignedSlots.add(slotId);

    if (assignedTiles.has(tileId)) {
      errors.push(`Duplicate tile assignment: tile '${tileId}' assigned more than once`);
    }
    assignedTiles.add(tileId);
  }

  // Check that all required slots are present
  for (const slotId of expectedSlotIds) {
    if (!assignedSlots.has(slotId)) {
      errors.push(`Missing assignment for slot '${slotId}'`);
    }
  }

  // Check that all required tiles are used
  for (const tileId of expectedTileIds) {
    if (!assignedTiles.has(tileId)) {
      errors.push(`Tile '${tileId}' is unassigned`);
    }
  }

  return {
    isValidBijection: errors.length === 0,
    errors,
  };
}

/**
 * Pure validator function that checks a puzzle assignment against the knowledge catalog.
 * Complexity: O(|E|) when using pre-indexed catalog.
 */
export function validatePuzzle(
  puzzle: PuzzleDefinition,
  assignment: PuzzleAssignment,
  catalogOrIndexed: KnowledgeCatalog | IndexedKnowledgeCatalog
): PuzzleValidationResult {
  const indexedCatalog =
    "verifiedMap" in catalogOrIndexed
      ? catalogOrIndexed
      : createIndexedCatalog(catalogOrIndexed);

  // Validate puzzle schema against catalog
  validatePuzzleDefinition(puzzle, indexedCatalog.raw);

  // Check assignment integrity (bijection)
  const assignmentDiagnostic = validateAssignmentIntegrity(puzzle, assignment);

  // Pre-compute active assumption closure for the puzzle context
  const activeClosure = indexedCatalog.getAssumptionClosure(
    puzzle.context.assumptions
  );

  // Build tile -> statement map
  const tileToStatement = new Map<string, string>();
  for (const tile of puzzle.tiles) {
    tileToStatement.set(tile.id, tile.statementId);
  }

  const edgeResults: Record<string, EdgeValidationResult> = {};
  let totalEdges = 0;
  let verifiedEdges = 0;
  let notVerifiedEdges = 0;
  let invalidEdges = 0;
  let incompleteEdges = 0;

  for (const edge of puzzle.edges) {
    totalEdges++;
    const sourceTileId = assignment[edge.sourceSlotId];
    const targetTileId = assignment[edge.targetSlotId];

    if (!sourceTileId || !targetTileId) {
      incompleteEdges++;
      edgeResults[edge.id] = {
        edgeId: edge.id,
        status: "incomplete",
        relation: edge.relation,
        sourceSlotId: edge.sourceSlotId,
        targetSlotId: edge.targetSlotId,
      };
      continue;
    }

    const sourceStatementId = tileToStatement.get(sourceTileId);
    const targetStatementId = tileToStatement.get(targetTileId);

    if (!sourceStatementId || !targetStatementId) {
      incompleteEdges++;
      edgeResults[edge.id] = {
        edgeId: edge.id,
        status: "incomplete",
        relation: edge.relation,
        sourceSlotId: edge.sourceSlotId,
        targetSlotId: edge.targetSlotId,
      };
      continue;
    }

    // Lookup in indexed catalog
    const key = indexKey(edge.relation, sourceStatementId, targetStatementId);

    // 1. Check verified relations
    const verifiedList = indexedCatalog.verifiedMap.get(key);
    let isVerified = false;
    let verifiedJustification: string | undefined;

    if (verifiedList) {
      for (const rel of verifiedList) {
        const assumptionsSatisfied = rel.requiredAssumptions.every((a) =>
          activeClosure.has(a)
        );
        if (assumptionsSatisfied) {
          isVerified = true;
          verifiedJustification = rel.justification;
          break;
        }
      }
    }

    if (isVerified) {
      verifiedEdges++;
      edgeResults[edge.id] = {
        edgeId: edge.id,
        status: "verified",
        relation: edge.relation,
        sourceSlotId: edge.sourceSlotId,
        targetSlotId: edge.targetSlotId,
        sourceStatementId,
        targetStatementId,
        justification: verifiedJustification,
      };
      continue;
    }

    // 2. Check refuted relations
    const refutedList = indexedCatalog.refutedMap.get(key);
    let isRefuted = false;
    let counterexample: string | undefined;
    let refutationJustification: string | undefined;

    if (refutedList) {
      for (const ref of refutedList) {
        const assumptionsSatisfied = ref.contextAssumptions.every((a) =>
          activeClosure.has(a)
        );
        if (assumptionsSatisfied) {
          isRefuted = true;
          counterexample = ref.counterexample;
          refutationJustification = ref.justification;
          break;
        }
      }
    }

    if (isRefuted) {
      invalidEdges++;
      edgeResults[edge.id] = {
        edgeId: edge.id,
        status: "invalid",
        relation: edge.relation,
        sourceSlotId: edge.sourceSlotId,
        targetSlotId: edge.targetSlotId,
        sourceStatementId,
        targetStatementId,
        counterexample,
        justification: refutationJustification,
      };
      continue;
    }

    // 3. Neither verified nor refuted under active hypotheses
    notVerifiedEdges++;
    edgeResults[edge.id] = {
      edgeId: edge.id,
      status: "not_verified",
      relation: edge.relation,
      sourceSlotId: edge.sourceSlotId,
      targetSlotId: edge.targetSlotId,
      sourceStatementId,
      targetStatementId,
    };
  }

  // A puzzle is solved iff the assignment is a valid bijection and 100% of edges are verified
  const isSolved =
    assignmentDiagnostic.isValidBijection &&
    totalEdges > 0 &&
    verifiedEdges === totalEdges;

  return {
    isSolved,
    assignmentDiagnostic,
    edges: edgeResults,
    summary: {
      totalEdges,
      verifiedEdges,
      notVerifiedEdges,
      invalidEdges,
      incompleteEdges,
    },
  };
}
