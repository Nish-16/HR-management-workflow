import type { NodeTypes } from "reactflow";

import { ApprovalNode } from "../../workflow-editor/nodes/ApprovalNode";
import { AutomatedStepNode } from "../../workflow-editor/nodes/AutomatedStepNode";
import { EndNode } from "../../workflow-editor/nodes/EndNode";
import { StartNode } from "../../workflow-editor/nodes/StartNode";
import { TaskNode } from "../../workflow-editor/nodes/TaskNode";
import type { HrNodeType } from "../../workflow-editor/types";

export const nodeTypes: NodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automatedStepNode: AutomatedStepNode,
  endNode: EndNode,
};

export const nodeDefinitions: HrNodeType[] = [
  "startNode",
  "taskNode",
  "approvalNode",
  "automatedStepNode",
  "endNode",
];
