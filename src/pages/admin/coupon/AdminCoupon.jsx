import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {
    useCreateCouponMutation,
    useGetActiveCouponQuery,
    useDeactivateCouponMutation,
} from '../../../redux/api/adminApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../../../utils/toastHelper';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

// Shared Styles
const labelSx = {
    fontSize: '0.80rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.5)',
    mb: 0.8,
    mx: 1
};

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        color: '#FFFFFF',
        '& input': { color: '#FFFFFF' },
        '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: '2px' },
        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
            WebkitAppearance: 'none',
        },
    }
};

const goldBtnSx = {
    py: 1.3,
    px: 3,
    borderRadius: '10px',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: '0.95rem',
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
        background: 'rgba(212,175,55,0.3)',
        color: 'rgba(0,0,0,0.5)',
    },
};

const selectSx = {
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#FFFFFF",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.3)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D4AF37" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D4AF37" },
    "& .MuiSvgIcon-root": { color: "#D4AF37" },
    "&.Mui-disabled": {
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.1)" },
        "& .MuiSelect-select": { WebkitTextFillColor: "rgba(255,255,255,0.4)" },
    }
};

const menuProps = {
    PaperProps: {
        sx: {
            background: "#1a1a1a",
            border: "1px solid rgba(212,175,55,0.3)",
            "& .MuiMenuItem-root": {
                color: "#FFF",
                "&:hover": { backgroundColor: "rgba(212,175,55,0.15)" },
                "&.Mui-selected": {
                    backgroundColor: "rgba(212,175,55,0.25)",
                    color: "#D4AF37",
                },
            },
        },
    },
};

const dangerBtnSx = {
    py: 1.3,
    px: 3,
    borderRadius: '10px',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: '0.95rem',
    background: 'transparent',
    color: '#e74c3c',
    border: '1px solid rgba(231,76,60,0.5)',
    transition: 'all 0.3s',
    '&:hover': {
        background: 'rgba(231,76,60,0.1)',
        borderColor: '#e74c3c',
    },
};

// Skeleton Loader - AdminCoupon
const CouponSkeleton = () => (
    <Paper
        elevation={0}
        sx={{
            background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
            border: '2px solid #D4AF37',
            borderRadius: '20px',
            overflow: 'hidden',
            p: 4,
        }}
    >
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Skeleton variant="circular" width={50} height={50} sx={{ bgcolor: 'rgba(212,175,55,0.1)' }} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={25} sx={{ mb: 1, bgcolor: 'rgba(212,175,55,0.1)' }} />
                <Skeleton variant="text" width="40%" height={25} sx={{ bgcolor: 'rgba(212,175,55,0.1)' }} />
            </Box>
            <Skeleton variant="rounded" width={100} height={30} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: 10 }} />
        </Box>

        {/* Coupon Code Skeleton */}
        <Skeleton
            variant="rounded"
            height={80}
            sx={{
                bgcolor: 'rgba(212,175,55,0.08)',
                borderRadius: '15px',
                mb: 3,
            }}
        />

        {/* Details Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            <Skeleton variant="rounded" height={60} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '12px' }} />
            <Skeleton variant="rounded" height={60} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '12px' }} />
            <Skeleton variant="rounded" height={60} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '12px' }} />
            <Skeleton variant="rounded" height={60} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '12px' }} />
        </Box>

        {/* Action Button Skeleton */}
        <Skeleton
            variant="rounded"
            height={45}
            sx={{ bgcolor: 'rgba(212,175,55,0.1)', borderRadius: '10px', mt: 3 }}
        />
    </Paper>
);

// Main Component
const AdminCoupon = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // API Calls
    const { data: couponResponse, isLoading } = useGetActiveCouponQuery();
    const [deactivateCoupon, { isLoading: isDeactivating }] = useDeactivateCouponMutation();
    const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();

    const activeCoupon = couponResponse?.data;

    // Create Dialog State
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        discountType: '',
        discountValue: '',
        expiryDate: null,
        maxUsage: '',
    });

    // Handlers
    const handleFormChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    const handleDeactivate = async () => {
        try {
            const response = await deactivateCoupon().unwrap();
            handleSuccess(response.message);
            setConfirmModalOpen(false);
        } catch (error) {
            handleError(error?.data?.message);
            setConfirmModalOpen(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.discountType) {
            handleError(t('admin.coupon.validation.selectDiscountType'));
            return;
        }
        if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
            handleError(t('admin.coupon.validation.discountRequired'));
            return;
        }
        if (formData.discountType === 'PERCENTAGE') {
            const percentage = parseFloat(formData.discountValue);
            if (percentage <= 0 || percentage > 100) {
                handleError(t('admin.coupon.validation.percentageRange'));
                return;
            }
        }
        if (!formData.expiryDate) {
            handleError(t('admin.coupon.validation.expiryRequired'));
            return;
        }
        if (formData.maxUsage) {
            const maxUsage = parseInt(formData.maxUsage);
            if (maxUsage <= 0) {
                handleError(t('admin.coupon.validation.maxUsagePositive'));
                return;
            }
        }

        const payload = {
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            expiryDate: formData.expiryDate.toISOString()
        }

        if (formData.maxUsage) {
            payload.maxUsage = parseInt(formData.maxUsage);
        }

        try {
            const response = await createCoupon(payload).unwrap();
            handleSuccess(response.message);
            setCreateDialogOpen(false);
            setFormData({
                discountType: '',
                discountValue: '',
                expiryDate: null,
                maxUsage: '',
            });
        } catch (error) {
            handleError(error?.data?.message);
        }
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY - hh:mm A');
    };

    const isExpired = (dateString) => {
        return dayjs(dateString).isBefore(dayjs());
    };

    const handleCancelEdit = () => {
        setFormData({
            discountType: '',
            discountValue: '',
            expiryDate: null,
            maxUsage: ''
        });
    }

    // Render
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                py: 4,
            }}
        >
            <Container maxWidth="md">
                <Fade in timeout={1000}>
                    <Slide direction="up" in timeout={1000}>

                        <Box>
                            {/* Page Title */}
                            <Slide direction="down" in timeout={1000}>
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#000', letterSpacing: '1px', '& span': { color: '#D4AF37' } }}>
                                        {isRTL ? (
                                            <>
                                                {t('admin.coupon.title')} <span>{t('admin.coupon.titleHighlight')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('admin.coupon.title')}</span> {t('admin.coupon.titleHighlight')}
                                            </>
                                        )}
                                    </Typography>
                                    <Box sx={{ width: isRTL ? 250 : 500, height: 3, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', mx: 'auto', mt: 1 }} />
                                </Box>
                            </Slide>

                            {/* Loading */}
                            {isLoading && <CouponSkeleton />}

                            {/* Active Coupon */}
                            {!isLoading && activeCoupon && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                                        border: '2px solid #D4AF37',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 40px rgba(212,175,55,0.08)',
                                    }}
                                >
                                    {/* Header */}
                                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    background: 'linear-gradient(135deg, #D4AF37, #F4D03F)',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                                                }}
                                            >
                                                <LocalOfferIcon sx={{ color: '#000', fontSize: 24 }} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                                                    {t('admin.coupon.active.title')}
                                                </Typography>
                                                <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>
                                                    {activeCoupon.code}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Chip
                                            icon={<CheckCircleIcon sx={{ fontSize: 19 }} />}
                                            label={activeCoupon.active ? t('admin.coupon.active.status') : t('admin.coupon.active.inactive')}
                                            sx={{
                                                background: activeCoupon.active ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                                                border: activeCoupon.active ? '1px solid #2ecc71' : '1px solid #e74c3c',
                                                color: activeCoupon.active ? '#2ecc71' : '#e74c3c',
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                '& .MuiChip-icon':
                                                    isRTL ? { ml: '-6px', mr: "5px" } : { ml: '5px' },
                                            }}
                                        />
                                    </Box>

                                    {/* Body */}
                                    <Box sx={{ p: 3 }}>

                                        {/* Coupon Code Display */}
                                        <Box
                                            sx={{
                                                background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(244,208,63,0.08))',
                                                border: '2px dashed #D4AF37',
                                                borderRadius: '15px',
                                                p: 3,
                                                mb: 3,
                                                textAlign: 'center',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&::before': { content: '"✦"', position: 'absolute', top: 0, right: 15, fontSize: '3rem', color: 'rgba(212,175,55,0.2)' },
                                                '&::after': { content: '"✦"', position: 'absolute', bottom: 0, left: 15, fontSize: '3rem', color: 'rgba(212,175,55,0.2)' }
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: "'Cormorant Garamond', serif",
                                                    fontSize: '2.5rem',
                                                    fontWeight: 800,
                                                    color: '#D4AF37',
                                                    letterSpacing: '6px',
                                                }}
                                            >
                                                {activeCoupon.code}
                                            </Typography>
                                        </Box>

                                        {/* Details Grid */}
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                <Box
                                                    sx={{
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1px solid rgba(212,175,55,0.2)',
                                                        borderRadius: '12px',
                                                        p: 2,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', mb: 0.5 }}>
                                                        {t('admin.coupon.fields.discountType')}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
                                                        {activeCoupon.discountType === 'PERCENTAGE' ?
                                                            t('admin.coupon.discountTypes.percentage') :
                                                            t('admin.coupon.discountTypes.fixed')}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                                <Box
                                                    sx={{
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1px solid rgba(212,175,55,0.2)',
                                                        borderRadius: '12px',
                                                        py: 2,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', mb: 0.5 }}>
                                                        {t('admin.coupon.fields.discountValue')}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#D4AF37' }}>
                                                        {activeCoupon.discountValue}
                                                        {activeCoupon.discountType === 'PERCENTAGE' ? '%' : t('admin.coupon.fields.currency')}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                                <Box
                                                    sx={{
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1px solid rgba(212,175,55,0.2)',
                                                        borderRadius: '12px',
                                                        py: 2,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', mb: 0.5 }}>
                                                        {t('admin.coupon.fields.usageCount')}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
                                                        {activeCoupon.usageCount} / {
                                                            activeCoupon.maxUsage != null ? (
                                                                activeCoupon.maxUsage
                                                            ) : (
                                                                <span style={{ color: '#D4AF37', fontSize: '1.2rem' }}>
                                                                    {t('admin.coupon.unlimited')}
                                                                </span>
                                                            )
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                <Box
                                                    sx={{
                                                        background: isExpired(activeCoupon.expiryDate) ? 'rgba(231,76,60,0.1)' : 'rgba(255,255,255,0.03)',
                                                        border: isExpired(activeCoupon.expiryDate) ? '1px solid rgba(231,76,60,0.3)' : '1px solid rgba(212,175,55,0.2)',
                                                        borderRadius: '12px',
                                                        p: 2,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', mb: 0.5 }}>
                                                        {t('admin.coupon.fields.expiryDate')}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: isExpired(activeCoupon.expiryDate) ? '#e74c3c' : '#FFFFFF' }}>
                                                        {formatDate(activeCoupon.expiryDate)}
                                                        {isExpired(activeCoupon.expiryDate) && ` (${t('admin.coupon.expired')})`}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ borderColor: 'rgba(212,175,55,0.2)', my: 3 }} />

                                        {/* Actions */}
                                        <Button
                                            fullWidth
                                            startIcon={isDeactivating ? <CircularProgress size={16} sx={{ color: '#e74c3c', ml: isRTL ? 1 : 0 }} /> : <DeleteIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                                            onClick={() => setConfirmModalOpen(true)}
                                            disabled={isDeactivating}
                                            sx={dangerBtnSx}
                                        >
                                            {isDeactivating ? t('admin.coupon.actions.deactivating') : t('admin.coupon.actions.deactivate')}
                                        </Button>
                                    </Box>
                                </Paper>
                            )}

                            {/* No Active Coupon */}
                            {!isLoading && !activeCoupon && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                                        border: '2px solid #D4AF37',
                                        borderRadius: '20px',
                                        p: 5,
                                        textAlign: 'center',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
                                        }
                                    }}
                                >
                                    <Box sx={{ fontSize: '4rem', mb: 2, opacity: 0.2 }}>🎟️</Box>
                                    <Typography sx={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                                        {t('admin.coupon.empty.title')}
                                    </Typography>
                                    <Button
                                        startIcon={<AddIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                                        onClick={() => setCreateDialogOpen(true)}
                                        sx={goldBtnSx}
                                    >
                                        {t('admin.coupon.empty.createButton')}
                                    </Button>
                                </Paper>
                            )}
                        </Box>
                    </Slide>
                </Fade>
            </Container>

            {/* Create Coupon Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => !isCreating && setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                        border: '2px solid #D4AF37',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        p: 3,
                        pb: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #D4AF37, #F4D03F)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <AddIcon sx={{ color: '#000', fontSize: 22 }} />
                        </Box>
                        <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.3rem' }}>
                            {t('admin.coupon.create.title')}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => {
                            if (!isCreating) {
                                handleCancelEdit();
                                setCreateDialogOpen(false);
                            }
                        }}
                        sx={{
                            color: '#D4AF37',
                            transition: 'transform 0.4s ease',
                            '&:hover': !isCreating && {
                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                transform: 'rotate(180deg)'
                            },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

                        {/* Discount Type */}
                        <Box>
                            <Typography sx={labelSx}>{t('admin.coupon.fields.discountType')}</Typography>
                            <FormControl fullWidth>
                                <Select
                                    name="discountType"
                                    value={formData.discountType}
                                    size="small"
                                    sx={selectSx}
                                    MenuProps={menuProps}
                                    onChange={handleFormChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <LocalOfferIcon
                                                sx={{ color: "#D4AF37", mr: isRTL ? 2.5 : 0, ml: isRTL ? -3 : 0, fontSize: 18 }}
                                            />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value="PERCENTAGE">{t('admin.coupon.discountTypes.percentageOption')}</MenuItem>
                                    <MenuItem value="FIXED">{t('admin.coupon.discountTypes.fixedOption')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Discount Value */}
                        <Box>
                            <Typography sx={labelSx}>{t('admin.coupon.fields.discountValue')}</Typography>
                            <TextField
                                fullWidth
                                name="discountValue"
                                value={formData.discountValue}
                                type="number"
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (value === '') {
                                        handleFormChange(e);
                                        return;
                                    }

                                    if (formData.discountType === 'PERCENTAGE') {
                                        if (/^(100(\.0{1,2})?|[1-9]\d?(\.\d{1,2})?)$/.test(value)) {
                                            handleFormChange(e);
                                        }
                                    } else {
                                        if (/^\d+(\.\d{0,2})?$/.test(value)) {
                                            handleFormChange(e);
                                        }
                                    }
                                }}
                                placeholder={t(`admin.coupon.create.discountValuePlaceholder.${formData.discountType === 'PERCENTAGE' ? 'percentage' : 'fixed'}`)}
                                size="small"
                                sx={fieldSx}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <span style={{ color: '#D4AF37', fontWeight: 700 }}>{formData.discountType === 'PERCENTAGE' ? '%' : t('admin.coupon.fields.currency')}</span>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* Expiry Date */}
                        <Box>
                            <Typography sx={labelSx}>{t('admin.coupon.fields.expiryDate')}</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={formData.expiryDate}
                                    onChange={(newValue) =>
                                        handleFormChange({ target: { name: 'expiryDate', value: newValue } })
                                    }
                                    minDateTime={dayjs().add(1, 'day')}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: "small",
                                            InputProps: {
                                                sx: {
                                                    direction: 'ltr',
                                                    borderRadius: "10px",
                                                    backgroundColor: "rgba(255,255,255,0.04)",
                                                    color: "#FFFFFF",
                                                    '& fieldset': {
                                                        borderColor: 'rgba(212,175,55,0.3)',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#D4AF37 !important',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#D4AF37 !important',
                                                    },
                                                    '& input': {
                                                        color: '#FFFFFF',
                                                    },
                                                    '& .MuiSvgIcon-root': {
                                                        color: '#D4AF37',
                                                    },
                                                }
                                            }
                                        },
                                        popper: {
                                            sx: {
                                                direction: 'ltr',
                                                '& .MuiPaper-root': {
                                                    backgroundColor: '#1a1a1a',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(212,175,55,0.3)',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                },
                                                '& .MuiPickersCalendarHeader-root': {
                                                    color: '#D4AF37',
                                                    '& .MuiPickersArrowSwitcher-button': {
                                                        color: '#D4AF37',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(212,175,55,0.1)',
                                                        }
                                                    },
                                                },
                                                '& .MuiDayCalendar-weekDayLabel': {
                                                    color: 'rgba(212,175,55,0.7)',
                                                },
                                                '& .MuiPickersDay-root': {
                                                    color: '#FFFFFF',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(212,175,55,0.2)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: '#D4AF37',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                        '&:hover': {
                                                            backgroundColor: '#FFD700',
                                                        },
                                                    },
                                                    '&.Mui-disabled': {
                                                        color: 'rgba(255, 255, 255, 0.15) !important',
                                                    },
                                                },
                                                '& .MuiPickersCalendarHeader-switchViewButton': {
                                                    color: '#D4AF37',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(212,175,55,0.1)',
                                                    },
                                                },
                                                '& .MuiYearCalendar-root': {
                                                    '& button': {
                                                        color: '#FFFFFF',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(212,175,55,0.2)',
                                                        },
                                                    },
                                                    '& button.Mui-selected': {
                                                        backgroundColor: '#D4AF37',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                    },
                                                },
                                                '& .MuiPickersMonth-monthButton': {
                                                    color: '#FFFFFF',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(212,175,55,0.2)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: '#D4AF37',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                        '&:hover': {
                                                            backgroundColor: '#FFD700',
                                                        },
                                                    },
                                                    '&.Mui-disabled': {
                                                        color: 'rgba(255,255,255,0.3)',
                                                    },
                                                },
                                                '& .MuiMultiSectionDigitalClock-root': {
                                                    '& .MuiMenuItem-root': {
                                                        color: '#FFFFFF',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(212,175,55,0.2)',
                                                        },
                                                        '&.Mui-selected': {
                                                            backgroundColor: '#D4AF37',
                                                            color: '#000000',
                                                            fontWeight: 'bold',
                                                            '&:hover': {
                                                                backgroundColor: '#FFD700',
                                                            },
                                                        },
                                                        '&.Mui-disabled': {
                                                            color: 'rgba(255,255,255,0.3)',
                                                        },
                                                    }
                                                }
                                            }
                                        },
                                        dialog: {
                                            sx: {
                                                direction: 'ltr',
                                                '& .MuiDialog-paper': {
                                                    backgroundColor: '#1a1a1a',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(212,175,55,0.3)',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                },
                                                '& .MuiPickersLayout-toolbar': {
                                                    backgroundColor: '#1a1a1a',
                                                    color: '#D4AF37',
                                                    '& .MuiTypography-root': {
                                                        color: '#D4AF37',
                                                    },
                                                    '& .MuiPickersToolbarText-root': {
                                                        color: '#FFFFFF',
                                                    },
                                                },
                                                '& .MuiTabs-root': {
                                                    backgroundColor: '#1a1a1a',
                                                    '& .MuiTab-root': {
                                                        color: 'rgba(212,175,55,0.5)',
                                                        '&.Mui-selected': {
                                                            color: '#D4AF37',
                                                        },
                                                    },
                                                    '& .MuiTabs-indicator': {
                                                        backgroundColor: '#D4AF37',
                                                    },
                                                },
                                                '& .MuiPickersCalendarHeader-root': {
                                                    color: '#D4AF37',
                                                    '& .MuiPickersArrowSwitcher-button': {
                                                        color: '#D4AF37',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(212,175,55,0.1)',
                                                        }
                                                    },
                                                    '& .MuiPickersCalendarHeader-label': {
                                                        color: '#D4AF37',
                                                    },
                                                },
                                                '& .MuiDayCalendar-weekDayLabel': {
                                                    color: 'rgba(212,175,55,0.7)',
                                                },
                                                '& .MuiPickersDay-root': {
                                                    color: '#FFFFFF',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(212,175,55,0.2)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: '#D4AF37',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                        '&:hover': {
                                                            backgroundColor: '#FFD700',
                                                        },
                                                    },
                                                    '&.Mui-disabled': {
                                                        color: 'rgba(255, 255, 255, 0.15) !important',
                                                    },
                                                },
                                                '& .MuiPickersCalendarHeader-switchViewButton': {
                                                    color: '#D4AF37',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(212,175,55,0.1)',
                                                    },
                                                },
                                                '& .MuiYearCalendar-root': {
                                                    '& button': {
                                                        color: '#FFFFFF',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(212,175,55,0.2)',
                                                        },
                                                    },
                                                    '& button.Mui-selected': {
                                                        backgroundColor: '#D4AF37',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                    },
                                                },
                                                '& .MuiPickersMonth-monthButton': {
                                                    color: '#FFFFFF',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(212,175,55,0.2)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: '#D4AF37',
                                                        color: '#000000',
                                                        fontWeight: 'bold',
                                                        '&:hover': {
                                                            backgroundColor: '#FFD700',
                                                        },
                                                    },
                                                    '&.Mui-disabled': {
                                                        color: 'rgba(255,255,255,0.3)',
                                                    },
                                                },
                                                '& .MuiMultiSectionDigitalClock-root': {
                                                    '& .MuiMenuItem-root': {
                                                        color: '#FFFFFF',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(212,175,55,0.2)',
                                                        },
                                                        '&.Mui-selected': {
                                                            backgroundColor: '#D4AF37',
                                                            color: '#000000',
                                                            fontWeight: 'bold',
                                                            '&:hover': {
                                                                backgroundColor: '#FFD700',
                                                            },
                                                        },
                                                        '&.Mui-disabled': {
                                                            color: 'rgba(255,255,255,0.3)',
                                                        },
                                                    }
                                                }
                                            }
                                        },
                                        actionBar: {
                                            actions: ['cancel', 'accept'],
                                            sx: {
                                                '& .MuiButton-root': {
                                                    color: '#D4AF37',
                                                    fontWeight: 'bold',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(212,175,55,0.1)',
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Box>

                        {/* Max Usage */}
                        <Box>
                            <Typography sx={labelSx}>{t('admin.coupon.fields.maxUsage')}</Typography>
                            <TextField
                                fullWidth
                                name="maxUsage"
                                value={formData.maxUsage}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (value === '' || /^[1-9]\d*$/.test(value)) {
                                        handleFormChange(e);
                                    }
                                }}
                                type="number"
                                placeholder={t('admin.coupon.create.maxUsagePlaceholder')}
                                size="small"
                                sx={fieldSx}
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        fullWidth
                        onClick={handleCreate}
                        disabled={isCreating}
                        startIcon={isCreating ? <CircularProgress size={16} sx={{ color: '#000', ml: isRTL ? 1 : 0 }} /> : <AddIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                        sx={goldBtnSx}
                    >
                        {isCreating ? t('admin.coupon.create.creating') : t('admin.coupon.create.button')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Modal */}
            <ConfirmationModal
                open={confirmModalOpen}
                message={t('admin.coupon.confirmDeactivate')}
                onConfirm={handleDeactivate}
                onCancel={() => setConfirmModalOpen(false)}
                onClose={() => { }}
            />

            <ToastContainer />
        </Box>
    );
};

export default AdminCoupon;