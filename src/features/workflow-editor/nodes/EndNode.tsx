import type { NodeProps } from "reactflow";

import { HrNodeShell } from "../components/HrNodeShell";
import type { WorkflowNodeData } from "../types";

export function EndNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  return (
    <HrNodeShell
      data={data}
      nodeType="endNode"
      fallbackLabel="End"
      selected={selected}
      showSource={false}
    />
  );
}
