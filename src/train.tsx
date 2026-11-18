import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Builder, Checklist, Surface } from "./play";
import {
  EMPTY_SELECTION,
  TRAINING_LOADOUT,
  checksPass,
  computeCraft,
  createFlight,
  initialCrew,
  neutralInput,
  initialResources,
  readiness,
  stepFlight,
  type FlightState,
  type RunState,
  type Selection,
  type Slot,
} from "./game/model";
import { LUNAR, MODULES, type ModuleId } from "./game/training";
import type { TrainingState } from "./game/storage";

export function ExperienceGate({ onChoose }: { onChoose: (mode: "recruit" | "experienced" | "free") => void }) {
  const { t } = useTranslation();
  const modes = ["recruit", "experienced", "free"] as const;
  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan">{t("train.gateKicker")}</p>
      <h2 className="mt-2 font-display text-4xl">{t("train.gateTitle")}</h2>
      <p className="mt-2 max-w-2xl text-ice/75">{t("train.gateLead")}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {modes.map((mode) => (
          <button key={mode} className={`xp-card ${mode === "recruit" ? "is-lead" : ""}`} onClick={() => onChoose(mode)} type="button">
            <span className="text-xs uppercase tracking-[0.16em] text-cyan">{t(`train.mode.${mode}Kicker`)}</span>
            <span className="mt-2 block font-display text-2xl">{t(`train.mode.${mode}`)}</span>
            <span className="mt-2 block text-sm text-ice/75">{t(`train.mode.${mode}Text`)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Academy({
  training,
  onOpen,
  onExperience,
  onMissions,
  onManual,
  onPractice,
}: {
  training: TrainingState;
  onOpen: (id: ModuleId, replay: boolean) => void;
  onExperience: () => void;
  onMissions: () => void;
  onManual: () => void;
  onPractice: () => void;
}) {
  const { t } = useTranslation();
  const done = training.done.length;
  return (
    <section>
      <p className="text-xs uppercase tracking-[0.22em] text-cyan">{t("train.academyKicker")}</p>
      <h2 className="font-display text-4xl">{t("tutorial.title")}</h2>
      <p className="mt-2 max-w-2xl text-ice/75">{t("train.academyLead")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label={t("train.completed")} value={`${done} / ${MODULES.length}`} />
        <Stat label={t("train.stage")} value={training.module ? t(`train.mod.${training.module}`) : t("train.stageNone")} />
        <Stat label={t("train.remaining")} value={`${MODULES.length - done}`} />
      </div>
      <ol className="mt-5 grid gap-3">
        {MODULES.map((id, index) => {
          const finished = training.done.includes(id);
          return (
            <li key={id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-cyan">{String(index + 1).padStart(2, "0")}</p>
                <p className="font-display text-xl">{t(`train.mod.${id}`)}</p>
                <p className="text-sm text-ice/70">{t(`train.skill.${id}`)}</p>
              </div>
              <button className="rounded-xl bg-cyan px-4 py-2 font-semibold text-ice" onClick={() => onOpen(id, finished)} type="button">
                {finished ? t("train.replay") : training.module === id ? t("train.resume") : t("train.start")}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 glass rounded-2xl p-4">
        <h3 className="font-display text-lg">{t("train.learned")}</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {MODULES.map((id) => (
            <li key={id} className={training.done.includes(id) ? "text-cyan" : "text-ice/40"}>
              {t(`train.skill.${id}`)}
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-display text-lg">{t("train.badges")}</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {MODULES.map((id) => (
            <li key={id} className={training.achievements.includes(id) ? "text-cyan" : "text-ice/40"}>
              {t(`train.badge.${id}`)}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-xl bg-cyan px-4 py-3 font-semibold text-ice" onClick={onPractice} type="button">{t("pilot.open")}</button>
        <button className="rounded-xl border border-cyan/40 px-4 py-3" onClick={onMissions} type="button">{t("tutorial.go")}</button>
        <button className="rounded-xl border border-white/15 px-4 py-3" onClick={onManual} type="button">{t("nav.help")}</button>
        <button className="rounded-xl border border-white/15 px-4 py-3" onClick={onExperience} type="button">{t("train.changeMode")}</button>
      </div>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ice/70">
        <li>{t("tutorial.s1")}</li>
        <li>{t("tutorial.s2")}</li>
        <li>{t("tutorial.s3")}</li>
        <li>{t("tutorial.s4")}</li>
      </ol>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-ice/50">{label}</p>
      <p className="font-display text-2xl text-cyan">{value}</p>
    </div>
  );
}

export function ModuleScreen({
  id,
  initialStep = 0,
  onProgress,
  onDone,
  onBack,
}: {
  id: ModuleId;
  initialStep?: number;
  onProgress: (step: number) => void;
  onDone: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(initialStep);
  const [miss, setMiss] = useState<string | null>(null);
  function go(next: number) {
    setMiss(null);
    setStep(next);
    onProgress(next);
  }
  function finish() {
    onDone();
  }
  return (
    <section>
      <button className="text-sm text-cyan" onClick={onBack} type="button">{t("train.back")}</button>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan">{String(MODULES.indexOf(id) + 1).padStart(2, "0")}</p>
      <h2 className="font-display text-3xl">{t(`train.mod.${id}`)}</h2>
      <p className="mt-2 max-w-2xl text-ice/75">{t(`train.goal.${id}`)}</p>
      {miss && <p className="mt-3 rounded-xl border border-alert/60 bg-alert/10 px-3 py-2 text-sm text-alert">{t(miss)}</p>}
      <div className="mt-4">
        {id === "command" && <CommandStep step={step} onAnswer={(ok, fail) => (ok ? go(step + 1) : setMiss(fail))} onFinish={finish} />}
        {id === "engineering" && <EngineeringStep step={step} onAdvance={() => go(step + 1)} onMiss={setMiss} onFinish={finish} />}
        {id === "planning" && <PlanningStep step={step} onAdvance={() => go(step + 1)} onMiss={setMiss} onFinish={finish} />}
        {id === "launch" && <LaunchStep step={step} onAdvance={() => go(step + 1)} onBack={() => go(Math.max(0, step - 1))} onFinish={finish} />}
        {id === "navigation" && <NavigationStep step={step} onAdvance={() => go(step + 1)} onMiss={setMiss} onFinish={finish} />}
        {id === "surface" && <SurfaceStep onFinish={finish} />}
      </div>
    </section>
  );
}

function CommandStep({ step, onAnswer, onFinish }: { step: number; onAnswer: (ok: boolean, fail: string) => void; onFinish: () => void }) {
  const { t } = useTranslation();
  if (step === 0) {
    return (
      <article className="glass rounded-2xl p-4">
        <p>{t("train.command.intro")}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Meter name={t("flight.fuel")} width="72%" />
          <Meter name={t("flight.energy")} width="76%" />
          <Meter name={t("surface.oxygen")} width="100%" />
        </div>
        <p className="mt-3 text-sm text-ice/60">{t("train.command.meters")}</p>
        <Next onClick={() => onAnswer(true, "")} label={t("train.exercise")} />
      </article>
    );
  }
  if (step === 1) {
    return (
      <Quiz
        prompt={t("train.command.qBudget", { budget: LUNAR.budget })}
        options={[
          { id: "1100", label: "1100" },
          { id: "780", label: "780" },
          { id: "1280", label: "1280" },
        ]}
        answer="1100"
        onPick={(ok) => onAnswer(ok, "train.miss.budget")}
      />
    );
  }
  if (step === 2) {
    return (
      <Quiz
        prompt={t("train.command.qRed")}
        options={[
          { id: "hold", label: t("train.command.redHold") },
          { id: "ok", label: t("train.command.redOk") },
          { id: "photo", label: t("train.command.redPhoto") },
        ]}
        answer="hold"
        onPick={(ok) => onAnswer(ok, "train.miss.red")}
      />
    );
  }
  return <Done text={t("train.command.done")} onFinish={onFinish} />;
}

function EngineeringStep({
  step,
  onAdvance,
  onMiss,
  onFinish,
}: {
  step: number;
  onAdvance: () => void;
  onMiss: (key: string) => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<Selection>({ ...EMPTY_SELECTION });
  const craft = computeCraft(selection);
  if (step === 0) {
    return (
      <article className="glass rounded-2xl p-4">
        <p>{t("train.engineering.intro")}</p>
        <Next onClick={onAdvance} label={t("train.openHangar")} />
      </article>
    );
  }
  if (step > 2) return <Done text={t("train.engineering.done")} onFinish={onFinish} />;
  const want = step === 1 ? "engine-mid" : "tank-mid";
  const slot: Slot = step === 1 ? "engine" : "tank";
  return (
    <div>
      <p className="mb-3 text-sm text-cyan">{t(step === 1 ? "train.engineering.askEngine" : "train.engineering.askTank")}</p>
      <Builder
        selection={selection}
        craft={craft}
        mission={LUNAR}
        onChange={(nextSlot, id) => setSelection((current) => ({ ...current, [nextSlot]: id }))}
        onTrain={() => setSelection({ ...TRAINING_LOADOUT })}
        onNext={() => {
          if (selection[slot] === want) onAdvance();
          else onMiss(step === 1 ? "train.miss.engine" : "train.miss.tank");
        }}
      />
    </div>
  );
}

function PlanningStep({
  step,
  onAdvance,
  onMiss,
  onFinish,
}: {
  step: number;
  onAdvance: () => void;
  onMiss: (key: string) => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<Selection>({ ...EMPTY_SELECTION });
  const checks = readiness(selection, LUNAR);
  const holds = checks.filter((check) => !check.ok);
  if (step === 0) {
    return (
      <article className="glass rounded-2xl p-4 text-sm">
        <p>{t("train.planning.intro", { budget: LUNAR.budget, dv: LUNAR.minDv.toFixed(2), comms: LUNAR.minComms })}</p>
        <Next onClick={onAdvance} label={t("train.exercise")} />
      </article>
    );
  }
  if (step === 1) {
    return (
      <article className="glass rounded-2xl p-4">
        <p>{t("train.planning.empty")}</p>
        <ul className="mt-3 space-y-1 text-sm text-alert">
          {holds.map((hold) => (
            <li key={hold.id}>{t(`check.${hold.id}`)}: {hold.value}</li>
          ))}
        </ul>
        <button className="mt-4 rounded-xl bg-cyan px-4 py-3 font-semibold text-ice" onClick={() => setSelection({ ...TRAINING_LOADOUT })} type="button">
          {t("build.loadout")}
        </button>
        <button
          className="ml-2 mt-4 rounded-xl border border-white/15 px-4 py-3"
          onClick={() => (checksPass(selection, LUNAR) ? onAdvance() : onMiss("train.miss.plan"))}
          type="button"
        >
          {t("train.planning.confirm")}
        </button>
      </article>
    );
  }
  return <Done text={t("train.planning.done", { cost: computeCraft(TRAINING_LOADOUT).cost, dv: computeCraft(TRAINING_LOADOUT).dv.toFixed(2) })} onFinish={onFinish} />;
}

function LaunchStep({ step, onAdvance, onBack, onFinish }: { step: number; onAdvance: () => void; onBack: () => void; onFinish: () => void }) {
  const { t } = useTranslation();
  const [inspected, setInspected] = useState<string[]>([]);
  const [flight, setFlight] = useState<FlightState | null>(null);
  const craft = computeCraft(TRAINING_LOADOUT);
  if (step === 0) {
    return (
      <article className="glass rounded-2xl p-4">
        <p>{t("train.launch.intro")}</p>
        <Next onClick={onAdvance} label={t("train.exercise")} />
      </article>
    );
  }
  if (step === 1) {
    return (
      <Checklist
        selection={TRAINING_LOADOUT}
        mission={LUNAR}
        inspected={inspected}
        onInspect={(id) => setInspected((current) => (current.includes(id) ? current : [...current, id]))}
        onBack={onBack}
        onLaunch={() => {
          let state = createFlight(craft);
          const input = neutralInput({ throttle: 0.8, engineOn: true });
          for (let tick = 0; tick < 30; tick += 1) state = stepFlight(state, input, craft, 0.05);
          setFlight(state);
          onAdvance();
        }}
      />
    );
  }
  return (
    <article className="glass rounded-2xl p-4">
      <p>{t("train.launch.result", { fuel: flight?.fuel.toFixed(1) ?? "—", altitude: flight?.altitude.toFixed(1) ?? "—" })}</p>
      <p className="mt-2 text-sm text-ice/70">{t("train.launch.fuelNote")}</p>
      <Next onClick={onFinish} label={t("train.complete")} />
    </article>
  );
}

function NavigationStep({
  step,
  onAdvance,
  onMiss,
  onFinish,
}: {
  step: number;
  onAdvance: () => void;
  onMiss: (key: string) => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const [pitch, setPitch] = useState(20);
  const [throttle, setThrottle] = useState(80);
  if (step === 0) {
    return (
      <article className="glass rounded-2xl p-4">
        <p>{t("train.nav.intro")}</p>
        <Next onClick={onAdvance} label={t("train.exercise")} />
      </article>
    );
  }
  if (step === 1) {
    const aligned = Math.abs(pitch - 48) <= 6 && throttle >= 28 && throttle <= 62;
    return (
      <article className="glass rounded-2xl p-4">
        <p>{t("train.nav.ask")}</p>
        <label className="mt-4 block text-sm">
          {t("flight.pitch")} {pitch}°
          <input className="mt-1 w-full" type="range" min={0} max={90} value={pitch} onChange={(event) => setPitch(Number(event.target.value))} />
        </label>
        <label className="mt-3 block text-sm">
          {t("flight.throttle")} {throttle}%
          <input className="mt-1 w-full" type="range" min={0} max={100} value={throttle} onChange={(event) => setThrottle(Number(event.target.value))} />
        </label>
        <button
          className="mt-4 rounded-xl bg-cyan px-4 py-3 font-semibold text-ice"
          onClick={() => (aligned ? onAdvance() : onMiss("train.miss.correction"))}
          type="button"
        >
          {t("train.nav.check")}
        </button>
      </article>
    );
  }
  return <Done text={t("train.nav.done")} onFinish={onFinish} />;
}

function SurfaceStep({ onFinish }: { onFinish: () => void }) {
  const { t } = useTranslation();
  const craft = computeCraft(TRAINING_LOADOUT);
  const [run, setRun] = useState<RunState>({
    missionId: "lunar",
    selection: { ...TRAINING_LOADOUT },
    inspected: [],
    tasks: [],
    incident: "none",
    crew: initialCrew(true),
    startedAt: Date.now(),
    log: [],
    resources: { ...initialResources(craft), data: 0 },
    stage: "surface",
  });
  return (
    <div>
      <p className="mb-3 text-sm text-ice/75">{t("train.surface.intro")}</p>
      <Surface mission={LUNAR} run={run} onChange={setRun} onFinish={onFinish} />
    </div>
  );
}

function Quiz({
  prompt,
  options,
  answer,
  onPick,
}: {
  prompt: string;
  options: { id: string; label: string }[];
  answer: string;
  onPick: (ok: boolean) => void;
}) {
  return (
    <article className="glass rounded-2xl p-4">
      <p>{prompt}</p>
      <div className="mt-4 grid gap-2">
        {options.map((option) => (
          <button key={option.id} className="rounded-xl border border-signal/40 px-4 py-3 text-left" onClick={() => onPick(option.id === answer)} type="button">
            {option.label}
          </button>
        ))}
      </div>
    </article>
  );
}

function Meter({ name, width }: { name: string; width: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-ice/60">{name}</p>
      <div className="meter-track mt-1"><div className="meter-fill" style={{ width }} /></div>
    </div>
  );
}

function Next({ onClick, label }: { onClick: () => void; label: string }) {
  return <button className="mt-4 rounded-xl bg-cyan px-4 py-3 font-semibold text-ice" onClick={onClick} type="button">{label}</button>;
}

function Done({ text, onFinish }: { text: string; onFinish: () => void }) {
  const { t } = useTranslation();
  return (
    <article className="glass rounded-2xl border border-cyan/40 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan">{t("train.feedback")}</p>
      <p className="mt-2">{text}</p>
      <Next onClick={onFinish} label={t("train.complete")} />
    </article>
  );
}

const MANUAL = ["controls", "build", "resources", "launch", "nav", "objectives", "crew", "eva", "trouble", "glossary"] as const;

export function FieldManual({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<(typeof MANUAL)[number]>("controls");
  return (
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <aside className="glass rounded-2xl p-3">
        <h2 className="px-2 font-display text-2xl">{t("train.manualTitle")}</h2>
        <div className="mt-3 grid gap-1">
          {MANUAL.map((id) => (
            <button key={id} className={`rounded-lg px-3 py-2 text-left text-sm ${open === id ? "bg-signal/20 text-ice" : "text-ice/75"}`} onClick={() => setOpen(id)} type="button">
              {t(`train.manual.${id}Title`)}
            </button>
          ))}
        </div>
        <button className="mt-3 px-3 text-sm text-cyan" onClick={onBack} type="button">{t("train.back")}</button>
      </aside>
      <article className="glass rounded-2xl p-5">
        <h3 className="font-display text-2xl">{t(`train.manual.${open}Title`)}</h3>
        <p className="mt-3 whitespace-pre-line text-ice/80">{t(`train.manual.${open}`)}</p>
      </article>
    </section>
  );
}

export function ContextHint({ id, message, onDismiss }: { id: string; message: string; onDismiss: (id: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="hint-card mb-4">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan">{t("train.hintLabel")}</p>
      <p className="mt-1 text-sm">{message}</p>
      <button className="mt-2 text-xs uppercase tracking-[0.14em] text-ice/70" onClick={() => onDismiss(id)} type="button">{t("train.hintDismiss")}</button>
    </div>
  );
}

export function CoachLine({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 rounded-2xl border border-cyan/30 bg-cyan/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan">{t("assistant.title")}</p>
      <p className="mt-1 text-sm">{message}</p>
      <p className="mt-1 text-xs text-ice/50">{t("assistant.rule")}</p>
    </div>
  );
}
