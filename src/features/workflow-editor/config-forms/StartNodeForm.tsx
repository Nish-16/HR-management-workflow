import type { StartNodeConfig } from "../types";
import { KeyValueListEditor } from "../../../components/ui/KeyValueListEditor";

type StartNodeFormProps = {
  config: StartNodeConfig;
  onChange: (config: StartNodeConfig) => void;
};

export function StartNodeForm({ config, onChange }: StartNodeFormProps) {
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
          placeholder="Start of process"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <KeyValueListEditor
        label="Metadata"
        items={config.metadata}
        onChange={(metadata) => onChange({ ...config, metadata })}
        addButtonLabel="Add metadata"
      />
    </div>
  );
}
