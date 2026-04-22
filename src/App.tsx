import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from "reactflow";
import { FileDown, Plus, Trash2 } from "lucide-react";

import { useAutomationActions } from "./hooks/useAutomationActions";
import { NodeConfigPanel } from "./features/workflow-editor/components/NodeConfigPanel";
import { ApprovalNode } from "./features/workflow-editor/nodes/ApprovalNode";
import { AutomatedStepNode } from "./features/workflow-editor/nodes/AutomatedStepNode";
import { EndNode } from "./features/workflow-editor/nodes/EndNode";
import { StartNode } from "./features/workflow-editor/nodes/StartNode";
import { TaskNode } from "./features/workflow-editor/nodes/TaskNode";
import { nodeLabels, type HrNodeType } from "./features/workflow-editor/types";
import { WorkflowSimulationPanel } from "./features/simulation/components/WorkflowSimulationPanel";
import { nodeVisuals } from "./features/workflow-editor/nodeTypeConfig";
import { useWorkflowStore } from "./store/workflowStore";
import {
  registerKeyboardShortcuts,
  SHORTCUTS_REFERENCE,
} from "./utils/keyboardShortcuts";

import "reactflow/dist/style.css";

const nodeTypes: NodeTypes = {
  startNode: StartNode,
  taskNode: TaskNode,
  approvalNode: ApprovalNode,
  automatedStepNode: AutomatedStepNode,
  endNode: EndNode,
};

const nodeDefinitions: HrNodeType[] = [
  "startNode",
  "taskNode",
  "approvalNode",
  "automatedStepNode",
  "endNode",
];

function App() {
  const [isHomeScreen, setIsHomeScreen] = useState(true);

  const {
    nodes,
    edges,
    selectedNodeIds,
    isSimulating,
    executionLog,
    validationErrors,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    deleteSelectedNodes,
    updateNodeConfig,
    setSelectedNodeId,
    toggleNodeSelection,
    clearCanvas,
    startBlankWorkflow,
    exportWorkflow,
    runSimulation,
    undo,
    redo,
  } = useWorkflowStore();

  const { actions, isLoading, error } = useAutomationActions();
  const selectedNode =
    selectedNodeIds.length > 0
      ? (nodes.find((n) => n.id === selectedNodeIds[0]) ?? null)
      : null;

  // Keyboard shortcuts
  useEffect(() => {
    if (isHomeScreen) {
      return;
    }

    const cleanup = registerKeyboardShortcuts(
      {
        onUndo: undo,
        onRedo: redo,
        onDelete: deleteSelectedNodes,
        onDuplicate: () => {
          if (selectedNode) {
            addNode(selectedNode.type as HrNodeType);
          }
        },
        onExport: exportWorkflow,
        onClearCanvas: clearCanvas,
        onRunSimulation: () => void runSimulation(),
      },
      selectedNodeIds[0] ?? null,
      selectedNode,
    );

    return cleanup;
  }, [
    selectedNodeIds,
    selectedNode,
    undo,
    redo,
    deleteSelectedNodes,
    addNode,
    exportWorkflow,
    clearCanvas,
    runSimulation,
    isHomeScreen,
  ]);

  if (isHomeScreen) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-linear-to-br from-slate-50 via-white to-cyan-50 p-6">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-300/30">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
            HR Workflow Designer
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            Build your process from a blank canvas
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600">
            Start with an empty workflow and add only the steps you need for
            your team's HR automation.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                startBlankWorkflow();
                setIsHomeScreen(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4" />
              <span>New Workflow</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="grid min-h-svh w-full grid-rows-[auto_1fr_auto] bg-slate-100 lg:grid-cols-[16rem_1fr_20rem] lg:grid-rows-1">
      <aside
        className="border-b border-slate-200 bg-white/90 p-4 backdrop-blur lg:border-b-0 lg:border-r"
        aria-label="Node palette"
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          HR Nodes
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {nodeDefinitions.map((type) => {
            const Icon = nodeVisuals[type].Icon;

            return (
              <button
                key={type}
                type="button"
                onClick={() => addNode(type)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{nodeLabels[type]}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={exportWorkflow}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <FileDown className="h-4 w-4 shrink-0" />
              <span>Export JSON</span>
            </span>
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-left text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 shrink-0" />
              <span>Clear Canvas</span>
            </span>
          </button>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Shortcuts
          </h3>
          <ul className="space-y-1 text-xs text-slate-600">
            {SHORTCUTS_REFERENCE.map((shortcut) => (
              <li key={shortcut.keys}>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5">
                  {shortcut.keys}
                </kbd>{" "}
                {shortcut.action}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="h-[55svh] w-full lg:h-svh">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) =>
            toggleNodeSelection(node.id, event.shiftKey)
          }
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          className="bg-linear-to-br from-slate-50 via-slate-100 to-blue-50"
        >
          <Background gap={20} size={1} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>

      <NodeConfigPanel
        node={selectedNode}
        automationActions={actions}
        isLoadingAutomations={isLoading}
        automationsError={error}
        onConfigChange={updateNodeConfig}
        onDeleteNode={deleteNode}
        onClose={() => setSelectedNodeId(null)}
      />

      <WorkflowSimulationPanel
        onRun={() => void runSimulation()}
        isRunning={isSimulating}
        validationErrors={validationErrors}
        executionLog={executionLog}
      />
    </div>
  );
}

export default App;
