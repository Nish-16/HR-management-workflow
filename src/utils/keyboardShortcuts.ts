import type { WorkflowNode } from "../store/workflowStore";

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

/**
 * Check if the keyboard event target is an input-like element
 * where keyboard shortcuts should be ignored
 */
export function isInputTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/**
 * Register global keyboard shortcuts
 * Returns a cleanup function to remove the listener
 */
export function registerKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  selectedNodeId: string | null,
  selectedNode: WorkflowNode | null,
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    if (isInputTarget(e.target)) {
      return;
    }

    // Ctrl+Z / Cmd+Z: Undo
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handlers.onUndo();
    }

    // Ctrl+Y or Ctrl+Shift+Z / Cmd+Shift+Z: Redo
    if (
      ((e.ctrlKey || e.metaKey) && e.key === "y") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
    ) {
      e.preventDefault();
      handlers.onRedo();
    }

    // Delete: Delete selected node
    if (e.key === "Delete" && selectedNodeId) {
      e.preventDefault();
      handlers.onDelete();
    }

    // Ctrl+D / Cmd+D: Duplicate selected node
    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      if (selectedNode) {
        handlers.onDuplicate();
      }
    }

    // Ctrl+Shift+E / Cmd+Shift+E: Export
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
      e.preventDefault();
      handlers.onExport();
    }

    // Ctrl+Shift+C / Cmd+Shift+C: Clear canvas
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
      e.preventDefault();
      if (confirm("Are you sure you want to clear the canvas?")) {
        handlers.onClearCanvas();
      }
    }

    // Ctrl+Enter / Cmd+Enter: Run simulation
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handlers.onRunSimulation();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => window.removeEventListener("keydown", handleKeyDown);
}
