import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Letter from "./Letter";

interface RotatingHeartProps {
  onDoubleTap: () => void;
}

function RotatingHeart({ onDoubleTap }: RotatingHeartProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Define the heart shape
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, 0, -0.5, 1.5, -2, 1.5);
    shape.bezierCurveTo(-3.5, 1.5, -3.5, -0.5, -3.5, -0.5);
    shape.bezierCurveTo(-3.5, -2, -1.5, -3.5, 0, -5);
    shape.bezierCurveTo(1.5, -3.5, 3.5, -2, 3.5, -0.5);
    shape.bezierCurveTo(3.5, -0.5, 3.5, 1.5, 2, 1.5);
    shape.bezierCurveTo(0.5, 1.5, 0, 0, 0, 0);
    return shape;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.2,
      bevelSegments: 2,
    }),
    [],
  );

  const geometry = useMemo(
    () => new THREE.ExtrudeGeometry(heartShape, extrudeSettings),
    [
      heartShape,
      extrudeSettings,
    ],
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "hotpink",
        roughness: 0.4,
        metalness: 0.6,
      }),
    [],
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
      scale={[0.5, 0.5, 0.5]} // Smaller for mobile
      onDoubleClick={onDoubleTap} // Trigger letter on double-tap
    />
  );
}

function Particles() {
  const count = 1000;

  // Create a custom round texture for particles
  const circleTexture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Generate positions in a sphere around the origin (where the heart is)
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 10 * (0.8 + 0.4 * Math.random()); // varied radius
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        map={circleTexture}
        alphaTest={0.5}
        transparent
        opacity={0.9}
      />
    </points>
  );
}

const App: React.FC = () => {
  const [isLetterOpen, setLetterOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [askFullscreen, setAskFullscreen] = useState(true);

  const handleCloseLetter = () => {
    setLetterOpen(false);
  };

  const handleDoubleTap = () => {
    setLetterOpen(true);
    setShowHint(false);
  };

  // Show hint after 10 seconds if letter hasn't been opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLetterOpen) {
        setShowHint(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLetterOpen]);

  // Request fullscreen when user gives permission
  const requestFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => console.warn(err));
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
    setAskFullscreen(false);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        position: "relative",
      }}
    >
      {askFullscreen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center",
          }}
        >
          <h2>Allow Fullscreen?</h2>
          <p>This experience is best viewed in fullscreen mode.</p>
          <button
            onClick={requestFullscreen}
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: "#ff4081",
              color: "white",
              marginTop: "20px",
            }}
          >
            Yes, take me fullscreen!
          </button>
        </div>
      )}
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight castShadow position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Environment preset="sunset" />
        </Suspense>
        <RotatingHeart onDoubleTap={handleDoubleTap} />
        <Particles />
        <OrbitControls enableZoom={false} autoRotate />
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
      {showHint && !isLetterOpen && (
        <div
          style={{
            position: "absolute",
            top: "5%",
            width: "100%",
            textAlign: "center",
            color: "white",
            fontSize: "1.2rem",
            fontWeight: "bold",
            textShadow: "1px 1px 3px #000",
          }}
        >
          double tap the heart
        </div>
      )}
      {isLetterOpen && <Letter onClose={handleCloseLetter} />}
    </div>
  );
};

export default App;
