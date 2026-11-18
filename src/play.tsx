import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlightCockpit } from "./cockpit";
import { actionFor, type ControlAction, type ControlMap } from "./game/controls";
import {
  etaSeconds,
  flightProgress,
  formatEta,
  engageBlock,
  mixPilot,
  type PilotMode,
} from "./game/autopilot";
import {
  CORRECTION_HOLD,
  DESTINATIONS,
  PARTS,
  clamp,
  createFlight,
  fuelPercent,
  neutralInput,
  readiness,
  stepFlight,
  type CraftStats,
  type FlightInput,
  type FlightState,
  type LandStage,
  type MissionDef,
  type RunState,
  type Selection,
  type SimRate,
  type Slot,
} from "./game/model";
import { MISSION_IMAGE, NASA_IMAGES } from "./game/catalog";
import { HangarView, SafeScene } from "./scene";

export function adviceKey(flight: FlightState, craft: CraftStats, run: RunState): string {
  if (craft.crewed && run.resources.oxygen < 30) return "assistant.oxygen";
  if (run.resources.water < 25 && craft.crewed) return "assistant.water";
  if (run.crew.fatigue > 68) return "assistant.fatigue";
  if (flight.phase === "pad") return "assistant.pad";
  if (!flight.separated && craft.boosterDry > 0 && flight.boosterFuel <= 0) return "assistant.separate";
  if (flight.temp > 115) return "assistant.heat";
  if (flight.phase === "correction") return "assistant.correction";
  if (flight.phase === "ascent" && Math.abs(flight.pitch - flight.suggested) > 16) return "assistant.pitch";
  if (flight.fuel < 14 && flight.phase === "ascent") return "assistant.fuel";
  if (flight.energy < 22) return "assistant.energy";
  return "assistant.nominal";
}

export function Builder({
  selection,
  craft,
  mission,
  onChange,
  onTrain,
  onNext,
}: {
  selection: Selection;
  craft: CraftStats;
  mission: MissionDef;
  onChange: (slot: Slot, id: string) => void;
  onTrain: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const slots = ["engine", "booster", "tank", "structure", "command", "power", "comms", "nav", "science", "crew", "life"] as const;
  const [activeSlot, setActiveSlot] = useState<(typeof slots)[number]>("engine");
  const [flash, setFlash] = useState(0);
  const holds = readiness(selection, mission).filter((check) => !check.ok);
  function install(slot: (typeof slots)[number], id: string) {
    onChange(slot, id);
    setFlash((value) => value + 1);
  }
  return (
    <div className="hangar grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)_280px]">
      <section className="glass rounded-2xl p-3">
        <h2 className="font-display text-lg">{t("build.title")}</h2>
        <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-cyan/80">{t("build.bayNote")}</p>
        <div className="mt-3 grid gap-1">
          {slots.map((slot) => (
            <button key={slot} className={`rounded-lg px-2 py-2 text-left text-sm ${activeSlot === slot ? "bg-signal/20 text-ice" : "text-ice/70"}`} onClick={() => setActiveSlot(slot)} type="button">
              {t(`slots.${slot}`)}
            </button>
          ))}
        </div>
      </section>
      <section className="glass relative min-h-[380px] overflow-hidden rounded-2xl">
        <div className="bay-stripe" aria-hidden="true" />
        <div className="h-[380px]">
          <HangarView selection={selection} />
        </div>
        <div key={flash} className="bay-flash" aria-hidden="true" />
        <div className="border-t border-signal/30 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan">{t(`slots.${activeSlot}`)}</p>
            <button className="rounded-lg border border-cyan/40 px-3 py-2 text-sm" onClick={onTrain} type="button">{t("build.loadout")}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PARTS.filter((part) => part.slot === activeSlot).map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => install(activeSlot, part.id)}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${selection[activeSlot] === part.id ? "border-alert bg-alert/10" : "border-white/10 bg-white/5"}`}
              >
                <span className="block font-medium">{t(`parts.${part.id}`)}</span>
                <span className="text-xs text-ice/60">{part.mass} t · {part.cost}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-ice/55">{t("build.modelNote")}</p>
          <p className="mt-2 text-sm text-ice/75">{t("build.tradeoff")}</p>
          <p className="mt-1 text-xs text-ice/60">{t("build.boosterHint")}</p>
        </div>
      </section>
      <aside className="glass h-fit rounded-2xl p-4">
        <h3 className="font-display text-lg">{t("build.stats")}</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label={t("build.mass")} value={`${craft.mass.toFixed(1)} t`} />
          <Row label={t("build.fuel")} value={`${craft.fuel.toFixed(0)} t`} />
          <Row label={t("build.dv")} value={`${craft.dv.toFixed(2)} km/s`} />
          <Row label={t("build.thrust")} value={`${craft.thrust.toFixed(0)}`} />
          <Row label={t("build.twr")} value={craft.twr.toFixed(2)} />
          <Row label={t("build.energy")} value={craft.energyMargin.toFixed(0)} />
          <Row label={t("build.comms")} value={`${craft.comms}`} />
          <Row label={t("build.payload")} value={`${craft.payload.toFixed(1)} / ${craft.capacity} t`} />
          <Row label={t("build.cost")} value={`${craft.cost}`} />
        </dl>
        <p className="mt-3 text-xs text-ice/50">{t("common.gameplay")}</p>
        <h4 className="mt-4 text-sm font-semibold">{t("build.issues")}</h4>
        {holds.length === 0 ? (
          <p className="mt-1 text-sm text-emerald-300">{t("build.clear")}</p>
        ) : (
          <ul className="mt-1 space-y-1 text-sm text-alert">
            {holds.map((hold) => (
              <li key={hold.id}>{t(`check.${hold.id}`)}: {hold.value}</li>
            ))}
          </ul>
        )}
        <button className="mt-4 w-full rounded-xl bg-cyan px-4 py-3 font-semibold text-ink" onClick={onNext} type="button">
          {t("build.ready")}
        </button>
      </aside>
    </div>
  );
}

export function Checklist({
  selection,
  mission,
  inspected,
  onInspect,
  onLaunch,
  onBack,
  onPractice,
}: {
  selection: Selection;
  mission: MissionDef;
  inspected: string[];
  onInspect: (id: string) => void;
  onLaunch: () => void;
  onBack: () => void;
  onPractice?: () => void;
}) {
  const { t } = useTranslation();
  const checks = readiness(selection, mission);
  const ready = checks.every((check) => check.ok && inspected.includes(check.id));
  return (
    <section className="glass mx-auto max-w-3xl rounded-2xl p-5">
      <h2 className="font-display text-2xl">{t("check.title")}</h2>
      <ul className="mt-4 space-y-2">
        {checks.map((check) => {
          const seen = inspected.includes(check.id);
          return (
            <li key={check.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-3">
              <div>
                <div className="font-medium">{t(`check.${check.id}`)}</div>
                <div className="text-sm text-ice/70">{seen ? (t(`parts.${check.value}`, { defaultValue: check.value })) : "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                {seen && <span className={check.ok ? "text-emerald-300" : "text-alert"}>{check.ok ? t("check.pass") : t("check.fail")}</span>}
                <button className="rounded-lg border border-cyan/40 px-3 py-2 text-sm" onClick={() => onInspect(check.id)} type="button">
                  {t("check.inspect")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {!ready && <p className="mt-3 text-sm text-ice/70">{t("check.blocked")}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-xl border border-white/15 px-4 py-3" onClick={onBack} type="button">{t("common.back")}</button>
        {onPractice && (
          <button className="rounded-xl border border-cyan/40 px-4 py-3" onClick={onPractice} type="button">{t("pilot.open")}</button>
        )}
        <button className="rounded-xl bg-cyan px-4 py-3 font-semibold text-ink disabled:opacity-40" disabled={!ready} onClick={onLaunch} type="button">
          {t("check.launch")}
        </button>
      </div>
    </section>
  );
}

const PRACTICE_STEPS = ["start", "throttle", "pitch", "yaw", "roll", "sas", "rcs", "stage"] as const;

function lessonMet(id: string, flight: FlightState, command: FlightInput, rcsUsed: boolean): boolean {
  if (id === "start") return flight.phase !== "pad" && (flight.engineOn || flight.thrustOut > 0.05);
  if (id === "throttle") return command.throttle >= 0.6 && flight.thrustOut >= 0.45;
  if (id === "pitch") return flight.pitch >= 12;
  if (id === "yaw") return Math.abs(flight.yaw) >= 8;
  if (id === "roll") return Math.abs(flight.roll) >= 12;
  if (id === "sas") return command.stabilize;
  if (id === "rcs") return rcsUsed;
  if (id === "stage") return flight.separated;
  return false;
}

export function FlightDeck({
  craft,
  mission,
  run,
  bindings,
  onBindings,
  practice = false,
  onFinish,
  onExit,
}: {
  craft: CraftStats;
  mission: MissionDef;
  run: RunState;
  bindings: ControlMap;
  onBindings: (next: ControlMap) => void;
  practice?: boolean;
  onFinish: (flight: FlightState) => void;
  onExit?: () => void;
}) {
  const { t } = useTranslation();
  const craftRef = useRef(craft);
  craftRef.current = craft;
  const runRef = useRef(run);
  const trail = useRef<{ p: number; y: number }[]>([{ p: 0, y: 0 }]);
  const missionRef = useRef(mission);
  missionRef.current = mission;
  const modeRef = useRef<PilotMode>("manual");
  runRef.current = run;
  const input = useRef<FlightInput>(neutralInput());
  const stick = useRef({ x: 0, y: 0, pitchHold: 0, yawHold: 0, roll: 0, fore: 0, aft: 0, left: 0, right: 0, up: 0, down: 0 });
  const keys = useRef(new Set<string>());
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  const practiceRef = useRef(practice);
  practiceRef.current = practice;
  const steps = PRACTICE_STEPS.filter((id) => practice && (id !== "stage" || craft.boosterDry > 0));
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const lessonRef = useRef(0);
  const rcsUsed = useRef(false);
  const armUntil = useRef(0);
  const sim = useRef<FlightState>(createFlight(craft, DESTINATIONS[mission.id]));
  const finished = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const [lesson, setLesson] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const [mode, setMode] = useState<PilotMode>("manual");
  const [blockKey, setBlockKey] = useState<string | null>(null);
  const [, setFrame] = useState(0);
  const toastTimer = useRef(0);

  function flash(id: string) {
    setToast(id);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1400);
  }

  function restart() {
    sim.current = createFlight(craftRef.current, DESTINATIONS[missionRef.current.id]);
    input.current = neutralInput();
    stick.current = { x: 0, y: 0, pitchHold: 0, yawHold: 0, roll: 0, fore: 0, aft: 0, left: 0, right: 0, up: 0, down: 0 };
    finished.current = false;
    trail.current = [{ p: 0, y: 0 }];
    modeRef.current = "manual";
    setMode("manual");
    setBlockKey(null);
    lessonRef.current = 0;
    rcsUsed.current = false;
    armUntil.current = 0;
    setLesson(0);
    setArmed(false);
    setToast(null);
  }

  function armAbort() {
    const now = performance.now();
    if (now < armUntil.current) {
      input.current.abort = true;
      input.current.engineOn = false;
      armUntil.current = 0;
      setArmed(false);
      flash("abort");
      return;
    }
    armUntil.current = now + 3000;
    setArmed(true);
    flash("arm");
  }

  const rateRef = useRef<SimRate>(1);
  const [simRate, setSimRate] = useState<SimRate>(1);

  useEffect(() => {
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const wall = Math.min(0.12, (now - last) / 1000);
      if (wall <= 0) return;
      last = now;
      let pending = Math.min(0.45, wall * rateRef.current);
      while (pending > 0 && sim.current.phase !== "arrival" && sim.current.phase !== "failed") {
        const dt = Math.min(0.05, pending);
        pending -= dt;
        const held = (action: ControlAction) => keys.current.has(bindingsRef.current[action]);
        const pitchKeys = (held("pitchDown") ? 1 : 0) - (held("pitchUp") ? 1 : 0);
        const yawKeys = (held("yawRight") ? 1 : 0) - (held("yawLeft") ? 1 : 0);
        const rollKeys = (held("rollRight") ? 1 : 0) - (held("rollLeft") ? 1 : 0);
        input.current.pitch = clamp(pitchKeys - stick.current.y + stick.current.pitchHold, -1, 1);
        input.current.yaw = clamp(yawKeys + stick.current.x + stick.current.yawHold, -1, 1);
        input.current.roll = clamp(rollKeys + stick.current.roll, -1, 1);
        input.current.rcsRight = clamp((held("rcsRight") ? 1 : 0) - (held("rcsLeft") ? 1 : 0) + stick.current.right - stick.current.left, -1, 1);
        input.current.rcsUp = clamp((held("rcsUp") ? 1 : 0) - (held("rcsDown") ? 1 : 0) + stick.current.up - stick.current.down, -1, 1);
        input.current.rcsFore = clamp((held("rcsFore") ? 1 : 0) - (held("rcsAft") ? 1 : 0) + stick.current.fore - stick.current.aft, -1, 1);
        const hand = dt / Math.max(1, rateRef.current);
        if (held("throttleUp")) input.current.throttle = clamp(input.current.throttle + hand * 2.8, 0, 1);
        if (held("throttleDown")) input.current.throttle = clamp(input.current.throttle - hand * 2.8, 0, 1);
        if (input.current.rcsEnabled && Math.abs(input.current.rcsRight) + Math.abs(input.current.rcsUp) + Math.abs(input.current.rcsFore) > 0.2) {
          rcsUsed.current = true;
        }
        const mixed = mixPilot(input.current, sim.current, craftRef.current, modeRef.current);
        if (modeRef.current === "autopilot") {
          input.current.throttle = mixed.throttle;
          input.current.engineOn = mixed.engineOn;
          input.current.stabilize = mixed.stabilize;
          input.current.rcsEnabled = mixed.rcsEnabled;
        }
        sim.current = stepFlight(sim.current, mixed, craftRef.current, dt);
        if (sim.current.handoff && modeRef.current === "autopilot") {
          modeRef.current = "manual";
          input.current.engineOn = false;
          input.current.throttle = 0;
          setMode("manual");
          setBlockKey(sim.current.navWarning ?? "autopilot.blockHandoff");
        }
        const height = sim.current.terminal
          ? (sim.current.termAlt - sim.current.dest.contactAlt) / Math.max(0.2, sim.current.dest.gateAlt - sim.current.dest.contactAlt)
          : Math.min(1, sim.current.altitude / 180);
        const along = flightProgress(sim.current);
        const mark = trail.current[trail.current.length - 1];
        if (Math.abs(along - mark.p) > 0.7 || Math.abs(height - mark.y) > 0.035) {
          trail.current = [...trail.current, { p: along, y: Math.max(0, Math.min(1, height)) }].slice(-120);
        }
        if (practiceRef.current && modeRef.current === "manual") {
          const id = stepsRef.current[lessonRef.current];
          if (id && lessonMet(id, sim.current, input.current, rcsUsed.current)) {
            lessonRef.current += 1;
            setLesson(lessonRef.current);
          }
        }
        if ((sim.current.phase === "arrival" || sim.current.phase === "failed") && !finished.current) {
          finished.current = true;
          if (!practiceRef.current) onFinishRef.current(sim.current);
        }
      }
      if (armUntil.current && performance.now() > armUntil.current) {
        armUntil.current = 0;
        setArmed(false);
      }
      setFrame((value) => value + 1);
    };
    const frame = (now: number) => {
      loop(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const timer = window.setInterval(() => loop(performance.now()), 200);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const action = actionFor(bindingsRef.current, event.code);
      if (!action) return;
      event.preventDefault();
      keys.current.add(event.code);
      if (action === "engineStart") {
        input.current.engineOn = true;
        flash("start");
      }
      if (action === "engineStop") {
        input.current.engineOn = false;
        flash("stop");
      }
      if (action === "separate") {
        input.current.separate = true;
        flash("stage");
      }
      if (action === "stabilize") {
        input.current.stabilize = !input.current.stabilize;
        flash(input.current.stabilize ? "sasOn" : "sasOff");
      }
      if (action === "rcsToggle") {
        input.current.rcsEnabled = !input.current.rcsEnabled;
        flash(input.current.rcsEnabled ? "rcsOn" : "rcsOff");
      }
      if (action === "abort") armAbort();
    };
    const onUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  function applyMode(next: PilotMode) {
    if (next !== "manual") {
      const block = engageBlock(sim.current);
      if (block) {
        setBlockKey(block);
        return;
      }
    }
    modeRef.current = next;
    setMode(next);
    setBlockKey(null);
    if (next === "manual") {
      input.current.guided = false;
      input.current.assist = false;
    }
  }

  const flight = sim.current;
  const progress = flightProgress(flight) / 100;
  const hint =
    flight.failKey
      ? flight.failKey
      : flight.navWarning
        ? flight.navWarning
        : flight.phase === "pad"
          ? "flight.hintPad"
          : flight.phase === "ascent"
            ? "flight.hintAscent"
            : flight.phase === "correction"
              ? "flight.hintCorrection"
              : flight.landed || flight.phase === "arrival"
                ? "autopilot.status.success"
                : flight.phase === "failed"
                  ? "flight.phaseFailed"
                  : flight.phase === "approach"
                    ? "flight.hintApproach"
                    : "flight.hintCoast";
  const practiceDone = practice && lesson >= steps.length;
  const practiceStep = practice && !practiceDone ? steps[lesson] : null;
  const hot = {
    pitchUp: input.current.pitch < -0.2,
    pitchDown: input.current.pitch > 0.2,
    yawLeft: input.current.yaw < -0.2,
    yawRight: input.current.yaw > 0.2,
    rollLeft: input.current.roll < -0.2,
    rollRight: input.current.roll > 0.2,
    rcsUp: input.current.rcsUp > 0.2,
    rcsDown: input.current.rcsUp < -0.2,
    rcsLeft: input.current.rcsRight < -0.2,
    rcsRight: input.current.rcsRight > 0.2,
    rcsFore: input.current.rcsFore > 0.2,
    rcsAft: input.current.rcsFore < -0.2,
  };

  return (
    <div className="cockpit flight-deck">
      <div className="flight-main">
        <div className="flight-view glass">
          <div className="nav-overlay">
            <span className={`mode-pill is-${mode}`}>{t(`autopilot.mode.${mode}`)}</span>
            <span className="mode-pill is-status">{simRate}×</span>
            <span className={`mode-pill ${flight.navStatus === "warning" || flight.navStatus === "handoff" ? "is-warn" : "is-status"}`}>
              {t(`autopilot.status.${flight.navStatus}`)}
            </span>
          </div>
          <SafeScene
            mission={mission.id}
            progress={progress}
            fallback={t("common.no3d")}
            pitch={flight.pitch}
            yaw={flight.yaw}
            roll={flight.roll}
            thrust={flight.thrustOut}
          />
        </div>
        <NavMonitor flight={flight} craft={craft} mission={mission} mode={mode} points={trail.current} hint={hint} />
        <div className="glass rounded-2xl p-3">
          {flight.phase === "correction" && (
            <p className="mb-2 text-sm text-cyan">
              {t("flight.hold")}: {flight.hold.toFixed(1)} / {CORRECTION_HOLD.toFixed(2)} s
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Row label={t("flight.verticalSpeed")} value={`${(flight.vertical * 1000).toFixed(0)} m/s`} />
            <Row label={t("flight.horizontalSpeed")} value={`${(flight.horizontal * 1000).toFixed(0)} m/s`} />
            <Row label={t("flight.energy")} value={`${flight.energy.toFixed(0)}`} />
            <Row label={t("flight.temp")} value={flight.temp.toFixed(0)} />
          </div>
          <div className="mt-3">
            <Meter label={t("flight.fuel")} value={flight.fuel + flight.boosterFuel} max={Math.max(craft.fuel + craft.boosterFuel, 1)} />
            <Meter label={t("flight.energy")} value={flight.energy} max={100} />
            <Meter label={t("flight.corridor")} value={flight.corridor} max={100} />
          </div>
          <p className="mt-3 text-xs text-ice/55">{t("flight.compressed")}</p>
          <div className="mt-3 rounded-xl border border-cyan/20 bg-cyan/5 p-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-cyan">{t("assistant.title")}</div>
            <p className="mt-1">{t(adviceKey(flight, craft, runRef.current))}</p>
            <p className="mt-1 text-xs text-ice/50">{t("assistant.rule")}</p>
          </div>
        </div>
      </div>
      <aside className="flight-side glass">
        <FlightCockpit
          flight={flight}
          craft={craft}
          throttle={input.current.throttle}
          stickX={stick.current.x}
          stickY={stick.current.y}
          bindings={bindings}
          onBindings={onBindings}
          hot={hot}
          toast={toast}
          abortArmed={armed}
          showStage={craft.boosterDry > 0}
          practiceStep={practiceStep ?? null}
          practiceIndex={lesson + 1}
          practiceTotal={practice ? steps.length : 0}
          practiceDone={practiceDone}
          simRate={simRate}
          onSimRate={(value) => {
            rateRef.current = value;
            setSimRate(value);
          }}
          onThrottle={(value) => {
            input.current.throttle = value;
          }}
          onStick={(x, y) => {
            stick.current.x = x;
            stick.current.y = y;
          }}
          onStickEnd={() => {
            stick.current.x = 0;
            stick.current.y = 0;
          }}
          onPitch={(value) => {
            stick.current.pitchHold = value;
          }}
          onYaw={(value) => {
            stick.current.yawHold = value;
          }}
          onRoll={(value) => {
            stick.current.roll = value;
          }}
          onRcs={(axis, down) => {
            stick.current[axis] = down ? 1 : 0;
          }}
          onStart={() => {
            input.current.engineOn = true;
            flash("start");
          }}
          onStop={() => {
            input.current.engineOn = false;
            flash("stop");
          }}
          onSeparate={() => {
            input.current.separate = true;
            flash("stage");
          }}
          onStabilize={() => {
            input.current.stabilize = !input.current.stabilize;
            flash(input.current.stabilize ? "sasOn" : "sasOff");
          }}
          onRcsToggle={() => {
            input.current.rcsEnabled = !input.current.rcsEnabled;
            flash(input.current.rcsEnabled ? "rcsOn" : "rcsOff");
          }}
          onAbort={armAbort}
          onSkipLesson={() => {
            lessonRef.current = steps.length;
            setLesson(steps.length);
          }}
          onRestart={restart}
          onExit={() => onExit?.()}
          pilotMode={mode}
          onPilotMode={applyMode}
          blockKey={blockKey}
        />
      </aside>
    </div>
  );
}

export function Surface({
  mission,
  run,
  onChange,
  onFinish,
}: {
  mission: MissionDef;
  run: RunState;
  onChange: (next: RunState | ((current: RunState) => RunState)) => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const closed = run.selection.life === "life-closed";

  useEffect(() => {
    const timer = window.setInterval(() => {
      onChange((latest) => {
        if (!latest.crew || latest.selection.crew !== "crew-pair") return latest;
        const closedLoop = latest.selection.life === "life-closed";
        const loss = closedLoop ? 0.35 : 0.7;
        return {
          ...latest,
          resources: {
            ...latest.resources,
            oxygen: clamp(latest.resources.oxygen - loss, 0, 100),
            water: clamp(latest.resources.water - 0.45, 0, 100),
            food: clamp(latest.resources.food - 0.25, 0, 100),
          },
          crew: {
            ...latest.crew,
            fatigue: clamp(latest.crew.fatigue + 0.35, 0, 100),
            health: clamp(latest.crew.health - (latest.resources.oxygen < 18 ? 0.4 : 0), 0, 100),
          },
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [closed, onChange]);

  const blocked = run.incident === "pending" || run.resources.oxygen <= 0;
  const done = mission.tasks.every((task) => run.tasks.includes(task));

  function task(id: string) {
    onChange((latest) => {
      const blockedNow = latest.incident === "pending" || latest.resources.oxygen <= 0;
      if (blockedNow || latest.tasks.includes(id)) return latest;
      return {
        ...latest,
        tasks: [...latest.tasks, id],
        incident: latest.incident === "none" ? "pending" : latest.incident,
        resources: { ...latest.resources, data: latest.resources.data + 12 },
      };
    });
  }

  function choose(safe: boolean) {
    onChange((latest) => ({
      ...latest,
      incident: safe ? "resolved" : "worsened",
      resources: {
        ...latest.resources,
        parts: safe ? Math.max(0, latest.resources.parts - 1) : latest.resources.parts,
        energy: safe ? latest.resources.energy : clamp(latest.resources.energy - 22, 0, 100),
        oxygen: safe ? latest.resources.oxygen : clamp(latest.resources.oxygen - 12, 0, 100),
      },
      log: [...latest.log, { key: safe ? "incident.safeResult" : "incident.riskResult" }],
    }));
  }

  function crewAction(kind: "drink" | "meal" | "rest") {
    onChange((latest) => {
      if (latest.selection.crew !== "crew-pair") return latest;
      if (kind === "drink") {
        return {
          ...latest,
          resources: { ...latest.resources, water: clamp(latest.resources.water - 8, 0, 100) },
          crew: { ...latest.crew, hydration: clamp(latest.crew.hydration + 14, 0, 100) },
        };
      }
      if (kind === "meal") {
        return {
          ...latest,
          resources: { ...latest.resources, food: clamp(latest.resources.food - 8, 0, 100) },
          crew: { ...latest.crew, nutrition: clamp(latest.crew.nutrition + 14, 0, 100), energy: clamp(latest.crew.energy + 6, 0, 100) },
        };
      }
      return {
        ...latest,
        crew: {
          ...latest.crew,
          fatigue: clamp(latest.crew.fatigue - 16, 0, 100),
          sleep: clamp(latest.crew.sleep + 12, 0, 100),
          stress: clamp(latest.crew.stress - 8, 0, 100),
        },
      };
    });
  }

  const photo = NASA_IMAGES.find((image) => image.file === MISSION_IMAGE[mission.id]);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass rounded-2xl p-4">
        {photo && <img className="mb-3 h-32 w-full rounded-lg object-cover" src={photo.file} alt={`${photo.title}. ${photo.credit}`} />}
        <h2 className="font-display text-2xl">{mission.id === "station" ? t("surface.evaTitle") : t("surface.title")}</h2>
        <p className="mt-1 text-xs text-ice/55">{t("surface.hudNote")}</p>
        <ul className="mt-4 space-y-2">
          {mission.tasks.map((id) => (
            <li key={id}>
              <button
                className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-3 text-left disabled:opacity-50"
                disabled={blocked || run.tasks.includes(id)}
                onClick={() => task(id)}
                type="button"
              >
                <span>{t(`surface.tasks.${id}`)}</span>
                <span className="text-sm text-cyan">{run.tasks.includes(id) ? t("check.pass") : t("common.continue")}</span>
              </button>
            </li>
          ))}
        </ul>
        {run.incident === "pending" && (
          <div className="mt-4 rounded-xl border border-alert/50 bg-alert/10 p-4">
            <h3 className="font-display text-lg">{t("incident.title")}</h3>
            <p className="mt-1 text-sm">{t(`incident.${mission.id}`)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-lg bg-cyan px-3 py-2 font-semibold text-ink" onClick={() => choose(true)} type="button">{t("incident.safe")}</button>
              <button className="rounded-lg border border-alert/70 px-3 py-2 text-alert" onClick={() => choose(false)} type="button">{t("incident.risk")}</button>
            </div>
          </div>
        )}
        <button className="mt-4 rounded-xl bg-cyan px-4 py-3 font-semibold text-ink disabled:opacity-40" disabled={!done || run.incident === "pending"} onClick={onFinish} type="button">
          {t("surface.finish")}
        </button>
        {!done && <p className="mt-2 text-sm text-ice/60">{t("surface.needTasks")}</p>}
      </section>
      <aside className="space-y-4">
        <section className="glass rounded-2xl p-4 text-sm">
          <Meter label={t("surface.oxygen")} value={run.resources.oxygen} max={100} />
          <Meter label={t("surface.water")} value={run.resources.water} max={100} />
          <Meter label={t("surface.food")} value={run.resources.food} max={100} />
          <Meter label={t("flight.energy")} value={run.resources.energy} max={100} />
          <div className="mt-3">
          <Row label={t("surface.data")} value={`${run.resources.data}`} />
          <Row label={t("surface.parts")} value={`${run.resources.parts}`} />
          <Row label={t("flight.fuel")} value={`${run.resources.fuel.toFixed(1)} t`} />
          </div>
        </section>
        <section className="glass rounded-2xl p-4">
          <h3 className="font-display text-lg">{t("surface.crew")}</h3>
          <div className="mt-2 space-y-1 text-sm">
            <Row label={t("surface.health")} value={run.crew.health.toFixed(0)} />
            <Row label={t("surface.fatigue")} value={run.crew.fatigue.toFixed(0)} />
            <Row label={t("surface.hydration")} value={run.crew.hydration.toFixed(0)} />
            <Row label={t("surface.nutrition")} value={run.crew.nutrition.toFixed(0)} />
            <Row label={t("surface.stress")} value={run.crew.stress.toFixed(0)} />
            <Row label={t("surface.sleep")} value={run.crew.sleep.toFixed(0)} />
          </div>
          <p className="mt-2 text-xs text-ice/50">{t("surface.medical")}</p>
          {run.selection.crew === "crew-pair" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-lg border border-white/15 px-3 py-2 text-sm" onClick={() => crewAction("drink")} type="button">{t("surface.drink")}</button>
              <button className="rounded-lg border border-white/15 px-3 py-2 text-sm" onClick={() => crewAction("meal")} type="button">{t("surface.meal")}</button>
              <button className="rounded-lg border border-white/15 px-3 py-2 text-sm" onClick={() => crewAction("rest")} type="button">{t("surface.rest")}</button>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}

const LANDING_STAGES: LandStage[] = ["approach", "align", "prep", "slow", "contact", "confirmed"];

function NavMonitor({
  flight,
  craft,
  mission,
  mode,
  points,
  hint,
}: {
  flight: FlightState;
  craft: CraftStats;
  mission: MissionDef;
  mode: PilotMode;
  points: { p: number; y: number }[];
  hint: string;
}) {
  const { t } = useTranslation();
  const distance = flight.terminal
    ? Math.max(0, flight.termAlt - flight.dest.contactAlt)
    : flight.range;
  const engine = flight.engineFault ? "engineFault" : flight.engineOn ? "engineRun" : "engineIdle";
  const currentIndex = flight.landed ? LANDING_STAGES.length - 1 : LANDING_STAGES.indexOf(flight.landStage);
  return (
    <section className="nav-panel glass">
      <div className="nav-panel-head">
        <p className="text-xs uppercase tracking-wider text-cyan">{t("autopilot.nav")}</p>
        <strong>{t(`autopilot.status.${flight.navStatus}`)}</strong>
      </div>
      <NavRoute points={points} />
      <div className="nav-grid">
        <NavCell label={t("autopilot.dest")} value={t(`mission.${mission.id}Name`)} />
        <NavCell label={t("autopilot.distance")} value={`${distance.toFixed(flight.terminal ? 2 : 1)} km`} />
        <NavCell label={t("autopilot.eta")} value={formatEta(etaSeconds(flight))} />
        <NavCell label={t("autopilot.trajectory")} value={t(`autopilot.route.${flight.dest.kind}`)} />
        <NavCell label={t("autopilot.fuel")} value={`${fuelPercent(flight, craft).toFixed(0)}%`} />
        <NavCell label={t("autopilot.engine")} value={t(`autopilot.${engine}`)} />
      </div>
      <div className="nav-progress">
        <div>
          <span>{t("autopilot.progress")}</span>
          <span>{Math.round(flightProgress(flight))}%</span>
        </div>
        <div className="meter-track" aria-hidden="true">
          <div className="meter-fill nav-fill" style={{ width: `${flightProgress(flight)}%` }} />
        </div>
      </div>
      <ol className="land-steps">
        {LANDING_STAGES.map((stage, index) => {
          const state = currentIndex < 0 ? "wait" : index < currentIndex ? "done" : index === currentIndex ? "now" : "wait";
          return (
            <li key={stage} className={`is-${state}`}>
              <span>{index + 1}</span>
              {t(`autopilot.stage.${stage}`)}
            </li>
          );
        })}
      </ol>
      {flight.navWarning && <p className="nav-warn">{t(flight.navWarning)}</p>}
      <p className="mt-2 text-sm text-ice/75">{t(hint)}</p>
      <p className="mt-2 text-[11px] leading-snug text-ice/50">
        {mode === "autopilot" ? t("autopilot.hasControls") : t("autopilot.relative")}
      </p>
    </section>
  );
}

function NavCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="nav-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NavRoute({ points }: { points: { p: number; y: number }[] }) {
  const last = points[points.length - 1] ?? { p: 0, y: 0 };
  const flown = points.map((point) => `${4 + point.p * 0.84},${90 - point.y * 76}`).join(" ");
  const x = 4 + last.p * 0.84;
  const y = 90 - last.y * 76;
  return (
    <svg viewBox="0 0 100 100" className="nav-route" role="img">
      <line x1="4" y1="90" x2="96" y2="90" stroke="rgba(234,242,255,0.16)" strokeWidth="0.6" />
      <polyline points={flown} fill="none" stroke="#00D9FF" strokeWidth="1.5" />
      <line className="route-plan" x1={x} y1={y} x2="92" y2="90" />
      <circle cx={x} cy={y} r="1.8" fill="#EAF2FF" />
      <path d="M92 84 L96 90 L88 90 Z" fill="#FFB15A" />
      <circle cx="92" cy="90" r="2.4" fill="none" stroke="#FFB15A" strokeWidth="0.8" />
    </svg>
  );
}

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <span>{value.toFixed(0)}</span>
      </div>
      <div className="meter-track" aria-hidden="true">
        <div className="meter-fill" style={{ width }} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-1">
      <dt className="text-ice/65">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

