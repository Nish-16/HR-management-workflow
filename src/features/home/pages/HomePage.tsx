import { useState, useEffect, type ElementType } from "react";
import {
  ListChecks,
  ListTodo,
  Play,
  Plus,
  ShieldCheck,
  Square,
  Workflow,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "../../../app/routes/paths";
import { useWorkflowStore } from "../../workflow-editor/store/workflowStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeColor = "emerald" | "blue" | "amber" | "purple" | "red";

type FlowNode = {
  id: string;
  label: string;
  badge: string;
  Icon: ElementType;
  color: NodeColor;
  desc: string;
  fields: string[];
};

// ─── Theme ───────────────────────────────────────────────────────────────────

const theme: Record<
  NodeColor,
  {
    border: string;
    ring: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconText: string;
    dot: string;
    canvasBorder: string;
    canvasRing: string;
  }
> = {
  emerald: {
    border: "border-emerald-300",
    ring: "ring-emerald-400",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    dot: "bg-emerald-400",
    canvasBorder: "border-emerald-500",
    canvasRing: "ring-emerald-500",
  },
  blue: {
    border: "border-blue-300",
    ring: "ring-blue-400",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    dot: "bg-blue-400",
    canvasBorder: "border-blue-500",
    canvasRing: "ring-blue-500",
  },
  amber: {
    border: "border-amber-300",
    ring: "ring-amber-400",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    dot: "bg-amber-400",
    canvasBorder: "border-amber-500",
    canvasRing: "ring-amber-500",
  },
  purple: {
    border: "border-purple-300",
    ring: "ring-purple-400",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    dot: "bg-purple-400",
    canvasBorder: "border-purple-500",
    canvasRing: "ring-purple-500",
  },
  red: {
    border: "border-red-300",
    ring: "ring-red-400",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    iconBg: "bg-red-100",
    iconText: "text-red-600",
    dot: "bg-red-400",
    canvasBorder: "border-red-500",
    canvasRing: "ring-red-500",
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const canvasNodes: FlowNode[] = [
  {
    id: "start",
    label: "New Hire",
    badge: "START",
    Icon: Play,
    color: "emerald",
    desc: "",
    fields: [],
  },
  {
    id: "task",
    label: "Collect Docs",
    badge: "TASK",
    Icon: ListTodo,
    color: "blue",
    desc: "",
    fields: [],
  },
  {
    id: "approval",
    label: "Manager Review",
    badge: "APPROVAL",
    Icon: ShieldCheck,
    color: "amber",
    desc: "",
    fields: [],
  },
  {
    id: "end",
    label: "Onboarded",
    badge: "END",
    Icon: Square,
    color: "red",
    desc: "",
    fields: [],
  },
];

const allNodeTypes: FlowNode[] = [
  {
    id: "start",
    label: "Start Node",
    badge: "START",
    Icon: Play,
    color: "emerald",
    desc: "Every workflow begins here. Attach key–value metadata — employee ID, department, hire date — and it carries through every downstream node.",
    fields: ["Process title", "Metadata (key / value pairs)"],
  },
  {
    id: "task",
    label: "Task Node",
    badge: "TASK",
    Icon: ListTodo,
    color: "blue",
    desc: "A human step. Assign it to a specific role, set a deadline, and attach any structured data the assignee needs to complete the work.",
    fields: ["Title *", "Description", "Assignee", "Due date", "Custom fields"],
  },
  {
    id: "approval",
    label: "Approval Node",
    badge: "APPROVAL",
    Icon: ShieldCheck,
    color: "amber",
    desc: "A gate. The workflow halts here until someone with the specified role approves. Set a numeric threshold for multi-approver scenarios.",
    fields: ["Title", "Approver role *", "Approval threshold"],
  },
  {
    id: "auto",
    label: "Automated Step",
    badge: "AUTO",
    Icon: Zap,
    color: "purple",
    desc: "Fires a system action with no human input — send an email, generate a document, provision an account. Parameters are dynamic and bound to the action.",
    fields: ["Title", "Action (from integration API)", "Dynamic params"],
  },
  {
    id: "end",
    label: "End Node",
    badge: "END",
    Icon: Square,
    color: "red",
    desc: "Closes the workflow. Optionally write a completion message and enable a summary view that surfaces the full run log for that execution.",
    fields: ["Completion message", "Enable summary view"],
  },
];

const howItWorks = [
  {
    n: "01",
    title: "Build on the canvas",
    body: "Add a Start node, chain tasks and approvals in order, close with an End. Drag to reposition, shift-click to multi-select.",
  },
  {
    n: "02",
    title: "Simulate before shipping",
    body: "Run Simulation walks every node, validates required fields, and writes a timestamped execution log — no real data touched.",
  },
  {
    n: "03",
    title: "Audit every run",
    body: "Each simulation is persisted. Open Past Runs to compare executions, trace errors back to the exact node that failed config.",
  },
];

// ─── Simulation hook ──────────────────────────────────────────────────────────

function useCyclingSimulation(length: number) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    let alive = true;
    const ids: ReturnType<typeof setTimeout>[] = [];

    function go(fn: () => void, ms: number) {
      const id = setTimeout(() => {
        if (alive) fn();
      }, ms);
      ids.push(id);
    }

    function cycle(startDelay: number) {
      go(() => {
        setStep(0);
        for (let i = 1; i < length; i++) {
          go(() => setStep(i), i * 750);
        }
        go(() => {
          setStep(-1);
          go(() => cycle(0), 1400);
        }, length * 750 + 400);
      }, startDelay);
    }

    cycle(900);
    return () => {
      alive = false;
      ids.forEach(clearTimeout);
    };
  }, [length]);

  return step;
}

// ─── Canvas connector ─────────────────────────────────────────────────────────

function CanvasConnector({
  traversed,
  arriving,
}: {
  traversed: boolean;
  arriving: boolean;
}) {
  return (
    <div className="relative flex w-10 shrink-0 items-center lg:w-16">
      {/* track */}
      <div className="h-px w-full bg-slate-700" />
      {/* animated fill */}
      <div
        className={`absolute left-0 h-px transition-[width] duration-500 ${
          traversed ? "w-full bg-slate-500" : arriving ? "w-3/4 bg-cyan-400" : "w-0"
        }`}
      />
      {/* arrowhead */}
      <div
        className={`absolute right-0 h-1.5 w-1.5 rotate-45 border-r border-t transition-colors duration-300 ${
          traversed
            ? "border-slate-500"
            : arriving
            ? "border-cyan-400"
            : "border-slate-700"
        }`}
      />
      {/* traveling dot */}
      {arriving && (
        <div className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-400 animate-ping" />
      )}
    </div>
  );
}

// ─── Canvas node card ─────────────────────────────────────────────────────────

function CanvasNodeCard({
  node,
  active,
  done,
}: {
  node: FlowNode;
  active: boolean;
  done: boolean;
}) {
  const t = theme[node.color];

  return (
    <div
      className={[
        "relative flex min-w-[96px] flex-col items-center rounded-xl border-2 px-3 py-2.5 text-center transition-all duration-300",
        active
          ? `${t.canvasBorder} bg-slate-900 ring-2 ring-offset-2 ring-offset-slate-950 ${t.canvasRing} shadow-lg`
          : done
          ? "border-slate-700 bg-slate-900/60"
          : "border-slate-800 bg-slate-900/40",
      ].join(" ")}
    >
      {/* Pulse beacon */}
      {active && (
        <span className="absolute -right-1 -top-1">
          <span
            className={`absolute inline-flex h-3 w-3 animate-ping rounded-full opacity-75 ${t.dot}`}
          />
          <span
            className={`relative inline-flex h-3 w-3 rounded-full ${t.dot}`}
          />
        </span>
      )}

      {/* Badge */}
      <div
        className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest transition-opacity duration-300 ${t.badgeBg} ${t.badgeText} ${!active && !done ? "opacity-40" : done ? "opacity-50" : "opacity-100"}`}
      >
        <node.Icon className="h-2.5 w-2.5" />
        {node.badge}
      </div>

      {/* Label */}
      <div
        className={`text-[11px] font-semibold leading-tight transition-colors duration-300 ${
          active ? "text-white" : done ? "text-slate-500" : "text-slate-600"
        }`}
      >
        {node.label}
      </div>
    </div>
  );
}

// ─── Workflow canvas preview ───────────────────────────────────────────────────

function WorkflowCanvas() {
  const step = useCyclingSimulation(canvasNodes.length);
  const isRunning = step >= 0;

  const statusLabel = isRunning
    ? ["Starting…", "Collecting docs…", "Awaiting approval…", "Complete ✓"][step] ?? "Running…"
    : "Ready";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 bg-slate-900/80 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <span className="ml-3 font-mono text-xs text-slate-500">
          onboarding.workflow
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              isRunning ? "animate-pulse bg-cyan-400" : "bg-slate-600"
            }`}
          />
          <span className="font-mono text-[11px] text-slate-500">
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Canvas area */}
      <div
        className="relative flex items-center justify-center px-8 py-12 lg:py-16"
        style={{
          backgroundImage: "radial-gradient(circle, #1e293b 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="flex items-center">
          {canvasNodes.map((node, i) => (
            <div key={node.id} className="flex items-center">
              <CanvasNodeCard
                node={node}
                active={step === i}
                done={step > i}
              />
              {i < canvasNodes.length - 1 && (
                <CanvasConnector
                  traversed={step > i + 1}
                  arriving={step === i + 1}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-4 py-2">
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-600">
          <span>{canvasNodes.length} nodes</span>
          <span>{canvasNodes.length - 1} edges</span>
        </div>
        <span className="font-mono text-[11px] text-slate-600">
          {isRunning ? `step ${step + 1} / ${canvasNodes.length}` : "simulation idle"}
        </span>
      </div>
    </div>
  );
}

// ─── Node explorer ────────────────────────────────────────────────────────────

function NodeExplorer() {
  const [activeId, setActiveId] = useState("task");
  const active = allNodeTypes.find((n) => n.id === activeId) ?? allNodeTypes[1];
  const t = theme[active.color];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      {/* Node type selector — mimics the canvas sidebar */}
      <div>
        <div className="flex flex-wrap gap-2">
          {allNodeTypes.map((node, i) => {
            const nt = theme[node.color];
            const isActive = node.id === activeId;
            return (
              <div key={node.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveId(node.id)}
                  className={[
                    "flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-150",
                    isActive
                      ? `${nt.border} bg-white text-slate-900 shadow-sm`
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800",
                  ].join(" ")}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors duration-150 ${
                      isActive ? nt.iconBg : "bg-slate-100"
                    }`}
                  >
                    <node.Icon
                      className={`h-3.5 w-3.5 transition-colors duration-150 ${
                        isActive ? nt.iconText : "text-slate-400"
                      }`}
                    />
                  </span>
                  {node.label}
                </button>

                {/* Connector arrow */}
                {i < allNodeTypes.length - 1 && (
                  <div className="hidden items-center sm:flex">
                    <div className="h-px w-3 bg-slate-200" />
                    <div className="h-1.5 w-1.5 rotate-45 border-r border-t border-slate-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Select a node to inspect its configuration surface.
        </p>
      </div>

      {/* Detail panel — mimics the right config panel */}
      <div
        className={[
          "rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200",
          `border-l-4 ${t.border}`,
        ].join(" ")}
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${t.badgeBg} ${t.badgeText}`}
          >
            <active.Icon className="h-3 w-3" />
            {active.badge}
          </div>
          <p className="mt-1.5 text-sm font-semibold text-slate-900">
            {active.label}
          </p>
        </div>

        <div className="px-4 py-4 text-sm text-slate-600 leading-relaxed">
          {active.desc}
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Config fields
          </p>
          <ul className="space-y-1.5">
            {active.fields.map((field) => (
              <li key={field} className="flex items-center gap-2 text-xs text-slate-600">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.dot}`} />
                {field}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate();
  const { startBlankWorkflow } = useWorkflowStore();

  return (
    <main className="min-h-svh bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-[2fr_3fr] lg:items-center lg:gap-16 lg:px-10">
        <div>
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-400">
            <Workflow className="h-4 w-4" />
            HR Workflow Builder
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-5xl">
            Visual workflows
            <br />
            <span className="text-slate-400">for every HR process.</span>
          </h1>

          <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-500">
            Design, simulate, and audit onboarding flows, approval chains, and
            automated HR sequences — all in the browser.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                startBlankWorkflow();
                navigate(ROUTES.canvas);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New workflow
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.canvas)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-95"
            >
              Open canvas
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.executedWorkflows)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-800"
            >
              <ListChecks className="h-4 w-4" />
              Past runs
            </button>
          </div>
        </div>

        <WorkflowCanvas />
      </section>

      {/* ── Node explorer ─────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Node types
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Five building blocks. Every workflow is a composition of these.
            </p>
          </div>
          <NodeExplorer />
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-slate-50 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-10 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            How it works
          </p>
          <div className="grid gap-10 sm:grid-cols-3">
            {howItWorks.map(({ n, title, body }) => (
              <div key={n}>
                <span className="mb-3 block select-none text-5xl font-black leading-none text-slate-100">
                  {n}
                </span>
                <p className="mb-1.5 text-sm font-semibold text-slate-800">
                  {title}
                </p>
                <p className="text-sm leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
