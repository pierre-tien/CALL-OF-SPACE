import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useRef, type ReactNode } from "react";
import type { Group } from "three";
import type { MissionId, Selection } from "./game/model";

const COLORS: Record<string, string> = {
  earth: "#2f6cae",
  moon: "#c8c2b4",
  mars: "#c45b3a",
  asteroid: "#8b8174",
  ship: "#EAF2FF",
};

function Globe({ color, position, scale }: { color: string; position: [number, number, number]; scale: number }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
    </mesh>
  );
}

export function MissionScene({
  mission,
  progress,
  pitch = 0,
  yaw = 0,
  roll = 0,
  thrust = 0,
}: {
  mission: MissionId;
  progress: number;
  pitch?: number;
  yaw?: number;
  roll?: number;
  thrust?: number;
}) {
  const angle = progress * Math.PI * 1.15;
  const ship: [number, number, number] = [Math.cos(angle) * 3.2, 0.2, Math.sin(angle) * 3.2];
  const target: [number, number, number] =
    mission === "mars" ? [4.2, 0, 0] : mission === "asteroid" ? [3.4, 0.4, 1.2] : mission === "lunar" ? [3.1, 0.1, 0.2] : [0.2, 1.5, 0];
  return (
    <Canvas camera={{ position: [0, 3.2, 7.2], fov: 42 }} dpr={[1, 1.5]}>
      <color attach="background" args={["#05070D"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 2]} intensity={1.4} />
      <Stars radius={40} depth={20} count={800} factor={2} fade speed={0.2} />
      <ThrustShake thrust={thrust}>
        <Globe color={COLORS.earth} position={[0, 0, 0]} scale={1.15} />
        {mission !== "station" && mission !== "rescue" && (
          <Globe color={mission === "mars" ? COLORS.mars : mission === "asteroid" ? COLORS.asteroid : COLORS.moon} position={target} scale={mission === "mars" ? 0.72 : 0.38} />
        )}
        {(mission === "station" || mission === "rescue") && (
          <mesh position={[1.8, 0.4, 0.2]}>
            <boxGeometry args={[0.45, 0.18, 0.18]} />
            <meshStandardMaterial color="#d5e6f4" />
          </mesh>
        )}
        <group position={ship} rotation={[0, -angle + (yaw * Math.PI) / 180, 0]}>
          <group rotation={[0, 0, -(pitch * Math.PI) / 180]}>
            <group rotation={[0, (roll * Math.PI) / 180, 0]}>
              <mesh>
                <coneGeometry args={[0.08, 0.28, 12]} />
                <meshStandardMaterial color={COLORS.ship} />
              </mesh>
              {thrust > 0.04 && (
                <>
                  <mesh position={[0, -0.62 - thrust * 0.46, 0]} scale={[0.7 + thrust * 0.55, 1.6 + thrust * 2.6, 0.7 + thrust * 0.55]}>
                    <coneGeometry args={[0.07, 0.42, 12]} />
                    <meshStandardMaterial color="#ff6a1a" emissive="#ff3b00" emissiveIntensity={2.8} transparent opacity={0.72} />
                  </mesh>
                  <mesh position={[0, -0.46 - thrust * 0.28, 0]} scale={[0.5 + thrust * 0.4, 1.25 + thrust * 2.1, 0.5 + thrust * 0.4]}>
                    <coneGeometry args={[0.05, 0.34, 12]} />
                    <meshStandardMaterial color="#ffb15a" emissive="#ff4d1a" emissiveIntensity={3.1} transparent opacity={0.94} />
                  </mesh>
                  <mesh position={[0, -0.3 - thrust * 0.12, 0]} scale={[0.32 + thrust * 0.22, 0.85 + thrust * 1.15, 0.32 + thrust * 0.22]}>
                    <coneGeometry args={[0.028, 0.22, 10]} />
                    <meshStandardMaterial color="#fff6dc" emissive="#fff1c2" emissiveIntensity={4} />
                  </mesh>
                  <pointLight position={[0, -0.7, 0]} intensity={18 + thrust * 70} color="#ff7a2a" distance={7} />
                </>
              )}
            </group>
          </group>
        </group>
      </ThrustShake>
      <OrbitControls enablePan={false} minDistance={4} maxDistance={12} />
    </Canvas>
  );
}

function ThrustShake({ thrust, children }: { thrust: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;
    const kick = thrust * thrust;
    const t = clock.elapsedTime;
    group.position.set(Math.sin(t * 61) * 0.09 * kick, Math.cos(t * 43) * 0.05 * kick, Math.sin(t * 29) * 0.04 * kick);
    group.rotation.set(Math.sin(t * 23) * 0.026 * kick, 0, Math.cos(t * 19) * 0.02 * kick);
  });
  return <group ref={ref}>{children}</group>;
}

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function HangarShip({ selection }: { selection: Selection }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (group.current) group.current.position.y = Math.sin(performance.now() / 900) * 0.05;
  });
  const tank = selection.tank === "tank-large" ? 1.45 : selection.tank === "tank-small" ? 0.72 : selection.tank ? 1.05 : 0.35;
  const heavy = selection.engine === "engine-heavy";
  const booster = selection.booster === "booster-solid";
  const solar = selection.power === "power-solar";
  const crewed = selection.crew === "crew-pair";
  const dish = selection.comms === "comms-high";
  return (
    <group ref={group}>
      <mesh position={[0, tank / 2 - 0.15, 0]}>
        <cylinderGeometry args={[0.36, 0.42, Math.max(tank, 0.2), 24]} />
        <meshStandardMaterial color="#d7e2ee" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[0, tank + 0.18, 0]}>
        <coneGeometry args={[crewed ? 0.38 : 0.28, 0.58, 24]} />
        <meshStandardMaterial color={crewed ? "#EAF2FF" : "#087BFF"} emissive={crewed ? "#000" : "#087BFF"} emissiveIntensity={crewed ? 0 : 0.25} />
      </mesh>
      <mesh position={[0, -0.58, 0]}>
        <cylinderGeometry args={[heavy ? 0.3 : 0.18, heavy ? 0.36 : 0.24, 0.38, 16]} />
        <meshStandardMaterial color="#FF2638" emissive="#FF2638" emissiveIntensity={0.35} />
      </mesh>
      {booster &&
        [-0.58, 0.58].map((x) => (
          <mesh key={x} position={[x, 0.05, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 0.9, 12]} />
            <meshStandardMaterial color="#8e98a6" metalness={0.4} roughness={0.45} />
          </mesh>
        ))}
      {solar &&
        [-0.95, 0.95].map((x) => (
          <mesh key={x} position={[x, tank * 0.35, 0]}>
            <boxGeometry args={[0.85, 0.03, 0.38]} />
            <meshStandardMaterial color="#087BFF" emissive="#087BFF" emissiveIntensity={0.4} />
          </mesh>
        ))}
      {dish && (
        <mesh position={[0.34, tank * 0.55, 0.2]} rotation={[0.4, 0, 0.6]}>
          <cylinderGeometry args={[0.16, 0.16, 0.03, 16]} />
          <meshStandardMaterial color="#00D9FF" emissive="#00D9FF" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  );
}

export function HangarView({ selection }: { selection: Selection }) {
  return (
    <Canvas camera={{ position: [3.4, 1.8, 4.2], fov: 38 }} dpr={[1, 1.5]}>
      <color attach="background" args={["#070b14"]} />
      <ambientLight intensity={0.28} />
      <spotLight position={[4, 7, 3]} intensity={24} color="#087BFF" angle={0.45} penumbra={0.7} />
      <pointLight position={[-2.4, 0.4, 2]} intensity={6} color="#FF2638" />
      <Stars radius={30} depth={12} count={400} factor={2} fade speed={0.15} />
      <HangarShip selection={selection} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#0a101c" metalness={0.45} roughness={0.55} />
      </mesh>
      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.7} minDistance={3.2} maxDistance={8} />
    </Canvas>
  );
}

export function SafeScene({
  mission,
  progress,
  fallback,
  pitch = 0,
  yaw = 0,
  roll = 0,
  thrust = 0,
}: {
  mission: MissionId;
  progress: number;
  fallback: string;
  pitch?: number;
  yaw?: number;
  roll?: number;
  thrust?: number;
}) {
  return (
    <Boundary fallback={<div className="grid h-full place-items-center px-4 text-center text-sm text-ice/70">{fallback}</div>}>
      <MissionScene mission={mission} progress={progress} pitch={pitch} yaw={yaw} roll={roll} thrust={thrust} />
    </Boundary>
  );
}
