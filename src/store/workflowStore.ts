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

type HistorySnapshot = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  nextNodeId: number;
};

export type ExecutedWorkflowRun = {
  id: string;
  executedAt: string;
  nodeCount: number;
  edgeCount: number;
  executionLog: string[];
};

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  nextNodeId: number;
  selectedNodeIds: string[];
  isSimulating: boolean;
  executionLog: string[];
  executedWorkflows: ExecutedWorkflowRun[];
  validationErrors: string[];
  history: HistorySnapshot[];
  historyIndex: number;
}

interface WorkflowActions {
  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node management
  addNode: (type: HrNodeType) => void;
  deleteNode: (nodeId: string) => void;
  deleteSelectedNodes: () => void;
  updateNodeConfig: <T extends HrNodeType>(
    nodeId: string,
    nodeType: T,
    config: NodeConfigByType[T],
  ) => void;
  setSelectedNodeId: (id: string | null) => void;
  toggleNodeSelection: (nodeId: string, isMultiSelect: boolean) => void;

  // Canvas
  clearCanvas: () => void;
  startBlankWorkflow: () => void;
  exportWorkflow: () => void;

  // History
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Simulation
  runSimulation: () => Promise<void>;
}

type WorkflowStore = WorkflowState & WorkflowActions;

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => {
      const saveToHistory = () => {
        set((s) => {
          const snapshot: HistorySnapshot = {
            nodes: s.nodes,
            edges: s.edges,
            nextNodeId: s.nextNodeId,
          };
          const newHistory = s.history.slice(0, s.historyIndex + 1);
          newHistory.push(snapshot);
          // Keep history limited to 50 snapshots
          if (newHistory.length > 50) {
            newHistory.shift();
          }
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      };

      return {
        nodes: defaultNodes,
        edges: [],
        nextNodeId: 2,
        selectedNodeIds: [],
        isSimulating: false,
        executionLog: [],
        executedWorkflows: [],
        validationErrors: [],
        history: [{ nodes: defaultNodes, edges: [], nextNodeId: 2 }],
        historyIndex: 0,

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
            const newState = {
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
              selectedNodeIds: [id],
            };
            // Save to history after adding node
            const snapshot: HistorySnapshot = {
              nodes: newState.nodes,
              edges: s.edges,
              nextNodeId: newState.nextNodeId,
            };
            const newHistory = s.history.slice(0, s.historyIndex + 1);
            newHistory.push(snapshot);
            if (newHistory.length > 50) {
              newHistory.shift();
            }
            return {
              ...newState,
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }),

        deleteNode: (nodeId) =>
          set((s) => {
            const newState = {
              nodes: s.nodes.filter((n) => n.id !== nodeId),
              edges: s.edges.filter(
                (e) => e.source !== nodeId && e.target !== nodeId,
              ),
              selectedNodeIds: s.selectedNodeIds.filter((id) => id !== nodeId),
            };
            // Save to history after deleting node
            const snapshot: HistorySnapshot = {
              nodes: newState.nodes,
              edges: newState.edges,
              nextNodeId: s.nextNodeId,
            };
            const newHistory = s.history.slice(0, s.historyIndex + 1);
            newHistory.push(snapshot);
            if (newHistory.length > 50) {
              newHistory.shift();
            }
            return {
              ...newState,
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }),

        updateNodeConfig: (nodeId, nodeType, config) =>
          set((s) => {
            const newState = {
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
            };
            // Save to history after updating config
            const snapshot: HistorySnapshot = {
              nodes: newState.nodes,
              edges: s.edges,
              nextNodeId: s.nextNodeId,
            };
            const newHistory = s.history.slice(0, s.historyIndex + 1);
            newHistory.push(snapshot);
            if (newHistory.length > 50) {
              newHistory.shift();
            }
            return {
              ...newState,
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }),

        setSelectedNodeId: (id) => set({ selectedNodeIds: id ? [id] : [] }),

        toggleNodeSelection: (nodeId: string, isMultiSelect: boolean) =>
          set((s) => {
            if (!isMultiSelect) {
              return { selectedNodeIds: [nodeId] };
            }

            const isSelected = s.selectedNodeIds.includes(nodeId);
            if (isSelected) {
              return {
                selectedNodeIds: s.selectedNodeIds.filter(
                  (id) => id !== nodeId,
                ),
              };
            }
            return {
              selectedNodeIds: [...s.selectedNodeIds, nodeId],
            };
          }),

        deleteSelectedNodes: () =>
          set((s) => {
            let newNodes = s.nodes;
            let newEdges = s.edges;

            // Delete all selected nodes
            for (const nodeId of s.selectedNodeIds) {
              newNodes = newNodes.filter((n) => n.id !== nodeId);
              newEdges = newEdges.filter(
                (e) => e.source !== nodeId && e.target !== nodeId,
              );
            }

            const newState = {
              nodes: newNodes,
              edges: newEdges,
              selectedNodeIds: [],
            };

            // Save to history
            const snapshot: HistorySnapshot = {
              nodes: newState.nodes,
              edges: newState.edges,
              nextNodeId: s.nextNodeId,
            };
            const newHistory = s.history.slice(0, s.historyIndex + 1);
            newHistory.push(snapshot);
            if (newHistory.length > 50) {
              newHistory.shift();
            }
            return {
              ...newState,
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }),

        clearCanvas: () =>
          set({
            nodes: defaultNodes,
            edges: [],
            nextNodeId: 2,
            selectedNodeIds: [],
            executionLog: [],
            validationErrors: [],
          }),

        startBlankWorkflow: () =>
          set({
            nodes: [],
            edges: [],
            nextNodeId: 1,
            selectedNodeIds: [],
            executionLog: [],
            executedWorkflows: [],
            validationErrors: [],
            history: [{ nodes: [], edges: [], nextNodeId: 1 }],
            historyIndex: 0,
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

        saveToHistory: () => saveToHistory(),

        undo: () =>
          set((s) => {
            if (s.historyIndex <= 0) return {};
            const newIndex = s.historyIndex - 1;
            const snapshot = s.history[newIndex];
            return {
              nodes: snapshot.nodes,
              edges: snapshot.edges,
              nextNodeId: snapshot.nextNodeId,
              historyIndex: newIndex,
              selectedNodeIds: [],
            };
          }),

        redo: () =>
          set((s) => {
            if (s.historyIndex >= s.history.length - 1) return {};
            const newIndex = s.historyIndex + 1;
            const snapshot = s.history[newIndex];
            return {
              nodes: snapshot.nodes,
              edges: snapshot.edges,
              nextNodeId: snapshot.nextNodeId,
              historyIndex: newIndex,
              selectedNodeIds: [],
            };
          }),

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
            set((s) => ({
              executionLog: result.executionLog,
              executedWorkflows: [
                {
                  id: `${Date.now()}`,
                  executedAt: new Date().toISOString(),
                  nodeCount: nodes.length,
                  edgeCount: edges.length,
                  executionLog: result.executionLog,
                },
                ...s.executedWorkflows,
              ].slice(0, 50),
            }));
          } catch {
            set({
              executionLog: [],
              validationErrors: ["Simulation failed. Please try again."],
            });
          } finally {
            set({ isSimulating: false });
          }
        },
      };
    },
    {
      name: "hr-workflow-v2",
      partialize: (s) => ({
        nodes: s.nodes,
        edges: s.edges,
        nextNodeId: s.nextNodeId,
        executedWorkflows: s.executedWorkflows,
      }),
    },
  ),
);
