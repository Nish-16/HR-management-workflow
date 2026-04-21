import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from "reactflow";
import { FileDown, Trash2 } from "lucide-react";

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
  const {
    nodes,
    edges,
    selectedNodeId,
    isSimulating,
    executionLog,
    validationErrors,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    updateNodeConfig,
    setSelectedNodeId,
    clearCanvas,
    exportWorkflow,
    runSimulation,
  } = useWorkflowStore();

  const { actions, isLoading, error } = useAutomationActions();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

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
      </aside>

      <div className="h-[55svh] w-full lg:h-svh">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
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
