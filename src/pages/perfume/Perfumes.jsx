import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useGetActivePerfumesQuery,
    useLazySearchPublicPerfumesQuery,
} from '../../redux/api/itemApi';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import SpaIcon from '@mui/icons-material/Spa';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import PerfumeFilters from '../../components/perfume/PerfumeFilters';
import PerfumeCard from '../../components/perfume/PerfumeCard';

/* Card Skeleton */
const PerfumeCardSkeleton = ({ index }) => (
    <Box
        sx={{
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            animation: `skeletonPulse 1.6s ease-in-out ${index * 0.08}s infinite alternate`,
            '@keyframes skeletonPulse': {
                from: { opacity: 0.35 },
                to: { opacity: 0.75 },
            },
        }}
    >
        <Skeleton
            variant="rectangular"
            height={270}
            sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
        />
        <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="65%" height={28} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Skeleton variant="text" width="40%" height={22} sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.04)' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                <Skeleton variant="text" width="30%" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)' }} />
                <Skeleton variant="rectangular" width={110} height={38} sx={{ borderRadius: '100px', bgcolor: 'rgba(212,175,55,0.07)' }} />
            </Box>
        </Box>
    </Box>
);

/* Custom Pagination */
const LuxuryPagination = ({ totalPages, currentPage, onChange, isRTL, t }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            const dist = Math.abs(currentPage - i);
            if (i === 1 || i === totalPages || dist <= 1) {
                pages.push(i);
            } else if (dist === 2) {
                pages.push('...');
            }
        }
        return pages.filter((p, idx, arr) => !(p === '...' && arr[idx - 1] === '...'));
    };

    const pages = getPageNumbers();

    const arrowStyle = (disabled) => ({
        width: { xs: 36, sm: 44 },
        height: { xs: 36, sm: 44 },
        borderRadius: '50%',
        border: '1.5px solid rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        color: '#222',
        fontSize: { xs: '0.8rem', sm: '1rem' },
        transition: 'all 0.25s ease',
        '&:hover': disabled
            ? {}
            : {
                background: 'rgba(244,208,63,0.15)',
                borderColor: '#F4D03F',
                transform: 'scale(1.1)',
            },
    });

    return (
        <Fade in>
            <Box
                sx={{
                    mt: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 2 },
                    }}
                >
                    {/* Prev Arrow */}
                    <Box
                        onClick={() => currentPage > 1 && onChange(currentPage - 1)}
                        sx={arrowStyle(currentPage === 1)}
                    >
                        {isRTL ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                    </Box>

                    {/* Page Numbers */}
                    {pages.map((p, idx) =>
                        p === '...' ? (
                            <Typography
                                key={`dots-${idx}`}
                                sx={{
                                    // color: 'rgba(0,0,0,0.3)',
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                }}
                            >
                                ···
                            </Typography>
                        ) : (
                            <Box
                                key={p}
                                onClick={() => onChange(p)}
                                sx={{
                                    minWidth: p === currentPage ? { xs: 36, sm: 44 } : { xs: 32, sm: 40 },
                                    height: p === currentPage ? { xs: 36, sm: 44 } : { xs: 32, sm: 40 },
                                    borderRadius: p === currentPage ? '12px' : '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontWeight: p === currentPage ? 700 : 500,
                                    fontSize: p === currentPage ? { xs: '0.85rem', sm: '1rem' } : { xs: '0.75rem', sm: '0.88rem' },
                                    transition: 'all 0.25s ease',
                                    ...(p === currentPage
                                        ? {
                                            background: '#F4D03F',
                                            color: '#000',
                                            boxShadow: '0 4px 12px rgba(244,208,63,0.4)',
                                        }
                                        : {
                                            border: '1px solid rgba(0,0,0,0.15)',
                                            color: '#222',
                                            '&:hover': {
                                                border: '1px solid #F4D03F',
                                                color: '#F4D03F',
                                                background: 'rgba(244,208,63,0.15)',
                                            },
                                        }),
                                }}
                            >
                                {p}
                            </Box>
                        )
                    )}

                    {/* Next Arrow */}
                    <Box
                        onClick={() => currentPage < totalPages && onChange(currentPage + 1)}
                        sx={arrowStyle(currentPage === totalPages)}
                    >
                        {isRTL ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                    </Box>
                </Box>

                {/* Page Counter */}
                <Typography
                    sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        letterSpacing: '0.15em',
                        color: 'rgba(0,0,0,0.8)',
                    }}
                >
                    {t('perfume.page')} {currentPage} {t('perfume.of')} {totalPages}
                </Typography>
            </Box>
        </Fade>
    );
};

/* Main Page */
const Perfumes = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [perfumeType, setPerfumeType] = useState('');
    const [perfumeSeason, setPerfumeSeason] = useState('');

    const { data: perfumesResponse, isLoading } = useGetActivePerfumesQuery(
        {
            page,
            size,
            perfumeType: perfumeType || undefined,
            perfumeSeason: perfumeSeason || undefined,
        },
        { skip: searchTerm.length > 0 }
    );

    const [triggerSearch, { data: searchResponse, isLoading: isSearching }] =
        useLazySearchPublicPerfumesQuery();

    const activeData = searchTerm ? searchResponse : perfumesResponse;
    const perfumes = activeData?.data?.content || [];
    const totalPages = activeData?.data?.page.totalPages || 0;
    const isLoadingData = isLoading || isSearching;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setPage(0);
            triggerSearch({ keyword: searchTerm, page: 0, size });
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPage(0);
    };

    const handlePageChange = (newPage) => {
        const zeroPage = newPage - 1;
        setPage(zeroPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (searchTerm) {
            triggerSearch({ keyword: searchTerm, page: zeroPage, size });
        }
    };

    const handleTypeChange = (value) => {
        setPerfumeType(value);
        setPage(0);
    };

    const handleSeasonChange = (value) => {
        setPerfumeSeason(value);
        setPage(0);
    };

    const formattedNumber = (value) => {
        if (value == null) return '';

        return new Intl.NumberFormat(
            i18n.language === 'ar' ? 'ar-JO' : 'en-US'
        ).format(value);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                fontFamily: "'Playfair Display', 'Georgia', serif",
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'fixed',
                    inset: 0,
                    background: `
                        radial-gradient(ellipse 80% 60% at 20% 10%, rgba(212,175,55,0.07) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 40% at 80% 90%, rgba(212,175,55,0.05) 0%, transparent 60%)
                    `,
                    pointerEvents: 'none',
                    zIndex: 0,
                },
            }}
        >
            {/* HERO */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 8, md: 12 },
                    background: "#000",
                    px: 2,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(212, 175, 55, 0.70) 0%, transparent 60%)',
                    }
                }}
            >

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Eyebrow */}
                    <Fade in timeout={400}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 3,
                                    py: 1,
                                    border: '1px solid rgba(212,175,55,0.3)',
                                    borderRadius: '100px',
                                    background: 'rgba(212,175,55,0.05)',
                                    backdropFilter: 'blur(12px)',
                                    mb: 2,
                                    animation: 'fadeSlideDown 0.7s ease both',
                                    '@keyframes fadeSlideDown': {
                                        from: { opacity: 0, transform: 'translateY(-18px)' },
                                        to: { opacity: 1, transform: 'translateY(0)' },
                                    },
                                }}
                            >
                                <SpaIcon sx={{ fontSize: 13, color: '#D4AF37' }} />
                                <Typography
                                    sx={{
                                        color: '#D4AF37',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.22em',
                                        textTransform: 'uppercase',
                                        fontFamily: "'Montserrat', sans-serif",
                                    }}
                                >
                                    {t('perfume.collection')}
                                </Typography>
                            </Box>
                        </Box>
                    </Fade>

                    {/* Main title */}
                    <Fade in timeout={600}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 900,
                                    fontSize: { xs: '3rem', sm: '4.5rem', md: '6.5rem' },
                                    letterSpacing: '-2px',
                                    mb: 2,
                                    background:
                                        'linear-gradient(160deg, #FFFFFF 0%, #D4AF37 40%, #FFFFFF 80%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundSize: '200% 200%',
                                    animation: 'shimmer 5s ease infinite',
                                    '@keyframes shimmer': {
                                        '0%': { backgroundPosition: '0% 50%' },
                                        '50%': { backgroundPosition: '100% 50%' },
                                        '100%': { backgroundPosition: '0% 50%' },
                                    },
                                }}
                            >
                                {t('perfume.heroTitle')}
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                                    color: 'rgba(255,255,255,0.5)',
                                    maxWidth: 560,
                                    mx: 'auto',
                                    lineHeight: 1.9,
                                    fontStyle: 'italic',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {t('perfume.heroSubtitle')}
                            </Typography>
                        </Box>
                    </Fade>

                    {/* Filters */}
                    <Fade in timeout={900}>
                        <Box>
                            <PerfumeFilters
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                onSearchSubmit={handleSearchSubmit}
                                onClearSearch={handleClearSearch}
                                perfumeType={perfumeType}
                                onTypeChange={handleTypeChange}
                                perfumeSeason={perfumeSeason}
                                onSeasonChange={handleSeasonChange}
                                disabled={!!searchTerm}
                            />
                        </Box>
                    </Fade>
                </Container>
            </Box>

            {/* GRID SECTION */}
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 8 } }}>

                {/* Results Info Bar */}
                {!isLoadingData && (
                    <Fade in>
                        <Box
                            sx={{
                                mb: 5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                                px: 0.5,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: '3px',
                                        background: 'linear-gradient(90deg, #D4AF37, transparent)',
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontFamily: "'Montserrat', sans-serif",
                                        fontSize: '0.78rem',
                                        letterSpacing: '0.14em',
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.38)',
                                    }}
                                >
                                    {searchTerm ? (
                                        <>
                                            <span style={{ color: '#D4AF37', fontSize: '1rem' }}>
                                                {t('perfume.searchResults')}{': '}
                                                "{searchTerm}"
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: '#D4AF37', fontSize: '1rem' }}>
                                                {formattedNumber(perfumes.length)}{' '}
                                                {t('perfume.perfumes')}
                                            </span>{' '}
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                    </Fade>
                )}

                {/* Cards Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, 240px)',
                        justifyContent: 'center',
                        gap: { xs: 2, md: 3 },
                    }}
                >
                    {isLoadingData ? (
                        [...Array(12)].map((_, i) => (
                            <PerfumeCardSkeleton key={i} index={i} />
                        ))
                    ) : perfumes.length === 0 ? (
                        <Box
                            sx={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                py: 16,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 130,
                                    height: 130,
                                    borderRadius: '50%',
                                    border: '1px solid rgba(212,175,55,0.65)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(212,175,55,0.04)',
                                    mx: 'auto',
                                    mb: 2,
                                    animation: 'floatEmpty 3.5s ease-in-out infinite',
                                    '@keyframes floatEmpty': {
                                        '0%, 100%': { transform: 'translateY(0)' },
                                        '50%': { transform: 'translateY(-14px)' },
                                    },
                                }}
                            >
                                <SpaIcon sx={{ fontSize: 60, color: 'rgba(212,175,55,0.65)' }} />
                            </Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    color: 'rgba(212,175,55,0.65)',
                                    mb: 2,
                                    fontStyle: 'italic',
                                }}
                            >
                                {t('perfume.noResults')}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'rgba(212,175,55,0.65)',
                                    fontSize: '1rem',
                                    fontFamily: "'Montserrat', sans-serif",
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {t('perfume.tryDifferentFilters')}
                            </Typography>
                        </Box>
                    ) : (
                        perfumes.map((perfume, index) => (
                            <PerfumeCard
                                key={perfume.id}
                                perfume={perfume}
                                index={index}
                            />
                        ))
                    )}
                </Box>

                {/* Pagination */}
                {!isLoadingData && (
                    <LuxuryPagination
                        totalPages={totalPages}
                        currentPage={page + 1}
                        onChange={handlePageChange}
                        isRTL={isRTL}
                        t={t}
                    />
                )}
            </Container>
        </Box>
    );
};

export default Perfumes;