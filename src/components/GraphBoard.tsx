import React, { useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  MarkerType,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { StatementNode } from "./StatementNode.js";
import {
  PuzzleDefinition,
  KnowledgeCatalog,
  PuzzleValidationResult,
  RelationType,
} from "../core/types.js";
import { Language } from "../i18n.js";

const nodeTypes = {
  statement: StatementNode,
};

export interface GraphBoardProps {
  puzzle: PuzzleDefinition;
  catalog: KnowledgeCatalog;
  language: Language;
  assignment: Record<string, string>; // slotId -> tileId
  selectedSlotId: string | null;
  validationResult: PuzzleValidationResult | null;
  onSelectSlot: (slotId: string) => void;
  onClearSelection: () => void;
}

function getRelationSymbol(rel: RelationType): string {
  switch (rel) {
    case "implies":
      return "⇒";
    case "equivalent":
      return "⇔";
    case "equals":
      return "=";
    case "subset_of":
      return "⊆";
    case "member_of":
      return "∈";
  }
}

export const GraphBoard: React.FC<GraphBoardProps> = ({
  puzzle,
  catalog,
  language,
  assignment,
  selectedSlotId,
  validationResult,
  onSelectSlot,
  onClearSelection,
}) => {
  const tileToStatement = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of puzzle.tiles) {
      map.set(t.id, t.statementId);
    }
    return map;
  }, [puzzle.tiles]);

  // Construct ReactFlow Nodes
  const nodes: Node[] = useMemo(() => {
    return puzzle.slots.map((slot) => {
      const tileId = assignment[slot.id];
      const statementId = tileId ? tileToStatement.get(tileId) : undefined;
      const statement = statementId
        ? catalog.statements[statementId]
        : undefined;

      return {
        id: slot.id,
        type: "statement",
        position: slot.position,
        draggable: false, // Board positions remain fixed!
        data: {
          slotId: slot.id,
          tileId: tileId ?? "",
          statementId: statementId ?? "",
          latex: statement?.translations?.[language]?.latex ?? statement?.latex ?? "",
          description: statement?.description ?? "",
          localizedDescription:
            statement?.translations?.[language]?.description ?? statement?.description ?? "",
          language,
          isSelected: selectedSlotId === slot.id,
          onSelectSlot,
        },
      };
    });
  }, [
    puzzle.slots,
    assignment,
    tileToStatement,
    catalog.statements,
    language,
    selectedSlotId,
    onSelectSlot,
  ]);

  // Construct ReactFlow Edges
  const edges: Edge[] = useMemo(() => {
    return puzzle.edges.map((edge) => {
      const edgeValidation = validationResult?.edges[edge.id];
      const status = edgeValidation?.status ?? "default";

      let strokeColor = "#747474";
      let labelBg = "#f4f4f4";
      let strokeDasharray: string | undefined;
      let animated = false;

      if (status === "verified") {
        strokeColor = "#111111";
        labelBg = "#ffffff";
      } else if (status === "invalid") {
        strokeColor = "#303030";
        labelBg = "#e5e5e5";
        strokeDasharray = "6 4";
      } else if (status === "not_verified") {
        strokeColor = "#858585";
        labelBg = "#f4f4f4";
        strokeDasharray = "2 4";
      }

      const isDirected = edge.relation === "implies";
      const symbol = getRelationSymbol(edge.relation);

      return {
        id: edge.id,
        source: edge.sourceSlotId,
        target: edge.targetSlotId,
        animated,
        label: symbol,
        labelStyle: {
          fill: strokeColor,
          fontWeight: 700,
          fontSize: 16,
        },
        labelBgStyle: {
          fill: labelBg,
          fillOpacity: 0.95,
          rx: 1,
          ry: 1,
        },
        style: {
          stroke: strokeColor,
          strokeWidth: status !== "default" ? 3 : 2,
          strokeDasharray,
        },
        markerEnd: isDirected
          ? {
              type: MarkerType.ArrowClosed,
              color: strokeColor,
              width: 18,
              height: 18,
            }
          : undefined,
      };
    });
  }, [puzzle.edges, validationResult]);

  return (
    <div
      className="graph-board-container"
      onClick={(e) => {
        // If clicking on the canvas background directly, clear selection
        if ((e.target as HTMLElement).classList.contains("react-flow__pane")) {
          onClearSelection();
        }
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_event, node) => {
          onSelectSlot(node.id);
        }}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#d0d0d0" />
      </ReactFlow>
    </div>
  );
};
