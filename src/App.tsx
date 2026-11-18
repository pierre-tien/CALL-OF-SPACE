import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  EMPTY_SELECTION,
  MISSIONS,
  PRACTICE_LOADOUT,
  TRAINING_LOADOUT,
  checksPass,
  computeCraft,
  initialCrew,
  initialResources,
  summarize,
  type FlightState,
  type MissionId,
  type RunState,
  type Slot,
} from "./game/model";
import { NASA_IMAGES, SBDB_2012_TC4 } from "./game/catalog";
import { formatKm, loadNasa, type NasaSnapshot } from "./game/nasa";
import { headsetStatus, type HeadsetReport } from "./game/xr";
import { AVATARS, emptySave, loadSave, writeSave, type ExperienceMode, type HistoryEntry, type SaveData, type TrainingState } from "./game/storage";
import { coachKey, hintFor, isModuleId, type ModuleId } from "./game/training";
import { ControlBinder } from "./cockpit";
import { Builder, Checklist, FlightDeck, Surface } from "./play";
import { Dashboard, HomeView, LanguageGate, MissionList, Stage } from "./shell";
import { Academy, CoachLine, ContextHint, ExperienceGate, FieldManual, ModuleScreen } from "./train";

type Screen = "language" | "experience" | "home" | "missions" | "brief" | "build" | "check" | "flight" | "practice" | "surface" | "report" | "settings" | "nasa" | "profile" | "multi" | "tutorial" | "about" | "board" | "dashboard" | "manual" | "module";

interface Finished {
  run: RunState;
  score: number;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [screen, setScreen] = useState<Screen>(save.languageChosen ? (save.training.experience ? "home" : "experience") : "language");
  const [nasa, setNasa] = useState<NasaSnapshot | null>(null);
  const [finished, setFinished] = useState<Finished | null>(null);
  const [abortOpen, setAbortOpen] = useState(false);
  const [room, setRoom] = useState<string | null>(null);
  const [chat, setChat] = useState<{ who: string; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState(save.name);

  useEffect(() => writeSave(save), [save]);
  useEffect(() => {
    void loadNasa().then(setNasa);
  }, []);

  const practiceCraft = useMemo(() => computeCraft(PRACTICE_LOADOUT), []);
  const practiceRun = useMemo<RunState>(
    () => ({
      missionId: "lunar",
      selection: { ...PRACTICE_LOADOUT },
      inspected: [],
      tasks: [],
      incident: "none",
      crew: initialCrew(true),
      startedAt: Date.now(),
      log: [],
      resources: initialResources(practiceCraft),
      stage: "flight",
    }),
    [practiceCraft],
  );
  const run = save.active;
  const mission = MISSIONS.find((item) => item.id === run?.missionId) ?? null;
  const craft = useMemo(() => (run ? computeCraft(run.selection) : null), [run]);

  const updateRun = useCallback((next: RunState | ((current: RunState) => RunState)) => {
    setSave((current) => {
      if (!current.active) return current;
      const active = typeof next === "function" ? next(current.active) : next;
      return { ...current, active };
    });
  }, []);

  function chooseLanguage(code: "en" | "fr" | "de", next: Screen = "home") {
    void i18n.changeLanguage(code);
    localStorage.setItem("cos-lang", code);
    setSave((current) => ({ ...current, languageChosen: true }));
    setScreen(next === "home" && !save.training.experience ? "experience" : next);
  }

  function patchTraining(patch: Partial<TrainingState>) {
    setSave((current) => ({ ...current, training: { ...current.training, ...patch } }));
  }

  function chooseExperience(mode: ExperienceMode) {
    patchTraining({ experience: mode, hints: mode !== "experienced" });
    setScreen(mode === "recruit" ? "tutorial" : "home");
  }

  function openModule(id: ModuleId, replay: boolean) {
    setSave((current) => ({
      ...current,
      training: {
        ...current.training,
        module: id,
        step: !replay && current.training.module === id ? current.training.step : 0,
      },
    }));
    setScreen("module");
  }

  function completeModule() {
    setSave((current) => {
      const id = current.training.module;
      if (!id) return current;
      const done = current.training.done.includes(id) ? current.training.done : [...current.training.done, id];
      const achievements = current.training.achievements.includes(id) ? current.training.achievements : [...current.training.achievements, id];
      return { ...current, training: { ...current.training, done, achievements, step: 0 } };
    });
    setScreen("tutorial");
  }

  function openMission(id: MissionId) {
    const selected = MISSIONS.find((item) => item.id === id);
    if (!selected) return;
    const crew = initialCrew(selected.crewed);
    const active: RunState = {
      missionId: id,
      selection: { ...EMPTY_SELECTION },
      inspected: [],
      tasks: [],
      incident: "none",
      crew,
      startedAt: Date.now(),
      log: [],
      resources: { fuel: 0, energy: 76, oxygen: selected.crewed ? 100 : 40, water: selected.crewed ? 100 : 30, food: selected.crewed ? 100 : 0, data: 0, parts: 3 },
      stage: "brief",
    };
    setSave((current) => ({ ...current, active }));
    setScreen("brief");
  }

  function setPart(slot: Slot, id: string) {
    if (!run) return;
    updateRun({ ...run, selection: { ...run.selection, [slot]: id }, inspected: [] });
  }

  function conclude(source: RunState, outcome: "success" | "partial" | "fail") {
    const duration = Math.round((Date.now() - source.startedAt) / 1000);
    const score = outcome === "success" ? 1000 + Math.round(source.resources.fuel * 4 + (source.flight?.corridor ?? 0)) : outcome === "partial" ? 560 : 180;
    const achievements = new Set(save.achievements);
    if (outcome !== "fail") achievements.add("commander");
    if (outcome === "success" && source.missionId === "lunar") achievements.add("lunar");
    if (outcome === "success" && source.missionId === "mars") achievements.add("mars");
    if ((source.flight?.corridor ?? 0) > 70 && source.flight?.arrived) achievements.add("engineer");
    if (source.incident === "resolved") achievements.add("survival");
    if (outcome === "success" && source.incident !== "worsened") achievements.add("clean");
    const entry: HistoryEntry = { missionId: source.missionId, outcome, score, duration, at: new Date().toISOString() };
    const finalRun = { ...source, outcome };
    setFinished({ run: finalRun, score });
    setSave((current) => ({
      ...current,
      active: null,
      completed: current.completed + 1,
      success: current.success + (outcome === "success" ? 1 : 0),
      duration: current.duration + duration,
      incidents: current.incidents + (source.incident === "resolved" ? 1 : 0),
      discoveries: current.discoveries + source.tasks.length,
      achievements: [...achievements],
      history: [entry, ...current.history].slice(0, 12),
    }));
    setScreen("report");
  }

  const onFlightFinish = useCallback((flight: FlightState) => {
    setSave((current) => {
      if (!current.active) return current;
      const summary = summarize(flight);
      return {
        ...current,
        active: {
          ...current.active,
          flight: summary,
          resources: { ...current.active.resources, fuel: flight.fuel, energy: flight.energy },
        },
      };
    });
  }, []);

  function finishSurface() {
    if (!run || !mission) return;
    const tasksDone = mission.tasks.every((task) => run.tasks.includes(task));
    const hurt = run.incident === "worsened" || run.resources.oxygen < 12 || run.crew.health < 35;
    conclude(run, tasksDone && !hurt ? "success" : "partial");
  }

  function resetDemo() {
    if (!window.confirm(t("common.confirmReset"))) return;
    const fresh = emptySave();
    setSave(fresh);
    setFinished(null);
    setScreen("language");
  }

  const locale = i18n.language.startsWith("fr") ? "fr-FR" : i18n.language.startsWith("de") ? "de-DE" : "en-US";

  function markStage(stage: RunState["stage"]) {
    setSave((current) => (current.active ? { ...current, active: { ...current.active, stage } } : current));
  }

  function resumeMission() {
    if (!run) return;
    if (run.flight?.arrived) {
      setScreen("surface");
      return;
    }
    setScreen(run.stage ?? "brief");
  }

  function navigate(next: string) {
    if (next === "quit") {
      if (run) setAbortOpen(true);
      else setScreen("home");
      return;
    }
    if (next === "resume") {
      resumeMission();
      return;
    }
    setScreen(next as Screen);
  }

  if (screen === "language") {
    return <LanguageGate onChoose={(code) => chooseLanguage(code)} />;
  }

  const bestScore = save.history.reduce((best, entry) => Math.max(best, entry.score), 0);
  const hint = hintFor(screen, save.training.dismissed, save.training.hints);
  const coach = save.training.hints && run && mission
    ? coachKey({
        screen,
        selection: run.selection,
        mission,
        inspected: run.inspected,
        oxygen: run.resources.oxygen,
        incident: run.incident,
        tasksDone: mission.tasks.every((task) => run.tasks.includes(task)),
      })
    : save.training.hints && screen === "brief"
      ? coachKey({ screen })
      : null;

  return (
    <Stage active={screen} onNavigate={navigate} dock={screen === "home" || screen === "missions" || screen === "dashboard"}>
        {screen === "experience" && <ExperienceGate onChoose={chooseExperience} />}
        {hint && <ContextHint id={hint.id} message={t(hint.key)} onDismiss={(id) => patchTraining({ dismissed: save.training.dismissed.includes(id) ? save.training.dismissed : [...save.training.dismissed, id] })} />}
        {coach && <CoachLine message={t(coach)} />}
        {screen === "home" && <HomeView onNavigate={navigate} resume={Boolean(run)} />}

        {screen === "dashboard" && (
          <Dashboard
            name={save.name}
            missionName={mission ? t(`mission.${mission.id}Name`) : null}
            flown={save.completed}
            best={bestScore}
            onMissions={() => setScreen("missions")}
            onResume={resumeMission}
          />
        )}

        {screen === "missions" && <MissionList missions={MISSIONS} onOpen={openMission} onPractice={() => setScreen("practice")} />}

        {screen === "brief" && mission && !nasa && <p className="glass rounded-2xl p-5">{t("common.loading")}</p>}
        {screen === "brief" && mission && nasa && (
          <section className="glass rounded-2xl p-5">
            <h2 className="font-display text-3xl">{t(`mission.${mission.id}Name`)}</h2>
            <p className="mt-2 max-w-3xl text-ice/80">{t(`brief.obj.${mission.id}`)}</p>
            <div className="mt-4 rounded-xl border border-cyan/20 p-3 text-sm">
              <div className="text-xs uppercase tracking-wider text-cyan">{t("common.nasa")}</div>
              {mission.id === "lunar" && <p className="mt-1">{t("brief.distance")}: {formatKm(nasa.moonRangeKm, locale)} · {nasa.moonGravity} m/s²</p>}
              {mission.id === "mars" && <p className="mt-1">{t("brief.distance")}: {formatKm(nasa.marsRangeKm, locale)}</p>}
              {mission.id === "asteroid" && (
                <div className="mt-1 space-y-1">
                  <p>
                    {SBDB_2012_TC4.fullName}: {SBDB_2012_TC4.orbitClass}, a {SBDB_2012_TC4.semiMajorAxisAu} au, e {SBDB_2012_TC4.eccentricity}, period {SBDB_2012_TC4.periodDays} d, H {SBDB_2012_TC4.absoluteMagnitude}. {t("common.retrieved")} {SBDB_2012_TC4.retrievedAt}.
                  </p>
                  <p>
                    {nasa.asteroidName}: {nasa.vinfDepartureKmS} km/s departure, {nasa.tofDays} d, catalog {nasa.asteroidModified}. {t("common.gameplay")} {t("mission.dv")} stays separate.
                  </p>
                </div>
              )}
              <p className="mt-1 text-ice/60">{nasa.status === "live" ? t("common.live") : t("common.cached")} · {t("common.retrieved")} {nasa.retrievedAt}</p>
            </div>
            <p className="mt-3 text-sm text-ice/70">{t("brief.disclaimer")}</p>
            <button className="mt-4 rounded-xl bg-cyan px-4 py-3 font-semibold text-ink" onClick={() => { markStage("build"); setScreen("build"); }} type="button">{t("brief.build")}</button>
          </section>
        )}

        {screen === "build" && run && craft && mission && (
          <Builder
            selection={run.selection}
            craft={craft}
            mission={mission}
            onChange={setPart}
            onTrain={() => updateRun({ ...run, selection: { ...TRAINING_LOADOUT }, inspected: [] })}
            onNext={() => { markStage("check"); setScreen("check"); }}
          />
        )}

        {screen === "check" && run && mission && (
          <Checklist
            selection={run.selection}
            mission={mission}
            inspected={run.inspected}
            onInspect={(id) =>
              setSave((current) => {
                if (!current.active) return current;
                const inspected = current.active.inspected.includes(id)
                  ? current.active.inspected
                  : [...current.active.inspected, id];
                return { ...current, active: { ...current.active, inspected } };
              })
            }
            onBack={() => { markStage("build"); setScreen("build"); }}
            onPractice={() => setScreen("practice")}
            onLaunch={() => {
              if (!checksPass(run.selection, mission) || !craft) return;
              updateRun({ ...run, stage: "flight", resources: { ...initialResources(craft), parts: 3, data: 0 } });
              setScreen("flight");
            }}
          />
        )}

        {screen === "flight" && run && mission && craft && (
          <div>
            <FlightDeck
              craft={craft}
              mission={mission}
              run={run}
              bindings={save.controls}
              onBindings={(controls) => setSave((current) => ({ ...current, controls }))}
              onFinish={onFlightFinish}
            />
            {run.flight?.arrived && (
              <button className="mt-4 rounded-xl bg-cyan px-4 py-3 font-semibold text-ink" onClick={() => { markStage("surface"); setScreen("surface"); }} type="button">{t("flight.arrive")}</button>
            )}
            {run.flight && !run.flight.arrived && (
              <button className="mt-4 rounded-xl border border-alert/50 px-4 py-3" onClick={() => conclude(run, "fail")} type="button">{t("flight.report")}</button>
            )}
          </div>
        )}

        {screen === "practice" && (
          <FlightDeck
            craft={practiceCraft}
            mission={MISSIONS[0]}
            run={practiceRun}
            bindings={save.controls}
            onBindings={(controls) => setSave((current) => ({ ...current, controls }))}
            practice
            onFinish={() => undefined}
            onExit={() => setScreen(run ? "missions" : "home")}
          />
        )}

        {screen === "surface" && run && mission && <Surface mission={mission} run={run} onChange={updateRun} onFinish={finishSurface} />}

        {screen === "report" && finished && (
          <ReportView finished={finished} nasa={nasa} onAgain={() => setScreen("missions")} />
        )}

        {screen === "nasa" && <NasaView nasa={nasa} locale={locale} />}
        {screen === "settings" && (
          <section className="glass max-w-2xl rounded-2xl p-5">
            <h2 className="font-display text-3xl">{t("settings.title")}</h2>
            <div className="mt-4 flex gap-2">
              {(["en", "fr", "de"] as const).map((code) => (
                <button key={code} className="rounded-lg border border-cyan/30 px-3 py-2" onClick={() => chooseLanguage(code, "settings")} type="button">{t(`lang.${code}`)}</button>
              ))}
            </div>
            <h3 className="mt-6 font-display text-xl">{t("settings.account")}</h3>
            <p className="text-sm text-ice/70">{t("settings.accountText")}</p>
            <h3 className="mt-4 font-display text-xl">{t("settings.vr")}</h3>
            <XrNote />
            <h3 className="mt-4 font-display text-xl">{t("settings.voice")}</h3>
            <p className="text-sm text-ice/70">{t("settings.voiceText")}</p>
            <h3 className="mt-6 font-display text-xl">{t("pilot.rebind")}</h3>
            <p className="mb-3 text-sm text-ice/70">{t("pilot.rebindHint")}</p>
            <ControlBinder bindings={save.controls} onChange={(controls) => setSave((current) => ({ ...current, controls }))} />
            <h3 className="mt-4 font-display text-xl">{t("settings.hints")}</h3>
            <p className="text-sm text-ice/70">{save.training.hints ? t("settings.hintsOn") : t("settings.hintsOff")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="rounded-lg border border-cyan/30 px-3 py-2" onClick={() => patchTraining({ hints: !save.training.hints })} type="button">{t("settings.hintsToggle")}</button>
              <button className="rounded-lg border border-white/15 px-3 py-2" onClick={() => patchTraining({ dismissed: [] })} type="button">{t("settings.hintsReset")}</button>
            </div>
            <button className="mt-6 rounded-xl border border-alert/50 px-4 py-3" onClick={resetDemo} type="button">{t("common.reset")}</button>
          </section>
        )}

        {screen === "profile" && (
          <section className="glass max-w-2xl rounded-2xl p-5">
            <h2 className="font-display text-3xl">{t("profile.title")}</h2>
            <label className="mt-4 block text-sm">
              {t("profile.name")}
              <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <div className="mt-3 flex gap-2">
              {AVATARS.map((avatar) => (
                <button key={avatar} className={`h-10 w-10 rounded-full border ${save.avatar === avatar ? "border-cyan" : "border-white/20"}`} onClick={() => setSave((current) => ({ ...current, avatar }))} type="button">{avatar}</button>
              ))}
            </div>
            <button className="mt-3 rounded-lg bg-cyan px-3 py-2 font-semibold text-ink" onClick={() => setSave((current) => ({ ...current, name: name || "Cadet" }))} type="button">{t("profile.save")}</button>
            <dl className="mt-4 text-sm">
              <Line label={t("profile.completed")} value={`${save.completed}`} />
              <Line label={t("profile.success")} value={`${save.success}`} />
              <Line label={t("profile.duration")} value={`${save.duration}s`} />
              <Line label={t("profile.incidents")} value={`${save.incidents}`} />
              <Line label={t("profile.discoveries")} value={`${save.discoveries}`} />
            </dl>
            <h3 className="mt-4 font-display text-lg">{t("train.badges")}</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {["command", "engineering", "planning", "launch", "navigation", "surface"].map((id) => (
                <li key={id} className={save.training.achievements.includes(id) ? "text-cyan" : "text-ice/45"}>
                  {t(`train.badge.${id}`)} — {t(`train.skill.${id}`)}
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-2 text-sm">
              {["lunar", "mars", "engineer", "survival", "commander", "clean"].map((id) => (
                <li key={id} className={save.achievements.includes(id) ? "text-cyan" : "text-ice/45"}>
                  {t(`achieve.${id}`)} — {t(`achieve.${id}Text`)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {screen === "board" && (
          <section className="glass rounded-2xl p-5">
            <h2 className="font-display text-3xl">{t("board.title")}</h2>
            <p className="text-sm text-ice/60">{t("board.local")}</p>
            {save.history.length === 0 && <p className="mt-4">{t("board.empty")}</p>}
            <ul className="mt-4 space-y-2">
              {save.history.map((entry) => (
                <li key={entry.at} className="flex justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
                  <span>{t(`mission.${entry.missionId}Name`)} · {t(`report.${entry.outcome}`)}</span>
                  <span>{entry.score}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {screen === "tutorial" && (
          <Academy
            training={save.training}
            onOpen={openModule}
            onExperience={() => setScreen("experience")}
            onMissions={() => setScreen("missions")}
            onManual={() => setScreen("manual")}
            onPractice={() => setScreen("practice")}
          />
        )}

        {screen === "manual" && <FieldManual onBack={() => setScreen("tutorial")} />}

        {screen === "module" && isModuleId(save.training.module) && (
          <ModuleScreen
            key={save.training.module}
            id={save.training.module}
            initialStep={save.training.step}
            onProgress={(step) => patchTraining({ step })}
            onDone={completeModule}
            onBack={() => setScreen("tutorial")}
          />
        )}

        {screen === "about" && (
          <section className="glass max-w-2xl rounded-2xl p-5">
            <h2 className="font-display text-3xl">{t("about.title")}</h2>
            <p className="mt-3 text-ice/80">{t("about.body")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="rounded-xl bg-cyan px-4 py-3 font-semibold text-ink" onClick={() => openMission("lunar")} type="button">{t("about.play")}</button>
              <button className="rounded-xl border border-white/15 px-4 py-3" onClick={() => setScreen("nasa")} type="button">{t("about.sources")}</button>
            </div>
          </section>
        )}

        {screen === "multi" && (
          <section className="glass rounded-2xl p-5">
            <h2 className="font-display text-3xl">{t("multi.title")}</h2>
            <p className="mt-2 rounded-xl border border-cyan/30 bg-cyan/5 p-3 text-sm">{t("multi.banner")}</p>
            {!room && (
              <button className="mt-4 rounded-xl bg-cyan px-4 py-3 font-semibold text-ink" onClick={() => setRoom(`COS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`)} type="button">
                {t("multi.create")}
              </button>
            )}
            {room && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-cyan">{t("multi.code")}: {room}</p>
                  <h3 className="mt-3 font-display">{t("multi.roles")}</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>{t("multi.you")} · {save.name} · {t("roles.commander")}</li>
                    <li>{t("roles.pilot")} · {t("common.simulated")}</li>
                    <li>{t("roles.engineer")} · {t("common.simulated")}</li>
                    <li>{t("roles.science")} · {t("common.simulated")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-display">{t("multi.chat")}</h3>
                  <ul className="mt-2 h-40 space-y-2 overflow-auto text-sm">
                    {chat.map((message, index) => (
                      <li key={`${message.who}-${index}`}><strong>{message.who}: </strong>{message.text}</li>
                    ))}
                  </ul>
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!draft.trim()) return;
                      const text = draft.trim();
                      setChat((current) => [...current, { who: save.name, text }]);
                      setDraft("");
                      window.setTimeout(() => setChat((current) => [...current, { who: t("common.simulated"), text: t("multi.reply") }]), 400);
                    }}
                  >
                    <input className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={draft} placeholder={t("multi.placeholder")} onChange={(event) => setDraft(event.target.value)} />
                    <button className="rounded-lg bg-cyan px-3 py-2 font-semibold text-ink" type="submit">{t("multi.send")}</button>
                  </form>
                </div>
              </div>
            )}
            <button className="mt-4 rounded-xl border border-white/15 px-4 py-3" onClick={() => setScreen("missions")} type="button">{t("multi.start")}</button>
          </section>
        )}

        {abortOpen && (
        <div className="fixed inset-0 grid place-items-center bg-black/60 p-4">
          <div className="glass max-w-md rounded-2xl p-5">
            <h3 className="font-display text-xl">{t("common.abort")}</h3>
            <p className="mt-2 text-sm">{t("common.abortText")}</p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg border border-white/15 px-3 py-2" onClick={() => setAbortOpen(false)} type="button">{t("common.cancel")}</button>
              <button
                className="rounded-lg bg-alert px-3 py-2 font-semibold text-ice"
                onClick={() => {
                  if (run) conclude(run, "fail");
                  setAbortOpen(false);
                }}
                type="button"
              >
                {t("common.abort")}
              </button>
            </div>
          </div>
        </div>
      )}
    </Stage>
  );
}

function XrNote() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<HeadsetReport | "checking">("checking");
  useEffect(() => {
    void headsetStatus().then(setStatus);
  }, []);
  const detail = status === "available" ? "settings.xrReady" : status === "none" ? "settings.xrNone" : status === "unsupported" ? "settings.xrOff" : "settings.xrCheck";
  return (
    <div className="text-sm text-ice/70">
      <p>{t("settings.vrText")}</p>
      <p className="mt-1">{t(detail)}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-1">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ReportView({ finished, nasa, onAgain }: { finished: Finished; nasa: NasaSnapshot | null; onAgain: () => void }) {
  const { t } = useTranslation();
  const { run, score } = finished;
  const outcome = run.outcome ?? "fail";
  const advice = outcome === "success" ? "report.recSuccess" : outcome === "partial" ? "report.recPartial" : "report.recFail";
  return (
    <section className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan">{t("report.score")} {score}</p>
      <h2 className="font-display text-3xl">{t(`report.${outcome}`)}</h2>
      <p className="mt-2">{t(`mission.${run.missionId}Name`)}</p>
      <h3 className="mt-4 font-display">{t("report.objectives")}</h3>
      <p className="text-sm text-ice/80">{t(`brief.obj.${run.missionId}`)}</p>
      <p className="mt-2 text-sm">{run.tasks.map((task) => t(`surface.tasks.${task}`)).join(" · ") || "—"}</p>
      <h3 className="mt-4 font-display">{t("report.decisions")}</h3>
      <ul className="text-sm text-ice/80">{run.log.map((entry, index) => <li key={index}>{t(entry.key)}</li>)}</ul>
      <h3 className="mt-4 font-display">{t("report.science")}</h3>
      <p className="text-sm">{t("surface.data")}: {run.resources.data}. {t("common.gameplay")}</p>
      {nasa && run.missionId === "lunar" && <p className="mt-2 text-sm text-cyan">{t("nasa.moon")}: {Math.round(nasa.moonRangeKm).toLocaleString()} km · {nasa.status}</p>}
      <h3 className="mt-4 font-display">{t("report.recommend")}</h3>
      <p className="text-sm text-ice/80">{t(advice)}</p>
      <button className="mt-4 rounded-xl bg-cyan px-4 py-3 font-semibold text-ink" onClick={onAgain} type="button">{t("report.again")}</button>
    </section>
  );
}

function NasaView({ nasa, locale }: { nasa: NasaSnapshot | null; locale: string }) {
  const { t } = useTranslation();
  return (
    <section className="glass rounded-2xl p-5">
      <h2 className="font-display text-3xl">{t("nasa.title")}</h2>
      <p className="mt-2 max-w-3xl text-sm text-ice/80">{t("nasa.lead")}</p>
      {!nasa && <p className="mt-4">{t("common.loading")}</p>}
      {nasa && (
        <div className="mt-4 space-y-2 text-sm">
          <p>{t("nasa.moon")}: {formatKm(nasa.moonRangeKm, locale)}</p>
          <p>{t("nasa.gravity")}: {nasa.moonGravity} m/s²</p>
          <p>{t("nasa.radius")}: {nasa.moonRadiusKm} km</p>
          <p>{t("nasa.mars")}: {formatKm(nasa.marsRangeKm, locale)}</p>
          <p>{t("nasa.asteroid")}: {nasa.asteroidName}, {nasa.vinfDepartureKmS} km/s, {nasa.tofDays} d ({nasa.asteroidModified})</p>
          <p className="text-ice/60">{nasa.status === "live" ? t("common.live") : t("common.cached")} · {t("common.retrieved")} {nasa.retrievedAt}</p>
          <h3 className="pt-3 font-display text-xl">{t("nasa.sbdbTitle")}</h3>
          <p>
            {SBDB_2012_TC4.source}. {SBDB_2012_TC4.fullName}, {SBDB_2012_TC4.orbitClass}, NEO {String(SBDB_2012_TC4.neo)}, PHA {String(SBDB_2012_TC4.pha)}, a {SBDB_2012_TC4.semiMajorAxisAu} au, e {SBDB_2012_TC4.eccentricity}, q {SBDB_2012_TC4.perihelionAu} au, period {SBDB_2012_TC4.periodDays} d, H {SBDB_2012_TC4.absoluteMagnitude}, rotation {SBDB_2012_TC4.rotationHours} h. Solution {SBDB_2012_TC4.solutionDate}. {t("common.retrieved")} {SBDB_2012_TC4.retrievedAt}.
          </p>
          <p className="text-ice/60">{SBDB_2012_TC4.gameplay}</p>
        </div>
      )}
      <h3 className="mt-5 font-display text-xl">{t("nasa.photos")}</h3>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {NASA_IMAGES.map((image) => (
          <li key={image.id} className="rounded-xl border border-white/10 p-3 text-sm">
            <img className="mb-2 h-28 w-full rounded-lg object-cover" src={image.file} alt={image.title} />
            <p className="font-medium">{image.title}</p>
            <p>{image.credit}</p>
            <p className="text-ice/60">{image.id} · {t("common.retrieved")} {image.retrievedAt}</p>
            <p>{image.gameplay}</p>
            <a className="text-cyan" href={image.source} target="_blank" rel="noreferrer">{image.source}</a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ice/70">{t("nasa.notUsed")}</p>
      <h3 className="mt-5 font-display text-xl">{t("nasa.assumptions")}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ice/80">
        <li>{t("nasa.a1")}</li>
        <li>{t("nasa.a2")}</li>
        <li>{t("nasa.a3")}</li>
        <li>{t("nasa.a4")}</li>
        <li>{t("nasa.a5")}</li>
        <li>{t("nasa.notPhoto")}</li>
        <li>{t("nasa.notHardware")}</li>
        <li>{t("nasa.missing")}</li>
      </ul>
      <a className="mt-4 inline-block text-cyan" href="https://images.nasa.gov/" target="_blank" rel="noreferrer">{t("nasa.library")}</a>
    </section>
  );
}
