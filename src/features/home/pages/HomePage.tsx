import {
  ArrowRight,
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

const nodeGuide = [
  {
    Icon: Play,
    accent: "border-emerald-400",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    label: "Start",
    desc: "Entry point. Attach metadata like employee ID or process name.",
  },
  {
    Icon: ListTodo,
    accent: "border-blue-400",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    label: "Task",
    desc: "Manual step with an assignee, due date, and custom fields.",
  },
  {
    Icon: ShieldCheck,
    accent: "border-amber-400",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    label: "Approval",
    desc: "Blocks progress until the required role signs off.",
  },
  {
    Icon: Zap,
    accent: "border-purple-400",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
    label: "Automated Step",
    desc: "Fires a configured action — no human input needed.",
  },
  {
    Icon: Square,
    accent: "border-red-400",
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
    label: "End",
    desc: "Closes the flow and optionally emits a run summary.",
  },
];

const steps = [
  {
    n: "01",
    title: "Place nodes",
    body: "Add a Start node, then wire in tasks, approvals, and automated steps in the order your process runs.",
  },
  {
    n: "02",
    title: "Close and simulate",
    body: "Cap the flow with an End node, then hit Run Simulation in the right panel to walk through every step.",
  },
  {
    n: "03",
    title: "Review runs",
    body: "Each simulation is saved. Compare runs side-by-side in the Past runs tab to spot regressions.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { startBlankWorkflow } = useWorkflowStore();

  return (
    <main
      className="min-h-svh bg-white"
      style={{
        backgroundImage:
          "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Hero */}
      <div className="mx-auto max-w-5xl px-6 pt-20 pb-16 md:px-10 md:pt-28">
        <div className="flex items-center gap-2 text-slate-400 mb-6 text-sm font-medium">
          <Workflow className="h-4 w-4" />
          HR Workflow Designer
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1] md:text-6xl">
          Map, simulate, and
          <br />
          <span className="text-slate-400">review HR workflows.</span>
        </h1>

        <p className="mt-6 max-w-lg text-lg text-slate-500 leading-relaxed">
          A canvas tool for onboarding flows, approval chains, and automated HR
          sequences. Connect nodes, run simulations, inspect logs.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              startBlankWorkflow();
              navigate(ROUTES.canvas);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New workflow
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.canvas)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-95"
          >
            Continue editing
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.executedWorkflows)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ListChecks className="h-4 w-4" />
            Past runs
          </button>
        </div>
      </div>

      {/* Node types */}
      <div className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-5">
          Node types
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nodeGuide.map(({ Icon, accent, iconBg, iconColor, label, desc }) => (
            <div
              key={label}
              className={`flex gap-4 rounded-xl border-l-4 ${accent} border border-slate-200 bg-white px-5 py-4 shadow-sm`}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-0.5 text-sm text-slate-500 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-14 md:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-8">
            How it works
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map(({ n, title, body }) => (
              <div key={n}>
                <span className="block text-4xl font-black text-slate-200 leading-none mb-3 select-none">
                  {n}
                </span>
                <p className="text-sm font-semibold text-slate-800 mb-1">{title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
