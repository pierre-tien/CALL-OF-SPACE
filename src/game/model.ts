export type MissionId = "lunar" | "mars" | "station" | "asteroid" | "rescue";

export type Slot =
  | "engine"
  | "booster"
  | "tank"
  | "structure"
  | "command"
  | "power"
  | "comms"
  | "nav"
  | "science"
  | "crew"
  | "life";

export interface Part {
  id: string;
  slot: Slot;
  mass: number;
  cost: number;
  fuel?: number;
  thrust?: number;
  isp?: number;
  burn?: number;
  energyOut?: number;
  energyIn?: number;
  comms?: number;
  capacity?: number;
  science?: number;
  required?: boolean;
}

export interface MissionDef {
  id: MissionId;
  budget: number;
  minDv: number;
  minComms: number;
  crewed: boolean;
  needsScience: boolean;
  kind: "transfer" | "rendezvous";
  body: "moon" | "mars" | "earth" | "asteroid";
  tasks: string[];
}

export const SLOTS: Slot[] = [
  "engine",
  "booster",
  "tank",
  "structure",
  "command",
  "power",
  "comms",
  "nav",
  "science",
  "crew",
  "life",
];

export const PARTS: Part[] = [
  { id: "engine-light", slot: "engine", mass: 1.4, cost: 90, thrust: 700, isp: 322, burn: 0.85 },
  { id: "engine-mid", slot: "engine", mass: 2.2, cost: 170, thrust: 1200, isp: 330, burn: 1.15 },
  { id: "engine-heavy", slot: "engine", mass: 3.8, cost: 280, thrust: 2000, isp: 285, burn: 2.15 },
  { id: "booster-none", slot: "booster", mass: 0, cost: 0 },
  { id: "booster-srb", slot: "booster", mass: 2.6, cost: 110, thrust: 900, isp: 250, burn: 1.7, fuel: 16 },
  { id: "tank-small", slot: "tank", mass: 1.8, cost: 70, fuel: 42 },
  { id: "tank-mid", slot: "tank", mass: 3.0, cost: 130, fuel: 72 },
  { id: "tank-large", slot: "tank", mass: 4.6, cost: 200, fuel: 112 },
  { id: "frame-light", slot: "structure", mass: 1.1, cost: 55, capacity: 8 },
  { id: "frame-mid", slot: "structure", mass: 1.6, cost: 90, capacity: 14 },
  { id: "frame-heavy", slot: "structure", mass: 2.4, cost: 140, capacity: 22 },
  { id: "command-core", slot: "command", mass: 1.5, cost: 120, energyIn: 5 },
  { id: "power-solar", slot: "power", mass: 0.7, cost: 80, energyOut: 28 },
  { id: "power-battery", slot: "power", mass: 1.5, cost: 65, energyOut: 16 },
  { id: "power-cell", slot: "power", mass: 1.1, cost: 100, energyOut: 22, energyIn: 0 },
  { id: "comms-omni", slot: "comms", mass: 0.25, cost: 35, comms: 42, energyIn: 3 },
  { id: "comms-high", slot: "comms", mass: 0.45, cost: 100, comms: 82, energyIn: 6 },
  { id: "nav-basic", slot: "nav", mass: 0.3, cost: 50, energyIn: 2 },
  { id: "nav-optical", slot: "nav", mass: 0.55, cost: 110, energyIn: 4 },
  { id: "science-none", slot: "science", mass: 0, cost: 0, science: 0, energyIn: 0 },
  { id: "science-camera", slot: "science", mass: 0.35, cost: 60, science: 14, energyIn: 4 },
  { id: "science-spec", slot: "science", mass: 0.9, cost: 140, science: 26, energyIn: 9 },
  { id: "crew-none", slot: "crew", mass: 0, cost: 0 },
  { id: "crew-pair", slot: "crew", mass: 1.6, cost: 160 },
  { id: "life-none", slot: "life", mass: 0, cost: 0 },
  { id: "life-basic", slot: "life", mass: 0.8, cost: 100, energyIn: 6 },
  { id: "life-closed", slot: "life", mass: 1.4, cost: 180, energyIn: 7 },
];

export const MISSIONS: MissionDef[] = [
  {
    id: "lunar",
    budget: 1100,
    minDv: 5.15,
    minComms: 60,
    crewed: true,
    needsScience: true,
    kind: "transfer",
    body: "moon",
    tasks: ["deploy", "photo", "sample", "transmit"],
  },
  {
    id: "mars",
    budget: 1280,
    minDv: 6.0,
    minComms: 70,
    crewed: true,
    needsScience: true,
    kind: "transfer",
    body: "mars",
    tasks: ["deploy", "photo", "water", "transmit"],
  },
  {
    id: "station",
    budget: 780,
    minDv: 4.2,
    minComms: 35,
    crewed: true,
    needsScience: false,
    kind: "rendezvous",
    body: "earth",
    tasks: ["inspect", "repair", "comms", "life"],
  },
  {
    id: "asteroid",
    budget: 1200,
    minDv: 5.5,
    minComms: 70,
    crewed: false,
    needsScience: true,
    kind: "transfer",
    body: "asteroid",
    tasks: ["approach", "measure", "compose", "report"],
  },
  {
    id: "rescue",
    budget: 1150,
    minDv: 5.25,
    minComms: 60,
    crewed: true,
    needsScience: false,
    kind: "transfer",
    body: "earth",
    tasks: ["signal", "intercept", "dock", "recover"],
  },
];

export type Selection = Record<Slot, string>;

export const EMPTY_SELECTION: Selection = {
  engine: "",
  booster: "booster-none",
  tank: "",
  structure: "",
  command: "",
  power: "",
  comms: "",
  nav: "",
  science: "science-none",
  crew: "crew-none",
  life: "life-none",
};

export const TRAINING_LOADOUT: Selection = {
  engine: "engine-mid",
  booster: "booster-none",
  tank: "tank-mid",
  structure: "frame-mid",
  command: "command-core",
  power: "power-solar",
  comms: "comms-high",
  nav: "nav-basic",
  science: "science-camera",
  crew: "crew-pair",
  life: "life-basic",
};

export const PRACTICE_LOADOUT: Selection = {
  ...TRAINING_LOADOUT,
  booster: "booster-srb",
};

export function partById(id: string | undefined): Part | undefined {
  return PARTS.find((part) => part.id === id);
}

export interface CraftStats {
  mass: number;
  dryMass: number;
  fuel: number;
  cost: number;
  thrust: number;
  isp: number;
  burn: number;
  boosterThrust: number;
  boosterBurn: number;
  boosterFuel: number;
  boosterDry: number;
  energyOut: number;
  energyIn: number;
  energyMargin: number;
  comms: number;
  science: number;
  payload: number;
  capacity: number;
  dv: number;
  twr: number;
  crewed: boolean;
  hasLife: boolean;
}

const G0 = 9.80665;

export function computeCraft(selection: Selection): CraftStats {
  const chosen = SLOTS.map((slot) => partById(selection[slot])).filter((part): part is Part => Boolean(part));
  const booster = chosen.find((part) => part.slot === "booster" && part.id !== "booster-none");
  const engine = chosen.find((part) => part.slot === "engine");
  const tank = chosen.find((part) => part.slot === "tank");
  const structure = chosen.find((part) => part.slot === "structure");
  const fuel = tank?.fuel ?? 0;
  const boosterFuel = booster?.fuel ?? 0;
  const boosterDry = booster?.mass ?? 0;
  const payloadSlots: Slot[] = ["command", "power", "comms", "nav", "science", "crew", "life"];
  const payload = chosen
    .filter((part) => payloadSlots.includes(part.slot))
    .reduce((sum, part) => sum + part.mass, 0);
  const dryWithoutBooster = chosen
    .filter((part) => part.slot !== "booster")
    .reduce((sum, part) => sum + part.mass, 0);
  const dryMass = dryWithoutBooster;
  const wet = dryMass + fuel + boosterDry + boosterFuel;
  const afterBoosterBurn = wet - boosterFuel;
  const afterDrop = afterBoosterBurn - boosterDry;
  const afterMain = Math.max(0.001, afterDrop - fuel);
  const dvBooster =
    booster && booster.isp && boosterFuel > 0
      ? (booster.isp * G0 * Math.log(wet / Math.max(0.001, afterBoosterBurn))) / 1000
      : 0;
  const dvMain =
    engine?.isp && fuel > 0 && afterDrop > afterMain
      ? (engine.isp * G0 * Math.log(afterDrop / afterMain)) / 1000
      : 0;
  const energyOut = chosen.reduce((sum, part) => sum + (part.energyOut ?? 0), 0);
  const energyIn = chosen.reduce((sum, part) => sum + (part.energyIn ?? 0), 0);
  const thrust = engine?.thrust ?? 0;
  const liftoffMass = wet;
  return {
    mass: liftoffMass,
    dryMass,
    fuel,
    cost: chosen.reduce((sum, part) => sum + part.cost, 0),
    thrust,
    isp: engine?.isp ?? 0,
    burn: engine?.burn ?? 0,
    boosterThrust: booster?.thrust ?? 0,
    boosterBurn: booster?.burn ?? 0,
    boosterFuel,
    boosterDry,
    energyOut,
    energyIn,
    energyMargin: energyOut - energyIn,
    comms: chosen.reduce((sum, part) => sum + (part.comms ?? 0), 0),
    science: chosen.reduce((sum, part) => sum + (part.science ?? 0), 0),
    payload,
    capacity: structure?.capacity ?? 0,
    dv: dvBooster + dvMain,
    twr: liftoffMass > 0 ? thrust / (liftoffMass * G0) : 0,
    crewed: selection.crew === "crew-pair",
    hasLife: selection.life === "life-basic" || selection.life === "life-closed",
  };
}

export interface Check {
  id: string;
  ok: boolean;
  value: string;
}

export function readiness(selection: Selection, mission: MissionDef): Check[] {
  const craft = computeCraft(selection);
  const has = (slot: Slot) => Boolean(selection[slot] && !selection[slot].endsWith("-none"));
  return [
    { id: "engine", ok: has("engine"), value: has("engine") ? selection.engine : "—" },
    { id: "tank", ok: has("tank") && craft.fuel > 0, value: `${craft.fuel.toFixed(0)} t` },
    { id: "structure", ok: has("structure") && craft.payload <= craft.capacity, value: `${craft.payload.toFixed(1)} / ${craft.capacity.toFixed(0)} t` },
    { id: "command", ok: has("command"), value: has("command") ? "OK" : "—" },
    { id: "power", ok: has("power") && craft.energyMargin >= 0, value: `${craft.energyMargin.toFixed(0)}` },
    { id: "comms", ok: craft.comms >= mission.minComms, value: `${craft.comms}` },
    { id: "nav", ok: has("nav"), value: has("nav") ? "OK" : "—" },
    { id: "dv", ok: craft.dv >= mission.minDv && craft.twr >= 1.15, value: `${craft.dv.toFixed(2)} km/s` },
    { id: "budget", ok: craft.cost <= mission.budget && craft.cost > 0, value: `${craft.cost} / ${mission.budget}` },
    { id: "crew", ok: !mission.crewed || (craft.crewed && craft.hasLife), value: mission.crewed ? (craft.crewed && craft.hasLife ? "OK" : "—") : "n/a" },
    { id: "science", ok: !mission.needsScience || craft.science > 0, value: `${craft.science}` },
  ];
}

export function checksPass(selection: Selection, mission: MissionDef): boolean {
  return readiness(selection, mission).every((check) => check.ok);
}

export interface CrewState {
  health: number;
  energy: number;
  fatigue: number;
  hydration: number;
  nutrition: number;
  stress: number;
  sleep: number;
}

export function initialCrew(crewed: boolean): CrewState {
  const base = crewed ? 78 : 100;
  return {
    health: base,
    energy: base,
    fatigue: crewed ? 22 : 0,
    hydration: base,
    nutrition: base,
    stress: crewed ? 20 : 0,
    sleep: base,
  };
}

export type LogEntry = { key: string; params?: Record<string, string | number> };

export type RunStage = "brief" | "build" | "check" | "flight" | "surface";

export interface RunState {
  missionId: MissionId;
  selection: Selection;
  inspected: string[];
  tasks: string[];
  incident: "pending" | "resolved" | "worsened" | "none";
  crew: CrewState;
  startedAt: number;
  log: LogEntry[];
  flight?: FlightSummary;
  resources: ResourceSnapshot;
  outcome?: "success" | "partial" | "fail";
  stage: RunStage;
}

export interface FlightSummary {
  time: number;
  fuelRemaining: number;
  peakTemp: number;
  corridor: number;
  separated: boolean;
  correction: boolean;
  arrived: boolean;
  failKey?: string;
}

export interface ResourceSnapshot {
  fuel: number;
  energy: number;
  oxygen: number;
  water: number;
  food: number;
  data: number;
  parts: number;
}

export function initialResources(craft: CraftStats): ResourceSnapshot {
  return {
    fuel: craft.fuel + craft.boosterFuel,
    energy: 76,
    oxygen: craft.hasLife ? 100 : 40,
    water: craft.hasLife ? 100 : 30,
    food: craft.crewed ? 100 : 0,
    data: 10,
    parts: 3,
  };
}

export interface FlightState {
  phase: "pad" | "ascent" | "correction" | "coast" | "approach" | "arrival" | "failed";
  time: number;
  altitude: number;
  vertical: number;
  horizontal: number;
  lateral: number;
  speed: number;
  accel: number;
  fuel: number;
  boosterFuel: number;
  separated: boolean;
  sepLate: number;
  /** Actual engine output after spool, 0–1. */
  throttle: number;
  /** Commanded engine output before spool, mirrored for the cockpit slider. */
  thrustOut: number;
  engineOn: boolean;
  /** Nose angle from vertical. 0 is straight up, 90 is toward the horizon. */
  pitch: number;
  yaw: number;
  roll: number;
  pitchRate: number;
  yawRate: number;
  rollRate: number;
  stabilize: boolean;
  sasPitch: number;
  sasYaw: number;
  sasRoll: number;
  rcsEnabled: boolean;
  aborted: boolean;
  /** Seconds spent thrusting hard without leaving the pad. */
  liftoffClock: number;
  leftPad: boolean;
  suggested: number;
  energy: number;
  temp: number;
  corridor: number;
  hold: number;
  correctionTarget: number;
  correctionDone: boolean;
  peakTemp: number;
  downrange: number;
  crossrange: number;
  failKey?: string;
  dest: DestProfile;
  /** Transfer distance still to close, in the coast model. */
  range: number;
  terminal: boolean;
  termAlt: number;
  sink: number;
  closure: number;
  termLat: number;
  landStage: LandStage;
  stageHold: number;
  landed: boolean;
  navStatus: NavStatus;
  navWarning: string | null;
  handoff: boolean;
  engineFault: boolean;
  engineHealth: number;
  unsafeTime: number;
}

/** Ascent and coast kinematics. Fuel use scales with this so propellant matches the faster clock. */
export const COMPRESS = 24;
const ASCENT_FUEL = COMPRESS / 8;
/** Descent clock. Velocity and altitude advance together so the landing path stays the same shape. */
export const LAND_PACE = 2.8;
/** Seconds of aligned thrust required before the coast begins. */
export const CORRECTION_HOLD = 0.75;
const ALIGN_HOLD = 0.38;
const PREP_HOLD = 0.26;
const CONTACT_HOLD = 0.4;
export const COAST_GAIN = 0.85 * ASCENT_FUEL;
export const SIM_RATES = [1, 2, 5, 10] as const;
export type SimRate = (typeof SIM_RATES)[number];

export function createFlight(craft: CraftStats, dest: DestProfile = DESTINATIONS.lunar): FlightState {
  return {
    phase: "pad",
    time: 0,
    altitude: 0,
    vertical: 0,
    horizontal: 0,
    lateral: 0,
    speed: 0,
    accel: 0,
    fuel: craft.fuel,
    boosterFuel: craft.boosterFuel,
    separated: craft.boosterFuel <= 0,
    sepLate: 0,
    throttle: 0,
    thrustOut: 0,
    engineOn: false,
    pitch: 0,
    yaw: 0,
    roll: 0,
    pitchRate: 0,
    yawRate: 0,
    rollRate: 0,
    stabilize: false,
    sasPitch: 0,
    sasYaw: 0,
    sasRoll: 0,
    rcsEnabled: false,
    aborted: false,
    liftoffClock: 0,
    leftPad: false,
    suggested: 0,
    energy: 72,
    temp: 18,
    corridor: 100,
    hold: 0,
    correctionTarget: 48,
    correctionDone: false,
    peakTemp: 18,
    downrange: 0,
    crossrange: 0,
    dest,
    range: dest.leg,
    terminal: false,
    termAlt: dest.gateAlt,
    sink: 0,
    closure: dest.closure0,
    termLat: 0,
    landStage: "none",
    stageHold: 0,
    landed: false,
    navStatus: "standby",
    navWarning: null,
    handoff: false,
    engineFault: false,
    engineHealth: 100,
    unsafeTime: 0,
  };
}

export interface FlightInput {
  /** -1 nose up (toward vertical), +1 nose down (toward the horizon), body axis. */
  pitch: number;
  /** -1 nose left, +1 nose right. */
  yaw: number;
  /** -1 roll left, +1 roll right, about the long axis. */
  roll: number;
  /** Commanded main-engine power, 0–1. */
  throttle: number;
  rcsRight: number;
  rcsUp: number;
  rcsFore: number;
  rcsEnabled: boolean;
  engineOn: boolean;
  separate: boolean;
  stabilize: boolean;
  abort: boolean;
  /** True while autopilot is the authority writing this command. */
  guided: boolean;
  /** True while assisted mode is blending the player's command. */
  assist: boolean;
}

export function neutralInput(patch: Partial<FlightInput> = {}): FlightInput {
  return {
    pitch: 0,
    yaw: 0,
    roll: 0,
    throttle: 0,
    rcsRight: 0,
    rcsUp: 0,
    rcsFore: 0,
    rcsEnabled: false,
    engineOn: false,
    separate: false,
    stabilize: false,
    abort: false,
    guided: false,
    assist: false,
    ...patch,
  };
}

/** How a mission destination is flown once the transfer leg is done. */
export type DestKind = "surface" | "dock" | "asteroid";

export interface DestProfile {
  id: MissionId;
  kind: DestKind;
  /** Transfer length closed by downrange speed during coast. */
  leg: number;
  /** Local gravity used only in the destination-relative frame, m/s². */
  gravity: number;
  gateAlt: number;
  contactAlt: number;
  /** Approach speed when the destination frame begins, km/s. */
  closure0: number;
  maxSink: number;
  maxClosure: number;
  maxLat: number;
  maxPitch: number;
  throttleCap: number;
  prepBand: number;
  touchBand: number;
  touchThrottle: number;
}

export const DESTINATIONS: Record<MissionId, DestProfile> = {
  lunar: {
    id: "lunar",
    kind: "surface",
    leg: 46,
    gravity: 1.62,
    gateAlt: 4.2,
    contactAlt: 0,
    closure0: 0.04,
    maxSink: 0.012,
    maxClosure: 0.014,
    maxLat: 0.016,
    maxPitch: 18,
    throttleCap: 0.72,
    prepBand: 0.9,
    touchBand: 0.14,
    touchThrottle: 0.24,
  },
  mars: {
    id: "mars",
    kind: "surface",
    leg: 58,
    gravity: 3.71,
    gateAlt: 5.2,
    contactAlt: 0,
    closure0: 0.045,
    maxSink: 0.011,
    maxClosure: 0.013,
    maxLat: 0.015,
    maxPitch: 16,
    throttleCap: 0.84,
    prepBand: 1.05,
    touchBand: 0.14,
    touchThrottle: 0.3,
  },
  station: {
    id: "station",
    kind: "dock",
    leg: 36,
    gravity: 0.04,
    gateAlt: 2.2,
    contactAlt: 0.16,
    closure0: 0.022,
    maxSink: 0.0045,
    maxClosure: 0.0045,
    maxLat: 0.0045,
    maxPitch: 8,
    throttleCap: 0.22,
    prepBand: 0.42,
    touchBand: 0.1,
    touchThrottle: 0.1,
  },
  asteroid: {
    id: "asteroid",
    kind: "asteroid",
    leg: 52,
    gravity: 0.02,
    gateAlt: 3.4,
    contactAlt: 0.48,
    closure0: 0.018,
    maxSink: 0.0032,
    maxClosure: 0.0032,
    maxLat: 0.0032,
    maxPitch: 14,
    throttleCap: 0.08,
    prepBand: 0.62,
    touchBand: 0.12,
    touchThrottle: 0.05,
  },
  rescue: {
    id: "rescue",
    kind: "dock",
    leg: 40,
    gravity: 0.04,
    gateAlt: 2.4,
    contactAlt: 0.14,
    closure0: 0.02,
    maxSink: 0.004,
    maxClosure: 0.004,
    maxLat: 0.0045,
    maxPitch: 8,
    throttleCap: 0.2,
    prepBand: 0.4,
    touchBand: 0.1,
    touchThrottle: 0.09,
  },
};

export type LandStage = "none" | "approach" | "align" | "prep" | "slow" | "contact" | "confirmed";

export type NavStatus =
  | "standby"
  | "assist"
  | "engaged"
  | "locked"
  | "correction"
  | "approaching"
  | "landing"
  | "success"
  | "warning"
  | "handoff";

/** Nose target the guidance and the landing-stage logic both follow. */
export function guidancePitch(state: FlightState): number {
  if (!state.terminal) {
    if (state.phase === "correction") return state.correctionTarget;
    if (state.phase === "coast") return clamp(state.pitch, 48, 74);
    return state.suggested;
  }
  const kind = state.dest.kind;
  switch (state.landStage) {
    case "approach":
      return kind === "asteroid" ? 24 : kind === "dock" ? 16 : 20;
    case "align":
      return kind === "dock" ? 2 : 6;
    case "prep":
      return kind === "asteroid" ? 10 : 9;
    case "slow":
      return state.closure > state.dest.maxClosure * 2.4 ? (kind === "asteroid" ? 32 : 30) : 7;
    case "contact":
    case "confirmed":
      return 3;
    default:
      return 6;
  }
}

export function wrap180(deg: number): number {
  return ((((deg + 180) % 360) + 360) % 360) - 180;
}

function canBurnFuel(state: FlightState, craft: CraftStats): boolean {
  if (state.engineFault || state.engineHealth <= 0) return false;
  return state.fuel > 0 || (!state.separated && state.boosterFuel > 0 && craft.boosterThrust > 0);
}

function applyAttitude(next: FlightState, input: FlightInput, dt: number): void {
  const engaging = input.stabilize && !next.stabilize;
  next.stabilize = input.stabilize;
  next.rcsEnabled = input.rcsEnabled;
  if (engaging) {
    next.sasPitch = next.pitch;
    next.sasYaw = next.yaw;
    next.sasRoll = next.roll;
  }
  let pitchCmd = clamp(input.pitch, -1, 1);
  let yawCmd = clamp(input.yaw, -1, 1);
  let rollCmd = clamp(input.roll, -1, 1);
  const pilot = Math.hypot(pitchCmd, yawCmd, rollCmd) > 0.08;
  if (next.stabilize && !pilot) {
    pitchCmd = clamp((next.sasPitch - next.pitch) / 5, -1, 1);
    yawCmd = clamp((next.sasYaw - next.yaw) / 6, -1, 1);
    rollCmd = clamp(wrap180(next.sasRoll - next.roll) / 6, -1, 1);
  }
  const rollRad = (next.roll * Math.PI) / 180;
  const mixedPitch = pitchCmd * Math.cos(rollRad) - yawCmd * Math.sin(rollRad);
  const mixedYaw = pitchCmd * Math.sin(rollRad) + yawCmd * Math.cos(rollRad);
  const atmo = clamp(1 - next.altitude / 90, 0, 1);
  const gimbal = next.engineOn ? 110 + 72 * next.thrustOut : 0;
  const rcsAuth = next.rcsEnabled ? 82 * (0.5 + 0.5 * (1 - atmo)) : 20;
  const authority = gimbal + rcsAuth;
  const damp = 3.05 + atmo * 1.15;
  next.pitchRate += (mixedPitch * authority - next.pitchRate * damp) * dt;
  next.yawRate += (mixedYaw * authority - next.yawRate * damp) * dt;
  next.rollRate += (rollCmd * authority * 1.2 - next.rollRate * damp) * dt;
  if (next.stabilize && !pilot) {
    const kill = Math.max(0, 1 - 3.5 * dt);
    next.pitchRate *= kill;
    next.yawRate *= kill;
    next.rollRate *= kill;
  }
  next.pitch = clamp(next.pitch + next.pitchRate * dt, -8, 96);
  if (next.pitch <= -8 || next.pitch >= 96) next.pitchRate = 0;
  next.yaw = wrap180(next.yaw + next.yawRate * dt);
  next.roll = wrap180(next.roll + next.rollRate * dt);
  if (pilot) {
    next.sasPitch = next.pitch;
    next.sasYaw = next.yaw;
    next.sasRoll = next.roll;
  }
}

function applyRcs(next: FlightState, input: FlightInput, dt: number): void {
  if (!next.rcsEnabled || (next.fuel <= 0.05 && next.energy <= 6)) return;
  const right = clamp(input.rcsRight, -1, 1);
  const up = clamp(input.rcsUp, -1, 1);
  const fore = clamp(input.rcsFore, -1, 1);
  const effort = Math.abs(right) + Math.abs(up) + Math.abs(fore);
  if (effort <= 0) return;
  const rollRad = (next.roll * Math.PI) / 180;
  const pitchRad = (next.pitch * Math.PI) / 180;
  const yawRad = (next.yaw * Math.PI) / 180;
  const accel = 0.0022 * (next.fuel > 0.05 ? 1 : 0.45);
  const worldUp = right * Math.sin(rollRad) + up * Math.cos(rollRad);
  const worldRight = right * Math.cos(rollRad) - up * Math.sin(rollRad);
  const foreV = fore * Math.cos(pitchRad) * Math.cos(yawRad);
  const foreH = fore * Math.sin(pitchRad) * Math.cos(yawRad);
  const foreL = fore * Math.sin(yawRad);
  const kick = accel * dt * COMPRESS;
  next.vertical += (worldUp + foreV) * kick;
  next.horizontal += foreH * kick;
  next.lateral += (worldRight + foreL) * kick;
  if (next.fuel > 0) next.fuel = Math.max(0, next.fuel - effort * 0.02 * dt * ASCENT_FUEL);
  next.energy = clamp(next.energy - effort * 1.4 * dt, 0, 100);
}

export function stepFlight(state: FlightState, input: FlightInput, craft: CraftStats, dt: number): FlightState {
  const next: FlightState = { ...state };
  next.time += dt;
  if (input.abort && !next.aborted && next.phase !== "arrival") {
    next.aborted = true;
    next.phase = "failed";
    next.failKey = "flight.failAbort";
    next.engineOn = false;
    next.rollRate += 30;
    next.yawRate += 10;
  }
  if (next.phase === "failed" || next.phase === "arrival") {
    next.engineOn = false;
    next.thrustOut = 0;
    next.throttle = 0;
    next.pitch = clamp(next.pitch + next.pitchRate * dt, -8, 96);
    next.yaw = wrap180(next.yaw + next.yawRate * dt);
    next.roll = wrap180(next.roll + next.rollRate * dt);
    const decay = Math.max(0, 1 - dt * 0.6);
    next.pitchRate *= decay;
    next.yawRate *= decay;
    next.rollRate *= decay;
    return next;
  }

  const burning = input.engineOn && canBurnFuel(next, craft);
  next.engineOn = burning;
  if (next.phase === "pad" && burning) next.phase = "ascent";
  const commanded = burning ? clamp(input.throttle, 0, 1) : 0;
  const spool = commanded >= next.thrustOut ? 16 : 12;
  next.thrustOut = clamp(next.thrustOut + clamp(commanded - next.thrustOut, -spool * dt, spool * dt), 0, 1);
  next.throttle = next.thrustOut;
  applyAttitude(next, input, dt);
  if (next.phase === "pad") {
    next.thrustOut = 0;
    next.throttle = 0;
    next.engineOn = false;
    return next;
  }

  const boosterLive = !next.separated && next.boosterFuel > 0 && craft.boosterThrust > 0 && next.engineOn;
  const thrust = next.engineOn ? craft.thrust * next.thrustOut + (boosterLive ? craft.boosterThrust * next.thrustOut : 0) : 0;
  const fuelPace = state.terminal ? LAND_PACE : ASCENT_FUEL;
  const mainBurn = next.engineOn ? craft.burn * next.thrustOut * dt * fuelPace : 0;
  next.fuel = Math.max(0, next.fuel - mainBurn);
  if (boosterLive) next.boosterFuel = Math.max(0, next.boosterFuel - craft.boosterBurn * next.thrustOut * dt * fuelPace);
  if (!next.separated && craft.boosterFuel > 0 && next.boosterFuel <= 0) {
    next.sepLate += dt;
    if (input.separate) next.separated = true;
  } else if (input.separate) {
    next.separated = true;
  }
  if (!canBurnFuel(next, craft)) next.engineOn = false;

  const deadBooster = !next.separated && craft.boosterDry > 0 ? craft.boosterDry + next.boosterFuel : 0;
  const mass = Math.max(1, craft.dryMass + next.fuel + deadBooster);
  const accel = thrust / mass;

  if (next.terminal) {
    integrateTerminal(next, input, craft, dt, accel);
    return next;
  }

  const pitchRad = (next.pitch * Math.PI) / 180;
  const yawRad = (next.yaw * Math.PI) / 180;
  const gravity = 9.81 * Math.max(0, 1 - next.altitude / 220);
  const verticalAccel = accel * Math.cos(pitchRad) * Math.cos(yawRad) - gravity;
  const horizontalAccel = accel * Math.sin(pitchRad) * Math.cos(yawRad);
  const lateralAccel = accel * Math.sin(yawRad);
  next.accel = verticalAccel;
  next.vertical += (verticalAccel * dt * COMPRESS) / 1000;
  next.horizontal += (horizontalAccel * dt * COMPRESS) / 1000;
  next.lateral += (lateralAccel * dt * COMPRESS) / 1000;
  applyRcs(next, input, dt);
  if (next.vertical < -0.2) next.vertical = -0.2;
  next.altitude = Math.max(0, next.altitude + next.vertical * dt * COMPRESS);
  if (next.altitude <= 0 && next.vertical < 0) next.vertical = 0;
  if (next.altitude > 2) next.leftPad = true;
  next.downrange += Math.max(0, next.horizontal) * dt * COMPRESS;
  next.crossrange += next.lateral * dt * COMPRESS;
  next.speed = Math.hypot(next.vertical, next.horizontal, next.lateral);
  next.suggested = Math.min(74, (next.altitude / 108) * 74);
  const pitchError = Math.abs(next.pitch - (next.phase === "correction" ? next.correctionTarget : next.suggested));
  const aim = Math.hypot(pitchError, Math.min(40, Math.abs(next.yaw)) * 0.45);
  next.temp = 16 + next.throttle * 38 + aim * 0.45 + next.speed * 4 + (next.sepLate > 4 ? 25 : 0) + Math.max(0, Math.abs(next.rollRate) - 25) * 0.15;
  next.peakTemp = Math.max(next.peakTemp, next.temp);
  next.corridor = clamp(next.corridor + (aim < 10 ? 4 : -aim * 0.35) * dt, 0, 100);
  next.energy = clamp(next.energy + craft.energyMargin * dt * 0.35, 0, 100);

  if (next.phase === "ascent") {
    next.liftoffClock = next.altitude < 1 && next.thrustOut > 0.5 && next.vertical < 0.2 ? next.liftoffClock + dt : 0;
    const inserted =
      next.altitude >= 125 &&
      next.altitude <= 520 &&
      next.horizontal >= 4.6 &&
      next.pitch >= 48 &&
      next.pitch <= 82;
    if (inserted) {
      next.phase = "correction";
      next.hold = 0;
    } else if (next.fuel <= 0 && next.horizontal < 4.6) {
      next.phase = "failed";
      next.failKey = next.altitude < 40 ? "flight.failLift" : "flight.failFuel";
    } else if (next.liftoffClock > 7 || (next.leftPad && next.altitude <= 0)) {
      next.phase = "failed";
      next.failKey = "flight.failLift";
    } else if (next.altitude > 700 && next.horizontal < 3) {
      next.phase = "failed";
      next.failKey = "flight.failPitch";
    } else if (next.temp > 160) {
      next.phase = "failed";
      next.failKey = "flight.failHeat";
    }
  }

  if (next.phase === "correction") {
    const aligned = Math.abs(next.pitch - next.correctionTarget) <= 6 && next.throttle >= 0.28 && next.throttle <= 0.62 && next.fuel > 0;
    next.hold = aligned ? next.hold + dt : Math.max(0, next.hold - dt * 0.5);
    if (next.hold >= CORRECTION_HOLD) {
      next.correctionDone = true;
      next.phase = "coast";
      next.hold = 0;
    } else if (next.fuel <= 0) {
      next.phase = "failed";
      next.failKey = "flight.failFuel";
    }
  }

  if (next.phase === "coast") {
    next.hold += dt;
    next.fuel = Math.max(0, next.fuel - 0.012 * dt * ASCENT_FUEL);
    next.range = Math.max(0, next.range - Math.max(0, next.horizontal) * dt * COAST_GAIN);
    if (next.range <= 0.15 && next.horizontal >= 2.6) enterTerminal(next);
    else if (next.fuel <= 0 && next.range > 6) {
      next.phase = "failed";
      next.failKey = "flight.failFuel";
    } else if (next.hold > 80 && next.range > 1) {
      next.phase = "failed";
      next.failKey = "flight.failPath";
    }
  }

  finishFrame(next, input, craft, dt);
  return next;
}

function enterTerminal(next: FlightState): void {
  const dest = next.dest;
  next.phase = "approach";
  next.terminal = true;
  next.termAlt = dest.gateAlt;
  next.sink = -0.002;
  next.closure = dest.closure0;
  next.termLat = clamp(next.crossrange * 0.00035, -0.02, 0.02);
  next.landStage = "approach";
  next.stageHold = 0;
  next.landed = false;
  next.range = Math.max(0, dest.gateAlt - dest.contactAlt);
}

/**
 * Destination-relative motion. The same thrust, fuel, and attitude state drive it.
 * Position is integrated at 6× so a descent fits a session; velocity still comes from
 * thrust and the destination's gravity. This is not an Earth-orbit propagator.
 */
function integrateTerminal(next: FlightState, input: FlightInput, craft: CraftStats, dt: number, accel: number): void {
  const dest = next.dest;
  const pitchRad = (next.pitch * Math.PI) / 180;
  const yawRad = (next.yaw * Math.PI) / 180;
  const lift = Math.cos(pitchRad) * Math.max(0.2, Math.cos(yawRad));
  const brake = Math.sin(Math.max(0, pitchRad)) * Math.max(0, Math.cos(yawRad));
  const vKick = (dt / 1000) * LAND_PACE;
  next.sink += (accel * lift - dest.gravity) * vKick;
  next.closure = Math.max(0, next.closure - accel * brake * vKick);
  next.termLat += accel * Math.sin(yawRad) * vKick;
  if (next.rcsEnabled && next.fuel > 0.02 && next.energy > 4 && !next.engineFault) {
    const right = clamp(input.rcsRight, -1, 1);
    const up = clamp(input.rcsUp, -1, 1);
    const fore = clamp(input.rcsFore, -1, 1);
    const effort = Math.abs(right) + Math.abs(up) + Math.abs(fore);
    if (effort > 0) {
      const rcs = 7.5 * vKick;
      next.sink += up * rcs;
      next.closure = Math.max(0, next.closure - fore * rcs);
      next.termLat += right * rcs;
      next.fuel = Math.max(0, next.fuel - effort * 0.012 * dt * LAND_PACE);
      next.energy = clamp(next.energy - effort * 1.1 * dt, 0, 100);
    }
  }
  next.termAlt += next.sink * dt * 6 * LAND_PACE;
  const hard =
    next.sink < -dest.maxSink ||
    next.closure > dest.maxClosure ||
    Math.abs(next.termLat) > dest.maxLat ||
    Math.abs(next.pitch) > dest.maxPitch + 8 ||
    Math.abs(next.yaw) > dest.maxPitch + 10;
  if (next.termAlt <= dest.contactAlt) {
    next.termAlt = dest.contactAlt;
    if (hard) {
      failLanding(next);
      finishFrame(next, input, craft, dt);
      return;
    }
    if (next.sink < 0) next.sink = 0;
  }

  const aligned =
    Math.abs(next.pitch - guidancePitch(next)) < 12 &&
    Math.abs(next.yaw) < 8 &&
    Math.abs(wrap180(next.roll)) < 14;

  if (next.phase !== "failed" && next.landStage === "approach") {
    const inGate = next.termAlt < dest.gateAlt * 0.82 && next.termAlt > dest.contactAlt + dest.prepBand;
    const bled = next.closure < dest.closure0 * 0.92;
    if (inGate && bled && Math.abs(next.yaw) < 12) {
      next.landStage = "align";
      next.stageHold = 0;
    }
  } else if (next.landStage === "align") {
    next.stageHold = aligned ? next.stageHold + dt : Math.max(0, next.stageHold - dt * 0.45);
    if (next.stageHold >= ALIGN_HOLD) {
      next.landStage = "prep";
      next.stageHold = 0;
    }
  } else if (next.landStage === "prep") {
    const lowEnough = next.termAlt <= dest.contactAlt + dest.prepBand;
    next.stageHold = aligned && lowEnough ? next.stageHold + dt : Math.max(0, next.stageHold - dt * 0.35);
    if (next.stageHold >= PREP_HOLD) {
      next.landStage = "slow";
      next.stageHold = 0;
    }
  } else if (next.landStage === "slow" || next.landStage === "contact") {
    const inBox =
      next.termAlt <= dest.contactAlt + dest.touchBand &&
      next.termAlt >= dest.contactAlt - 0.001 &&
      next.sink >= -dest.maxSink &&
      next.sink <= dest.maxSink * 1.4 &&
      next.closure <= dest.maxClosure &&
      Math.abs(next.termLat) <= dest.maxLat &&
      Math.abs(next.pitch) <= dest.maxPitch &&
      Math.abs(next.yaw) <= dest.maxPitch + 4 &&
      next.thrustOut <= dest.touchThrottle;
    if (inBox) {
      next.landStage = "contact";
      next.stageHold += dt;
      next.sink *= Math.max(0, 1 - dt * 1.5);
      next.closure *= Math.max(0, 1 - dt * 1.7);
      next.termLat *= Math.max(0, 1 - dt * 1.7);
      if (next.stageHold >= CONTACT_HOLD) {
        next.landed = true;
        next.phase = "arrival";
        next.landStage = "confirmed";
        next.sink = 0;
        next.closure = 0;
        next.termLat = 0;
        next.termAlt = dest.contactAlt;
        next.engineOn = false;
        next.thrustOut = 0;
        next.navWarning = null;
        next.handoff = false;
      }
    } else if (next.landStage === "contact") {
      next.landStage = "slow";
      next.stageHold = 0;
    }
  }

  next.suggested = guidancePitch(next);
  next.speed = Math.hypot(next.sink, next.closure, next.termLat);
  next.altitude = Math.max(0, next.termAlt);
  next.vertical = next.sink;
  next.horizontal = next.closure;
  next.lateral = next.termLat;
  next.downrange += Math.max(0, next.closure) * dt * 2;
  next.accel = accel * lift - dest.gravity;
  next.range = Math.max(0, next.termAlt - dest.contactAlt);
  next.temp = 16 + next.thrustOut * 28 + next.speed * 10 + Math.abs(next.termLat) * 20;
  next.peakTemp = Math.max(next.peakTemp, next.temp);
  const aim = Math.hypot(Math.abs(next.pitch - next.suggested), Math.min(30, Math.abs(next.yaw)));
  next.corridor = clamp(next.corridor + (aim < 12 ? 3 : -aim * 0.2) * dt, 0, 100);
  next.energy = clamp(next.energy + craft.energyMargin * dt * 0.35, 0, 100);
  finishFrame(next, input, craft, dt);
}

function failLanding(next: FlightState): void {
  next.phase = "failed";
  next.landed = false;
  next.landStage = "none";
  next.engineOn = false;
  next.thrustOut = 0;
  next.failKey =
    next.dest.kind === "asteroid" ? "flight.failAsteroid" : next.dest.kind === "dock" ? "flight.failDock" : "flight.failLanding";
  next.navWarning = "autopilot.warnImpact";
}

function finishFrame(next: FlightState, input: FlightInput, craft: CraftStats, dt: number): void {
  if (next.phase === "failed" || next.phase === "arrival") {
    if (next.landed) next.navStatus = "success";
    else if (next.failKey) next.navStatus = "warning";
    return;
  }
  if (next.temp > 150) next.engineHealth = Math.max(0, next.engineHealth - dt * 14);
  else next.engineHealth = Math.min(100, next.engineHealth + dt * 3);
  if (next.engineHealth <= 0) {
    next.engineFault = true;
    next.engineOn = false;
    next.thrustOut = 0;
  }
  let warning: string | null = null;
  if (next.engineFault) warning = "autopilot.warnEngine";
  else if (next.terminal && next.fuel < 1.1) warning = "autopilot.warnFuel";
  else if (next.temp > 142) warning = "autopilot.warnHeat";
  else if (next.terminal && next.termAlt < next.dest.contactAlt + next.dest.prepBand && next.closure > next.dest.maxClosure * 3.2) {
    warning = "autopilot.warnSpeed";
  } else if ((next.phase === "ascent" || next.phase === "correction") && next.corridor < 16 && next.altitude > 18) {
    warning = "autopilot.warnPath";
  }
  next.navWarning = warning;
  if (warning === "autopilot.warnPath" || warning === "autopilot.warnSpeed") next.unsafeTime += dt;
  else next.unsafeTime = 0;
  const fuelCritical = next.terminal && next.fuel < 0.3 && next.landStage !== "contact";
  next.handoff = Boolean(next.engineFault || fuelCritical || next.unsafeTime > 7);
  if (next.landed) next.navStatus = "success";
  else if (next.handoff) next.navStatus = "handoff";
  else if (warning) next.navStatus = "warning";
  else if (next.landStage === "prep" || next.landStage === "slow" || next.landStage === "contact") next.navStatus = "landing";
  else if (next.landStage === "approach" || next.landStage === "align") next.navStatus = "approaching";
  else if (input.guided && next.phase === "coast") next.navStatus = Math.abs(next.yaw) > 6 ? "correction" : "locked";
  else if ((input.guided || input.assist) && Math.abs(next.pitch - guidancePitch(next)) > 10) next.navStatus = "correction";
  else if (input.guided) next.navStatus = "engaged";
  else if (input.assist) next.navStatus = "assist";
  else next.navStatus = "standby";
  void craft;
}

export function guideInput(state: FlightState): FlightInput {
  const coasting = state.phase === "coast" || state.phase === "arrival" || state.phase === "failed";
  const target = state.phase === "correction" ? state.correctionTarget : coasting ? state.pitch : state.suggested;
  const throttle = state.phase === "correction" ? 0.45 : 0.78;
  return neutralInput({
    throttle,
    engineOn: !coasting,
    pitch: clamp((target - state.pitch) / 7, -1, 1),
    yaw: clamp(-state.yaw / 8, -1, 1),
    roll: clamp(-state.roll / 8, -1, 1),
    separate: !state.separated && state.boosterFuel <= 0,
  });
}

export type FlightStageId = "pad" | "booster" | "upper" | "correction" | "coast" | "approach" | "arrival" | "failed";

export function flightStageId(state: FlightState, craft: CraftStats): FlightStageId {
  if (state.phase === "failed") return "failed";
  if (state.phase === "arrival") return "arrival";
  if (state.phase === "approach") return "approach";
  if (state.phase === "coast") return "coast";
  if (state.phase === "correction") return "correction";
  if (state.phase === "pad") return "pad";
  if (!state.separated && craft.boosterDry > 0) return "booster";
  return "upper";
}

export type FlightStatusId = "abort" | "failed" | "arrival" | "pad" | "coast" | "coastStable" | "poweredStable" | "powered" | "stable" | "cutoff";

export function flightStatusId(state: FlightState): FlightStatusId {
  if (state.failKey === "flight.failAbort") return "abort";
  if (state.phase === "failed") return "failed";
  if (state.phase === "arrival") return "arrival";
  if (state.phase === "pad") return "pad";
  if (state.phase === "approach") return state.landed ? "arrival" : state.stabilize ? "poweredStable" : "powered";
  if (state.phase === "coast") return state.stabilize ? "coastStable" : "coast";
  if (state.engineOn && state.stabilize) return "poweredStable";
  if (state.engineOn) return "powered";
  if (state.stabilize) return "stable";
  return "cutoff";
}

export function fuelPercent(state: FlightState, craft: CraftStats): number {
  const cap = Math.max(0.001, craft.fuel + craft.boosterFuel);
  return clamp(((state.fuel + state.boosterFuel) / cap) * 100, 0, 100);
}

export function thrustPercent(state: FlightState, craft: CraftStats): number {
  const max = Math.max(1, craft.thrust + (state.separated ? 0 : craft.boosterThrust));
  const live = state.engineOn
    ? craft.thrust * state.thrustOut + (!state.separated && state.boosterFuel > 0 ? craft.boosterThrust * state.thrustOut : 0)
    : 0;
  return clamp((live / max) * 100, 0, 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function summarize(flight: FlightState): FlightSummary {
  return {
    time: flight.time,
    fuelRemaining: flight.fuel,
    peakTemp: flight.peakTemp,
    corridor: flight.corridor,
    separated: flight.separated,
    correction: flight.correctionDone,
    arrived: flight.landed && flight.phase === "arrival",
    failKey: flight.failKey,
  };
}
