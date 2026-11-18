import { mergeControls, type ControlMap } from "./controls";
import type { MissionId, RunState } from "./model";

export interface HistoryEntry {
  missionId: MissionId;
  outcome: "success" | "partial" | "fail";
  score: number;
  duration: number;
  at: string;
}

export type ExperienceMode = "recruit" | "experienced" | "free";

export interface TrainingState {
  experience: ExperienceMode | null;
  hints: boolean;
  dismissed: string[];
  done: string[];
  achievements: string[];
  module: string | null;
  step: number;
}

export function emptyTraining(): TrainingState {
  return { experience: null, hints: true, dismissed: [], done: [], achievements: [], module: null, step: 0 };
}

export interface SaveData {
  languageChosen: boolean;
  name: string;
  avatar: string;
  completed: number;
  success: number;
  duration: number;
  incidents: number;
  discoveries: number;
  achievements: string[];
  history: HistoryEntry[];
  active: RunState | null;
  training: TrainingState;
  controls: ControlMap;
}

const KEY = "call-of-space-v1";

export const AVATARS = ["A", "K", "N", "R", "S", "V"];

export function emptySave(): SaveData {
  return {
    languageChosen: false,
    name: "Cadet",
    avatar: "A",
    completed: 0,
    success: 0,
    duration: 0,
    incidents: 0,
    discoveries: 0,
    achievements: [],
    history: [],
    active: null,
    training: emptyTraining(),
    controls: mergeControls(),
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const training = { ...emptyTraining(), ...(parsed.training ?? {}) };
    const played = (parsed.history?.length ?? 0) > 0 || (parsed.completed ?? 0) > 0;
    if (!parsed.training?.experience && played) {
      training.experience = "experienced";
      training.hints = parsed.training?.hints ?? false;
    }
    return { ...emptySave(), ...parsed, training, controls: mergeControls(parsed.controls) };
  } catch {
    return emptySave();
  }
}

export function writeSave(save: SaveData): void {
  localStorage.setItem(KEY, JSON.stringify(save));
}
