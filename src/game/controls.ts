export const CONTROL_ACTIONS = [
  "pitchUp",
  "pitchDown",
  "yawLeft",
  "yawRight",
  "rollLeft",
  "rollRight",
  "throttleUp",
  "throttleDown",
  "engineStart",
  "engineStop",
  "separate",
  "stabilize",
  "abort",
  "rcsToggle",
  "rcsFore",
  "rcsAft",
  "rcsLeft",
  "rcsRight",
  "rcsUp",
  "rcsDown",
] as const;

export type ControlAction = (typeof CONTROL_ACTIONS)[number];
export type ControlMap = Record<ControlAction, string>;

export const DEFAULT_CONTROLS: ControlMap = {
  pitchUp: "KeyW",
  pitchDown: "KeyS",
  yawLeft: "KeyA",
  yawRight: "KeyD",
  rollLeft: "KeyQ",
  rollRight: "KeyE",
  throttleUp: "ShiftLeft",
  throttleDown: "ControlLeft",
  engineStart: "KeyG",
  engineStop: "KeyC",
  separate: "KeyB",
  stabilize: "KeyT",
  abort: "Backspace",
  rcsToggle: "KeyR",
  rcsFore: "KeyI",
  rcsAft: "KeyK",
  rcsLeft: "KeyJ",
  rcsRight: "KeyL",
  rcsUp: "KeyU",
  rcsDown: "KeyO",
};

export function mergeControls(patch?: Partial<ControlMap> | null): ControlMap {
  return { ...DEFAULT_CONTROLS, ...(patch ?? {}) };
}

export function keyLabel(code: string): string {
  if (!code) return "—";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  const names: Record<string, string> = {
    ShiftLeft: "Shift",
    ShiftRight: "R-Shift",
    ControlLeft: "Ctrl",
    ControlRight: "R-Ctrl",
    AltLeft: "Alt",
    AltRight: "R-Alt",
    Space: "Space",
    Backspace: "Backspace",
    Enter: "Enter",
    Tab: "Tab",
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
  };
  return names[code] ?? code.replace(/^(Numpad|Bracket|Semicolon)/, "");
}

export function actionFor(bindings: ControlMap, code: string): ControlAction | null {
  for (const action of CONTROL_ACTIONS) {
    if (bindings[action] === code) return action;
  }
  return null;
}

export function rebind(bindings: ControlMap, action: ControlAction, code: string): ControlMap {
  const next = { ...bindings };
  for (const item of CONTROL_ACTIONS) {
    if (next[item] === code) next[item] = "";
  }
  next[action] = code;
  return next;
}
