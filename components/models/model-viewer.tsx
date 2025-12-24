"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // 自动旋转
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Center>
      <primitive ref={modelRef} object={scene} />
    </Center>
  );
}

export function ModelViewer({ modelUrl, className = "" }: ModelViewerProps) {
  return (
    <div className={`w-full h-full min-h-[300px] bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={<Loader />}>
          <Model url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={1}
          maxDistance={100}
        />
      </Canvas>
    </div>
  );
}

// 带控制面板的查看器
export function ModelViewerWithControls({
  modelUrl,
  className = "",
}: ModelViewerProps) {
  return (
    <div className={`relative ${className}`}>
      <ModelViewer modelUrl={modelUrl} className="h-[400px]" />

      {/* 控制提示 */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-2 rounded-lg">
        <p>鼠标左键：旋转</p>
        <p>鼠标右键：平移</p>
        <p>滚轮：缩放</p>
      </div>
    </div>
  );
}
