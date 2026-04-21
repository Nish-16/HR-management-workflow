import type { NodeProps } from "reactflow";

import { HrNodeShell } from "../components/HrNodeShell";
import type { WorkflowNodeData } from "../types";

export function StartNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  return (
    <HrNodeShell
      data={data}
      nodeType="startNode"
      fallbackLabel="Start"
      selected={selected}
      showTarget={false}
    />
  );
}
