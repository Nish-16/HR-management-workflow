import { Home, ListChecks, Workflow } from "lucide-react";
import { NavLink } from "react-router-dom";

import { ROUTES } from "../../../app/routes/paths";

export function CanvasTabs() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-slate-900 text-white"
        : "bg-white text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <nav className="flex items-center gap-2" aria-label="Canvas routes">
        <NavLink to={ROUTES.canvas} end className={linkClass}>
          <Workflow className="h-4 w-4" />
          <span>Canvas</span>
        </NavLink>
        <NavLink to={ROUTES.executedWorkflows} className={linkClass}>
          <ListChecks className="h-4 w-4" />
          <span>Executed Workflows</span>
        </NavLink>
      </nav>
      <NavLink
        to={ROUTES.home}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </NavLink>
    </div>
  );
}
