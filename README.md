# HR Workflow Designer

A visual workflow builder for HR processes — onboarding, leave approvals, document verification — built with React, TypeScript, and React Flow.

[HR Workflow Designer]

---

## Features

- **Visual canvas** — drag, connect, and rearrange nodes freely
- **5 node types** — Start, Task, Approval, Automated Step, End
- **Per-node config forms** — each type has its own validated form panel
- **Dynamic action params** — Automated Step nodes generate form fields from the mock API response
- **Topological simulation** — executes and logs nodes in correct graph order (Kahn's algorithm)
- **Workflow validation** — 9 checks: connectivity, reachability, required fields, and more
- **Persistent canvas** — state survives page refresh via localStorage (Zustand persist)
- **Export JSON** — download the serialized workflow graph
- **MiniMap + Controls** — built-in React Flow navigation aids

---

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Architecture

```
src/
├── api/                          # Mock API layer (no UI imports)
│   ├── automationApi.ts          # GET /automations — returns actions + param lists
│   └── workflowSimulationApi.ts  # POST /simulate — topo-sorted execution log
│
├── components/ui/
│   └── KeyValueListEditor.tsx    # Generic key-value pair editor (reused across forms)
│
├── features/
│   ├── workflow-editor/
│   │   ├── nodes/                # One file per React Flow custom node
│   │   ├── config-forms/         # One form per node type
│   │   ├── components/
│   │   │   ├── HrNodeShell.tsx   # Shared node wrapper — visual style + handles
│   │   │   └── NodeConfigPanel.tsx
│   │   ├── nodeTypeConfig.ts     # Visual style registry (color, icon, badge per type)
│   │   └── types.ts              # All types + discriminated union NodeConfigByType
│   │
│   └── simulation/
│       ├── components/
│       │   └── WorkflowSimulationPanel.tsx
│       └── services/
│           └── workflowSimulation.ts  # Graph serialization + 9-rule validation
│
├── hooks/
│   └── useAutomationActions.ts   # Loads automation actions with loading/error state
│
├── store/
│   └── workflowStore.ts          # Zustand store — all canvas state + actions
│
└── App.tsx                       # Layout only — wires store to React Flow and panels
```

### Key design decisions

**Zustand with persist middleware** — all canvas state (nodes, edges, nextNodeId) lives in a single store and is automatically synced to localStorage. `App.tsx` is purely a layout component; it holds no state.

**Discriminated union types** — `NodeConfigByType` maps each node type to its config shape. `updateNodeConfig<T extends HrNodeType>` is generic, so the compiler rejects mismatched type/config pairs at the call site.

**Topological execution order** — simulation uses Kahn's BFS algorithm on the edge list, so log entries always appear in the actual flow order regardless of how nodes were added.

**Scalability** — adding a new node type requires: one entry in `HrNodeType`, one entry in `nodeTypeConfig.ts`, one node component, one form component, and one entry in `getDefaultConfigForType`. No existing files need structural changes.

---

## Node Types

| Type | Config fields | Validation |
|------|--------------|------------|
| Start | title, metadata (key-value) | — |
| Task | title *(required)*, description, assignee, due date, custom fields | title must not be empty |
| Approval | title, approver role *(required)*, threshold | approver role must not be empty |
| Automated Step | title, action *(required)*, dynamic params | action must be selected |
| End | message, summary flag | — |

---

## Workflow Validation Rules

Before simulation, the graph is checked for:

1. Workflow is not empty
2. At least one Start node
3. At least one End node
4. All edges reference valid node IDs
5. Required config fields are filled (title, approver role, action)
6. Every non-Start node has at least one incoming edge
7. Every non-End node has at least one outgoing edge
8. The full graph is connected (undirected BFS)
9. Every node is reachable from Start (forward BFS)
10. Every node can reach End (reverse BFS)

---

## Mock API

The API layer (`src/api/`) simulates async HTTP calls with a fixed delay. Shapes are designed to be drop-in replaceable with real `fetch` calls.

| Endpoint | File | Returns |
|----------|------|---------|
| GET /automations | `automationApi.ts` | `AutomationAction[]` — id, label, params |
| POST /simulate | `workflowSimulationApi.ts` | `{ success, executionLog }` |

---

## How It Works

This section explains the full internal flow of the app — how data moves from a button click to the canvas — so a new developer can get oriented quickly.

### Big Picture

The app has three visual zones:

```
┌─────────────────┬──────────────────────────┬──────────────────┐
│   Left sidebar  │         Canvas           │   Right panel    │
│  (node palette  │      (React Flow)        │  (NodeConfig +   │
│  + shortcuts)   │                          │   Simulation)    │
└─────────────────┴──────────────────────────┴──────────────────┘
```

All state — nodes, edges, selection, history, simulation output — lives in a single **Zustand store** (`src/store/workflowStore.ts`). `App.tsx` is a pure layout component: it reads from the store and passes callbacks down to each zone. Nothing else holds state.

---

### 1. Adding a Node

Clicking a node type button in the left sidebar calls `addNode(type)` on the store. The store:

1. Generates a new ID: `node-${nextNodeId}`
2. Calculates a grid position so nodes don't stack on top of each other
3. Calls `getDefaultConfigForType(type)` to get a blank config object for that type
4. Appends the new node to `nodes`, increments `nextNodeId`
5. Sets `selectedNodeIds = [newId]` so the config panel opens immediately
6. Saves a history snapshot for undo support

React Flow receives the updated `nodes` array as a prop and re-renders the canvas.

---

### 2. Connecting Nodes

React Flow handles drag-to-connect natively. When the user drags from one node's handle to another, React Flow fires `onConnect(connection)`. The store's handler calls `addEdge(connection, s.edges)` — a React Flow utility — and writes the new edge array back to state.

Edges are stored as plain objects `{ id, source, target }`. No custom edge components are used.

---

### 3. Editing a Node (Config Panel)

Clicking a node on the canvas fires `toggleNodeSelection(node.id, event.shiftKey)`. The store sets `selectedNodeIds = [id]` on a normal click, or toggles the ID in/out of the array on Shift+click for multi-select.

`App.tsx` derives `selectedNode = nodes.find(n => n.id === selectedNodeIds[0])` and passes it to `NodeConfigPanel`. The panel renders the correct form based on `node.type`:

| Node type | Form | Required fields |
|-----------|------|----------------|
| `startNode` | `StartNodeForm` | — |
| `taskNode` | `TaskNodeForm` | title |
| `approvalNode` | `ApprovalNodeForm` | approverRole |
| `automatedStepNode` | `AutomatedNodeForm` | actionId |
| `endNode` | `EndNodeForm` | — |

Each form is fully controlled — it renders directly from `node.data.config` and calls `onConfigChange(nodeId, nodeType, newConfig)` on every change. That calls `updateNodeConfig` in the store, which maps over `nodes` and returns a **new node object** (`{ ...node, data: { label, config } }`) for the matching ID. The new reference is what tells React Flow to re-render that node on the canvas.

`AutomatedNodeForm` is the most dynamic: it fetches available actions from `automationApi.ts` via `useAutomationActions`, then generates a text input for each param defined in the selected action (e.g. selecting "Send Email" renders fields for `to` and `subject`).

---

### 4. Undo / Redo

Every mutating action — add, delete, update config — saves a `HistorySnapshot` (`{ nodes, edges, nextNodeId }`) to a `history` array in the store, capped at 50 entries. `historyIndex` tracks the current position.

- **Undo** (`Ctrl+Z`): decrements `historyIndex` and restores that snapshot
- **Redo** (`Ctrl+Y`): increments `historyIndex` and restores forward
- Any new action after an undo calls `history.slice(0, historyIndex + 1)` before pushing, so the future branch is discarded

---

### 5. Keyboard Shortcuts

`App.tsx` registers a single `keydown` listener via `registerKeyboardShortcuts` inside a `useEffect`. The listener is re-registered whenever `selectedNodeIds`, `selectedNode`, or any handler changes — all listed in the dependency array.

Before handling any key, the listener calls `isInputTarget(e.target)`. If the user is typing inside an `<input>`, `<textarea>`, or `<select>`, all shortcuts are skipped.

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Delete selected node(s) |
| `Ctrl+D` | Duplicate selected node |
| `Ctrl+Enter` | Run simulation |
| `Ctrl+Shift+E` | Export JSON |
| `Ctrl+Shift+C` | Clear canvas (with confirm dialog) |
| `Shift+Click` | Multi-select nodes |

---

### 6. Validation

Before simulation runs, `validateWorkflowGraph(serializedWorkflow)` checks:

1. Workflow is not empty
2. Has at least one Start node
3. Has at least one End node
4. All edge `source`/`target` IDs exist in the node list
5. Task nodes have a non-empty title
6. Approval nodes have a non-empty approver role
7. Automated Step nodes have an action selected
8. Every non-Start node has at least one incoming edge
9. Every non-End node has at least one outgoing edge
10. **Connectivity** — undirected BFS from Start reaches every node (no islands)
11. **Forward reachability** — directed BFS from Start reaches every node
12. **Reverse reachability** — directed BFS backwards from every End reaches every node (no dead-end paths)

If any check fails, errors are written to `validationErrors` in the store and shown in the simulation panel. Simulation does not proceed.

---

### 7. Simulation

If validation passes, `runSimulation()`:

1. Sets `isSimulating = true` (shows a loading state in the panel)
2. Calls `simulateWorkflow({ workflow })` — a mock async function with a 450 ms delay
3. Inside the mock, `topoSort()` runs **Kahn's algorithm** (BFS by in-degree) on the edge list to produce a stable execution order regardless of how nodes were added to the canvas
4. Each node in sorted order emits a log line based on its type and config — e.g. `Task "Send Offer Letter" assigned to HR Manager · due 2026-05-01`
5. The log array is written to `executionLog` and rendered in `WorkflowSimulationPanel`

The simulation API (`src/api/workflowSimulationApi.ts`) has zero UI imports and a clean request/response shape, so swapping in a real HTTP call means changing only that file.

---

### 8. Export

`exportWorkflow()` serializes the current canvas into a `SerializedWorkflow` JSON, creates a Blob, and triggers a browser file download as `workflow.json`. The serialized shape strips all React Flow internals and keeps only:

- **Nodes**: `{ id, type, label, config, position }`
- **Edges**: `{ id, source, target }`

---

### 9. Persistence

The Zustand store uses the `persist` middleware with storage key `hr-workflow-v2`. On every state change, `nodes`, `edges`, and `nextNodeId` are written to `localStorage`. On page load, the store rehydrates automatically. History, selection state, and simulation output are intentionally excluded via the `partialize` option — they reset on every page load.

