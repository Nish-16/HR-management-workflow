import { Navigate, Route, Routes } from "react-router-dom";

import { ROUTES } from "./paths";
import { HomePage } from "../../features/home/pages/HomePage";
import { CanvasPage } from "../../features/canvas/pages/CanvasPage";
import { ExecutedWorkflowsPage } from "../../features/executions/pages/ExecutedWorkflowsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.canvas} element={<CanvasPage />} />
      <Route
        path={ROUTES.executedWorkflows}
        element={<ExecutedWorkflowsPage />}
      />
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
