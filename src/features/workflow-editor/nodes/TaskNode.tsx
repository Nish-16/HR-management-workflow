import type { NodeProps } from "reactflow";

import { HrNodeShell } from "../components/HrNodeShell";
import type { WorkflowNodeData } from "../types";

export function TaskNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  return (
    <HrNodeShell
      data={data}
      nodeType="taskNode"
      fallbackLabel="Task"
      selected={selected}
    />
  );
}
