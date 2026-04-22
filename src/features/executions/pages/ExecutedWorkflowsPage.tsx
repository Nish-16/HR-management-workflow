import { CanvasTabs } from "../../canvas/components/CanvasTabs";
import { useWorkflowStore } from "../../../store/workflowStore";

export function ExecutedWorkflowsPage() {
  const { executedWorkflows } = useWorkflowStore();

  return (
    <main className="min-h-svh bg-slate-100 p-4">
      <CanvasTabs />

      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Executed Workflows
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review simulation runs from your canvas.
        </p>

        {executedWorkflows.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No workflow executions yet. Run a simulation in Canvas to populate
            this tab.
          </div>
        ) : (
          <ol className="mt-6 space-y-4">
            {executedWorkflows.map((run) => (
              <li
                key={run.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(run.executedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {run.nodeCount} nodes • {run.edgeCount} edges
                  </p>
                </div>
                <ol className="mt-3 space-y-2 text-sm text-slate-700">
                  {run.executionLog.map((entry, index) => (
                    <li key={`${run.id}-${index}`} className="flex gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                      <span>{entry}</span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
