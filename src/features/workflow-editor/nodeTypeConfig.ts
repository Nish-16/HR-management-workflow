import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  ListTodo,
  Play,
  ShieldCheck,
  Sparkles,
  Square,
} from "lucide-react";

import type { HrNodeType } from "./types";

export type NodeVisual = {
  bg: string;
  border: string;
  badge: string;
  badgeText: string;
  Icon: LucideIcon;
};

export const nodeVisuals: Record<HrNodeType, NodeVisual> = {
  startNode: {
    bg: "bg-emerald-50",
    border: "border-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
    badgeText: "START",
    Icon: Play,
  },
  taskNode: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    badgeText: "TASK",
    Icon: ListTodo,
  },
  approvalNode: {
    bg: "bg-amber-50",
    border: "border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    badgeText: "APPROVAL",
    Icon: ShieldCheck,
  },
  automatedStepNode: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    badge: "bg-purple-100 text-purple-700",
    badgeText: "AUTO",
    Icon: Sparkles,
  },
  endNode: {
    bg: "bg-red-50",
    border: "border-red-400",
    badge: "bg-red-100 text-red-700",
    badgeText: "END",
    Icon: Square,
  },
};
