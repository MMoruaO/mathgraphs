import {
  AssumptionId,
  KnowledgeCatalog,
  RelationType,
  VerifiedRelation,
  RefutedRelation,
} from "./types.js";

export class CatalogIntegrityError extends Error {
  constructor(message: string) {
    super(`CatalogIntegrityError: ${message}`);
    this.name = "CatalogIntegrityError";
  }
}

/**
 * Computes the transitive closure of a set of active assumptions
 * given the assumption hierarchy in the catalog.
 * Handles cycles safely using a visited set.
 */
export function computeAssumptionClosure(
  assumptions: Record<string, { implies?: AssumptionId[] }>,
  activeAssumptions: AssumptionId[]
): Set<AssumptionId> {
  const closure = new Set<AssumptionId>();
  const queue: AssumptionId[] = [...activeAssumptions];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!closure.has(current)) {
      closure.add(current);
      const def = assumptions[current];
      if (def?.implies) {
        for (const implied of def.implies) {
          if (!closure.has(implied)) {
            queue.push(implied);
          }
        }
      }
    }
  }

  return closure;
}

export interface IndexedKnowledgeCatalog {
  raw: KnowledgeCatalog;
  // Key: `${relation}:${sourceStatementId}:${targetStatementId}`
  verifiedMap: Map<string, VerifiedRelation[]>;
  refutedMap: Map<string, RefutedRelation[]>;
  getAssumptionClosure: (activeAssumptions: AssumptionId[]) => Set<AssumptionId>;
}

export function indexKey(
  relation: RelationType,
  sourceId: string,
  targetId: string
): string {
  return `${relation}:${sourceId}:${targetId}`;
}

/**
 * Validates the internal consistency of a KnowledgeCatalog:
 * - Unique IDs for statements and assumptions.
 * - All references in relations and refutations point to registered statements and assumptions.
 * - No contradictions between verified and refuted relations under compatible assumptions.
 * Throws CatalogIntegrityError if any inconsistency is detected.
 */
export function validateCatalogIntegrity(catalog: KnowledgeCatalog): void {
  // 1. Check uniqueness and valid assumptions
  const assumptionIds = new Set<string>();
  for (const [id, assumption] of Object.entries(catalog.assumptions)) {
    if (id !== assumption.id) {
      throw new CatalogIntegrityError(
        `Assumption key mismatch: '${id}' !== '${assumption.id}'`
      );
    }
    if (assumptionIds.has(id)) {
      throw new CatalogIntegrityError(`Duplicate assumption ID: '${id}'`);
    }
    assumptionIds.add(id);
  }

  for (const assumption of Object.values(catalog.assumptions)) {
    if (assumption.implies) {
      for (const impliedId of assumption.implies) {
        if (!assumptionIds.has(impliedId)) {
          throw new CatalogIntegrityError(
            `Assumption '${assumption.id}' implies unregistered assumption '${impliedId}'`
          );
        }
      }
    }
  }

  // 2. Check statements
  const statementIds = new Set<string>();
  for (const [id, statement] of Object.entries(catalog.statements)) {
    if (id !== statement.id) {
      throw new CatalogIntegrityError(
        `Statement key mismatch: '${id}' !== '${statement.id}'`
      );
    }
    if (statementIds.has(id)) {
      throw new CatalogIntegrityError(`Duplicate statement ID: '${id}'`);
    }
    statementIds.add(id);
  }

  // 3. Check relations references and duplicate IDs
  const relationIds = new Set<string>();
  for (const rel of catalog.relations) {
    if (relationIds.has(rel.id)) {
      throw new CatalogIntegrityError(`Duplicate verified relation ID: '${rel.id}'`);
    }
    relationIds.add(rel.id);

    if (!statementIds.has(rel.sourceStatementId)) {
      throw new CatalogIntegrityError(
        `Relation '${rel.id}' references unregistered sourceStatementId '${rel.sourceStatementId}'`
      );
    }
    if (!statementIds.has(rel.targetStatementId)) {
      throw new CatalogIntegrityError(
        `Relation '${rel.id}' references unregistered targetStatementId '${rel.targetStatementId}'`
      );
    }
    for (const reqAssump of rel.requiredAssumptions) {
      if (!assumptionIds.has(reqAssump)) {
        throw new CatalogIntegrityError(
          `Relation '${rel.id}' references unregistered requiredAssumption '${reqAssump}'`
        );
      }
    }
  }

  // 4. Check refutations references
  const refutationIds = new Set<string>();
  if (catalog.refutations) {
    for (const ref of catalog.refutations) {
      if (refutationIds.has(ref.id)) {
        throw new CatalogIntegrityError(`Duplicate refutation ID: '${ref.id}'`);
      }
      refutationIds.add(ref.id);

      if (!statementIds.has(ref.sourceStatementId)) {
        throw new CatalogIntegrityError(
          `Refutation '${ref.id}' references unregistered sourceStatementId '${ref.sourceStatementId}'`
        );
      }
      if (!statementIds.has(ref.targetStatementId)) {
        throw new CatalogIntegrityError(
          `Refutation '${ref.id}' references unregistered targetStatementId '${ref.targetStatementId}'`
        );
      }
      for (const ctxAssump of ref.contextAssumptions) {
        if (!assumptionIds.has(ctxAssump)) {
          throw new CatalogIntegrityError(
            `Refutation '${ref.id}' references unregistered contextAssumption '${ctxAssump}'`
          );
        }
      }
    }
  }

  // 5. Detect Contradictions:
  // A pair cannot be verified and refuted under mutually compatible assumptions.
  // Compatible means: there exists an assumption context under which BOTH the verified relation
  // and the refutation are simultaneously active.
  // Specifically: if Union(rel.requiredAssumptions, ref.contextAssumptions) is closed and
  // satisfies both requirements simultaneously.
  if (catalog.refutations) {
    for (const ref of catalog.refutations) {
      for (const rel of catalog.relations) {
        const directMatch =
          rel.relation === ref.relation &&
          rel.sourceStatementId === ref.sourceStatementId &&
          rel.targetStatementId === ref.targetStatementId;

        const symmetricMatch =
          rel.symmetric &&
          rel.relation === ref.relation &&
          rel.sourceStatementId === ref.targetStatementId &&
          rel.targetStatementId === ref.sourceStatementId;

        if (directMatch || symmetricMatch) {
          // Check if assumptions are compatible:
          // A context containing all required assumptions and all refutation assumptions
          // would trigger both simultaneously.
          const combinedAssumptions = [
            ...rel.requiredAssumptions,
            ...ref.contextAssumptions,
          ];
          const closure = computeAssumptionClosure(
            catalog.assumptions,
            combinedAssumptions
          );

          const relSatisfied = rel.requiredAssumptions.every((a) =>
            closure.has(a)
          );
          const refSatisfied = ref.contextAssumptions.every((a) =>
            closure.has(a)
          );

          if (relSatisfied && refSatisfied) {
            throw new CatalogIntegrityError(
              `Contradiction detected for (${rel.sourceStatementId} -${rel.relation}-> ${rel.targetStatementId}): Verified relation '${rel.id}' and Refuted relation '${ref.id}' are simultaneously satisfiable under combined assumptions.`
            );
          }
        }
      }
    }
  }
}

/**
 * Validates integrity and indexes the KnowledgeCatalog into HashMaps for O(1) edge lookup.
 */
export function createIndexedCatalog(
  catalog: KnowledgeCatalog
): IndexedKnowledgeCatalog {
  validateCatalogIntegrity(catalog);

  const verifiedMap = new Map<string, VerifiedRelation[]>();
  const refutedMap = new Map<string, RefutedRelation[]>();

  for (const rel of catalog.relations) {
    const key = indexKey(
      rel.relation,
      rel.sourceStatementId,
      rel.targetStatementId
    );
    const list = verifiedMap.get(key) ?? [];
    list.push(rel);
    verifiedMap.set(key, list);

    if (rel.symmetric) {
      const symKey = indexKey(
        rel.relation,
        rel.targetStatementId,
        rel.sourceStatementId
      );
      if (symKey !== key) {
        const symList = verifiedMap.get(symKey) ?? [];
        symList.push(rel);
        verifiedMap.set(symKey, symList);
      }
    }
  }

  if (catalog.refutations) {
    for (const ref of catalog.refutations) {
      const key = indexKey(
        ref.relation,
        ref.sourceStatementId,
        ref.targetStatementId
      );
      const list = refutedMap.get(key) ?? [];
      list.push(ref);
      refutedMap.set(key, list);
    }
  }

  return {
    raw: catalog,
    verifiedMap,
    refutedMap,
    getAssumptionClosure: (activeAssumptions: AssumptionId[]) =>
      computeAssumptionClosure(catalog.assumptions, activeAssumptions),
  };
}
