import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const PerfumeCard = ({ perfume, index }) => {
    const { t, i18n } = useTranslation();
    const navigate    = useNavigate();
    const isRTL       = i18n.language === 'ar';
    const displayName = perfume.translatedName?.[i18n.language] || perfume.name;

    const formattedNumber = (value) => {
        if (value == null) return '';

        return new Intl.NumberFormat(
            i18n.language === 'ar' ? 'ar-JO' : 'en-US'
        ).format(value);
    };

    return (
        <Zoom in timeout={index * 70}>
            <Box
                onClick={() => navigate(`/perfumes/${perfume.id}`)}
                sx={{
                    position: 'relative',
                    borderRadius: { xs: '16px', md: '21px' },
                    padding: '1.5px',
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'background .01s',
                }}
            >
                {/* CARD BODY */}
                <Box
                    sx={{
                        position: 'relative', zIndex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: { xs: '15px', md: '20px' },
                        overflow: 'hidden',
                        background: '#0A0A0A',
                        transition: 'transform .38s cubic-bezier(0.23,1,0.32,1), box-shadow .38s ease',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',

                        '&:hover': {
                            transform: { xs: 'translateY(-4px)', md: 'translateY(-7px)' },
                            boxShadow: `
                                inset 0 1px 0 rgba(212,175,55,0.18),
                                0 20px 50px rgba(0,0,0,0.6),
                                0 8px 32px rgba(212,175,55,0.10),
                                0 0 0 3px gold,  
                                0 0 10px 4px rgba(212,175,55,0.3)
                            `,
                        },
                    }}
                >
                    {/* IMAGE */}
                    <Box sx={{
                        position: 'relative',
                        height: { xs: 140, sm: 170, md: 190, lg: 210 },   
                        background: 'radial-gradient(ellipse at 50% 80%, rgba(212,175,55,0.10) 0%, transparent 70%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        p: { xs: 1.5, md: 2 },
                        overflow: 'hidden',
                        '&::after': {
                            content: '""', position: 'absolute',
                            bottom: 0, left: '8%', right: '8%', height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.22), transparent)',
                        },
                    }}>
                        <Box
                            component="img"
                            src={`${import.meta.env.VITE_API_BASE_URL}${perfume.primaryImageUrl}`}
                            alt={displayName}
                            sx={{
                                width: '100%', height: '100%', objectFit: 'contain',
                                transition: 'transform .5s cubic-bezier(0.23,1,0.32,1)',
                                filter: 'drop-shadow(0 8px 24px rgba(212,175,55,0.15))',
                            }}
                        />

                        {perfume.active && (
                            <Box sx={{
                                position: 'absolute', top: 10,
                                [isRTL ? 'right' : 'left']: 10,
                                px: { xs: 1.2, md: 1.5 },
                                py: { xs: 0.4, md: 0.5 },
                                borderRadius: '100px',
                                background: 'rgba(39,174,96,0.15)',
                                border: '1px solid rgba(74,222,128,0.25)',
                                color: '#4ade80',
                                fontSize: { xs: 9, md: 11 },
                                fontWeight: 700,
                                fontFamily: "'Montserrat', sans-serif",
                                letterSpacing: '0.06em',
                                backdropFilter: 'blur(8px)',
                            }}>
                                {t('perfume.card.available')}
                            </Box>
                        )}

                        <Box sx={{
                            position: 'absolute', bottom: 16,
                            [isRTL ? 'left' : 'right']: 10,
                            px: { xs: 1.2, md: 1.6 },
                            py: { xs: 0.4, md: 0.5 },
                            borderRadius: '100px',
                            background: 'rgba(0,0,0,0.7)',
                            border: '1px solid rgba(212,175,55,0.22)',
                            fontSize: { xs: 8, md: 10 },
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#D4AF37',
                            fontFamily: "'Montserrat', sans-serif",
                            backdropFilter: 'blur(8px)',
                        }}>
                            {perfume.brand}
                        </Box>
                    </Box>

                    {/* CONTENT */}
                    <Box sx={{
                        flexGrow: 1, display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: { xs: 1.2, sm: 1.5, md: 1.8 },
                    }}>
                        <Box sx={{ mb: { xs: 0.75, md: 1 } }}>
                            <Typography sx={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontWeight: 700,
                                /* responsive */
                                fontSize: { xs: '0.82rem', sm: '0.9rem', md: '1.05rem' },
                                lineHeight: 1.4,
                                color: 'rgba(255,255,255,0.90)',
                                mb: 0.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}>
                                {displayName}
                            </Typography>
                            {displayName !== perfume.name && (
                                <Typography sx={{
                                    fontSize: { xs: 9, md: 11 },
                                    color: 'rgba(255,255,255,0.30)',
                                    fontFamily: "'Montserrat', sans-serif",
                                }}>
                                    {perfume.name}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: { xs: 1, md: 1.5 },
                            gap: { xs: 0.75, md: 1 },
                        }}>
                            {/* PRICE */}
                            <Box>
                                <Typography sx={{
                                    fontSize: { xs: 8, md: 10 },
                                    color: 'rgba(255,255,255,0.50)',
                                    fontFamily: "'Montserrat', sans-serif",
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    mb: 0.3,
                                }}>
                                    {t('perfume.card.startingFrom')}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                                    <Typography sx={{
                                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                                        fontWeight: 900,
                                        fontFamily: "'Montserrat', sans-serif",
                                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        lineHeight: 1,
                                    }}>
                                        {formattedNumber(perfume.lowestPrice)}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: { xs: 9, md: 11 },
                                        color: 'rgba(255,255,255,0.50)',
                                        fontFamily: "'Montserrat', sans-serif",
                                    }}>
                                        {t('perfume.card.currency')}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* BUTTON */}
                            <Box sx={{
                                px: { xs: 1.2, sm: 1.5, md: 2 },
                                py: { xs: 0.65, md: 0.9 },
                                borderRadius: '100px',
                                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                color: '#0A0A0A',
                                display: 'flex', alignItems: 'center',
                                gap: { xs: 0.4, md: 0.6 },
                                fontSize: { xs: 9.5, sm: 10.5, md: 12 },
                                fontWeight: 800,
                                fontFamily: "'Montserrat', sans-serif",
                                letterSpacing: '0.04em',
                                whiteSpace: 'nowrap', flexShrink: 0,
                                boxShadow: '0 4px 16px rgba(212,175,55,0.40)',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    boxShadow: '0 6px 22px rgba(212,175,55,0.35)',
                                    transform: 'scale(1.04)',
                                    background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
                                },
                            }}>
                                <LocalOfferIcon sx={{ fontSize: { xs: 11, md: 13 } }} />
                                {t('perfume.card.viewDetails')}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Zoom>
    );
};

export default PerfumeCard;