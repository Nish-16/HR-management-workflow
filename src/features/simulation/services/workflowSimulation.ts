import type { Edge, Node } from "reactflow";

import type {
  ApprovalNodeConfig,
  AutomatedStepNodeConfig,
  HrNodeType,
  TaskNodeConfig,
  WorkflowNodeData,
} from "../../workflow-editor/types";

export type WorkflowNodeSnapshot = {
  id: string;
  type: HrNodeType;
  label: string;
  config: WorkflowNodeData["config"];
  position: {
    x: number;
    y: number;
  };
};

export type WorkflowEdgeSnapshot = {
  id: string;
  source: string;
  target: string;
};

export type SerializedWorkflow = {
  nodes: WorkflowNodeSnapshot[];
  edges: WorkflowEdgeSnapshot[];
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

type WorkflowNode = Node<WorkflowNodeData, HrNodeType>;

export function serializeWorkflowGraph(
  nodes: WorkflowNode[],
  edges: Edge[],
): SerializedWorkflow {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type ?? "taskNode",
      label: node.data.label,
      config: node.data.config,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
  };
}

export function validateWorkflowGraph(
  workflow: SerializedWorkflow,
): ValidationResult {
  const errors: string[] = [];
  const { nodes, edges } = workflow;

  if (nodes.length === 0) {
    errors.push("Workflow is empty. Add at least one node.");
    return { isValid: false, errors };
  }

  const starts = nodes.filter((node) => node.type === "startNode");
  const ends = nodes.filter((node) => node.type === "endNode");

  if (starts.length === 0) {
    errors.push("A Start Node is required.");
  }

  if (ends.length === 0) {
    errors.push("At least one End Node is required.");
  }

  const nodeIds = new Set(nodes.map((node) => node.id));

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} has invalid source or target.`);
    }
  }

  for (const node of nodes) {
    if (node.type === "taskNode") {
      const c = node.config as TaskNodeConfig;
      if (!c.title?.trim()) {
        errors.push(`Task node "${node.label}" is missing a required title.`);
      }
    }
    if (node.type === "approvalNode") {
      const c = node.config as ApprovalNodeConfig;
      if (!c.approverRole?.trim()) {
        errors.push(
          `Approval node "${node.label}" is missing a required approver role.`,
        );
      }
    }
    if (node.type === "automatedStepNode") {
      const c = node.config as AutomatedStepNodeConfig;
      if (!c.actionId) {
        errors.push(
          `Automated step "${node.label}" has no action selected.`,
        );
      }
    }
  }

  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  const undirected = new Map<string, string[]>();

  for (const node of nodes) {
    outgoing.set(node.id, []);
    incoming.set(node.id, []);
    undirected.set(node.id, []);
  }

  for (const edge of edges) {
    outgoing.get(edge.source)?.push(edge.target);
    incoming.get(edge.target)?.push(edge.source);
    undirected.get(edge.source)?.push(edge.target);
    undirected.get(edge.target)?.push(edge.source);
  }

  for (const node of nodes) {
    const inDegree = incoming.get(node.id)?.length ?? 0;
    const outDegree = outgoing.get(node.id)?.length ?? 0;

    if (node.type !== "startNode" && inDegree === 0) {
      errors.push(`${node.label} must have an incoming connection.`);
    }

    if (node.type !== "endNode" && outDegree === 0) {
      errors.push(`${node.label} must have an outgoing connection.`);
    }
  }

  if (starts.length > 0) {
    const connectedVisited = new Set<string>();
    const stack = [starts[0].id];

    while (stack.length > 0) {
      const nodeId = stack.pop();
      if (!nodeId || connectedVisited.has(nodeId)) {
        continue;
      }

      connectedVisited.add(nodeId);
      const neighbors = undirected.get(nodeId) ?? [];

      for (const neighbor of neighbors) {
        if (!connectedVisited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }

    if (connectedVisited.size !== nodes.length) {
      errors.push("All nodes must belong to a connected workflow graph.");
    }

    const forwardVisited = new Set<string>();
    const queue = starts.map((node) => node.id);

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId || forwardVisited.has(nodeId)) {
        continue;
      }

      forwardVisited.add(nodeId);
      const nextNodes = outgoing.get(nodeId) ?? [];

      for (const nextNodeId of nextNodes) {
        if (!forwardVisited.has(nextNodeId)) {
          queue.push(nextNodeId);
        }
      }
    }

    if (forwardVisited.size !== nodes.length) {
      errors.push("Every node must be reachable from a Start Node.");
    }

    const reverseVisited = new Set<string>();
    const reverseQueue = ends.map((node) => node.id);

    while (reverseQueue.length > 0) {
      const nodeId = reverseQueue.shift();
      if (!nodeId || reverseVisited.has(nodeId)) {
        continue;
      }

      reverseVisited.add(nodeId);
      const previousNodes = incoming.get(nodeId) ?? [];

      for (const previousNodeId of previousNodes) {
        if (!reverseVisited.has(previousNodeId)) {
          reverseQueue.push(previousNodeId);
        }
      }
    }

    if (reverseVisited.size !== nodes.length) {
      errors.push("Every path must eventually lead to an End Node.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
