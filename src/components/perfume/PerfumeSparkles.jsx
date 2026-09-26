import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import Box from '@mui/material/Box';

/* Golden sparkles — identical motion & design to the 404 scene.
   Shader-driven seamless drift (no loop seam, no respawn jumps).
   Split into its own chunk so three.js only loads with this component. */
const PerfumeSparkles = () => {
    const sizes = useMemo(() => Float32Array.from({ length: 90 }, () => 1.5 + Math.random() * 3.5), []);
    return (
        <Box
            aria-hidden="true"
            sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
            }}
        >
            <Canvas
                dpr={[1, 1.75]}
                camera={{ position: [0, 0, 6], fov: 50 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
                <Sparkles count={90} scale={[12, 5, 4]} size={sizes} speed={0.4} color="#F4D03F" opacity={1} />
            </Canvas>
        </Box>
    );
};

export default PerfumeSparkles;
