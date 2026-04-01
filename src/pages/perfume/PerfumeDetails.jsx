import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { useGetPerfumeByIdQuery } from '../../redux/api/itemApi';
import { addToCart } from '../../redux/slices/cartSlice';
import { selectIsAuthenticated } from '../../redux/slices/authSlice';
import { handleSuccess, handleError } from '../../utils/toastHelper';
import { Box } from '@mui/material';
import { Button } from '@mui/material';
import { Chip } from '@mui/material';
import { Container } from '@mui/material';
import { Divider } from '@mui/material';
import { Fade } from '@mui/material';
import { IconButton } from '@mui/material';
import { Paper } from '@mui/material';
import { Skeleton } from '@mui/material';
import { Slide } from '@mui/material';
import { Stack } from '@mui/material';
import { Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

const IMAGE_COLUMN_MAX = { xs: 200, sm: 210, md: 220 };

const mainImageFrameSx = {
    width: '100%',
    maxWidth: IMAGE_COLUMN_MAX,
    mx: 'auto',
    aspectRatio: '3 / 4',
    maxHeight: { xs: 260, sm: 280, md: 300 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const MAIN_IMAGE_SX = {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'block',
};

const pageShellSx = {
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F4 50%, #EFEFEF 100%)',
    py: { xs: 2, sm: 3, md: 4 },
    px: { xs: 1, sm: 2 },
    position: 'relative',
    fontFamily: "'Playfair Display', 'Georgia', serif"
};

const goldBtnSx = {
    py: { xs: 1.1, md: 1.25 },
    fontWeight: 800,
    textTransform: 'none',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: { xs: '0.9rem', md: '0.95rem' },
    borderRadius: '12px',
    color: '#000',
    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    boxShadow: '0 4px 18px rgba(212,175,55,0.35)',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 28px rgba(212,175,55,0.45)',
    },
};

const chipSx = {
    color: '#fff',
    borderColor: 'rgba(212,175,55,0.45)',
    background: 'rgba(212,175,55,0.06)',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    fontSize: { xs: '0.72rem', sm: '0.75rem' },
    transition: 'all 0.25s ease',
    '&:hover': {
        borderColor: '#D4AF37',
        background: 'rgba(212,175,55,0.12)',
    },
};

const fontSans = (isRTL) =>
    isRTL
        ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
        : "'Montserrat', sans-serif";

const goldTitleUnderlineSx = (isRTL) => ({
    maxWidth: { xs: '100%', sm: isRTL ? 360 : 420, md: isRTL ? 480 : 520 },
    marginLeft: isRTL ? 'auto' : 0,
    marginRight: isRTL ? 0 : 'auto',
    height: { xs: 2, md: 3 },
    background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
    transform: isRTL ? 'scaleX(-1)' : 'none',
    mt: { xs: 0.75, md: 1 },
    borderRadius: 1,
    animation: 'lineGlow 3s ease-in-out infinite',
    '@keyframes lineGlow': {
        '0%, 100%': { opacity: 0.85 },
        '50%': { opacity: 1 },
    },
});

const labelRowSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    width: '100%',
    mb: 1.5,
};

const labelTextSx = (isRTL) => ({
    color: 'rgba(212,175,55,0.9)',
    fontWeight: 700,
    fontFamily: fontSans(isRTL),
    fontSize: '0.78rem',
    letterSpacing: isRTL ? 0 : '0.06em',
    textAlign: isRTL ? 'right' : 'left',
    flex: '0 1 auto',
    minWidth: { xs: '100%', sm: 140 },
});

const PerfumeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const { data, isLoading, isError } = useGetPerfumeByIdQuery(id);
    const perfume = data?.data;

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [qty, setQty] = useState(1);

    const displayName = perfume?.translatedName?.[i18n.language] || perfume?.name;
    const displayDescription =
        perfume?.description?.[i18n.language] || perfume?.description?.en || '';

    const translateType = (code) =>
        t(`perfumeDetails.enums.types.${code}`, { defaultValue: code });
    const translateSeason = (code) =>
        t(`perfumeDetails.enums.seasons.${code}`, { defaultValue: code });
    const translateSize = (code) =>
        t(`perfumeDetails.enums.sizes.${code}`, { defaultValue: code });

    const availableSizes = useMemo(
        () => (perfume?.availableSizes || []).filter((s) => s.available && s.quantity > 0),
        [perfume]
    );

    const selectedSizeObject = useMemo(
        () => availableSizes.find((s) => s.size === selectedSize) || null,
        [availableSizes, selectedSize]
    );

    const imageUrls = useMemo(() => {
        if (!perfume) return [];
        const list = perfume.imageUrls?.length ? perfume.imageUrls : [perfume.primaryImageUrl];
        return list.map((url) => `${import.meta.env.VITE_API_BASE_URL}${url}`);
    }, [perfume]);

    const formattedNumber = (value) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(value);

    const handleIncrease = () => {
        if (!selectedSizeObject) return;
        if (qty < selectedSizeObject.quantity) setQty((q) => q + 1);
    };

    const handleDecrease = () => {
        if (qty > 1) setQty((q) => q - 1);
    };

    const handleSelectSize = (sizeCode) => {
        setSelectedSize(sizeCode);
        setQty(1);
    };

    const handleAddToCart = () => {
        if (!perfume) return;

        if (!selectedSizeObject) {
            handleError(t('perfumeDetails.selectSizeFirst'));
            return;
        }

        dispatch(
            addToCart({
                id: `${perfume.id}-${selectedSizeObject.size}`,
                perfumeId: perfume.id,
                name: displayName,
                imageUrl: `${import.meta.env.VITE_API_BASE_URL}${perfume.primaryImageUrl}`,
                brand: perfume.brand,
                size: selectedSizeObject.size,
                price: selectedSizeObject.price,
                quantity: qty,
            })
        );

        handleSuccess(t('perfumeDetails.addedToCart'));
    };

    if (isLoading) {
        return (
            <Box sx={pageShellSx} dir={isRTL ? 'rtl' : 'ltr'}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Skeleton
                        variant="rounded"
                        height={52}
                        sx={{ mb: 2, borderRadius: '14px', bgcolor: 'rgba(0,0,0,0.06)' }}
                    />
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: { xs: '14px', md: '20px' },
                            border: '2px solid rgba(212,175,55,0.35)',
                            overflow: 'hidden',
                            background: 'linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%)',
                            p: { xs: 2, md: 3 },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'minmax(200px, 0.34fr) minmax(0, 1fr)' },
                                gap: 2,
                                direction: isRTL ? 'rtl' : 'ltr',
                            }}
                        >
                            <Skeleton
                                variant="rounded"
                                sx={{
                                    bgcolor: 'rgba(212,175,55,0.08)',
                                    borderRadius: '16px',
                                    width: '100%',
                                    maxWidth: IMAGE_COLUMN_MAX,
                                    mx: 'auto',
                                    aspectRatio: '3 / 4',
                                    maxHeight: { xs: 260, sm: 280, md: 300 },
                                }}
                            />
                            <Box>
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rounded"
                                        height={34}
                                        sx={{
                                            mb: 1.2,
                                            bgcolor: 'rgba(212,175,55,0.07)',
                                            borderRadius: '10px',
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (isError || !perfume) {
        return (
            <Box sx={pageShellSx} dir={isRTL ? 'rtl' : 'ltr'}>
                <Container
                    maxWidth="md"
                    sx={{ position: 'relative', zIndex: 1, py: 8, textAlign: 'center' }}
                >
                    <Fade in timeout={600}>
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 2,
                                    fontWeight: 700,
                                    color: '#1a1a1a',
                                    fontFamily: isRTL
                                        ? "'Noto Sans Arabic', Georgia, serif"
                                        : "'Playfair Display', serif",
                                }}
                            >
                                {t('perfumeDetails.notFound')}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/perfume')}
                                sx={{
                                    ...goldBtnSx,
                                    fontFamily: fontSans(isRTL),
                                }}
                            >
                                {t('perfumeDetails.backToList')}
                            </Button>
                        </Box>
                    </Fade>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={pageShellSx} dir={isRTL ? 'rtl' : 'ltr'}>
            <Container
                maxWidth="lg"
                sx={{ position: 'relative', zIndex: 1, px: { xs: 0.5, sm: 1, md: 2 } }}
            >
                <Fade in timeout={800}>
                    <Box>
                        <Slide direction="down" in timeout={900}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: { xs: 0.5, sm: 1, md: 1.5 },
                                    my: { xs: 1.5, sm: 2, md: 2.5 },
                                }}
                            >
                                <IconButton
                                    onClick={() => navigate('/perfume')}
                                    size="small"
                                    aria-label={t('perfumeDetails.backToList')}
                                    sx={{
                                        color: '#000',
                                        padding: { xs: '4px', sm: '5px', md: '6px' },
                                        transition: 'all 0.3s ease',
                                        flexShrink: 0,
                                        '&:hover svg': {
                                            color: '#D4AF37',
                                            transform: isRTL
                                                ? 'scale(1.2) rotate(10deg)'
                                                : 'scale(1.2) rotate(-10deg)',
                                        },
                                    }}
                                >
                                    {isRTL ? (
                                        <ArrowForwardIcon
                                            sx={{
                                                transition: 'all 0.3s ease',
                                                fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' },
                                            }}
                                        />
                                    ) : (
                                        <ArrowBackIcon
                                            sx={{
                                                transition: 'all 0.3s ease',
                                                fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' },
                                            }}
                                        />
                                    )}
                                </IconButton>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="h5"
                                        component="div"
                                        sx={{
                                            fontWeight: 800,
                                            color: '#000',
                                            lineHeight: 1.35,
                                            fontSize: { xs: '0.95rem', sm: '1.15rem', md: '1.3rem' },
                                            fontFamily: fontSans(isRTL),
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            animation: 'titleFromTop 0.7s ease both',
                                            '@keyframes titleFromTop': {
                                                from: { opacity: 0, transform: 'translateY(-14px)' },
                                                to: { opacity: 1, transform: 'translateY(0)' },
                                            },
                                        }}
                                    >
                                        <Box component="span" sx={{ color: '#000' }}>
                                            {t('perfumeDetails.detailsLabel')}
                                        </Box>{' '}
                                        <Box component="span" sx={{ color: '#D4AF37' }}>
                                            — {displayName}
                                        </Box>
                                    </Typography>
                                    <Box sx={goldTitleUnderlineSx(isRTL)} />
                                </Box>
                            </Box>
                        </Slide>

                        <Slide direction="up" in timeout={950}>
                            <Paper
                                elevation={0}
                                sx={{
                                    background: 'linear-gradient(145deg, #0c0c0c 0%, #1a1a1a 100%)',
                                    border: {
                                        xs: '1.5px solid rgba(212,175,55,0.5)',
                                        md: '2px solid #D4AF37',
                                    },
                                    borderRadius: { xs: '16px', md: '22px' },
                                    overflow: 'hidden',
                                    boxShadow:
                                        '0 24px 64px rgba(0,0,0,0.2), 0 0 48px rgba(212,175,55,0.06)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundImage:
                                            'radial-gradient(circle at 80% 15%, rgba(212,175,55,0.08) 0%, transparent 55%)',
                                        pointerEvents: 'none',
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            md: 'minmax(200px, 0.34fr) minmax(0, 1fr)',
                                        },
                                        gap: { xs: 2, md: 3 },
                                        p: { xs: 2, sm: 2.5, md: 3.25 },
                                        direction: isRTL ? 'rtl' : 'ltr',
                                        alignItems: 'start',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            minWidth: 0,
                                            width: '100%',
                                            maxWidth: IMAGE_COLUMN_MAX,
                                            mx: 'auto',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                borderRadius: '18px',
                                                overflow: 'hidden',
                                                background: 'linear-gradient(160deg, #141414, #0a0a0a)',
                                                border: '1px solid rgba(212,175,55,0.15)',
                                                mb: 1.25,
                                                ...mainImageFrameSx,
                                            }}
                                        >
                                            <Fade in key={activeImage} timeout={450}>
                                                <Box
                                                    component="img"
                                                    src={imageUrls[activeImage]}
                                                    alt={displayName}
                                                    sx={MAIN_IMAGE_SX}
                                                />
                                            </Fade>
                                        </Box>

                                        <Stack
                                            direction="row"
                                            sx={{
                                                width: '100%',
                                                maxWidth: IMAGE_COLUMN_MAX,
                                                mx: 'auto',
                                                pb: 0.5,
                                                pt: 0.5,
                                                flexDirection: isRTL ? 'row-reverse' : 'row',
                                                justifyContent: 'center',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                            }}
                                        >
                                            {imageUrls.map((img, idx) => (
                                                <Box
                                                    key={`${img}-${idx}`}
                                                    component="img"
                                                    src={img}
                                                    alt=""
                                                    onClick={() => setActiveImage(idx)}
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        objectFit: 'cover',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        border:
                                                            idx === activeImage
                                                                ? '2px solid #D4AF37'
                                                                : '1px solid rgba(255,255,255,0.14)',
                                                        opacity: idx === activeImage ? 1 : 0.72,
                                                        transition:
                                                            'opacity 0.28s ease, border-color 0.28s ease, transform 0.28s ease',
                                                        '&:hover': {
                                                            opacity: 1,
                                                            borderColor: 'rgba(212,175,55,0.65)',
                                                            transform: 'scale(1.06)',
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minWidth: 0,
                                            textAlign: isRTL ? 'right' : 'left',
                                            animation: 'bodyFromBottom 0.75s ease both',
                                            '@keyframes bodyFromBottom': {
                                                from: { opacity: 0, transform: 'translateY(18px)' },
                                                to: { opacity: 1, transform: 'translateY(0)' },
                                            },
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: 'rgba(255,255,255,0.55)',
                                                mb: 0.5,
                                                fontFamily: fontSans(isRTL),
                                                fontSize: '0.82rem',
                                                fontWeight: 600,
                                                letterSpacing: isRTL ? '0' : '0.12em',
                                                textTransform: isRTL ? 'none' : 'uppercase',
                                            }}
                                        >
                                            {perfume.brand}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: '#fff',
                                                fontWeight: 800,
                                                mb: 0.75,
                                                fontSize: { xs: '1.35rem', md: '1.75rem' },
                                                lineHeight: 1.35,
                                                fontFamily: isRTL
                                                    ? "'Noto Sans Arabic', 'Playfair Display', serif"
                                                    : "'Playfair Display', serif",
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {displayName}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: 'rgba(255,255,255,0.82)',
                                                mb: 1.5,
                                                fontFamily: isRTL
                                                    ? "'Noto Sans Arabic', 'Cormorant Garamond', Georgia, serif"
                                                    : "'Cormorant Garamond', Georgia, serif",
                                                fontSize: { xs: '1rem', md: '1.1rem' },
                                                maxHeight: { xs: 'none', md: 260 }
                                            }}
                                        >
                                            {displayDescription}
                                        </Typography>

                                        <Box sx={labelRowSx}>
                                            <Typography component="div" sx={labelTextSx(isRTL)}>
                                                {t('perfumeDetails.typeLabel')}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                sx={{
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    flex: '1 0 100%',
                                                    mt: 0.5
                                                }}
                                            >
                                                <Chip
                                                    label={translateType(perfume.perfumeType)}
                                                    variant="outlined"
                                                    sx={{
                                                        ...chipSx,
                                                        borderColor: 'rgba(212,175,55,0.55)',
                                                        background: 'rgba(212,175,55,0.1)',
                                                        fontFamily: fontSans(isRTL),
                                                    }}
                                                />
                                            </Stack>
                                        </Box>

                                        <Box sx={labelRowSx}>
                                            <Typography component="div" sx={labelTextSx(isRTL)}>
                                                {t('perfumeDetails.seasonsLabel')}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                sx={{
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    flex: '1 0 100%',
                                                    mt: 0.5
                                                }}
                                            >
                                                {(perfume.perfumeSeason || []).map((season) => (
                                                    <Chip
                                                        key={season}
                                                        label={translateSeason(season)}
                                                        variant="outlined"
                                                        sx={{ ...chipSx, fontFamily: fontSans(isRTL) }}
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>

                                        <Divider sx={{ borderColor: 'rgba(212,175,55,0.2)', my: 0.5 }} />

                                        <Box sx={{ ...labelRowSx, mb: 1.25 }}>
                                            <Typography
                                                component="div"
                                                sx={{
                                                    ...labelTextSx(isRTL),
                                                    color: '#D4AF37',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {t('perfumeDetails.chooseSize')}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                sx={{
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    flex: '1 0 100%',
                                                    mt: 0.5
                                                }}
                                            >
                                                {availableSizes.map((s) => (
                                                    <Button
                                                        key={s.size}
                                                        onClick={() => handleSelectSize(s.size)}
                                                        variant={
                                                            selectedSize === s.size ? 'contained' : 'outlined'
                                                        }
                                                        sx={{
                                                            borderRadius: '12px',
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontFamily: fontSans(isRTL),
                                                            minWidth: 92,
                                                            borderColor: '#D4AF37',
                                                            color:
                                                                selectedSize === s.size ? '#000' : '#D4AF37',
                                                            background:
                                                                selectedSize === s.size
                                                                    ? 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)'
                                                                    : 'transparent',
                                                            '&:hover': {
                                                                borderColor: '#F4D03F',
                                                                background:
                                                                    selectedSize === s.size
                                                                        ? 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)'
                                                                        : 'rgba(212,175,55,0.12)',
                                                            },
                                                        }}
                                                    >
                                                        {translateSize(s.size)}
                                                    </Button>
                                                ))}
                                            </Stack>
                                        </Box>

                                        {selectedSizeObject && (
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: '1fr',
                                                        sm: 'repeat(3, minmax(0, 1fr))',
                                                    },
                                                    gap: 1.25,
                                                    mb: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: '14px',
                                                        border: '1px solid rgba(212,175,55,0.28)',
                                                        background:
                                                            'linear-gradient(145deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.2) 100%)',
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: 'rgba(255,255,255,0.5)',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700,
                                                            mb: 0.5,
                                                            fontFamily: fontSans(isRTL),
                                                        }}
                                                    >
                                                        {t('perfumeDetails.priceLabel')}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            color: '#D4AF37',
                                                            fontWeight: 800,
                                                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                                            fontFamily: fontSans(isRTL),
                                                            lineHeight: 1.2,
                                                        }}
                                                        dir="ltr"
                                                    >
                                                        {formattedNumber(selectedSizeObject.price)}
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                color: 'rgba(255,255,255,0.55)',
                                                                fontWeight: 600,
                                                                fontSize: '0.85em',
                                                                ml: 0.5,
                                                            }}
                                                        >
                                                            {t('perfumeDetails.currency')}
                                                        </Box>
                                                    </Typography>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: '14px',
                                                        border: '1px solid rgba(255,255,255,0.12)',
                                                        background: 'rgba(255,255,255,0.03)',
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: 'rgba(255,255,255,0.5)',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700,
                                                            mb: 0.5,
                                                            fontFamily: fontSans(isRTL),
                                                        }}
                                                    >
                                                        {t('perfumeDetails.stock')}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            color: '#fff',
                                                            fontWeight: 800,
                                                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                                            fontFamily: fontSans(isRTL),
                                                            lineHeight: 1.2,
                                                        }}
                                                        dir="ltr"
                                                    >
                                                        {formattedNumber(selectedSizeObject.quantity)}
                                                    </Typography>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: '14px',
                                                        border: '1px solid rgba(212,175,55,0.35)',
                                                        background: 'rgba(212,175,55,0.06)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'stretch',
                                                        justifyContent: 'center',
                                                        minHeight: 88,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: 'rgba(255,255,255,0.55)',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700,
                                                            mb: 0.75,
                                                            fontFamily: fontSans(isRTL),
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {t('perfumeDetails.quantity')}
                                                    </Typography>
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        spacing={0}
                                                        sx={{
                                                            direction: 'ltr',
                                                            border: '1px solid rgba(255,255,255,0.22)',
                                                            borderRadius: '12px',
                                                            px: 0.5,
                                                            py: 0.25,
                                                            bgcolor: 'rgba(0,0,0,0.25)',
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={handleDecrease}
                                                            size="small"
                                                            sx={{
                                                                color: '#fff',
                                                                '&:hover': {
                                                                    background: 'rgba(212,175,55,0.15)',
                                                                    color: '#D4AF37',
                                                                },
                                                            }}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography
                                                            sx={{
                                                                minWidth: 36,
                                                                textAlign: 'center',
                                                                color: '#fff',
                                                                fontWeight: 800,
                                                                fontFamily: fontSans(isRTL),
                                                                fontSize: '1.05rem',
                                                                fontVariantNumeric: 'tabular-nums',
                                                            }}
                                                            component="span"
                                                        >
                                                            {qty}
                                                        </Typography>
                                                        <IconButton
                                                            onClick={handleIncrease}
                                                            size="small"
                                                            sx={{
                                                                color: '#fff',
                                                                '&:hover': {
                                                                    background: 'rgba(212,175,55,0.15)',
                                                                    color: '#D4AF37',
                                                                },
                                                            }}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </Box>
                                            </Box>
                                        )}

                                        <Button
                                            startIcon={<AddShoppingCartIcon />}
                                            onClick={handleAddToCart}
                                            fullWidth
                                            sx={{
                                                ...goldBtnSx,
                                                flexDirection: isRTL ? 'row-reverse' : 'row',
                                                fontFamily: fontSans(isRTL),
                                                gap: 1,
                                            }}
                                        >
                                            {t('perfumeDetails.addToCart')}
                                        </Button>

                                        {!isAuthenticated && (
                                            <Typography
                                                sx={{
                                                    mt: 1.25,
                                                    color: 'rgba(255,255,255,0.55)',
                                                    fontSize: '0.82rem',
                                                    fontFamily: fontSans(isRTL),
                                                    lineHeight: 1.7,
                                                }}
                                            >
                                                {t('perfumeDetails.guestCouponHint')}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        </Slide>
                    </Box>
                </Fade>
            </Container>

            <ToastContainer />
        </Box>
    );
};

export default PerfumeDetails;