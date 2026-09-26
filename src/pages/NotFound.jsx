import { Component, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';

const NotFoundScene = lazy(() => import('../components/3d/NotFoundScene'));

class SceneBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}

const NotFound = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();

    const fadeUp = {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: 'easeOut' },
    };

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                overflow: 'hidden',
                background: '#050506',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <SceneBoundary>
                <Suspense fallback={null}>
                    <Box sx={{ position: 'absolute', inset: 0 }}>
                        <NotFoundScene />
                    </Box>
                </Suspense>
            </SceneBoundary>

            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: 'radial-gradient(ellipse at center, rgba(5,5,6,0.35) 0%, rgba(5,5,6,0.78) 100%)',
                }}
            />

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    textAlign: 'center',
                    px: 2,
                    pt: { xs: 7, sm: 9, md: 8 },
                    pb: 6,
                    maxWidth: 720,
                    mx: 'auto',
                }}
            >
                <Motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    style={{ width: '100%' }}
                >
                    <Typography
                        component="span"
                        sx={{
                            display: 'block',
                            fontSize: { xs: '5.75rem', sm: '8rem', md: '10.5rem' },
                            fontWeight: 500,
                            fontFamily: `Georgia, 'Playfair Display', 'Times New Roman', serif`,
                            lineHeight: 1,
                            letterSpacing: '0.05em',
                            background: 'linear-gradient(180deg, #FFF6DC 0%, #F4D03F 38%, #D4AF37 68%, #9A7B24 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            userSelect: 'none',
                        }}
                    >
                        404
                    </Typography>
                </Motion.div>

                <Motion.div
                    {...fadeUp}
                    transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: 1.5, sm: 2.5 },
                            mt: 3.5,
                        }}
                    >
                        <Box sx={{ width: { xs: 40, sm: 72 }, height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.9), rgba(244,208,63,0.9))' }} />
                        <Typography
                            component="span"
                            sx={{
                                display: 'inline-block',
                                fontFamily: `Georgia, 'Playfair Display', 'Times New Roman', serif`,
                                fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
                                fontWeight: 500,
                                lineHeight: 1.35,
                                letterSpacing: '0.02em',
                                textIndent: isRTL ? '0.06em' : 0,
                                background: 'linear-gradient(180deg, #FFF6DC 0%, #F4D03F 55%, #D4AF37 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: 'drop-shadow(0 2px 16px rgba(212,175,55,0.28))',
                                direction: isRTL ? 'rtl' : 'ltr',
                            }}
                        >
                            {t('page404.subtitle')}
                        </Typography>
                        <Box sx={{ width: { xs: 40, sm: 72 }, height: '1.5px', background: 'linear-gradient(270deg, transparent, rgba(212,175,55,0.9), rgba(244,208,63,0.9))' }} />
                    </Box>
                </Motion.div>

                <Motion.div
                    {...fadeUp}
                    transition={{ duration: 0.8, delay: 0.24, ease: 'easeOut' }}
                >
                    <Typography
                        sx={{
                            color: 'rgba(255,255,255,0.55)',
                            fontSize: { xs: '0.9rem', sm: '0.98rem' },
                            mt: 2.5,
                            maxWidth: 440,
                            lineHeight: 1.8,
                            direction: isRTL ? 'rtl' : 'ltr',
                        }}
                    >
                        {t('page404.desc')}
                    </Typography>
                </Motion.div>

                <Motion.div
                    {...fadeUp}
                    transition={{ duration: 0.8, delay: 0.36, ease: 'easeOut' }}
                >
                    <Button
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            mt: 4.5,
                            py: 1.15,
                            px: { xs: 3.5, sm: 5 },
                            borderRadius: '100px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            letterSpacing: isRTL ? 0 : '0.12em',
                            textTransform: isRTL ? 'none' : 'uppercase',
                            color: '#D4AF37',
                            border: '1px solid rgba(212,175,55,0.55)',
                            background: 'rgba(212,175,55,0.04)',
                            backdropFilter: 'blur(6px)',
                            transition: 'all 0.35s ease',
                            '& .MuiButton-startIcon': { ml: isRTL ? 1.5 : 0, mr: isRTL ? 0 : 1.5 },
                            '&:hover': {
                                color: '#0a0a0a',
                                borderColor: '#D4AF37',
                                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 10px 30px rgba(212,175,55,0.35)',
                            },
                        }}
                    >
                        {t('page404.backHome')}
                    </Button>
                </Motion.div>
            </Box>
        </Box>
    );
};

export default NotFound;