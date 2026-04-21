import type { NodeProps } from "reactflow";

import { HrNodeShell } from "../components/HrNodeShell";
import type { WorkflowNodeData } from "../types";

export function AutomatedStepNode({
  data,
  selected,
}: NodeProps<WorkflowNodeData>) {
  return (
    <HrNodeShell
      data={data}
      nodeType="automatedStepNode"
      fallbackLabel="Automated Step"
      selected={selected}
    />
  );
}
