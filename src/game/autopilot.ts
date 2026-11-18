import {
  COAST_GAIN,
  CORRECTION_HOLD,
  LAND_PACE,
  clamp,
  guidancePitch,
  neutralInput,
  type CraftStats,
  type FlightInput,
  type FlightState,
  type LandStage,
} from "./model";

export type PilotMode = "manual" | "assisted" | "autopilot";

function seek(current: number, target: number, gain: number): number {
  return clamp((target - current) / gain, -1, 1);
}

function maxAccel(state: FlightState, craft: CraftStats): number {
  const booster = !state.separated ? craft.boosterDry + state.boosterFuel : 0;
  const mass = Math.max(1, craft.dryMass + state.fuel + booster);
  const thrust = craft.thrust + (!state.separated && state.boosterFuel > 0 ? craft.boosterThrust : 0);
  return thrust / mass;
}

/** Sink rate (km/s, positive up) the guidance wants in the destination frame. */
export function sinkTarget(state: FlightState): number {
  const dest = state.dest;
  const floor = dest.contactAlt;
  if (state.landStage === "approach") {
    if (state.termAlt > dest.gateAlt * 0.8) return dest.kind === "asteroid" ? -0.012 : -0.02;
    if (state.termAlt < dest.gateAlt * 0.72) return 0.008;
    return state.closure > dest.closure0 * 0.92 ? 0 : -0.004;
  }
  if (state.landStage === "align") {
    if (state.termAlt < dest.gateAlt * 0.68) return 0.006;
    if (state.termAlt > dest.gateAlt * 0.86) return -0.005;
    return 0;
  }
  if (state.landStage === "prep") {
    if (state.termAlt > floor + dest.prepBand) return dest.kind === "surface" ? -0.018 : dest.kind === "asteroid" ? -0.007 : -0.009;
    return dest.kind === "asteroid" ? -0.0025 : -0.004;
  }
  if (state.landStage === "slow") {
    if (state.termAlt > floor + dest.touchBand) return dest.kind === "surface" ? -0.011 : dest.kind === "asteroid" ? -0.004 : -0.0055;
    return 0;
  }
  return 0;
}

/**
 * Commands the same pitch, yaw, roll, throttle, and RCS channels as the player.
 * It never writes position directly.
 */
export function autopilotCommand(state: FlightState, craft: CraftStats): FlightInput {
  const base = neutralInput({
    guided: true,
    stabilize: true,
    rcsEnabled: true,
    separate: !state.separated && state.boosterFuel <= 0 && state.phase !== "pad",
  });
  if (state.engineFault || state.phase === "failed" || state.phase === "arrival" || state.landed) {
    return neutralInput({ guided: true, engineOn: false, stabilize: true });
  }

  const pitch = seek(state.pitch, guidancePitch(state), state.terminal ? 4.6 : 3.8);
  const yaw = seek(state.yaw, 0, state.terminal ? 5 : 5.5);
  const roll = seek(state.roll, 0, 5);

  if (state.phase === "pad" || state.phase === "ascent") {
    const low = state.fuel < 10 && state.phase === "ascent";
    return { ...base, engineOn: true, throttle: low ? 0.7 : 0.96, pitch, yaw, roll };
  }

  if (state.phase === "correction") {
    return { ...base, engineOn: state.fuel > 0.4, throttle: 0.45, pitch, yaw, roll };
  }

  if (state.phase === "coast") {
    const falling = state.altitude < 160 && state.vertical < 0.04;
    const offAxis = Math.abs(state.yaw) > 5 || Math.abs(state.pitch - guidancePitch(state)) > 8;
    const engineOn = state.fuel > 2.5 && (falling || offAxis);
    return {
      ...base,
      engineOn,
      throttle: falling ? 0.4 : offAxis ? 0.18 : 0,
      pitch: seek(state.pitch, falling ? clamp(guidancePitch(state), 46, 70) : guidancePitch(state), 6),
      yaw,
      roll,
    };
  }

  const dest = state.dest;
  const targetSink = sinkTarget(state);
  const pitchRad = (guidancePitch(state) * Math.PI) / 180;
  const lift = Math.max(0.25, Math.cos(pitchRad));
  const accel = Math.max(1, maxAccel(state, craft));
  const hover = dest.gravity / (accel * lift);
  const gain = (dest.kind === "surface" ? 5.2 : dest.kind === "asteroid" ? 0.85 : 1.1) / LAND_PACE;
  let throttle = clamp(hover + (targetSink - state.sink) * gain, 0, dest.throttleCap);
  if (state.landStage === "contact" || state.landStage === "confirmed") throttle = 0;
  if (state.navWarning === "autopilot.warnFuel") throttle = Math.min(throttle, hover * 0.65);
  if (state.navWarning === "autopilot.warnHeat" || state.temp > 136) throttle = Math.min(throttle, 0.12);

  const fore = clamp(state.closure / (dest.kind === "surface" ? 0.018 : 0.008), 0, 1);
  const lateral = clamp(-state.termLat / 0.006, -1, 1);
  const vertical = clamp((targetSink - state.sink) / (dest.kind === "surface" ? 0.012 : 0.0035), -1, 1);

  return {
    ...base,
    engineOn: throttle > 0.012 && state.fuel > 0.05,
    throttle,
    pitch,
    yaw,
    roll,
    rcsFore: fore,
    rcsRight: lateral,
    rcsUp: vertical,
  };
}

export function mixPilot(player: FlightInput, state: FlightState, craft: CraftStats, mode: PilotMode): FlightInput {
  if (mode === "manual") return { ...player, guided: false, assist: false };
  const auto = autopilotCommand(state, craft);
  if (mode === "autopilot") return { ...auto, abort: player.abort };
  const stick = Math.hypot(player.pitch, player.yaw, player.roll);
  const mix = stick > 0.22 ? 0.32 : 0.7;
  const engineOn = player.engineOn;
  const throttle = engineOn ? clamp(player.throttle * (1 - mix) + auto.throttle * mix, 0, 1) : player.throttle;
  return {
    ...player,
    pitch: clamp(player.pitch * (1 - mix) + auto.pitch * mix, -1, 1),
    yaw: clamp(player.yaw * (1 - mix) + auto.yaw * mix, -1, 1),
    roll: clamp(player.roll * (1 - mix) + auto.roll * mix, -1, 1),
    throttle,
    engineOn,
    rcsEnabled: player.rcsEnabled || state.terminal,
    rcsFore: clamp(player.rcsFore + auto.rcsFore * mix, -1, 1),
    rcsRight: clamp(player.rcsRight + auto.rcsRight * mix, -1, 1),
    rcsUp: clamp(player.rcsUp + auto.rcsUp * mix, -1, 1),
    separate: player.separate || auto.separate,
    stabilize: true,
    abort: player.abort,
    guided: false,
    assist: true,
  };
}

/** Reasons a player may not hand the craft to guidance. Disengage is always allowed. */
export function engageBlock(state: FlightState): string | null {
  if (state.phase === "failed" || state.aborted) return "autopilot.blockFailed";
  if (state.landed || state.phase === "arrival") return "autopilot.blockDone";
  if (state.engineFault) return "autopilot.blockEngine";
  if (state.fuel + state.boosterFuel < 0.45) return "autopilot.blockFuel";
  if (state.temp > 156) return "autopilot.blockHeat";
  if (state.landStage === "contact") return "autopilot.blockContact";
  return null;
}

export function flightProgress(state: FlightState): number {
  if (state.landed || state.phase === "arrival") return 100;
  if (state.phase === "failed") return clamp(state.terminal ? 78 : state.altitude / 3, 0, 88);
  if (state.phase === "pad") return 0;
  if (state.phase === "ascent") return clamp((state.altitude / 140) * 36, 1, 36);
  if (state.phase === "correction") return 36 + clamp(state.hold / CORRECTION_HOLD, 0, 1) * 12;
  if (state.phase === "coast") return 48 + (1 - state.range / Math.max(1, state.dest.leg)) * 22;
  const map: Record<LandStage, number> = {
    none: 70,
    approach: 74,
    align: 81,
    prep: 87,
    slow: 93,
    contact: 97,
    confirmed: 100,
  };
  return map[state.landStage];
}

export function etaSeconds(state: FlightState): number {
  if (state.landed || state.phase === "arrival" || state.phase === "failed") return 0;
  if (!state.terminal) {
    if (state.phase === "coast") return state.range / Math.max(0.45, state.horizontal * COAST_GAIN) + 18;
    if (state.phase === "correction") return state.dest.leg / Math.max(2, COAST_GAIN * 3) + 22;
    return state.dest.leg / Math.max(2, COAST_GAIN * 3) + 28;
  }
  const closing = Math.max(0.012, -Math.min(0, state.sink) * 6 * LAND_PACE + 0.016);
  return Math.max(6, (state.termAlt - state.dest.contactAlt) / closing);
}

export function formatEta(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  const remain = whole % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}
