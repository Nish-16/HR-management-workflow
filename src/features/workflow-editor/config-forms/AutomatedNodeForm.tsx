import type { AutomationAction } from "../../../api/automationApi";
import type { AutomatedStepNodeConfig } from "../types";

type AutomatedNodeFormProps = {
  config: AutomatedStepNodeConfig;
  actions: AutomationAction[];
  isLoadingActions: boolean;
  actionsError: string | null;
  onChange: (config: AutomatedStepNodeConfig) => void;
};

export function AutomatedNodeForm({
  config,
  actions,
  isLoadingActions,
  actionsError,
  onChange,
}: AutomatedNodeFormProps) {
  const selectedAction = actions.find(
    (action) => action.id === config.actionId,
  );

  const handleActionChange = (actionId: string) => {
    const action = actions.find((item) => item.id === actionId);

    if (!action) {
      onChange({ ...config, actionId, params: {} });
      return;
    }

    const nextParams = action.params.reduce<Record<string, string>>(
      (accumulator, param) => {
        accumulator[param] = config.params[param] ?? "";
        return accumulator;
      },
      {},
    );

    onChange({
      ...config,
      actionId,
      params: nextParams,
    });
  };

  const handleParamChange = (param: string, value: string) => {
    onChange({
      ...config,
      params: {
        ...config.params,
        [param]: value,
      },
    });
  };

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
          placeholder="Automate account setup"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Action
        </span>
        <select
          value={config.actionId}
          onChange={(event) => handleActionChange(event.target.value)}
          disabled={isLoadingActions || actions.length === 0}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Select automation action</option>
          {actions.map((action) => (
            <option key={action.id} value={action.id}>
              {action.label}
            </option>
          ))}
        </select>
      </label>

      {isLoadingActions ? (
        <p className="text-xs text-slate-500">Loading automation actions...</p>
      ) : null}

      {actionsError ? (
        <p className="text-xs text-red-600">{actionsError}</p>
      ) : null}

      {selectedAction ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dynamic Params
          </div>
          {selectedAction.params.map((param) => (
            <label key={param} className="block space-y-1">
              <span className="text-xs text-slate-600">{param}</span>
              <input
                value={config.params[param] ?? ""}
                onChange={(event) =>
                  handleParamChange(param, event.target.value)
                }
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
