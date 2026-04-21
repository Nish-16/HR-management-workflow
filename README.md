# HR Workflow Designer

A visual workflow builder for HR processes — onboarding, leave approvals, document verification — built with React, TypeScript, and React Flow.

![HR Workflow Designer](https://placeholder.com/screenshot)

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
