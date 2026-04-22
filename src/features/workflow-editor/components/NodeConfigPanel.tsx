import type { Node } from "reactflow";
import { Trash2, X } from "lucide-react";

import type { AutomationAction } from "../api/automationApi";
import type { HrNodeType, NodeConfigByType, WorkflowNodeData } from "../types";
import { ApprovalNodeForm } from "./node-forms/ApprovalNodeForm";
import { AutomatedNodeForm } from "./node-forms/AutomatedNodeForm";
import { EndNodeForm } from "./node-forms/EndNodeForm";
import { StartNodeForm } from "./node-forms/StartNodeForm";
import { TaskNodeForm } from "./node-forms/TaskNodeForm";

type WorkflowNode = Node<WorkflowNodeData, HrNodeType>;

type NodeConfigPanelProps = {
  node: WorkflowNode | null;
  automationActions: AutomationAction[];
  isLoadingAutomations: boolean;
  automationsError: string | null;
  onConfigChange: <T extends HrNodeType>(
    nodeId: string,
    nodeType: T,
    config: NodeConfigByType[T],
  ) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
};

export function NodeConfigPanel({
  node,
  automationActions,
  isLoadingAutomations,
  automationsError,
  onConfigChange,
  onDeleteNode,
  onClose,
}: NodeConfigPanelProps) {
  if (!node || !node.type) {
    return (
      <aside className="w-full border-l border-slate-200 bg-white p-4 lg:w-80">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Node Config
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Select a node to edit its properties.
        </p>
      </aside>
    );
  }

  const header = node.data.label || "Node";

  return (
    <aside className="w-full border-l border-slate-200 bg-white p-4 lg:w-80">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Node Config
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-800">{header}</p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              onDeleteNode(node.id);
              onClose();
            }}
            className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            <span className="inline-flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            <span className="inline-flex items-center gap-1.5">
              <X className="h-3.5 w-3.5" />
              <span>Close</span>
            </span>
          </button>
        </div>
      </div>

      {node.type === "startNode" ? (
        <StartNodeForm
          config={node.data.config as NodeConfigByType["startNode"]}
          onChange={(config) => onConfigChange(node.id, "startNode", config)}
        />
      ) : null}

      {node.type === "taskNode" ? (
        <TaskNodeForm
          config={node.data.config as NodeConfigByType["taskNode"]}
          onChange={(config) => onConfigChange(node.id, "taskNode", config)}
        />
      ) : null}

      {node.type === "approvalNode" ? (
        <ApprovalNodeForm
          config={node.data.config as NodeConfigByType["approvalNode"]}
          onChange={(config) => onConfigChange(node.id, "approvalNode", config)}
        />
      ) : null}

      {node.type === "automatedStepNode" ? (
        <AutomatedNodeForm
          config={node.data.config as NodeConfigByType["automatedStepNode"]}
          actions={automationActions}
          isLoadingActions={isLoadingAutomations}
          actionsError={automationsError}
          onChange={(config) =>
            onConfigChange(node.id, "automatedStepNode", config)
          }
        />
      ) : null}

      {node.type === "endNode" ? (
        <EndNodeForm
          config={node.data.config as NodeConfigByType["endNode"]}
          onChange={(config) => onConfigChange(node.id, "endNode", config)}
        />
      ) : null}
    </aside>
  );
}
