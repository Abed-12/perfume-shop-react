import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    useUpdatePerfumeByIDMutation,
    useAddPerfumeImageMutation,
    useUpdatePerfumeImageMutation,
    useDeletePerfumeImageMutation,
} from '../../../redux/api/adminApi';
import { useGetPerfumeByIdQuery } from '../../../redux/api/itemApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CategoryIcon from '@mui/icons-material/Category';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpaIcon from '@mui/icons-material/Spa';
import InventoryIcon from '@mui/icons-material/Inventory';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import TranslateIcon from '@mui/icons-material/Translate';
import InputAdornment from '@mui/material/InputAdornment';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../../../utils/toastHelper';
import ImageManager from '../../../components/perfume/ImageManager';

const PERFUME_TYPES = ['FEMALE', 'MALE', 'UNISEX'];
const PERFUME_SEASONS = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];
const PERFUME_SIZES = ['SIZE_50', 'SIZE_100'];

const extractImageId = (url) => {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 1], 10);
};

const labelSx = {
    fontSize: { xs: '0.68rem', sm: '0.72rem', md: '0.75rem' },
    fontWeight: 700,
    color: 'rgba(255,255,255,0.42)',
    mb: 0.7,
    mx: 0.5,
};

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        color: '#FFFFFF',
        fontSize: { xs: '0.82rem', sm: '0.88rem', md: '0.9rem' },
        '& input, & textarea': { color: '#FFFFFF', fontSize: 'inherit', py: { xs: '8px', sm: '10px' } },
        '& input::placeholder, & textarea::placeholder': { fontSize: { xs: '0.72rem', sm: '0.78rem', md: '0.8rem' } },
        '& fieldset': { borderColor: 'rgba(212,175,55,0.25)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: '2px' },
        '&.Mui-disabled': {
            '& input, & textarea': { WebkitTextFillColor: 'rgba(255,255,255,0.5)' },
            '& fieldset': { borderColor: 'rgba(212,175,55,0.1)' },
            backgroundColor: 'rgba(255,255,255,0.02)',
        },
    },
    '& .MuiSelect-icon': { color: '#D4AF37' },
    '& .MuiFormHelperText-root': { color: '#D4AF37', fontSize: { xs: '0.68rem', sm: '0.72rem', md: '0.75rem' }, marginLeft: '4px' },
    '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
    },
};

const goldBtnSx = {
    py: { xs: 0.8, sm: 1, md: 1.2 },
    px: { xs: 1.5, sm: 2, md: 3 },
    borderRadius: '10px',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.92rem' },
    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    color: '#000',
    boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
    transition: 'all 0.3s',
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
    },
    '&.Mui-disabled': {
        background: 'rgba(212,175,55,0.25)',
        color: 'rgba(0,0,0,0.45)',
    },
};

const menuProps = {
    PaperProps: {
        sx: {
            background: '#1a1a1a',
            border: '1px solid rgba(212,175,55,0.3)',
            '& .MuiMenuItem-root': {
                fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.9rem' },
                color: '#FFF',
                '&:hover': { backgroundColor: 'rgba(212,175,55,0.15)' },
                '&.Mui-selected': { backgroundColor: 'rgba(212,175,55,0.25)', color: '#D4AF37' },
            },
        },
    },
};

const DetailsSkeleton = () => (
    <Paper elevation={0} sx={{
        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
        border: '2px solid #D4AF37',
        borderRadius: { xs: '14px', sm: '16px', md: '20px' },
        overflow: 'hidden',
    }}>
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderBottom: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Skeleton variant="rounded" width={40} height={40} sx={{ bgcolor: 'rgba(212,175,55,0.1)', borderRadius: '11px', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="42%" height={24} sx={{ bgcolor: 'rgba(212,175,55,0.1)' }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Skeleton variant="rounded" width={60} height={20} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '20px' }} />
                    <Skeleton variant="rounded" width={44} height={20} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '20px' }} />
                </Box>
            </Box>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {[...Array(7)].map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={42} sx={{ bgcolor: 'rgba(212,175,55,0.07)', borderRadius: '10px', mb: 1.5 }} />
                    ))}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton variant="rounded" height={300} sx={{ bgcolor: 'rgba(212,175,55,0.07)', borderRadius: '15px' }} />
                </Grid>
            </Grid>
        </Box>
    </Paper>
);

const InfoRow = ({ icon, label, children }) => (
    <Box sx={{
        display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 1.5 }, py: { xs: 0.8, sm: 1 },
        borderBottom: '1px solid rgba(212,175,55,0.07)',
    }}>
        <Box sx={{ color: '#D4AF37', mt: 0.15, flexShrink: 0, opacity: 0.8, '& svg': { fontSize: { xs: '14px', sm: '16px', md: '17px' } } }}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.68rem', md: '0.7rem' }, color: 'rgba(255,255,255,0.37)', fontWeight: 700, mb: 0.4 }}>
                {label}
            </Typography>
            {children}
        </Box>
    </Box>
);

const SectionTitle = ({ children }) => (
    <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, my: { xs: 1.5, sm: 2 },
        '&::after': { content: '""', flex: 1, height: '1px', background: 'rgba(212,175,55,0.18)' },
    }}>
        <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, fontWeight: 700, color: '#D4AF37', whiteSpace: 'nowrap' }}>
            {children}
        </Typography>
    </Box>
);

const SectionHeader = ({ title, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: { xs: 1.5, sm: 2 }, gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }, fontWeight: 700, color: '#D4AF37', whiteSpace: 'nowrap' }}>
                {title}
            </Typography>
            <Box sx={{ flex: 1, height: '1px', background: 'rgba(212,175,55,0.18)' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
            {children}
        </Box>
    </Box>
);

const AdminPerfumeDetails = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();

    const { data: perfumeResponse, isLoading } = useGetPerfumeByIdQuery(id);
    const [updatePerfume, { isLoading: isSaving }] = useUpdatePerfumeByIDMutation();
    const [addImage] = useAddPerfumeImageMutation();
    const [updateImage] = useUpdatePerfumeImageMutation();
    const [deleteImage] = useDeletePerfumeImageMutation();

    const perfume = perfumeResponse?.data;

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingImages, setIsEditingImages] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        active: true,
        perfumeType: '',
        perfumeSeasons: [],
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        prices: [],
    });

    const [images, setImages] = useState([]);

    useEffect(() => {
        if (!perfume || isEditing) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            name: perfume.name || '',
            brand: perfume.brand || '',
            active: perfume.active,
            perfumeType: perfume.perfumeType || '',
            perfumeSeasons: Array.isArray(perfume.perfumeSeason) ? perfume.perfumeSeason : [],
            nameAr: perfume.translatedName?.ar || '',
            nameEn: perfume.translatedName?.en || '',
            descriptionAr: perfume.description?.ar || '',
            descriptionEn: perfume.description?.en || '',
            prices: (perfume.availableSizes || []).map(s => ({
                perfumeSize: s.size,
                price: s.price,
                quantity: s.quantity,
                note: '',
                isActive: s.available,
            })),
        });

        setImages(
            (perfume.imageUrls || []).map((url) => ({
                id: extractImageId(url),
                url: `${import.meta.env.VITE_API_BASE_URL}${url}`,
                isPrimary: url === perfume.primaryImageUrl,
            }))
        );
    }, [perfume, isEditing]);

    const handleFormChange = (field, value) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const handlePriceChange = (index, field, value) => {
        const updated = [...formData.prices];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, prices: updated }));
    };

    const addPrice = () =>
        setFormData(prev => ({
            ...prev,
            prices: [...prev.prices, { perfumeSize: '', price: '', quantity: '', note: '', isActive: true }],
        }));

    const removePrice = (index) =>
        setFormData(prev => ({ ...prev, prices: prev.prices.filter((_, i) => i !== index) }));

    const handleCancelEdit = () => setIsEditing(false);

    const validatePrices = () => {
        for (const p of formData.prices) {
            if (!p.perfumeSize) { handleError(t('admin.perfume.detail.selectSize')); return false; }
            if (!p.price || isNaN(p.price) || parseFloat(p.price) <= 0) { handleError(t('admin.perfume.detail.invalidPrice')); return false; }
            if (!p.quantity || isNaN(p.quantity) || parseInt(p.quantity) < 0) { handleError(t('admin.perfume.detail.invalidQty')); return false; }
        }
        return true;
    };

    const handleSave = async () => {
        if (!formData.name.trim()) { handleError(t('admin.perfume.detail.enterName')); return; }
        if (!validatePrices()) return;

        try {
            const body = {
                name: formData.name,
                brand: formData.brand,
                active: formData.active,
                perfumeType: formData.perfumeType,
                perfumeSeasons: formData.perfumeSeasons,
                translations: [
                    { locale: 'ar', name: formData.nameAr, description: formData.descriptionAr },
                    { locale: 'en', name: formData.nameEn, description: formData.descriptionEn },
                ],
                prices: formData.prices.map(p => ({
                    perfumeSize: p.perfumeSize,
                    price: parseFloat(p.price),
                    quantity: parseInt(p.quantity),
                    note: p.note || '',
                    isActive: p.isActive ?? true,
                })),
            };

            const response = await updatePerfume({ perfumeId: id, body }).unwrap();
            handleSuccess(response.message);
            setIsEditing(false);
        } catch (error) {
            handleError(error?.data?.message);
        }
    };

    const handleAddImage = async (file, isPrimary) => {
        try {
            const response = await addImage({ perfumeId: id, image: file, isPrimary }).unwrap();
            handleSuccess(response.message);
        } catch (error) {
            handleError(error?.data?.message);
        }
    };

    const handleDeleteImage = async (imageId, index) => {
        try {
            const response = await deleteImage({ perfumeId: id, imageId }).unwrap();
            setImages(prev => prev.filter((_, i) => i !== index));
            handleSuccess(response.message);
        } catch (error) {
            handleError(error?.data?.message);
        }
    };

    const handleReplaceImage = async (imageId, index, file, isPrimary) => {
        try {
            const response = await updateImage({ perfumeId: id, imageId, image: file, isPrimary }).unwrap();
            handleSuccess(response.message);
        } catch (error) {
            handleError(error?.data?.message);
        }
    };

    const handleCancelImageEdit = () => setIsEditingImages(false);

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)', py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
                <Container maxWidth="lg"><DetailsSkeleton /></Container>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)',
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 2 },
            position: 'relative',
            '&::before': {
                content: '""', position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 80% 15%, rgba(212,175,55,0.07) 0%, transparent 55%)',
                pointerEvents: 'none',
            },
        }}>
            <Container maxWidth="lg" disableGutters={false} sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
                <Fade in timeout={1000}>
                    <Box>

                        {/* Page Header */}
                        <Slide direction="down" in timeout={1000}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 1.5 }, my: { xs: 1.5, sm: 2, md: 3 } }}>
                                <IconButton
                                    onClick={() => navigate('/admin-panel/perfume')}
                                    size="small"
                                    sx={{
                                        color: '#000', padding: { xs: '4px', sm: '5px', md: '6px' }, transition: 'all 0.3s ease',
                                        '&:hover svg': {
                                            color: '#D4AF37',
                                            transform: isRTL ? 'scale(1.2) rotate(10deg)' : 'scale(1.2) rotate(-10deg)',
                                        },
                                    }}
                                >
                                    {isRTL
                                        ? <ArrowForwardIcon sx={{ transition: 'all 0.3s ease', fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' } }} />
                                        : <ArrowBackIcon sx={{ transition: 'all 0.3s ease', fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' } }} />
                                    }
                                </IconButton>
                                <Box>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 800, color: '#000', lineHeight: 1.1,
                                        fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                                    }}>
                                        {t('admin.perfume.detail.details')}{' '}
                                        <span style={{ color: '#D4AF37' }}>{perfume?.name}</span>
                                    </Typography>
                                    <Box sx={{
                                        width: { xs: '100%', sm: isRTL ? 300 : 380, md: isRTL ? 400 : 500 },
                                        height: { xs: 2, md: 3 },
                                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                        mt: { xs: 0.5, md: 1 },
                                    }} />
                                </Box>
                            </Box>
                        </Slide>

                        {/* Main Card */}
                        <Slide direction="up" in timeout={1000}>
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                                border: { xs: '1.5px solid #D4AF37', md: '2px solid #D4AF37' },
                                borderRadius: { xs: '14px', sm: '16px', md: '20px' },
                                overflow: 'hidden',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 40px rgba(212,175,55,0.05)',
                            }}>

                                {/* Card Header */}
                                <Box sx={{
                                    p: { xs: 1.5, sm: 2, md: 3 },
                                    borderBottom: '1px solid rgba(212,175,55,0.18)',
                                    background: 'rgba(212,175,55,0.025)',
                                    display: 'flex', alignItems: 'center',
                                    gap: { xs: 1.2, sm: 1.5, md: 2 },
                                    mb: -3,
                                }}>
                                    <Box sx={{
                                        width: { xs: 38, sm: 44, md: 50 },
                                        height: { xs: 38, sm: 44, md: 50 },
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', flexShrink: 0
                                    }}>
                                        <SpaIcon sx={{ color: '#D4AF37', fontSize: { xs: 16, sm: 18, md: 22 } }} />
                                        <Box sx={{
                                            position: 'absolute', inset: -5, borderRadius: '50%',
                                            border: '2px solid transparent',
                                            borderTopColor: '#D4AF37',
                                            borderRightColor: 'rgba(212,175,55,0.15)',
                                            animation: 'spin 9s linear infinite',
                                            '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                                        }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{
                                            color: '#D4AF37', fontWeight: 700,
                                            fontSize: { xs: '0.88rem', sm: '0.95rem', md: '1.08rem' },
                                            lineHeight: 1.2,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {perfume?.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.6, mt: 0.5, flexWrap: 'wrap' }}>
                                            <Chip label={perfume?.brand} size="small"
                                                sx={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.32)', color: '#D4AF37', fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.67rem' }, fontWeight: 700, height: { xs: 18, sm: 20, md: 21 } }} />
                                            <Chip
                                                label={formData.active ? t('admin.perfume.detail.active') : t('admin.perfume.detail.inactive')}
                                                size="small"
                                                sx={{
                                                    background: formData.active ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                                                    border: `1px solid ${formData.active ? 'rgba(46,204,113,0.32)' : 'rgba(231,76,60,0.32)'}`,
                                                    color: formData.active ? '#2ecc71' : '#e74c3c',
                                                    fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.67rem' }, fontWeight: 700, height: { xs: 18, sm: 20, md: 21 },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Card Body */}
                                <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 4 } }}>
                                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>

                                        {/* LEFT - Basic Info */}
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <SectionHeader title={t('admin.perfume.detail.basicInfo')}>
                                                {!isEditing ? (
                                                    <Button
                                                        startIcon={<EditIcon sx={{ ml: isRTL ? 1 : 0, fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }} />}
                                                        onClick={() => setIsEditing(true)}
                                                        size="small"
                                                        sx={{ ...goldBtnSx, my: { xs: 2, sm: 0.6, md: 0 }, py: { xs: 0.5, sm: 0.6, md: 0.7 }, px: { xs: 1.2, sm: 1.5, md: 2 }, fontSize: { xs: '0.72rem', sm: '0.76rem', md: '0.8rem' } }}
                                                    >
                                                        {t('admin.perfume.detail.edit')}
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            startIcon={
                                                                isSaving
                                                                    ? <CircularProgress size={11} sx={{ color: '#000', ml: isRTL ? 1 : 0 }} />
                                                                    : <SaveIcon sx={{ ml: isRTL ? 1 : 0, fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }} />
                                                            }
                                                            onClick={handleSave}
                                                            disabled={isSaving}
                                                            size="small"
                                                            sx={{ ...goldBtnSx, my: { xs: 2, sm: 0.6, md: 0 }, py: { xs: 0.5, sm: 0.6, md: 0.7 }, px: { xs: 1.2, sm: 1.5, md: 2 }, fontSize: { xs: '0.72rem', sm: '0.76rem', md: '0.8rem' } }}
                                                        >
                                                            {isSaving ? t('admin.perfume.detail.saving') : t('admin.perfume.detail.save')}
                                                        </Button>
                                                        <Button
                                                            startIcon={<CloseIcon sx={{ ml: isRTL ? 1 : 0, fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }} />}
                                                            onClick={handleCancelEdit}
                                                            disabled={isSaving}
                                                            size="small"
                                                            sx={{
                                                                my: { xs: 2, sm: 0.6, md: 0 },
                                                                py: { xs: 0.5, sm: 0.6, md: 0.7 }, px: { xs: 1.2, sm: 1.5, md: 2 }, borderRadius: '10px', fontWeight: 700,
                                                                textTransform: 'none', fontSize: { xs: '0.72rem', sm: '0.76rem', md: '0.8rem' },
                                                                background: 'transparent', color: 'rgba(255,255,255,0.55)',
                                                                border: '1px solid rgba(255,255,255,0.18)',
                                                                '&:hover': { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.35)' },
                                                            }}
                                                        >
                                                            {t('admin.perfume.detail.cancel')}
                                                        </Button>
                                                    </>
                                                )}
                                            </SectionHeader>

                                            {/* VIEW MODE */}
                                            {!isEditing && (
                                                <Box>
                                                    <InfoRow icon={<LocalOfferIcon sx={{ fontSize: { xs: 14, sm: 16, md: 17 } }} />} label={t('admin.perfume.detail.name')}>
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.93rem' } }}>{formData.name}</Typography>
                                                    </InfoRow>
                                                    <InfoRow icon={<AutoAwesomeIcon sx={{ fontSize: { xs: 14, sm: 16, md: 17 } }} />} label={t('admin.perfume.detail.brand')}>
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.93rem' } }}>{formData.brand}</Typography>
                                                    </InfoRow>
                                                    <InfoRow icon={<CategoryIcon sx={{ fontSize: { xs: 14, sm: 16, md: 17 } }} />} label={t('admin.perfume.detail.type')}>
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.93rem' } }}>
                                                            {formData.perfumeType ? t(`admin.perfume.detail.${formData.perfumeType}`) : '—'}
                                                        </Typography>
                                                    </InfoRow>
                                                    <InfoRow icon={<WbSunnyIcon sx={{ fontSize: { xs: 14, sm: 16, md: 17 } }} />} label={t('admin.perfume.detail.seasons')}>
                                                        {formData.perfumeSeasons.length > 0 ? (
                                                            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mt: 0.3 }}>
                                                                {formData.perfumeSeasons.map(season => (
                                                                    <Chip key={season} label={t(`admin.perfume.detail.${season}`)} size="small"
                                                                        sx={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.27)', color: '#D4AF37', fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' }, height: { xs: 19, sm: 21, md: 22 } }} />
                                                                ))}
                                                            </Box>
                                                        ) : (
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.93rem' } }}>—</Typography>
                                                        )}
                                                    </InfoRow>
                                                    <InfoRow icon={<TranslateIcon sx={{ fontSize: { xs: 14, sm: 16, md: 17 } }} />} label={t('admin.perfume.detail.arabicName')}>
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.93rem' } }}>{formData.nameAr}</Typography>
                                                    </InfoRow>
                                                    <InfoRow icon={<TranslateIcon sx={{ fontSize: { xs: 14, sm: 16, md: 17 } }} />} label={t('admin.perfume.detail.englishName')}>
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.93rem' } }}>{formData.nameEn}</Typography>
                                                    </InfoRow>
                                                    <InfoRow icon={<InventoryIcon sx={{ fontSize: { xs: 14, sm: 16, md: 17 } }} />} label={t('admin.perfume.detail.arabicDescription')}>
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: { xs: '0.77rem', sm: '0.84rem', md: '0.88rem' }, lineHeight: 1.65 }}>{formData.descriptionAr}</Typography>
                                                    </InfoRow>
                                                    <InfoRow icon={<InventoryIcon sx={{ fontSize: { xs: 14, sm: 16, md: 17 } }} />} label={t('admin.perfume.detail.englishDescription')}>
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: { xs: '0.77rem', sm: '0.84rem', md: '0.88rem' }, lineHeight: 1.65 }}>{formData.descriptionEn}</Typography>
                                                    </InfoRow>

                                                    <SectionTitle>{t('admin.perfume.detail.prices')}</SectionTitle>
                                                    {formData.prices.length === 0 ? (
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.88rem' } }}>—</Typography>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.8, sm: 1 } }}>
                                                            {formData.prices.map((price, i) => (
                                                                <Box key={i} sx={{
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                    px: { xs: 1.2, sm: 1.5, md: 2 }, py: { xs: 1, sm: 1.1, md: 1.3 },
                                                                    background: 'rgba(212,175,55,0.04)',
                                                                    border: '1px solid rgba(212,175,55,0.13)',
                                                                    borderRadius: '10px',
                                                                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                                                    gap: { xs: 0.8, sm: 0 },
                                                                }}>
                                                                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.84rem', md: '0.9rem' }, minWidth: { xs: 'auto', sm: 60 } }}>
                                                                        {t(`admin.perfume.detail.${price.perfumeSize}`)}
                                                                    </Typography>
                                                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.76rem', sm: '0.82rem', md: '0.88rem' } }}>
                                                                        {price.price} {t('admin.perfume.detail.currency')}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
                                                                        <Chip label={`${price.quantity} ${t('admin.perfume.detail.pieces')}`} size="small"
                                                                            sx={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.48)', fontSize: { xs: '0.6rem', sm: '0.64rem', md: '0.67rem' }, height: { xs: 18, sm: 20, md: 21 } }} />
                                                                        <Chip
                                                                            label={price.isActive ? t('admin.perfume.detail.available') : t('admin.perfume.detail.unavailable')}
                                                                            size="small"
                                                                            sx={{
                                                                                background: price.isActive ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                                                                                color: price.isActive ? '#2ecc71' : '#e74c3c',
                                                                                fontSize: { xs: '0.6rem', sm: '0.64rem', md: '0.67rem' }, height: { xs: 18, sm: 20, md: 21 },
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            {/* EDIT MODE */}
                                            {isEditing && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.8, sm: 2, md: 2.5 } }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={formData.active}
                                                                size="small"
                                                                onChange={(e) => handleFormChange('active', e.target.checked)}
                                                                sx={{
                                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#D4AF37' },
                                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#D4AF37' },
                                                                }}
                                                            />
                                                        }
                                                        label={
                                                            <Typography sx={{ color: formData.active ? '#2ecc71' : 'rgba(255,255,255,0.45)', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' } }}>
                                                                {formData.active ? t('admin.perfume.detail.active') : t('admin.perfume.detail.inactive')}
                                                            </Typography>
                                                        }
                                                    />
                                                    <Box>
                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.name')}</Typography>
                                                        <TextField fullWidth size="small" value={formData.name}
                                                            onChange={(e) => handleFormChange('name', e.target.value)} sx={fieldSx} />
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.brand')}</Typography>
                                                        <TextField fullWidth size="small" value={formData.brand}
                                                            onChange={(e) => handleFormChange('brand', e.target.value)} sx={fieldSx} />
                                                    </Box>
                                                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                                        <Grid size={{ xs: 12, sm: 6 }}>
                                                            <Typography sx={labelSx}>{t('admin.perfume.detail.type')}</Typography>
                                                            <FormControl fullWidth size="small" sx={fieldSx}>
                                                                <Select value={formData.perfumeType}
                                                                    onChange={(e) => handleFormChange('perfumeType', e.target.value)}
                                                                    MenuProps={menuProps}>
                                                                    {PERFUME_TYPES.map(type => (
                                                                        <MenuItem key={type} value={type}>{t(`admin.perfume.detail.${type}`)}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 6 }}>
                                                            <Typography sx={labelSx}>{t('admin.perfume.detail.seasons')}</Typography>
                                                            <FormControl fullWidth size="small" sx={fieldSx}>
                                                                <Select multiple value={formData.perfumeSeasons}
                                                                    onChange={(e) => handleFormChange('perfumeSeasons', e.target.value)}
                                                                    MenuProps={menuProps}
                                                                    renderValue={(selected) => (
                                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                            {selected.map(season => (
                                                                                <Chip key={season} label={t(`admin.perfume.detail.${season}`)} size="small"
                                                                                    sx={{ color: '#D4AF37', height: { xs: 18, sm: 20 }, fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.67rem' } }} />
                                                                            ))}
                                                                        </Box>
                                                                    )}>
                                                                    {PERFUME_SEASONS.map(season => (
                                                                        <MenuItem key={season} value={season}>{t(`admin.perfume.detail.${season}`)}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                    </Grid>
                                                    <Box>
                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.arabicName')}</Typography>
                                                        <TextField fullWidth size="small" value={formData.nameAr}
                                                            onChange={(e) => handleFormChange('nameAr', e.target.value)}
                                                            inputProps={{ dir: 'rtl' }} sx={fieldSx} />
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.englishName')}</Typography>
                                                        <TextField fullWidth size="small" value={formData.nameEn}
                                                            onChange={(e) => handleFormChange('nameEn', e.target.value)}
                                                            inputProps={{ dir: 'ltr' }} sx={fieldSx} />
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.arabicDescription')}</Typography>
                                                        <TextField fullWidth size="small" value={formData.descriptionAr}
                                                            onChange={(e) => handleFormChange('descriptionAr', e.target.value)}
                                                            multiline rows={2} inputProps={{ dir: 'rtl' }} sx={fieldSx} />
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.englishDescription')}</Typography>
                                                        <TextField fullWidth size="small" value={formData.descriptionEn}
                                                            onChange={(e) => handleFormChange('descriptionEn', e.target.value)}
                                                            multiline rows={2} inputProps={{ dir: 'ltr' }} sx={fieldSx} />
                                                    </Box>

                                                    <Divider sx={{ borderColor: 'rgba(212,175,55,0.18)' }} />

                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1, sm: 1.5 } }}>
                                                            <Typography sx={{ ...labelSx, mb: 0 }}>{t('admin.perfume.detail.prices')}</Typography>
                                                            {formData.prices.length < PERFUME_SIZES.length && (
                                                                <Button size="small" startIcon={<AddIcon sx={{ ml: isRTL ? 1 : 0, fontSize: { xs: '0.85rem', sm: '1rem' } }} />} onClick={addPrice}
                                                                    sx={{ color: '#D4AF37', textTransform: 'none', fontSize: { xs: '0.72rem', sm: '0.76rem', md: '0.78rem' } }}>
                                                                    {t('admin.perfume.detail.addSize')}
                                                                </Button>
                                                            )}
                                                        </Box>
                                                        {formData.prices.map((price, index) => (
                                                            <Box key={index} sx={{ mb: { xs: 1.5, sm: 2 }, p: { xs: 1.5, sm: 2 }, border: '1px solid rgba(212,175,55,0.13)', borderRadius: '10px', background: 'rgba(212,175,55,0.02)' }}>
                                                                <Grid container spacing={1.2} alignItems="center">
                                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.size')}</Typography>
                                                                        <FormControl fullWidth size="small" sx={fieldSx}>
                                                                            <Select value={price.perfumeSize}
                                                                                onChange={(e) => handlePriceChange(index, 'perfumeSize', e.target.value)}
                                                                                displayEmpty MenuProps={menuProps}
                                                                                renderValue={(val) => val
                                                                                    ? t(`admin.perfume.detail.${val}`)
                                                                                    : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
                                                                                }>
                                                                                {PERFUME_SIZES
                                                                                    .filter(s => !formData.prices.some((p, i) => i !== index && p.perfumeSize === s))
                                                                                    .map(size => (
                                                                                        <MenuItem key={size} value={size}>{t(`admin.perfume.detail.${size}`)}</MenuItem>
                                                                                    ))}
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid size={{ xs: 5, sm: 3 }}>
                                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.price')}</Typography>
                                                                        <TextField fullWidth size="small" type="number" placeholder="0.00"
                                                                            value={price.price}
                                                                            onChange={(e) => {
                                                                                const v = e.target.value;
                                                                                if (v === '' || /^\d+(\.\d{0,2})?$/.test(v))
                                                                                    handlePriceChange(index, 'price', v);
                                                                            }}
                                                                            inputProps={{ min: 0.01, step: '0.01' }}
                                                                            error={price.price !== '' && parseFloat(price.price) <= 0}
                                                                            sx={fieldSx}
                                                                            InputProps={{
                                                                                endAdornment: (
                                                                                    <InputAdornment position="end">
                                                                                        <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.75rem' }}>
                                                                                            {t('admin.perfume.detail.currency')}
                                                                                        </span>
                                                                                    </InputAdornment>
                                                                                ),
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid size={{ xs: 5, sm: 3 }}>
                                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.quantity')}</Typography>
                                                                        <TextField fullWidth size="small" type="number" placeholder="0"
                                                                            value={price.quantity}
                                                                            onChange={(e) => {
                                                                                const v = e.target.value;
                                                                                if (v === '' || /^\d+$/.test(v))
                                                                                    handlePriceChange(index, 'quantity', v);
                                                                            }}
                                                                            inputProps={{ min: 0, step: 1 }}
                                                                            error={price.quantity !== '' && parseInt(price.quantity) < 0}
                                                                            sx={fieldSx}
                                                                        />
                                                                    </Grid>
                                                                    <Grid size={{ xs: 2, sm: 2 }} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: 0.3 }}>
                                                                        <IconButton onClick={() => removePrice(index)}
                                                                            disabled={formData.prices.length === 1}
                                                                            size="small" sx={{ color: '#e74c3c' }}>
                                                                            <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }} />
                                                                        </IconButton>
                                                                    </Grid>
                                                                    <Grid size={{ xs: 9, sm: 10 }}>
                                                                        <Typography sx={labelSx}>{t('admin.perfume.detail.price_note_label')}</Typography>
                                                                        <TextField fullWidth size="small"
                                                                            placeholder={t('admin.perfume.detail.price_note_placeholder')}
                                                                            value={price.note}
                                                                            onChange={(e) => handlePriceChange(index, 'note', e.target.value)}
                                                                            sx={fieldSx} />
                                                                        <Typography sx={{ fontSize: { xs: '0.63rem', sm: '0.67rem', md: '0.70rem' }, fontWeight: 700, color: '#D4AF37', mx: 0.5 }}>
                                                                            {t('admin.perfume.detail.price_note_helper')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid size={{ xs: 3, sm: 2 }} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Switch size="small" checked={price.isActive}
                                                                                    onChange={(e) => handlePriceChange(index, 'isActive', e.target.checked)}
                                                                                    sx={{
                                                                                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#D4AF37' },
                                                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#D4AF37' },
                                                                                    }} />
                                                                            }
                                                                            label={
                                                                                <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.64rem', md: '0.68rem' }, color: price.isActive ? '#2ecc71' : 'rgba(255,255,255,0.4)' }}>
                                                                                    {price.isActive ? t('admin.perfume.detail.available') : t('admin.perfume.detail.hidden')}
                                                                                </Typography>
                                                                            }
                                                                            sx={{ m: 0 }}
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                        </Grid>

                                        {/* RIGHT - Images */}
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            {/* Divider only on mobile between sections */}
                                            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
                                                <Divider sx={{ borderColor: 'rgba(212,175,55,0.2)' }} />
                                            </Box>

                                            <SectionHeader title={t('admin.perfume.detail.images')}>
                                                {!isEditingImages ? (
                                                    <Button
                                                        startIcon={<EditIcon sx={{ ml: isRTL ? 1 : 0, fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }} />}
                                                        onClick={() => setIsEditingImages(true)}
                                                        size="small"
                                                        sx={{ ...goldBtnSx, py: { xs: 0.5, sm: 0.6, md: 0.7 }, px: { xs: 1.2, sm: 1.5, md: 2 }, fontSize: { xs: '0.72rem', sm: '0.76rem', md: '0.8rem' } }}
                                                    >
                                                        {t('admin.perfume.detail.edit')}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        startIcon={<CloseIcon sx={{ ml: isRTL ? 1 : 0, fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }} />}
                                                        onClick={handleCancelImageEdit}
                                                        size="small"
                                                        sx={{
                                                            py: { xs: 0.5, sm: 0.6, md: 0.7 }, px: { xs: 1.2, sm: 1.5, md: 2 }, borderRadius: '10px', fontWeight: 700,
                                                            textTransform: 'none', fontSize: { xs: '0.72rem', sm: '0.76rem', md: '0.8rem' },
                                                            background: 'transparent', color: 'rgba(255,255,255,0.55)',
                                                            border: '1px solid rgba(255,255,255,0.18)',
                                                            '&:hover': { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.35)' },
                                                        }}
                                                    >
                                                        {t('admin.perfume.detail.cancel')}
                                                    </Button>
                                                )}
                                            </SectionHeader>

                                            <ImageManager
                                                images={images}
                                                onAddImage={isEditingImages ? handleAddImage : undefined}
                                                onDeleteImage={isEditingImages ? handleDeleteImage : undefined}
                                                onReplaceImage={isEditingImages ? handleReplaceImage : undefined}
                                                readOnly={!isEditingImages}
                                            />
                                        </Grid>

                                    </Grid>
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

export default AdminPerfumeDetails;