'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Sculpture() {
  const group = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!group.current || !outer.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y += delta * 0.11;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * 0.13, 0.025);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -state.pointer.x * 0.14, 0.025);
    outer.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.012);
  });
  return <group ref={group} rotation={[0.3, -0.4, 0.2]}>
    <mesh ref={outer}>
      <icosahedronGeometry args={[2.05, 2]} />
      <meshPhysicalMaterial color="#91a8ff" metalness={0.42} roughness={0.25} transmission={0.32} thickness={1.2} transparent opacity={0.85} flatShading />
    </mesh>
    <mesh rotation={[0.48, 0.15, -0.42]}>
      <torusGeometry args={[2.48, 0.015, 8, 96]} />
      <meshBasicMaterial color="#a3b9ff" transparent opacity={0.68} />
    </mesh>
    <mesh rotation={[-0.48, 0.6, 0.36]}>
      <torusGeometry args={[2.34, 0.01, 8, 96]} />
      <meshBasicMaterial color="#e6d4ff" transparent opacity={0.48} />
    </mesh>
  </group>;
}

export default function HeroScene() {
  return <div className="hero-canvas" aria-hidden="true"><Suspense fallback={null}>
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}>
      <ambientLight intensity={1.5} />
      <pointLight position={[4, 3, 5]} intensity={36} color="#b3bfff" />
      <pointLight position={[-4, -3, 2]} intensity={24} color="#b1efff" />
      <Sculpture />
    </Canvas>
  </Suspense></div>;
}
