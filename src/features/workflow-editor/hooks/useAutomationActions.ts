import { useEffect, useState } from "react";

import { getAutomations, type AutomationAction } from "../api/automationApi";

type UseAutomationActionsResult = {
  actions: AutomationAction[];
  isLoading: boolean;
  error: string | null;
};

export function useAutomationActions(): UseAutomationActionsResult {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadActions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAutomations();

        if (!isMounted) {
          return;
        }

        setActions(response);
      } catch {
        if (!isMounted) {
          return;
        }

        setError("Failed to load automation actions.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadActions();

    return () => {
      isMounted = false;
    };
  }, []);

  return { actions, isLoading, error };
}
