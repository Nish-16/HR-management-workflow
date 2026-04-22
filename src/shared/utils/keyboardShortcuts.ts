import type { WorkflowNode } from "../../features/workflow-editor/store/workflowStore";

export interface KeyboardShortcutHandlers {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onClearCanvas: () => void;
  onRunSimulation: () => void;
}

export const KEYBOARD_SHORTCUTS = {
  UNDO: "Ctrl+Z",
  REDO: "Ctrl+Y",
  DELETE: "Delete",
  DUPLICATE: "Ctrl+D",
  EXPORT: "Ctrl+Shift+E",
  CLEAR_CANVAS: "Ctrl+Shift+C",
  RUN_SIMULATION: "Ctrl+⏎",
} as const;

export const SHORTCUTS_REFERENCE = [
  { keys: "Ctrl+Z", action: "Undo" },
  { keys: "Ctrl+Y", action: "Redo" },
  { keys: "Delete", action: "Delete" },
  { keys: "Ctrl+D", action: "Duplicate" },
  { keys: "Ctrl+⏎", action: "Run" },
  { keys: "Ctrl+Shift+E", action: "Export" },
  { keys: "Shift+Click", action: "Multi-select" },
];

export function isInputTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export function registerKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  selectedNodeId: string | null,
  selectedNode: WorkflowNode | null,
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isInputTarget(e.target)) {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handlers.onUndo();
    }

    if (
      ((e.ctrlKey || e.metaKey) && e.key === "y") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
    ) {
      e.preventDefault();
      handlers.onRedo();
    }

    if (e.key === "Delete" && selectedNodeId) {
      e.preventDefault();
      handlers.onDelete();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      if (selectedNode) {
        handlers.onDuplicate();
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
      e.preventDefault();
      handlers.onExport();
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
      e.preventDefault();
      if (confirm("Are you sure you want to clear the canvas?")) {
        handlers.onClearCanvas();
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handlers.onRunSimulation();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => window.removeEventListener("keydown", handleKeyDown);
}
