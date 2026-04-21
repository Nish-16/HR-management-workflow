import type { NodeProps } from "reactflow";

import { HrNodeShell } from "../components/HrNodeShell";
import type { WorkflowNodeData } from "../types";

export function ApprovalNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  return (
    <HrNodeShell
      data={data}
      nodeType="approvalNode"
      fallbackLabel="Approval"
      selected={selected}
    />
  );
}
