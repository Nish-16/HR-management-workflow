import { Handle, Position } from "reactflow";

import type { HrNodeType, WorkflowNodeData } from "../types";
import { nodeVisuals } from "../nodeTypeConfig";

type HrNodeShellProps = {
  data: WorkflowNodeData;
  nodeType: HrNodeType;
  fallbackLabel: string;
  selected?: boolean;
  showTarget?: boolean;
  showSource?: boolean;
};

export function HrNodeShell({
  data,
  nodeType,
  fallbackLabel,
  selected = false,
  showTarget = true,
  showSource = true,
}: HrNodeShellProps) {
  const visual = nodeVisuals[nodeType];

  return (
    <div
      className={[
        "relative min-w-40 rounded-xl border-2 px-3 py-2 text-center shadow-md shadow-slate-300/40 transition-shadow",
        visual.bg,
        visual.border,
        selected ? "shadow-lg ring-2 ring-offset-2 ring-slate-400" : "",
      ].join(" ")}
    >
      {showTarget ? (
        <Handle
          type="target"
          position={Position.Left}
          className="h-2.5! w-2.5! border-2! border-white! bg-slate-500!"
        />
      ) : null}

      <div
        className={[
          "mb-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
          visual.badge,
        ].join(" ")}
      >
        <visual.Icon className="h-3 w-3" />
        <span>{visual.badgeText}</span>
      </div>

      <div className="text-sm font-semibold text-slate-800">
        {data.label || fallbackLabel}
      </div>

      {showSource ? (
        <Handle
          type="source"
          position={Position.Right}
          className="h-2.5! w-2.5! border-2! border-white! bg-slate-500!"
        />
      ) : null}
    </div>
  );
}
