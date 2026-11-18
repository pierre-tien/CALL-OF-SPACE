import { MISSIONS, checksPass, readiness, type MissionDef, type Selection } from "./model";

export const MODULES = ["command", "engineering", "planning", "launch", "navigation", "surface"] as const;
export type ModuleId = (typeof MODULES)[number];

export const LUNAR = MISSIONS[0];

export function isModuleId(value: string | null): value is ModuleId {
  return MODULES.includes(value as ModuleId);
}

export function coachKey(input: {
  screen: string;
  selection?: Selection;
  mission?: MissionDef;
  inspected?: string[];
  oxygen?: number;
  incident?: string;
  tasksDone?: boolean;
}): string | null {
  const { screen, selection, mission, inspected = [], oxygen, incident, tasksDone } = input;
  if (screen === "brief") return "train.coach.brief";
  if (screen === "build" && selection && mission) {
    if (!selection.engine) return "train.coach.pickEngine";
    const holds = readiness(selection, mission).filter((check) => !check.ok);
    if (holds.length > 0) return "train.coach.fixHolds";
    return "train.coach.buildReady";
  }
  if (screen === "check" && selection && mission) {
    const checks = readiness(selection, mission);
    const waiting = checks.some((check) => !inspected.includes(check.id));
    if (waiting) return "train.coach.inspect";
    if (!checksPass(selection, mission)) return "train.coach.fixHolds";
    return "train.coach.launch";
  }
  if (screen === "surface") {
    if (incident === "pending") return "train.coach.incident";
    if ((oxygen ?? 100) < 30) return "assistant.oxygen";
    if (!tasksDone) return "train.coach.tasks";
    return "train.coach.surfaceReady";
  }
  return null;
}

export function hintFor(screen: string, dismissed: string[], hints: boolean): { id: string; key: string } | null {
  if (!hints) return null;
  const queue: Record<string, { id: string; key: string }[]> = {
    build: [{ id: "hangar", key: "train.hint.hangar" }],
    flight: [
      { id: "cockpit", key: "train.hint.cockpit" },
      { id: "fuel", key: "train.hint.fuel" },
    ],
    surface: [
      { id: "eva", key: "train.hint.eva" },
      { id: "crew", key: "train.hint.crew" },
    ],
  };
  return (queue[screen] ?? []).find((item) => !dismissed.includes(item.id)) ?? null;
}
