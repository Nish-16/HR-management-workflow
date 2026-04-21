import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "reactflow";

import { simulateWorkflow } from "../api/workflowSimulationApi";
import {
  serializeWorkflowGraph,
  validateWorkflowGraph,
} from "../features/simulation/services/workflowSimulation";
import {
  getDefaultConfigForType,
  nodeLabels,
  type HrNodeType,
  type NodeConfigByType,
  type WorkflowNodeData,
} from "../features/workflow-editor/types";

export type WorkflowNode = Node<WorkflowNodeData, HrNodeType>;
export type WorkflowEdge = Edge;

const defaultNodes: WorkflowNode[] = [
  {
    id: "node-1",
    type: "startNode",
    position: { x: 150, y: 150 },
    data: {
      label: nodeLabels.startNode,
      config: getDefaultConfigForType("startNode"),
    },
  },
];

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  nextNodeId: number;
  selectedNodeId: string | null;
  isSimulating: boolean;
  executionLog: string[];
  validationErrors: string[];
}

interface WorkflowActions {
  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node management
  addNode: (type: HrNodeType) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeConfig: <T extends HrNodeType>(
    nodeId: string,
    nodeType: T,
    config: NodeConfigByType[T],
  ) => void;
  setSelectedNodeId: (id: string | null) => void;

  // Canvas
  clearCanvas: () => void;
  exportWorkflow: () => void;

  // Simulation
  runSimulation: () => Promise<void>;
}

type WorkflowStore = WorkflowState & WorkflowActions;

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      nodes: defaultNodes,
      edges: [],
      nextNodeId: 2,
      selectedNodeId: null,
      isSimulating: false,
      executionLog: [],
      validationErrors: [],

      onNodesChange: (changes) =>
        set((s) => ({
          nodes: applyNodeChanges(changes, s.nodes) as WorkflowNode[],
        })),

      onEdgesChange: (changes) =>
        set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

      onConnect: (connection) =>
        set((s) => ({ edges: addEdge(connection, s.edges) })),

      addNode: (type) =>
        set((s) => {
          const id = `node-${s.nextNodeId}`;
          return {
            nodes: [
              ...s.nodes,
              {
                id,
                type,
                position: {
                  x: 100 + ((s.nextNodeId - 1) % 6) * 200,
                  y: 100 + Math.floor((s.nextNodeId - 1) / 6) * 130,
                },
                data: {
                  label: nodeLabels[type],
                  config: getDefaultConfigForType(type),
                },
              },
            ],
            nextNodeId: s.nextNodeId + 1,
            selectedNodeId: id,
          };
        }),

      deleteNode: (nodeId) =>
        set((s) => ({
          nodes: s.nodes.filter((n) => n.id !== nodeId),
          edges: s.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId,
          ),
          selectedNodeId: s.selectedNodeId === nodeId ? null : s.selectedNodeId,
        })),

      updateNodeConfig: (nodeId, nodeType, config) =>
        set((s) => ({
          nodes: s.nodes.map((node) => {
            if (node.id !== nodeId || node.type !== nodeType) return node;
            const title =
              "title" in config &&
              typeof config.title === "string" &&
              config.title.trim()
                ? config.title
                : node.data.label;
            return { ...node, data: { label: title, config } };
          }),
        })),

      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      clearCanvas: () =>
        set({
          nodes: defaultNodes,
          edges: [],
          nextNodeId: 2,
          selectedNodeId: null,
          executionLog: [],
          validationErrors: [],
        }),

      exportWorkflow: () => {
        const { nodes, edges } = get();
        const serialized = serializeWorkflowGraph(nodes, edges);
        const blob = new Blob([JSON.stringify(serialized, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workflow.json";
        a.click();
        URL.revokeObjectURL(url);
      },

      runSimulation: async () => {
        const { nodes, edges } = get();
        const serialized = serializeWorkflowGraph(nodes, edges);
        const validation = validateWorkflowGraph(serialized);

        if (!validation.isValid) {
          set({ validationErrors: validation.errors, executionLog: [] });
          return;
        }

        set({ validationErrors: [], isSimulating: true });

        try {
          const result = await simulateWorkflow({ workflow: serialized });
          set({ executionLog: result.executionLog });
        } catch {
          set({
            executionLog: [],
            validationErrors: ["Simulation failed. Please try again."],
          });
        } finally {
          set({ isSimulating: false });
        }
      },
    }),
    {
      name: "hr-workflow-v2",
      partialize: (s) => ({
        nodes: s.nodes,
        edges: s.edges,
        nextNodeId: s.nextNodeId,
      }),
    },
  ),
);
