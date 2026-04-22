import type { KeyValuePair } from "../../../features/workflow-editor/types";

type KeyValueListEditorProps = {
  label: string;
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  addButtonLabel: string;
};

export function KeyValueListEditor({
  label,
  items,
  onChange,
  addButtonLabel,
}: KeyValueListEditorProps) {
  const updateItem = (
    index: number,
    field: keyof Omit<KeyValuePair, "uid">,
    value: string,
  ) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([
      ...items,
      { uid: crypto.randomUUID(), key: "", value: "" },
    ]);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.uid ?? String(index)}
            className="grid grid-cols-[1fr_1fr_auto] gap-2"
          >
            <input
              value={item.key}
              onChange={(e) => updateItem(index, "key", e.target.value)}
              placeholder="Key"
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              value={item.value}
              onChange={(e) => updateItem(index, "value", e.target.value)}
              placeholder="Value"
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        {addButtonLabel}
      </button>
    </div>
  );
}
