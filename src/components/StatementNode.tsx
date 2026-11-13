import React from "react";
import { Handle, Position } from "@xyflow/react";
import { MathRenderer } from "./MathRenderer.js";

export interface StatementNodeData {
  slotId: string;
  tileId: string;
  statementId: string;
  latex: string;
  description: string;
  isSelected: boolean;
  onSelectSlot: (slotId: string) => void;
}

export const StatementNode: React.FC<{ data: StatementNodeData }> = ({ data }) => {
  const {
    slotId,
    latex,
    description,
    isSelected,
    onSelectSlot,
  } = data;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectSlot(slotId);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Slot ${slotId}: ${description || latex}`}
      onClick={() => onSelectSlot(slotId)}
      onKeyDown={handleKeyDown}
      className={`statement-node ${isSelected ? "statement-node-selected" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        className="opacity-0"
      />
      <div className="statement-node-inner">
        <div className="slot-badge">{slotId}</div>
        <div className="math-container">
          <MathRenderer math={latex} displayMode={false} />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        className="opacity-0"
      />
    </div>
  );
};
