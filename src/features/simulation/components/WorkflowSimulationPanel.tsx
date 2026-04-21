import { PlayCircle, TriangleAlert } from "lucide-react";

type WorkflowSimulationPanelProps = {
  onRun: () => void;
  isRunning: boolean;
  validationErrors: string[];
  executionLog: string[];
};

export function WorkflowSimulationPanel({
  onRun,
  isRunning,
  validationErrors,
  executionLog,
}: WorkflowSimulationPanelProps) {
  return (
    <section className="border-t border-slate-200 bg-white p-4 lg:col-span-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Workflow Simulation
        </h2>
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="rounded-md border border-slate-300 bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            {isRunning ? "Running..." : "Run Workflow"}
          </span>
        </button>
      </div>

      {validationErrors.length > 0 ? (
        <ul className="mb-3 space-y-1 text-sm text-red-600">
          {validationErrors.map((error) => (
            <li key={error} className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Execution Log
        </div>
        {executionLog.length === 0 ? (
          <p className="text-sm text-slate-600">
            Run the workflow to see steps.
          </p>
        ) : (
          <ol className="space-y-2 text-sm text-slate-700">
            {executionLog.map((entry, index) => (
              <li key={`${entry}-${index}`} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-400" />
                <span>{entry}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
