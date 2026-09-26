import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, Lightformer, Sparkles, useGLTF } from '@react-three/drei';

const PerfumeBottle = () => {
    const { scene } = useGLTF('/models/perfume.glb');
    return <primitive object={scene} scale={2.2} position={[0, -1.35, 0]} />;
};

const Turntable = ({ children, speed = 0.35 }) => {
    const ref = useRef();
    useFrame((_, delta) => {
        if (!ref.current) return;
        ref.current.rotation.y += delta * speed;
    });
    return <group ref={ref}>{children}</group>;
};

const NotFoundScene = () => {
    return (
        <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.25, 5.6], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
            <fog attach="fog" args={['#0a0a0a', 8, 14]} />

            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 7, 5]} intensity={1.2} />
            <pointLight position={[-4, -1, 4]} intensity={0.6} color="#D4AF37" />
            <pointLight position={[3, 3, 3]} intensity={0.5} color="#F4D03F" />

            <Suspense fallback={null}>
                <Turntable>
                    <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.5}>
                        <PerfumeBottle />
                    </Float>
                </Turntable>

                <Sparkles count={90} scale={[9, 5, 8]} size={3.5} speed={0.4} color="#F4D03F" opacity={1} />

                <Environment resolution={128}>
                    <Lightformer form="rect" intensity={6} position={[0, 4, -7]} scale={[10, 8, 1]} color="#D4AF37" />
                    <Lightformer form="circle" intensity={5} position={[-5, 1, -1]} scale={2.5} color="#ffffff" />
                    <Lightformer form="circle" intensity={3.5} position={[4, 2, 2]} scale={2} color="#F4D03F" />
                </Environment>

                <ContactShadows position={[0, -2.56, 0]} opacity={0.55} scale={9} blur={2.6} far={3.5} color="#000000" frames={1} />
            </Suspense>
        </Canvas>
    );
};

export default NotFoundScene;