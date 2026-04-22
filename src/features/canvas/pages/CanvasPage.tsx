import { useEffect } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import { FileDown, Trash2 } from "lucide-react";

import { useAutomationActions } from "../../workflow-editor/hooks/useAutomationActions";
import { WorkflowSimulationPanel } from "../../simulation/components/WorkflowSimulationPanel";
import { nodeVisuals } from "../../workflow-editor/nodeTypeConfig";
import { NodeConfigPanel } from "../../workflow-editor/components/NodeConfigPanel";
import { nodeLabels, type HrNodeType } from "../../workflow-editor/types";
import { useWorkflowStore } from "../../workflow-editor/store/workflowStore";
import {
  registerKeyboardShortcuts,
  SHORTCUTS_REFERENCE,
} from "../../../shared/utils/keyboardShortcuts";
import { CanvasTabs } from "../components/CanvasTabs";
import { nodeDefinitions, nodeTypes } from "../config/canvasConfig";

import "reactflow/dist/style.css";

export function CanvasPage() {
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

  useEffect(() => {
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
  ]);

  return (
    <main className="min-h-svh bg-slate-100 p-4">
      <CanvasTabs />

      <div className="grid min-h-[calc(100svh-8rem)] w-full grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[16rem_1fr_20rem] lg:grid-rows-1">
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

        <div className="h-[55svh] w-full lg:h-full">
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
            className="bg-linear-to-br from-slate-50 via-slate-100 to-cyan-50"
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
    </main>
  );
}
