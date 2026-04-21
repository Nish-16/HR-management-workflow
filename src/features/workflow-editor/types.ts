export type HrNodeType =
  | "startNode"
  | "taskNode"
  | "approvalNode"
  | "automatedStepNode"
  | "endNode";

export type KeyValuePair = {
  uid: string;
  key: string;
  value: string;
};

export type StartNodeConfig = {
  title: string;
  metadata: KeyValuePair[];
};

export type TaskNodeConfig = {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
};

export type ApprovalNodeConfig = {
  title: string;
  approverRole: string;
  threshold: number;
};

export type AutomatedStepNodeConfig = {
  title: string;
  actionId: string;
  params: Record<string, string>;
};

export type EndNodeConfig = {
  message: string;
  summary: boolean;
};

export type NodeConfigByType = {
  startNode: StartNodeConfig;
  taskNode: TaskNodeConfig;
  approvalNode: ApprovalNodeConfig;
  automatedStepNode: AutomatedStepNodeConfig;
  endNode: EndNodeConfig;
};

export type AnyNodeConfig = NodeConfigByType[HrNodeType];

export type WorkflowNodeData = {
  label: string;
  config: AnyNodeConfig;
};

export const nodeLabels: Record<HrNodeType, string> = {
  startNode: "Start Node",
  taskNode: "Task Node",
  approvalNode: "Approval Node",
  automatedStepNode: "Automated Step Node",
  endNode: "End Node",
};

export function getDefaultConfigForType<T extends HrNodeType>(
  type: T,
): NodeConfigByType[T] {
  const defaults: NodeConfigByType = {
    startNode: {
      title: "",
      metadata: [],
    },
    taskNode: {
      title: "",
      description: "",
      assignee: "",
      dueDate: "",
      customFields: [],
    },
    approvalNode: {
      title: "",
      approverRole: "",
      threshold: 1,
    },
    automatedStepNode: {
      title: "",
      actionId: "",
      params: {},
    },
    endNode: {
      message: "",
      summary: false,
    },
  };

  return defaults[type];
}
