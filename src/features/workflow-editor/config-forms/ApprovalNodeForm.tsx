import type { ApprovalNodeConfig } from "../types";

type ApprovalNodeFormProps = {
  config: ApprovalNodeConfig;
  onChange: (config: ApprovalNodeConfig) => void;
};

export function ApprovalNodeForm({ config, onChange }: ApprovalNodeFormProps) {
  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Title
        </span>
        <input
          value={config.title}
          onChange={(event) =>
            onChange({ ...config, title: event.target.value })
          }
          placeholder="Manager Approval"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Approver Role
        </span>
        <input
          value={config.approverRole}
          onChange={(event) =>
            onChange({ ...config, approverRole: event.target.value })
          }
          placeholder="Department Head"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Threshold
        </span>
        <input
          type="number"
          min={1}
          value={config.threshold}
          onChange={(event) =>
            onChange({
              ...config,
              threshold: Math.max(1, Number(event.target.value) || 1),
            })
          }
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
    </div>
  );
}
