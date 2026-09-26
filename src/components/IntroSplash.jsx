import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';

const DRAW_MS = 2000;
const HOLD_MS = 900;
const FADE_MS = 750;

/* iPhone-style hello intro: thin script draws itself over a blurred
   colorful wallpaper, then fades into the site */
const IntroSplash = ({ onDone }) => {
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (leaving) return undefined;
        const id = window.setTimeout(() => setLeaving(true), DRAW_MS + HOLD_MS);
        return () => window.clearTimeout(id);
    }, [leaving]);

    useEffect(() => {
        if (!leaving) return undefined;
        const id = window.setTimeout(onDone, FADE_MS);
        return () => window.clearTimeout(id);
    }, [leaving, onDone]);

    return (
        <Box
            onClick={() => setLeaving(true)}
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                bgcolor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                opacity: leaving ? 0 : 1,
                transition: `opacity ${FADE_MS}ms ease`,
            }}
        >
            <style>{`
                @keyframes introReveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
            `}</style>

            {/* Dark luxury ambience matching the site */}
            <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0 }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '95vmin',
                        height: '95vmin',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.38) 0%, rgba(146, 64, 14, 0.16) 45%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
                    }}
                />
            </Box>

            {/* Filled script revealed like handwriting, start to end */}
            <Box
                sx={{
                    position: 'relative',
                    transform: 'rotate(-2deg)',
                    userSelect: 'none',
                    width: 'min(94vw, 880px)',
                    clipPath: 'inset(0 100% 0 0)',
                    animation: `introReveal ${DRAW_MS}ms ease-in-out 0.15s forwards`,
                }}
            >
                <svg
                    viewBox="0 0 900 260"
                    style={{ width: '100%', height: 'auto', overflow: 'visible', display: 'block', filter: 'drop-shadow(0 4px 30px rgba(0,0,0,0.45))' }}
                    role="img"
                    aria-label="perfume shop"
                >
                    <text
                        x="50%"
                        y="52%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="'Bulgaria', 'Segoe Script', cursive"
                        fontSize="150"
                        textLength="800"
                        lengthAdjust="spacingAndGlyphs"
                        fill="#ffffff"
                        stroke="#ffffff"
                        strokeWidth="2"
                        paintOrder="stroke"
                    >
                        perfume shop
                    </text>
                </svg>
            </Box>
        </Box>
    );
};

export default IntroSplash;
