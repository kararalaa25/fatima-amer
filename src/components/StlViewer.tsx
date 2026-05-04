import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const [geom, setGeom] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    const loader = new STLLoader();
    loader.load(url, (g) => {
      g.center();
      g.computeVertexNormals();
      setGeom(g);
    });
  }, [url]);
  if (!geom) return null;
  return (
    <mesh geometry={geom} castShadow receiveShadow>
      <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

export function StlViewer({ url }: { url: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-slate-50 to-slate-100">
      <Canvas shadows camera={{ position: [0, 0, 100], fov: 40 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Model url={url} />
          </Stage>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}
