import type {
  SerializedWorkflow,
  WorkflowNodeSnapshot,
  WorkflowEdgeSnapshot,
} from "../services/workflowSimulation";
import type {
  ApprovalNodeConfig,
  AutomatedStepNodeConfig,
  EndNodeConfig,
  TaskNodeConfig,
} from "../../workflow-editor/types";

export type SimulateWorkflowRequest = {
  workflow: SerializedWorkflow;
};

export type SimulateWorkflowResponse = {
  success: boolean;
  executionLog: string[];
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function topoSort(
  nodes: WorkflowNodeSnapshot[],
  edges: WorkflowEdgeSnapshot[],
): WorkflowNodeSnapshot[] {
  const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const adj = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  const nodeMap = new Map<string, WorkflowNodeSnapshot>(
    nodes.map((n) => [n.id, n]),
  );

  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue = nodes
    .filter((n) => (inDegree.get(n.id) ?? 0) === 0)
    .map((n) => n.id);
  const sorted: WorkflowNodeSnapshot[] = [];

  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeMap.get(id);
    if (node) sorted.push(node);
    for (const next of adj.get(id) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  return sorted;
}

function buildExecutionLog(workflow: SerializedWorkflow): string[] {
  const ordered = topoSort(workflow.nodes, workflow.edges);
  const logs: string[] = [];

  for (const node of ordered) {
    switch (node.type) {
      case "startNode": {
        logs.push(`Workflow started`);
        break;
      }
      case "taskNode": {
        const c = node.config as TaskNodeConfig;
        const title = c.title?.trim() || node.label;
        const assignee = c.assignee?.trim() || "Unassigned";
        const due = c.dueDate ? ` · due ${c.dueDate}` : "";
        logs.push(`Task "${title}" assigned to ${assignee}${due}`);
        break;
      }
      case "approvalNode": {
        const c = node.config as ApprovalNodeConfig;
        const title = c.title?.trim() || node.label;
        const role = c.approverRole?.trim() || "Manager";
        logs.push(
          `Approval "${title}" pending ${role} (threshold: ${c.threshold ?? 1})`,
        );
        break;
      }
      case "automatedStepNode": {
        const c = node.config as AutomatedStepNodeConfig;
        const title = c.title?.trim() || node.label;
        const action = c.actionId || "unknown";
        const paramPairs = Object.entries(c.params ?? {})
          .map(([k, v]) => `${k}=${v}`)
          .join(", ");
        logs.push(
          `Automated "${title}" executed ${action}${paramPairs ? ` (${paramPairs})` : ""}`,
        );
        break;
      }
      case "endNode": {
        const c = node.config as EndNodeConfig;
        const message = c.message?.trim() || "Workflow completed";
        logs.push(message);
        break;
      }
    }
  }

  return logs;
}

export async function simulateWorkflow(
  payload: SimulateWorkflowRequest,
): Promise<SimulateWorkflowResponse> {
  await wait(450);
  return {
    success: true,
    executionLog: buildExecutionLog(payload.workflow),
  };
}
