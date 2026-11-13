import { describe, it, expect } from "vitest";
import { linearAlgebraCatalog } from "../../src/core/fixture.js";
import {
  validateCatalogIntegrity,
  createIndexedCatalog,
  computeAssumptionClosure,
  CatalogIntegrityError,
} from "../../src/core/catalog.js";
import { KnowledgeCatalog } from "../../src/core/types.js";

describe("Catalog Integrity & Assumption Hierarchy", () => {
  it("validates the reference linear algebra catalog without error", () => {
    expect(() => validateCatalogIntegrity(linearAlgebraCatalog)).not.toThrow();
  });

  it("indexes catalog relations correctly for O(1) lookup", () => {
    const indexed = createIndexedCatalog(linearAlgebraCatalog);
    const keyForward = "equivalent:P1:P5";
    const keyReverse = "equivalent:P5:P1";

    expect(indexed.verifiedMap.has(keyForward)).toBe(true);
    expect(indexed.verifiedMap.has(keyReverse)).toBe(true);

    const forwardRels = indexed.verifiedMap.get(keyForward)!;
    expect(forwardRels[0].id).toBe("rel_P1_equiv_P5");
  });

  it("verifies that P4 not implies P1 has the valid 3x3 counterexample and rejects diag(2,0)", () => {
    const refP4 = linearAlgebraCatalog.refutations?.find(
      (r) => r.sourceStatementId === "P4" && r.targetStatementId === "P1"
    );
    expect(refP4).toBeDefined();
    expect(refP4?.counterexample).toContain("[[2, 0, 0], [0, 0, 1], [0, 0, 0]]");
    // Ensure the false example diag(2, 0) was removed
    expect(refP4?.counterexample).not.toContain("diag(2, 0)");
  });

  it("computes transitive assumption closure correctly and handles cycles", () => {
    const assumptions = {
      A: { implies: ["B"] },
      B: { implies: ["C"] },
      C: { implies: ["A"] }, // cycle
      D: { implies: [] },
    };

    const closure = computeAssumptionClosure(assumptions, ["A"]);
    expect(closure.has("A")).toBe(true);
    expect(closure.has("B")).toBe(true);
    expect(closure.has("C")).toBe(true);
    expect(closure.has("D")).toBe(false);
  });

  it("detects and throws CatalogIntegrityError on contradictory verified and refuted relations", () => {
    const contradictoryCatalog: KnowledgeCatalog = {
      assumptions: {
        base: { id: "base", latex: "", description: "" },
      },
      statements: {
        S1: { id: "S1", latex: "", description: "" },
        S2: { id: "S2", latex: "", description: "" },
      },
      relations: [
        {
          id: "rel_1",
          relation: "implies",
          sourceStatementId: "S1",
          targetStatementId: "S2",
          requiredAssumptions: ["base"],
          symmetric: false,
        },
      ],
      refutations: [
        {
          id: "ref_1",
          relation: "implies",
          sourceStatementId: "S1",
          targetStatementId: "S2",
          contextAssumptions: ["base"],
          counterexample: "explicit counterexample",
        },
      ],
    };

    expect(() => validateCatalogIntegrity(contradictoryCatalog)).toThrow(
      CatalogIntegrityError
    );
  });

  it("detects missing statement references in relations", () => {
    const invalidCatalog: KnowledgeCatalog = {
      assumptions: {},
      statements: {
        S1: { id: "S1", latex: "", description: "" },
      },
      relations: [
        {
          id: "rel_bad",
          relation: "implies",
          sourceStatementId: "S1",
          targetStatementId: "S_NONEXISTENT",
          requiredAssumptions: [],
          symmetric: false,
        },
      ],
    };

    expect(() => validateCatalogIntegrity(invalidCatalog)).toThrow(
      CatalogIntegrityError
    );
  });

  it("detects missing assumption references in relations", () => {
    const invalidCatalog: KnowledgeCatalog = {
      assumptions: {},
      statements: {
        S1: { id: "S1", latex: "", description: "" },
        S2: { id: "S2", latex: "", description: "" },
      },
      relations: [
        {
          id: "rel_bad_assump",
          relation: "implies",
          sourceStatementId: "S1",
          targetStatementId: "S2",
          requiredAssumptions: ["ASSUMP_NONEXISTENT"],
          symmetric: false,
        },
      ],
    };

    expect(() => validateCatalogIntegrity(invalidCatalog)).toThrow(
      CatalogIntegrityError
    );
  });
});
