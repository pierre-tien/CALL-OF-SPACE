import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Hand, Navigation, Power, PowerOff, Radio, RotateCcw, RotateCw, Shield, Siren } from "lucide-react";
import { useEffect, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CONTROL_ACTIONS, DEFAULT_CONTROLS, keyLabel, rebind, type ControlAction, type ControlMap } from "./game/controls";
import type { PilotMode } from "./game/autopilot";
import { SIM_RATES, flightStageId, flightStatusId, fuelPercent, thrustPercent, type CraftStats, type FlightState, type SimRate } from "./game/model";

export function ControlBinder({ bindings, onChange }: { bindings: ControlMap; onChange: (next: ControlMap) => void }) {
  const { t } = useTranslation();
  const [listen, setListen] = useState<ControlAction | null>(null);
  useEffect(() => {
    if (!listen) return;
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.code === "Escape") {
        setListen(null);
        return;
      }
      onChange(rebind(bindings, listen, event.code));
      setListen(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [listen, bindings, onChange]);

  return (
    <div className="pilot-bind">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.14em] text-cyan">{listen ? t("pilot.listening") : t("pilot.rebindHint")}</p>
        <button className="text-xs text-ice/70" type="button" onClick={() => onChange({ ...DEFAULT_CONTROLS })}>
          {t("pilot.resetKeys")}
        </button>
      </div>
      <div className="grid gap-1 sm:grid-cols-2">
        {CONTROL_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            className={`pilot-bind-row ${listen === action ? "is-live" : ""}`}
            onClick={() => setListen(action)}
          >
            <span>{t(`pilot.action.${action}`)}</span>
            <kbd>{bindings[action] ? keyLabel(bindings[action]) : t("pilot.unset")}</kbd>
          </button>
        ))}
      </div>
    </div>
  );
}

export function VirtualStick({
  x,
  y,
  onChange,
  onRelease,
}: {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  onRelease: () => void;
}) {
  const { t } = useTranslation();
  function read(event: ReactPointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
    const dy = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
    onChange(Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy)));
  }
  return (
    <div
      className="pilot-stick"
      role="slider"
      aria-label={t("pilot.stick")}
      aria-valuemin={-1}
      aria-valuemax={1}
      aria-valuenow={Number(y.toFixed(2))}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        read(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) read(event);
      }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
    >
      <span className="pilot-stick-cross" />
      <span className="pilot-knob" style={{ transform: `translate(${x * 34}px, ${y * 34}px)` }} />
    </div>
  );
}

function Press({
  label,
  kbd,
  live,
  onDown,
  onUp,
  tone,
  icon,
}: {
  label: string;
  kbd?: string;
  live?: boolean;
  onDown: () => void;
  onUp: () => void;
  tone?: "alert" | "ok";
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={live}
      className={`pilot-btn ${live ? "is-live" : ""} ${tone === "alert" ? "is-alert" : ""} ${tone === "ok" ? "is-ok" : ""}`}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onDown();
      }}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <span className="pilot-btn-label">
        {icon}
        {label}
      </span>
      {kbd && <kbd>{kbd}</kbd>}
    </button>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pilot-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function FlightCockpit({
  flight,
  craft,
  throttle,
  stickX,
  stickY,
  bindings,
  onBindings,
  hot,
  toast,
  abortArmed,
  showStage,
  practiceStep,
  practiceIndex,
  practiceTotal,
  practiceDone,
  simRate,
  onSimRate,
  onThrottle,
  onStick,
  onStickEnd,
  onPitch,
  onYaw,
  onRoll,
  onRcs,
  onStart,
  onStop,
  onSeparate,
  onStabilize,
  onRcsToggle,
  onAbort,
  onSkipLesson,
  onRestart,
  onExit,
  pilotMode,
  onPilotMode,
  blockKey,
}: {
  flight: FlightState;
  craft: CraftStats;
  throttle: number;
  stickX: number;
  stickY: number;
  bindings: ControlMap;
  onBindings: (next: ControlMap) => void;
  hot: Record<string, boolean>;
  toast: string | null;
  abortArmed: boolean;
  showStage: boolean;
  practiceStep: string | null;
  practiceIndex: number;
  practiceTotal: number;
  practiceDone: boolean;
  simRate: SimRate;
  onSimRate: (value: SimRate) => void;
  onThrottle: (value: number) => void;
  onStick: (x: number, y: number) => void;
  onStickEnd: () => void;
  onPitch: (value: number) => void;
  onYaw: (value: number) => void;
  onRoll: (value: number) => void;
  onRcs: (axis: "fore" | "aft" | "left" | "right" | "up" | "down", down: boolean) => void;
  onStart: () => void;
  onStop: () => void;
  onSeparate: () => void;
  onStabilize: () => void;
  onRcsToggle: () => void;
  onAbort: () => void;
  onSkipLesson: () => void;
  onRestart: () => void;
  onExit: () => void;
  pilotMode: PilotMode;
  onPilotMode: (mode: PilotMode) => void;
  blockKey: string | null;
}) {
  const { t } = useTranslation();
  const [keysOpen, setKeysOpen] = useState(false);
  const stage = flightStageId(flight, craft);
  const status = flightStatusId(flight);
  const fuel = fuelPercent(flight, craft);
  const thrust = thrustPercent(flight, craft);
  const key = (action: ControlAction) => keyLabel(bindings[action]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">{t("flight.title")}</h2>
        <span className={`pilot-status ${flight.engineOn ? "is-live" : ""}`}>{t(`flight.status.${status}`)}</span>
      </div>

      <Block title={t("autopilot.section")}>
        <div className="pilot-modes" role="group" aria-label={t("autopilot.modeLabel")}>
          {(["manual", "assisted", "autopilot"] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={pilotMode === id}
              className={`pilot-mode ${pilotMode === id ? "is-live" : ""}`}
              onClick={() => onPilotMode(id)}
            >
              {t(`autopilot.mode.${id}`)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`pilot-btn autopilot-master ${pilotMode === "autopilot" ? "is-live is-ok" : ""}`}
          aria-pressed={pilotMode === "autopilot"}
          onClick={() => onPilotMode(pilotMode === "autopilot" ? "manual" : "autopilot")}
        >
          <span className="pilot-btn-label">
            <Navigation size={16} />
            {pilotMode === "autopilot" ? t("autopilot.masterOn") : t("autopilot.masterOff")}
          </span>
        </button>
        {pilotMode === "autopilot" && (
          <button type="button" className="pilot-btn is-alert" onClick={() => onPilotMode("manual")}>
            <span className="pilot-btn-label"><Hand size={16} />{t("autopilot.disengage")}</span>
          </button>
        )}
        {blockKey && <p className="nav-warn">{t(blockKey)}</p>}
        <p className="text-[11px] leading-snug text-ice/55">
          {pilotMode === "autopilot" ? t("autopilot.hasControls") : pilotMode === "assisted" ? t("autopilot.assistNote") : t("autopilot.safe")}
        </p>
      </Block>

      <Block title={t("flight.simSpeed")}>
        <div className="sim-rates" role="group" aria-label={t("flight.simSpeed")}>
          {SIM_RATES.map((rate) => (
            <button
              key={rate}
              type="button"
              aria-pressed={simRate === rate}
              className={`pilot-mode ${simRate === rate ? "is-live" : ""}`}
              onClick={() => onSimRate(rate)}
            >
              {rate}×
            </button>
          ))}
        </div>
        <p className="text-[11px] leading-snug text-ice/55">{t("flight.simSpeedHint")}</p>
      </Block>

      {toast && <p className="cmd-toast">{t(`pilot.toast.${toast}`)}</p>}

      <div className="pilot-readout">
        <Readout label={t("flight.altitude")} value={`${flight.altitude.toFixed(1)} km`} />
        <Readout label={t("flight.velocity")} value={`${Math.round(flight.speed * 1000)} m/s`} />
        <Readout label={t("flight.fuelPct")} value={`${fuel.toFixed(0)}%`} />
        <Readout label={t("pilot.engineStatus")} value={flight.engineOn ? `${t("pilot.on")} · ${thrust.toFixed(0)}%` : t("pilot.off")} live={flight.engineOn} />
        <Readout label={t("flight.pitch")} value={`${flight.pitch.toFixed(1)}°`} />
        <Readout label={t("flight.yaw")} value={`${flight.yaw.toFixed(1)}°`} />
        <Readout label={t("flight.roll")} value={`${flight.roll.toFixed(1)}°`} />
      </div>
      <p className="pilot-stage-line">
        <span className="is-hot">{t(`autopilot.mode.${pilotMode}`)}</span>
        <span>{t(`flight.stageName.${stage}`)}</span>
        <span>{t("flight.suggested")} {(flight.terminal ? flight.suggested : flight.phase === "correction" ? flight.correctionTarget : flight.suggested).toFixed(0)}°</span>
      </p>

      <Block title={t("pilot.sectionDirection")}>
        <div className="pilot-axes">
          <Press label={t("pilot.action.pitchUp")} kbd={key("pitchUp")} live={hot.pitchUp} icon={<ChevronUp size={16} />} onDown={() => onPitch(-1)} onUp={() => onPitch(0)} />
          <Press label={t("pilot.action.pitchDown")} kbd={key("pitchDown")} live={hot.pitchDown} icon={<ChevronDown size={16} />} onDown={() => onPitch(1)} onUp={() => onPitch(0)} />
          <Press label={t("pilot.action.yawLeft")} kbd={key("yawLeft")} live={hot.yawLeft} icon={<ChevronLeft size={16} />} onDown={() => onYaw(-1)} onUp={() => onYaw(0)} />
          <Press label={t("pilot.action.yawRight")} kbd={key("yawRight")} live={hot.yawRight} icon={<ChevronRight size={16} />} onDown={() => onYaw(1)} onUp={() => onYaw(0)} />
          <Press label={t("pilot.action.rollLeft")} kbd={key("rollLeft")} live={hot.rollLeft} icon={<RotateCcw size={16} />} onDown={() => onRoll(-1)} onUp={() => onRoll(0)} />
          <Press label={t("pilot.action.rollRight")} kbd={key("rollRight")} live={hot.rollRight} icon={<RotateCw size={16} />} onDown={() => onRoll(1)} onUp={() => onRoll(0)} />
        </div>
        <VirtualStick x={stickX} y={stickY} onChange={onStick} onRelease={onStickEnd} />
      </Block>

      <Block title={t("pilot.sectionEngine")}>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={flight.engineOn} className={`pilot-btn is-ok ${flight.engineOn ? "is-live" : ""}`} onClick={onStart}>
            <span className="pilot-btn-label"><Power size={16} />{t("flight.ignite")}</span>
            <kbd>{key("engineStart")}</kbd>
          </button>
          <button type="button" aria-pressed={!flight.engineOn && flight.phase !== "pad"} className={`pilot-btn ${!flight.engineOn && flight.phase !== "pad" ? "is-live" : ""}`} onClick={onStop}>
            <span className="pilot-btn-label"><PowerOff size={16} />{t("flight.stop")}</span>
            <kbd>{key("engineStop")}</kbd>
          </button>
        </div>
        <label className="pilot-throttle">
          <span>{t("flight.throttle")} {Math.round(throttle * 100)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(throttle * 100)}
            aria-valuetext={`${Math.round(throttle * 100)}%`}
            onChange={(event) => onThrottle(Number(event.target.value) / 100)}
          />
          <span className="text-[11px] text-ice/50">{key("throttleUp")} / {key("throttleDown")}</span>
        </label>
        <button type="button" aria-pressed={flight.rcsEnabled} className={`pilot-btn ${flight.rcsEnabled ? "is-live" : ""}`} onClick={onRcsToggle}>
          <span className="pilot-btn-label"><Radio size={16} />{t("flight.rcs")} · {flight.rcsEnabled ? t("pilot.on") : t("pilot.off")}</span>
          <kbd>{key("rcsToggle")}</kbd>
        </button>
        {showStage && (
          <button type="button" className={`pilot-btn ${flight.separated ? "is-live" : ""}`} onClick={onSeparate} disabled={flight.separated}>
            <span>{flight.separated ? t("flight.separated") : t("flight.separate")}</span>
            <kbd>{key("separate")}</kbd>
          </button>
        )}
      </Block>

      <Block title={t("pilot.sectionAssist")}>
        <button type="button" aria-pressed={flight.stabilize} className={`pilot-btn ${flight.stabilize ? "is-live" : ""}`} onClick={onStabilize}>
          <span className="pilot-btn-label"><Shield size={16} />{t("flight.stabilize")} · {flight.stabilize ? t("pilot.on") : t("pilot.off")}</span>
          <kbd>{key("stabilize")}</kbd>
        </button>
        <button type="button" className={`pilot-btn is-alert ${abortArmed ? "is-armed" : ""} ${flight.aborted ? "is-live" : ""}`} onClick={onAbort}>
          <span className="pilot-btn-label"><Siren size={16} />{abortArmed ? t("flight.abortArm") : t("flight.abort")}</span>
          <kbd>{key("abort")}</kbd>
        </button>
      </Block>

      {practiceStep && (
        <div className="pilot-lesson">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan">
            {t("pilot.lessonKicker", { step: practiceIndex, total: practiceTotal })}
          </p>
          <p className="mt-1 text-sm">{t(`pilot.lesson.${practiceStep}`)}</p>
          <button className="mt-2 text-xs text-ice/60" type="button" onClick={onSkipLesson}>{t("pilot.skip")}</button>
        </div>
      )}
      {practiceDone && (
        <div className="pilot-lesson">
          <p className="text-sm">{t("pilot.lesson.done")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="pilot-btn is-ok" type="button" onClick={onExit}>{t("pilot.exit")}</button>
            <button className="pilot-btn" type="button" onClick={onRestart}>{t("pilot.restart")}</button>
          </div>
        </div>
      )}

      <div>
        <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-ice/50">{t("pilot.rcsPad")}</p>
        <div className="pilot-rcs">
          <Press label={t("pilot.action.rcsUp")} kbd={key("rcsUp")} live={hot.rcsUp} onDown={() => onRcs("up", true)} onUp={() => onRcs("up", false)} />
          <Press label={t("pilot.action.rcsLeft")} kbd={key("rcsLeft")} live={hot.rcsLeft} onDown={() => onRcs("left", true)} onUp={() => onRcs("left", false)} />
          <Press label={t("pilot.action.rcsFore")} kbd={key("rcsFore")} live={hot.rcsFore} onDown={() => onRcs("fore", true)} onUp={() => onRcs("fore", false)} />
          <Press label={t("pilot.action.rcsRight")} kbd={key("rcsRight")} live={hot.rcsRight} onDown={() => onRcs("right", true)} onUp={() => onRcs("right", false)} />
          <Press label={t("pilot.action.rcsDown")} kbd={key("rcsDown")} live={hot.rcsDown} onDown={() => onRcs("down", true)} onUp={() => onRcs("down", false)} />
          <Press label={t("pilot.action.rcsAft")} kbd={key("rcsAft")} live={hot.rcsAft} onDown={() => onRcs("aft", true)} onUp={() => onRcs("aft", false)} />
        </div>
      </div>

      <button className="text-xs uppercase tracking-[0.14em] text-cyan" type="button" onClick={() => setKeysOpen((open) => !open)}>
        {t("pilot.rebind")}
      </button>
      {keysOpen && <ControlBinder bindings={bindings} onChange={onBindings} />}

      {practiceTotal > 0 && !practiceDone && (
        <div className="flex flex-wrap gap-2">
          <button className="pilot-btn" type="button" onClick={onRestart}>{t("pilot.restart")}</button>
          <button className="pilot-btn" type="button" onClick={onExit}>{t("pilot.exit")}</button>
        </div>
      )}
    </div>
  );
}

function Readout({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className={`pilot-cell ${live ? "is-live" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
