import { KeyValueListEditor } from "../../../../shared/components/ui/KeyValueListEditor";
import type { TaskNodeConfig } from "../../types";

type TaskNodeFormProps = {
  config: TaskNodeConfig;
  onChange: (config: TaskNodeConfig) => void;
};

export function TaskNodeForm({ config, onChange }: TaskNodeFormProps) {
  const customFields = config.customFields ?? [];

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Title <span className="text-red-500">*</span>
        </span>
        <input
          required
          value={config.title}
          onChange={(event) =>
            onChange({ ...config, title: event.target.value })
          }
          placeholder="Collect onboarding documents"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Description
        </span>
        <textarea
          value={config.description}
          onChange={(event) =>
            onChange({ ...config, description: event.target.value })
          }
          rows={3}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Assignee
        </span>
        <input
          value={config.assignee}
          onChange={(event) =>
            onChange({ ...config, assignee: event.target.value })
          }
          placeholder="HR Specialist"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Due Date
        </span>
        <input
          type="date"
          value={config.dueDate}
          onChange={(event) =>
            onChange({ ...config, dueDate: event.target.value })
          }
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <KeyValueListEditor
        label="Custom Fields"
        items={customFields}
        onChange={(fields) => onChange({ ...config, customFields: fields })}
        addButtonLabel="Add field"
      />
    </div>
  );
}
