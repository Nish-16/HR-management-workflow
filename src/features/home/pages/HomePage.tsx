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
import { useWorkflowStore } from "../../../store/workflowStore";

const nodeGuide = [
  {
    Icon: Play,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Start",
    desc: "Entry point of the workflow. Attach metadata like employee ID or process name.",
  },
  {
    Icon: ListTodo,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Task",
    desc: "Manual step assigned to a person. Set a due date and custom fields.",
  },
  {
    Icon: ShieldCheck,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Approval",
    desc: "Gate that requires sign-off from a specific role before the flow continues.",
  },
  {
    Icon: Zap,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    label: "Automated Step",
    desc: "Runs a configured action without human input — notifications, data writes, etc.",
  },
  {
    Icon: Square,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "End",
    desc: "Closes the workflow. Optionally outputs a summary of the completed run.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { startBlankWorkflow } = useWorkflowStore();

  return (
    <main className="min-h-svh bg-slate-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <Workflow className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">HR Workflow Designer</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Build and test HR workflows
          </h1>
          <p className="mt-3 text-slate-500 max-w-xl">
            A canvas for mapping out onboarding flows, approval chains, and
            automated HR sequences. Connect nodes, run a simulation, inspect
            the log.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                startBlankWorkflow();
                navigate(ROUTES.canvas);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
              New workflow
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.canvas)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Workflow className="h-4 w-4" />
              Continue editing
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.executedWorkflows)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ListChecks className="h-4 w-4" />
              Past runs
            </button>
          </div>
        </header>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Node types
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nodeGuide.map(({ Icon, color, bg, border, label, desc }) => (
              <div
                key={label}
                className={`rounded-xl border ${border} ${bg} p-4`}
              >
                <div className={`mb-2 inline-flex items-center gap-1.5 ${color} text-sm font-semibold`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            How it works
          </h2>
          <ol className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="font-mono text-slate-400 select-none">1.</span>
              Add a <strong className="text-slate-800">Start</strong> node, then connect it to tasks, approvals, or automated steps in the order your process runs.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-slate-400 select-none">2.</span>
              Close the flow with an <strong className="text-slate-800">End</strong> node, then hit <strong className="text-slate-800">Run Simulation</strong> in the right panel.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-slate-400 select-none">3.</span>
              Check the execution log in-panel or visit <strong className="text-slate-800">Past runs</strong> to compare across simulations.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
