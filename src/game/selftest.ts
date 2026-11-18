import { autopilotCommand, engageBlock } from "./autopilot";
import {
  DESTINATIONS,
  MISSIONS,
  PRACTICE_LOADOUT,
  TRAINING_LOADOUT,
  computeCraft,
  createFlight,
  neutralInput,
  readiness,
  stepFlight,
  type FlightState,
  type MissionId,
} from "./model";

const craft = computeCraft(TRAINING_LOADOUT);
console.log("training", {
  mass: craft.mass.toFixed(1),
  dry: craft.dryMass.toFixed(1),
  fuel: craft.fuel,
  dv: craft.dv.toFixed(2),
  twr: craft.twr.toFixed(2),
  cost: craft.cost,
});
console.log(
  "checks",
  readiness(TRAINING_LOADOUT, MISSIONS[0]).map((check) => `${check.id}:${check.ok}`),
);

function fly(id: MissionId, vehicle = craft): { state: FlightState; stages: string[] } {
  let state = createFlight(vehicle, DESTINATIONS[id]);
  const seen = new Set<string>();
  for (let i = 0; i < 8000 && state.phase !== "arrival" && state.phase !== "failed"; i++) {
    if (state.landStage !== "none") seen.add(state.landStage);
    state = stepFlight(state, autopilotCommand(state, vehicle), vehicle, 0.05);
  }
  const stages = [...seen];
  console.log(id, state.phase, {
    t: state.time.toFixed(1),
    fuel: state.fuel.toFixed(1),
    landed: state.landed,
    fail: state.failKey,
    stages: stages.join(">"),
  });
  return { state, stages };
}

let failed = false;
const needed = ["approach", "align", "prep", "slow", "contact"];
for (const mission of MISSIONS) {
  const { state, stages } = fly(mission.id);
  if (!state.landed || state.phase !== "arrival" || needed.some((stage) => !stages.includes(stage))) failed = true;
}

const practice = computeCraft(PRACTICE_LOADOUT);
const practiceFlight = fly("lunar", practice);
if (!practiceFlight.state.landed || !practiceFlight.state.separated) failed = true;

let crash = createFlight(craft, DESTINATIONS.lunar);
crash = { ...crash, phase: "approach", terminal: true, termAlt: 0.02, sink: -0.08, closure: 0.08, termLat: 0.04, landStage: "slow" };
for (let i = 0; i < 30; i++) crash = stepFlight(crash, neutralInput(), craft, 0.05);
console.log("hard-landing", crash.phase, crash.landed, crash.failKey);
if (crash.landed || crash.phase !== "failed" || crash.failKey !== "flight.failLanding") failed = true;

let rock = createFlight(craft, DESTINATIONS.asteroid);
rock = { ...rock, phase: "approach", terminal: true, termAlt: 0.5, sink: -0.02, closure: 0.05, landStage: "slow" };
for (let i = 0; i < 40; i++) rock = stepFlight(rock, neutralInput(), craft, 0.05);
console.log("asteroid-fast", rock.phase, rock.landed, rock.failKey);
if (rock.landed || rock.failKey !== "flight.failAsteroid") failed = true;

const pad = createFlight(craft, DESTINATIONS.lunar);
if (engageBlock(pad) !== null) failed = true;
if (engageBlock({ ...crash, phase: "failed" }) !== "autopilot.blockFailed") failed = true;
if (engageBlock({ ...pad, landStage: "contact", phase: "approach", terminal: true }) !== "autopilot.blockContact") failed = true;

if (failed) throw new Error("AUTOPILOT SELFTEST FAILED");
console.log("AUTOPILOT SELFTEST OK");
