import { BarChart3, BookOpen, Home, Info, Power, Rocket, Settings, User, Users, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MISSION_IMAGE, NASA_IMAGES } from "./game/catalog";
import type { MissionId } from "./game/model";

type Go = (screen: string) => void;

export function Stage({
  active,
  onNavigate,
  children,
  dock = true,
}: {
  active: string;
  onNavigate: Go;
  children: ReactNode;
  dock?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="stage">
      <div className="stage-sky" />
      <div className="stage-earth" aria-hidden="true" />
      <div className="stage-shade" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-3 py-3 sm:px-5">
        <header className="flex items-center justify-between gap-3">
          <button className="text-left" onClick={() => onNavigate("home")} type="button">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ice/70 sm:text-xs">{t("home.agency")}</div>
            <div className="text-[10px] text-cyan sm:text-xs">{t("home.dataNote")}</div>
          </button>
          <nav className="top-nav" aria-label={t("nav.home")}>
            <TopLink icon={<Home size={16} />} label={t("nav.home")} active={active === "home"} onClick={() => onNavigate("home")} />
            <TopLink icon={<BarChart3 size={16} />} label={t("nav.leaderboard")} active={active === "board"} onClick={() => onNavigate("board")} />
            <TopLink icon={<BookOpen size={16} />} label={t("nav.help")} active={active === "manual"} onClick={() => onNavigate("manual")} />
            <TopLink icon={<Settings size={16} />} label={t("nav.settings")} active={active === "settings"} onClick={() => onNavigate("settings")} />
            <TopLink icon={<Power size={16} />} label={t("nav.quit")} tone="quit" active={false} onClick={() => onNavigate("quit")} />
          </nav>
        </header>
        <div className="flex-1 py-4">{children}</div>
        <p className="px-1 pt-2 text-right text-[10px] leading-snug text-ice/60">{t("home.earthCredit")}</p>
        {dock && (
          <footer className="dock text-xs sm:text-sm">
            <span className="flex items-center gap-2"><Info size={16} className="shrink-0 text-cyan" />{t("home.step1")}</span>
            <span className="flex items-center gap-2"><Rocket size={16} className="shrink-0 text-cyan" />{t("home.step2")}</span>
            <span className="flex items-center gap-2"><Wrench size={16} className="shrink-0 text-cyan" />{t("home.step3")}</span>
            <span className="flex items-center gap-2"><BarChart3 size={16} className="shrink-0 text-cyan" />{t("home.step4")}</span>
          </footer>
        )}
      </div>
    </div>
  );
}

export function HomeView({ onNavigate, resume }: { onNavigate: Go; resume: boolean }) {
  const { t } = useTranslation();
  const solo = NASA_IMAGES[0];
  const station = NASA_IMAGES[1];
  const links = [
    ["tutorial", "nav.tutorial"],
    ["board", "nav.leaderboard"],
    ["profile", "nav.progression"],
    ["about", "nav.about"],
    ["dashboard", "nav.dashboard"],
    ["manual", "nav.help"],
    ["settings", "nav.settings"],
  ] as const;
  return (
    <div className="home-layout flex min-h-[calc(100vh-10.5rem)] flex-col">
      <div className="lockup max-w-xl border-l-4 border-signal pl-3">
        <h1>
          CALL
          <span className="title-of">OF</span>
          <span>SPACE</span>
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-ice/80">{t("meta.pillars")}</p>
        <p className="tagline">{t("meta.tagline")}</p>
      </div>
      <nav className="game-menu" aria-label={t("nav.play")}>
        <div className="game-links">
          <button
            className="is-play"
            type="button"
            onClick={() => document.getElementById("play-modes")?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
          >
            {t("nav.play")}
          </button>
          <button type="button" onClick={() => onNavigate("practice")}>{t("pilot.open")}</button>
          {links.filter(([screen]) => screen !== "dashboard" && screen !== "settings" && screen !== "manual").map(([screen, key]) => (
            <button key={screen} type="button" onClick={() => onNavigate(screen)}>{t(key)}</button>
          ))}
        </div>
        <div className="game-links game-links-utility">
          {links.filter(([screen]) => screen === "dashboard" || screen === "manual" || screen === "settings").map(([screen, key]) => (
            <button key={screen} type="button" onClick={() => onNavigate(screen)}>{t(key)}</button>
          ))}
          <button className="is-quit" type="button" onClick={() => onNavigate("quit")}>{t("nav.quit")}</button>
          {resume && <button type="button" onClick={() => onNavigate("resume")}>{t("home.resume")}</button>}
        </div>
      </nav>
      <p className="menu-quote">{t("home.quote")}</p>
      <div id="play-modes" className="mt-4 grid min-h-[320px] flex-1 gap-4 md:grid-cols-2">
        <button className="mode-hero" onClick={() => onNavigate("missions")} type="button">
          <img src={solo.file} alt={`${solo.title}. ${solo.credit}`} />
          <span className="mode-veil" />
          <span className="mode-copy">
            <User size={18} />
            <span>
              <span className="block font-display text-2xl">{t("home.solo")}</span>
              <span className="block text-sm text-ice/80">{t("home.soloText")}</span>
            </span>
          </span>
        </button>
        <button className="mode-hero" onClick={() => onNavigate("multi")} type="button">
          <img src={station.file} alt={`${station.title}. ${station.credit}`} />
          <span className="mode-veil" />
          <span className="mode-copy">
            <Users size={18} />
            <span>
              <span className="block font-display text-2xl">{t("home.multi")}</span>
              <span className="block text-sm text-ice/80">{t("home.multiText")}</span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

export function MissionList({
  missions,
  onOpen,
  onPractice,
}: {
  missions: { id: MissionId; budget: number; minDv: number }[];
  onOpen: (id: MissionId) => void;
  onPractice: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl">{t("mission.title")}</h2>
        <button className="rounded-xl border border-cyan/40 px-4 py-3" onClick={onPractice} type="button">{t("pilot.open")}</button>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ice/70">{t("pilot.lead")}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {missions.map((item) => (
          <button
            key={item.id}
            className={`mission-tile ${MISSION_IMAGE[item.id] ? "" : "mission-void"}`}
            style={MISSION_IMAGE[item.id] ? { backgroundImage: `url(${MISSION_IMAGE[item.id]})` } : undefined}
            onClick={() => onOpen(item.id)}
            type="button"
          >
            <span className="mission-copy">
              <span className="text-[11px] uppercase tracking-[0.18em] text-cyan">{t("mission.rank")} · {t(`mission.${item.id}Rank`)}</span>
              <span className="mt-1 block font-display text-2xl">{t(`mission.${item.id}Name`)}</span>
              <span className="mt-2 block text-sm text-ice/85">{t(`mission.${item.id}Summary`)}</span>
              <span className="mt-3 block text-xs text-ice/70">
                {t("mission.budget")} {item.budget} · {t("mission.dv")} {item.minDv.toFixed(2)} km/s
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Dashboard({
  name,
  missionName,
  flown,
  best,
  onMissions,
  onResume,
}: {
  name: string;
  missionName: string | null;
  flown: number;
  best: number;
  onMissions: () => void;
  onResume: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="mode-card p-4 md:col-span-2">
        <p className="text-xs uppercase tracking-[0.16em] text-cyan">{t("board.dashTitle")}</p>
        <h2 className="mt-2 font-display text-3xl">{name}</h2>
        <p className="mt-2 text-sm text-ice/75">{t("board.dashLead")}</p>
        <p className="mt-4 text-sm">{missionName ? `${t("board.dashActive")}: ${missionName}` : t("board.dashNone")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-xl bg-cyan px-4 py-3 text-sm font-semibold text-ink" onClick={onMissions} type="button">{t("nav.play")}</button>
          {missionName && (
            <button className="rounded-xl border border-cyan/40 px-4 py-3 text-sm" onClick={onResume} type="button">{t("home.resume")}</button>
          )}
        </div>
      </article>
      <article className="mode-card p-4 text-sm">
        <p>{t("board.dashFlown")}</p>
        <p className="font-display text-3xl">{flown}</p>
        <p className="mt-4">{t("board.dashBest")}</p>
        <p className="font-display text-3xl">{best}</p>
      </article>
    </section>
  );
}

export function LanguageGate({ onChoose }: { onChoose: (code: "en" | "fr" | "de") => void }) {
  const { t } = useTranslation();
  return (
    <Stage active="language" onNavigate={() => undefined} dock={false}>
      <main className="grid min-h-[70vh] place-items-center">
        <section className="mode-card w-full max-w-xl p-6 sm:p-8">
          <div className="lockup">
            <h1>
              CALL
              <span className="title-of">OF</span>
              <span>SPACE</span>
            </h1>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-cyan">{t("meta.pillars")}</p>
          </div>
          <p className="mt-6 text-lg">{t("lang.title")}</p>
          <p className="mt-1 text-sm text-ice/70">{t("lang.subtitle")}</p>
          <div className="mt-6 grid gap-3">
            {(["en", "fr", "de"] as const).map((code) => (
              <button key={code} className="rail-btn border border-white/10" onClick={() => onChoose(code)} type="button">
                {t(`lang.${code}`)}
              </button>
            ))}
          </div>
        </section>
      </main>
    </Stage>
  );
}

function TopLink({ icon, label, active, tone = "default", onClick }: { icon: ReactNode; label: string; active: boolean; tone?: "default" | "quit"; onClick: () => void }) {
  return (
    <button className={tone === "quit" ? "is-quit" : undefined} aria-current={active ? "page" : undefined} onClick={onClick} type="button">
      {icon}
      <span>{label}</span>
    </button>
  );
}
