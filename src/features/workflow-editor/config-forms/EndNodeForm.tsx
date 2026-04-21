import type { EndNodeConfig } from "../types";

type EndNodeFormProps = {
  config: EndNodeConfig;
  onChange: (config: EndNodeConfig) => void;
};

export function EndNodeForm({ config, onChange }: EndNodeFormProps) {
  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Message
        </span>
        <textarea
          value={config.message}
          onChange={(event) =>
            onChange({ ...config, message: event.target.value })
          }
          rows={3}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={config.summary}
          onChange={(event) =>
            onChange({ ...config, summary: event.target.checked })
          }
          className="h-4 w-4 rounded border-slate-300"
        />
        Enable summary view
      </label>
    </div>
  );
}
