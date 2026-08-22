import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Collapse from '@mui/material/Collapse';
import InputAdornment from '@mui/material/InputAdornment';
import Fade from '@mui/material/Fade';

import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import NoteIcon from '@mui/icons-material/Note';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useTrackGuestOrderQuery, useCancelGuestOrderMutation } from '../redux/api/orderApi';
import { selectIsCustomer } from '../redux/slices/authSlice';
import ConfirmationModal from './ConfirmationModal';
import { handleError } from '../utils/toastHelper';

// ─── Shared Styles (same as CustomerRegister) ───────────────────────────────────
const fieldSx = () => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        '& input, & textarea': { 
            color: '#FFFFFF',
            py: 1.5,
        },
        '& fieldset': {
            borderColor: 'rgba(212,175,55,0.3)',
        },
        '&:hover fieldset': {
            borderColor: '#D4AF37',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#D4AF37',
        },
    },
    '& .MuiFormHelperText-root': {
        color: '#f44336',
        marginLeft: 0,
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255,255,255,0.5)',
    },
});

const submitBtnSx = {
    py: 1.5,
    borderRadius: 2,
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    color: '#000',
    boxShadow: '0 4px 15px rgba(212,175,55,0.4)',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
        boxShadow: '0 6px 20px rgba(212,175,55,0.5)',
        transform: 'translateY(-2px)',
    },
    '&:active': { transform: 'translateY(0)' },
    '&:disabled': {
        background: 'rgba(212,175,55,0.2)',
        color: 'rgba(0,0,0,0.5)',
    },
};

const outlineBtnSx = {
    py: 1.5,
    borderRadius: 2,
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    background: 'transparent',
    color: '#D4AF37',
    border: '2px solid #D4AF37',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'rgba(212,175,55,0.1)',
        transform: 'translateY(-2px)',
    },
    '&:active': { transform: 'translateY(0)' },
};

const statusConfig = {
    PENDING: { bg: 'rgba(243,156,18,0.15)', border: '#f39c12', color: '#f39c12' },
    PROCESSING: { bg: 'rgba(52,152,219,0.15)', border: '#3498db', color: '#3498db' },
    DELIVERED: { bg: 'rgba(46,204,113,0.15)', border: '#2ecc71', color: '#2ecc71' },
    CANCELLED: { bg: 'rgba(231,76,60,0.15)', border: '#e74c3c', color: '#e74c3c' },
};

const TrackOrderDialog = ({ open, onClose, initialOrderNumber = null, initialEmail = null }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const isCustomer = useSelector(selectIsCustomer);

    const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '');
    const [email, setEmail] = useState(initialEmail || '');
    const [searched, setSearched] = useState(false);
    const [isOrderSummaryCollapsed, setIsOrderSummaryCollapsed] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const isGuest = !isCustomer;

    // Auto-search when dialog opens with initial params
    useEffect(() => {
        if (open && initialOrderNumber && initialEmail) {
            setOrderNumber(initialOrderNumber);
            setEmail(initialEmail);
            setSearched(true);
        } else if (!open) {
            // Reset when dialog closes
            setSearched(false);
        }
    }, [open, initialOrderNumber, initialEmail]);

    const { data: guestOrderData, isLoading, isError, error, refetch } = useTrackGuestOrderQuery(
        { orderNumber, email },
        { skip: !searched || !orderNumber || !email, refetchOnMountOrArgChange: true }
    );

    const [cancelGuestOrder, { isLoading: isCancelling }] = useCancelGuestOrderMutation();

    const orderData = guestOrderData?.data;
    const showCollapseArrow = orderData?.items?.length >= 2;
    const statusColor = statusConfig[orderData?.status] || statusConfig.PENDING;

    // Show error toast when order not found
    useEffect(() => {
        if (searched && isError && !isLoading) {
            const errorMessage = error?.data?.message || error?.message || error?.data || t('trackOrder.orderNotFound');
            handleError(errorMessage);
            setSearched(false);
        }
    }, [isError, isLoading, searched, t, error]);

    const handleSearch = () => {
        if (orderNumber && email) {
            setSearched(true);
        }
    };

    const handleReset = () => {
        setOrderNumber('');
        setEmail('');
        setSearched(false);
        setCancelReason('');
    };

    const handleCancelOrder = async () => {
        try {
            await cancelGuestOrder({ 
                orderNumber, 
                cancelData: { 
                    email, 
                    cancellationReason: cancelReason 
                } 
            }).unwrap();
            setCancelModalOpen(false);
            refetch();
            setCancelReason('');
        } catch (error) {
            console.error('Failed to cancel order:', error);
        }
    };

    const canCancel = orderData?.status === 'PENDING' && !orderData?.cancelledAt;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatInt = (value) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(value);

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                        border: '2px solid #D4AF37',
                        boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
                        maxHeight: '90vh',
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(212,175,55,0.3)',
                    pb: 1
                }}>
                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.3rem' }}>
                        {t('trackOrder.title')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {searched && orderData && (
                            <Tooltip title={t('trackOrder.searchAgain')} arrow>
                                <IconButton
                                    onClick={handleReset}
                                    sx={{
                                        color: '#D4AF37',
                                        background: 'rgba(212,175,55,0.1)',
                                        border: '1px solid rgba(212,175,55,0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'rgba(212,175,55,0.2)',
                                            transform: 'rotate(180deg)',
                                            boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                                        },
                                    }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: '#D4AF37',
                                transition: 'transform 0.4s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                    transform: 'rotate(180deg)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {/* Search Form */}
                    {!searched && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#FFFFFF',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    mt: 1,
                                    mb: -1
                                }}
                            >
                                {t('trackOrder.orderNumber')}
                            </Typography>
                            <TextField
                                fullWidth
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                sx={fieldSx()}
                                size="medium"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ShoppingBagIcon
                                                sx={{ color: '#D4AF37', fontSize: 20, mr: isRTL ? 2 : 0 }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#FFFFFF',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    mt: 1,
                                    mb: -1
                                }}
                            >
                                {t('trackOrder.email')}
                            </Typography>
                            <TextField
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={fieldSx()}
                                size="medium"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon
                                                sx={{ color: '#D4AF37', fontSize: 20, mr: isRTL ? 2 : 0 }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                fullWidth
                                onClick={handleSearch}
                                disabled={!orderNumber || !email}
                                sx={{
                                    ...submitBtnSx,
                                    py: 1.8,
                                    fontSize: '1.1rem',
                                }}
                            >
                                {t('trackOrder.search')}
                            </Button>
                        </Box>
                    )}

                    {/* Loading State */}
                    {searched && isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#D4AF37' }} />
                        </Box>
                    )}

                    {/* Order Details */}
                    {searched && orderData && (
                        <Box sx={{ pt: 1 }}>

                            {/* Order Info */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {isRTL && <ShoppingBagIcon sx={{ color: '#D4AF37', fontSize: 24 }} />}
                                        <Box>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {t('orderSuccess.orderNumber')}
                                            </Typography>
                                            <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700 }}>
                                                {orderData.orderNumber}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <CalendarTodayIcon sx={{ color: '#D4AF37', fontSize: 24 }} />
                                        <Box>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {t('orderSuccess.orderDate')}
                                            </Typography>
                                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600 }}>
                                                {formatDate(orderData.orderDate)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LocalShippingIcon sx={{ color: '#D4AF37', fontSize: 24 }} />
                                        <Box>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {t('orderSuccess.statusLabel')}
                                            </Typography>
                                            <Chip
                                                label={t(`orderSuccess.status.${orderData.status?.toLowerCase()}`, { defaultValue: orderData.status })}
                                                size="small"
                                                sx={{
                                                    background: statusColor.bg,
                                                    border: `1px solid ${statusColor.border}`,
                                                    color: statusColor.color,
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    height: 24,
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 24, height: 24, background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)' }}>
                                            <MonetizationOnIcon sx={{ fontSize: 16, color: '#000' }} />
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {t('orderSuccess.total')}
                                            </Typography>
                                            <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700 }}>
                                                {formatCurrency(orderData.pricing.totalPrice)} {t('orderSuccess.currency')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ borderColor: 'rgba(212,175,55,0.3)', my: 2 }} />

                            {/* Cancellation Details */}
                            {orderData.status === 'CANCELLED' && (
                                <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: `${statusColor.bg}`, border: `1px solid ${statusColor.border}` }}>
                                    <Typography sx={{ color: statusColor.color, fontWeight: 700, fontSize: '0.95rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CancelIcon /> {t('trackOrder.cancellationDetails')}
                                    </Typography>
                                    {orderData.cancellationReason && (
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                                            <NoteIcon sx={{ color: statusColor.color, fontSize: 18, mt: 0.2 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {t('trackOrder.cancellationReason')}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                    {orderData.cancellationReason}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    {orderData.cancelledAt && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarTodayIcon sx={{ color: statusColor.color, fontSize: 18 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {t('trackOrder.cancelledAt')}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                    {formatDate(orderData.cancelledAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Delivery Details */}
                            {orderData.status === 'DELIVERED' && orderData.deliveredAt && (
                                <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: `${statusColor.bg}`, border: `1px solid ${statusColor.border}` }}>
                                    <Typography sx={{ color: statusColor.color, fontWeight: 700, fontSize: '0.95rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocalShippingIcon /> {t('trackOrder.deliveryDetails')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarTodayIcon sx={{ color: statusColor.color, fontSize: 18 }} />
                                        <Box>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {t('trackOrder.deliveredAt')}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                {formatDate(orderData.deliveredAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {/* Guest Info */}
                            <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'rgba(212,175,55,0.05)' }}>
                                <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem', mb: 1.5 }}>
                                    {t('trackOrder.guestInfo')}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                                {orderData.guestInfo?.username}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                                {orderData.guestInfo?.email}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Order Items */}
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    onClick={() => showCollapseArrow && setIsOrderSummaryCollapsed(!isOrderSummaryCollapsed)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: showCollapseArrow ? 'pointer' : 'default',
                                        mb: 2,
                                        pb: 1,
                                        borderBottom: '1px solid rgba(212,175,55,0.2)',
                                    }}
                                >
                                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1rem' }}>
                                        {t('orderConfirm.orderSummary')}
                                    </Typography>
                                    {showCollapseArrow && (
                                        <ExpandMoreIcon
                                            sx={{
                                                color: '#D4AF37',
                                                transition: 'transform 0.3s ease',
                                                transform: isOrderSummaryCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                            }}
                                        />
                                    )}
                                </Box>
                                <Collapse in={!isOrderSummaryCollapsed}>
                                    <List sx={{ p: 0 }}>
                                        {orderData.items?.map((item, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    p: 2,
                                                    mb: 1,
                                                    borderRadius: 2,
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(212,175,55,0.1)',
                                                    flexDirection: 'row-reverse',
                                                }}
                                            >
                                                <ListItemAvatar sx={{ minWidth: 'auto' }}>
                                                    <Avatar
                                                        src={getImageUrl(item.primaryImageUrl)}
                                                        imgProps={{ onError: (e) => { e.target.src = null; } }}
                                                        sx={{ width: 60, height: 60, border: '1px solid rgba(212,175,55,0.3)' }}
                                                    >
                                                        {!getImageUrl(item.primaryImageUrl) && <ShoppingBagIcon />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    sx={{ textAlign: isRTL ? 'right' : 'left' }}
                                                    primaryTypographyProps={{ component: 'div' }}
                                                    secondaryTypographyProps={{ component: 'div' }}
                                                    primary={
                                                        <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            {item.translatedName?.[i18n.language] || item.name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, direction: isRTL ? 'rtl' : 'ltr' }}>
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                                                    {item.brand}
                                                                </Typography>
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                                                    •
                                                                </Typography>
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', direction: 'ltr' }}>
                                                                    {t(`perfumeDetails.enums.sizes.${item.size}`, { defaultValue: item.size })}
                                                                </Typography>
                                                            </Box>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', mt: 0.5 }}>
                                                                {t('orderConfirm.qty')}: {formatInt(item.quantity)}
                                                            </Typography>
                                                            <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.85rem', mt: 0.5 }}>
                                                                {formatCurrency(item.subtotal)} {t('orderSuccess.currency')}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </Box>

                            {/* Pricing */}
                            <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                                <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ReceiptIcon /> {t('orderConfirm.pricing')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{t('orderConfirm.subtotal')}</Typography>
                                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.85rem' }}>{formatCurrency(orderData.pricing.subtotal)} {t('orderSuccess.currency')}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{t('orderConfirm.shippingFee')}</Typography>
                                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.85rem' }}>{formatCurrency(orderData.pricing.shippingFee)} {t('orderSuccess.currency')}</Typography>
                                    </Box>
                                    <Divider sx={{ borderColor: 'rgba(212,175,55,0.3)' }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem' }}>{t('orderConfirm.total')}</Typography>
                                        <Typography sx={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.1rem' }}>{formatCurrency(orderData.pricing.totalPrice)} {t('orderSuccess.currency')}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Shipping Info */}
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem', mb: 1.5, pb: 1, borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                                    {t('orderConfirm.deliverySection')}
                                </Typography>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <LocationOnIcon sx={{ color: '#D4AF37', fontSize: 18, mt: 0.2 }} />
                                            <Box sx={{ flex: 1 }}>
                                                {orderData.shippingInfo?.governorate && (
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, mb: 0.3 }}>
                                                        {t('governorates.' + orderData.shippingInfo.governorate, { defaultValue: orderData.shippingInfo.governorate })}
                                                    </Typography>
                                                )}
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                    {orderData.shippingInfo?.address}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {t('orderConfirm.phoneNumber')}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                    {orderData.shippingInfo?.phoneNumber}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    {orderData.shippingInfo?.alternativePhoneNumber && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                                                <Box>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {t('orderConfirm.alternativePhone')}
                                                    </Typography>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                        {orderData.shippingInfo.alternativePhoneNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>

                            {/* Notes */}
                            {orderData.notes && (
                                <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: 'rgba(212,175,55,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <NoteIcon sx={{ color: '#D4AF37', fontSize: 18, mt: 0.2 }} />
                                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                            {orderData.notes}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Cancellable Order Alert */}
                            {canCancel && (
                                <Fade in={canCancel}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            alignItems: { xs: 'stretch', sm: 'center' },
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            mb: 3,
                                            p: 2,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(244,67,54,0.08) 0%, rgba(244,67,54,0.03) 100%)',
                                            border: '1px solid rgba(244,67,54,0.25)',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 38, height: 38, background: 'rgba(244,67,54,0.15)' }}>
                                                <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>
                                                    {t('trackOrder.canStillCancelTitle')}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                                                    {t('trackOrder.canStillCancelSubtitle')}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Button
                                            onClick={() => setCancelModalOpen(true)}
                                            startIcon={<CancelIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                                            sx={{
                                                flexShrink: 0,
                                                py: 1,
                                                px: 2,
                                                borderRadius: 2,
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                textTransform: 'none',
                                                color: '#f44336',
                                                background: 'rgba(244, 67, 54, 0.12)',
                                                border: '1.5px solid #f44336',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: '#f44336',
                                                    color: '#FFFFFF',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 16px rgba(244,67,54,0.4)',
                                                },
                                                '&:active': { transform: 'translateY(0)' },
                                            }}
                                        >
                                            {t('trackOrder.cancelOrder')}
                                        </Button>
                                    </Box>
                                </Fade>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Order Confirmation Modal */}
            <ConfirmationModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleCancelOrder}
                title={t('trackOrder.cancelOrderTitle')}
                message={t('trackOrder.cancelOrderMessage')}
                confirmText={t('trackOrder.confirmCancel')}
                cancelText={t('common.cancel')}
                loading={isCancelling}
            >
                <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={t('trackOrder.cancelReasonPlaceholder')}
                    sx={{...fieldSx(), mb:2}}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5, ml: isRTL ? 1 : 0 }}>
                                <NoteIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfirmationModal>
        </>
    );
};

export default TrackOrderDialog;
