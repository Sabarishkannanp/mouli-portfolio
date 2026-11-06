"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";

function Hoverable({
  children,
  position,
  speed = 1.4,
}: {
  children: React.ReactNode;
  position: [number, number, number];
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = THREE.MathUtils.damp(g.scale.x, hover ? 1.22 : 1, 6, dt);
    g.scale.setScalar(s);
    g.rotation.y += dt * (hover ? 2.4 : 0.25);
  });
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={0.9}>
      <group
        ref={ref}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        {children}
      </group>
    </Float>
  );
}

function PenNib() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.62);
    s.bezierCurveTo(0.3, -0.25, 0.36, 0.1, 0.3, 0.42);
    s.lineTo(-0.3, 0.42);
    s.bezierCurveTo(-0.36, 0.1, -0.3, -0.25, 0, -0.62);
    const hole = new THREE.Path();
    hole.absarc(0, 0.05, 0.07, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 16 });
    g.center();
    return g;
  }, []);
  return (
    <group rotation={[0, 0, -0.5]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#7C5CFF" metalness={0.3} roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.26, 24]} />
        <meshPhysicalMaterial color="#5B3FE0" roughness={0.2} clearcoat={1} />
      </mesh>
    </group>
  );
}

function BezierTube() {
  const geo = useMemo(() => {
    const c = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-1.6, -0.2, 0),
      new THREE.Vector3(-0.6, 1.1, 0.3),
      new THREE.Vector3(0.5, -1.2, -0.2),
      new THREE.Vector3(1.6, 0.25, 0),
    );
    return { tube: new THREE.TubeGeometry(c, 64, 0.025, 8, false), a: c.v0, b: c.v3 };
  }, []);
  return (
    <group>
      <mesh geometry={geo.tube}>
        <meshStandardMaterial color="#FF4FD8" emissive="#B04FE8" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      {[geo.a, geo.b].map((v, i) => (
        <mesh key={i} position={v}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color="#F2F0FF" emissive="#7C5CFF" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.25, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.15, 3, dt);
    g.position.x = THREE.MathUtils.damp(g.position.x, state.pointer.x * 0.15, 3, dt);
  });
  return <group ref={ref}>{children}</group>;
}

function Objects() {
  const { viewport } = useThree();
  const hx = Math.min(viewport.width / 2 - 0.55, 2.4);
  const hy = Math.min(viewport.height / 2 - 0.5, 1.7);
  return (
    <Rig>
      <Hoverable position={[-hx, hy * 0.75, 0]}>
        <mesh>
          <sphereGeometry args={[0.48, 48, 48]} />
          <meshPhysicalMaterial color="#7C5CFF" roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} iridescence={0.6} />
        </mesh>
      </Hoverable>
      <Hoverable position={[hx, hy * 0.6, -0.3]} speed={1.1}>
        <mesh rotation={[1.1, 0.3, 0]}>
          <torusGeometry args={[0.42, 0.16, 24, 64]} />
          <meshPhysicalMaterial color="#FF4FD8" roughness={0.15} clearcoat={1} iridescence={0.4} />
        </mesh>
      </Hoverable>
      <Hoverable position={[-hx * 0.95, -hy * 0.55, 0.2]} speed={1.7}>
        <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.12} smoothness={4} rotation={[0.5, 0.6, 0]}>
          <meshPhysicalMaterial
            color="#3DF5FF"
            roughness={0.05}
            transmission={1}
            thickness={0.6}
            ior={1.4}
            clearcoat={1}
            attenuationColor="#3DF5FF"
            attenuationDistance={1.2}
          />
        </RoundedBox>
      </Hoverable>
      <Hoverable position={[hx * 0.95, -hy * 0.5, 0.1]} speed={1.3}>
        <PenNib />
      </Hoverable>
      <Float speed={1} floatIntensity={0.5} rotationIntensity={0.2}>
        <group position={[0, -hy * 0.95, 0.4]} scale={0.8}>
          <BezierTube />
        </group>
      </Float>
    </Rig>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[-4, 2, 3]} color="#7C5CFF" intensity={40} />
      <pointLight position={[4, -1, 3]} color="#FF4FD8" intensity={35} />
      {/* local studio-style environment (no HDR download) */}
      <Environment resolution={128}>
        <Lightformer intensity={2.5} position={[0, 4, 2]} scale={[8, 2, 1]} />
        <Lightformer intensity={1.5} position={[-5, 0, 2]} scale={[2, 6, 1]} color="#B9A8FF" />
        <Lightformer intensity={1.5} position={[5, 0, 2]} scale={[2, 6, 1]} color="#FFB0EE" />
        <Lightformer intensity={0.8} position={[0, -4, 2]} scale={[8, 1, 1]} />
      </Environment>
      <Objects />
      <ContactShadows position={[0, -2.2, 0]} opacity={0.45} scale={10} blur={2.6} far={3} color="#2a1a5c" />
    </Canvas>
  );
}
