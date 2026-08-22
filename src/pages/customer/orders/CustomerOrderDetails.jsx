import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCustomerOrderByOrderNumberQuery, useCancelCustomerOrderMutation } from '../../../redux/api/customerApi';
import { useTrackGuestOrderQuery, useCancelGuestOrderMutation } from '../../../redux/api/orderApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
import ConfirmationModal from '../../../components/ConfirmationModal';
import { handleError } from '../../../utils/toastHelper';

const fieldSx = () => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        '& input, & textarea': { color: '#FFFFFF', py: 1.5 },
        '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37' },
    },
    '& .MuiFormHelperText-root': { color: '#f44336', marginLeft: 0 },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
});

const statusConfig = {
    PENDING: { bg: 'rgba(243,156,18,0.15)', border: '#f39c12', color: '#f39c12' },
    PROCESSING: { bg: 'rgba(52,152,219,0.15)', border: '#3498db', color: '#3498db' },
    DELIVERED: { bg: 'rgba(46,204,113,0.15)', border: '#2ecc71', color: '#2ecc71' },
    CANCELLED: { bg: 'rgba(231,76,60,0.15)', border: '#e74c3c', color: '#e74c3c' },
};

const CustomerOrderDetails = () => {
    const { orderNumber } = useParams();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();
    const location = useLocation();

    const [orderContext] = useState(() => {
        const state = location.state || {};
        if (state.orderType) {
            sessionStorage.setItem(
                'customerOrderContext',
                JSON.stringify({ orderType: state.orderType, email: state.email })
            );
            return { orderType: state.orderType, email: state.email };
        }
        try {
            const saved = JSON.parse(sessionStorage.getItem('customerOrderContext') || '{}');
            return { orderType: saved.orderType || 'CUSTOMER', email: saved.email };
        } catch {
            return { orderType: 'CUSTOMER', email: null };
        }
    });

    const isGuest = orderContext.orderType === 'GUEST';

    const customerQuery = useGetCustomerOrderByOrderNumberQuery(orderNumber, { skip: isGuest });
    const guestQuery = useTrackGuestOrderQuery(
        { orderNumber, email: orderContext.email },
        { skip: !isGuest }
    );

    const isLoading = isGuest ? guestQuery.isLoading : customerQuery.isLoading;
    const raw = (isGuest ? guestQuery.data : customerQuery.data)?.data;

    const order = raw && {
        ...raw,
        customerName: isGuest
            ? raw.guestInfo?.username || raw.customerName
            : [raw.customerInfo?.firstName, raw.customerInfo?.lastName].filter(Boolean).join(' ') || raw.customerName,
        email: isGuest ? raw.guestInfo?.email : raw.customerInfo?.email,
        pricing: { discountAmount: 0, shippingFee: 0, subtotal: 0, totalPrice: 0, ...(raw.pricing || {}) },
        shippingInfo: raw.shippingInfo || {},
    };

    const [itemsExpanded, setItemsExpanded] = useState(true);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const [cancelCustomerOrder, { isLoading: isCancellingCustomer }] = useCancelCustomerOrderMutation();
    const [cancelGuestOrder, { isLoading: isCancellingGuest }] = useCancelGuestOrderMutation();
    const isCancelling = isGuest ? isCancellingGuest : isCancellingCustomer;

    const showCollapseArrow = order?.items?.length >= 2;
    const statusColor = statusConfig[order?.status] || statusConfig.PENDING;
    const canCancel = order?.status === 'PENDING' && !order?.cancelledAt;

    const formatCurrency = (value) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);

    const formatInt = (value) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(value);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(dateStr));
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`;
    };

    const handleCancelOrder = async () => {
        try {
            if (isGuest) {
                await cancelGuestOrder({
                    orderNumber,
                    cancelData: { email: orderContext.email, cancellationReason: cancelReason },
                }).unwrap();
                guestQuery.refetch();
            } else {
                await cancelCustomerOrder({
                    orderNumber,
                    cancelData: { cancellationReason: cancelReason },
                }).unwrap();
                customerQuery.refetch();
            }
            setCancelModalOpen(false);
            setCancelReason('');
        } catch (err) {
            handleError(err?.data?.message || err?.message || 'Failed to cancel order');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)', py: 4, px: 2 }}>
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <IconButton onClick={() => navigate('/my-orders')} size="small" sx={{ color: '#000', '&:hover svg': { color: '#D4AF37', transform: isRTL ? 'scale(1.2) rotate(10deg)' : 'scale(1.2) rotate(-10deg)' } }}>
                            {isRTL ? <ArrowForwardIcon sx={{ transition: 'all 0.3s ease', fontSize: '2rem' }} /> : <ArrowBackIcon sx={{ transition: 'all 0.3s ease', fontSize: '2rem' }} />}
                        </IconButton>
                        <Box sx={{ width: 'fit-content' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                                {t('customer.orders.detail.pageTitle')}{' '}
                                <span style={{ color: '#D4AF37' }}>{t('customer.orders.detail.pageTitleHighlight')}</span>
                            </Typography>
                            <Box sx={{
                                width: '100%',
                                height: 3,
                                background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                mt: 0.5,
                            }} />
                        </Box>
                    </Box>
                    <Paper elevation={0} sx={{
                        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                        border: '2px solid #D4AF37',
                        borderRadius: 4,
                        p: 4,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                    }}>
                        <CircularProgress sx={{ color: '#D4AF37' }} />
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (!order) {
        return (
            <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)', py: 4, px: 2 }}>
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <IconButton onClick={() => navigate('/my-orders')} size="small" sx={{ color: '#000', '&:hover svg': { color: '#D4AF37', transform: isRTL ? 'scale(1.2) rotate(10deg)' : 'scale(1.2) rotate(-10deg)' } }}>
                            {isRTL ? <ArrowForwardIcon sx={{ transition: 'all 0.3s ease', fontSize: '2rem' }} /> : <ArrowBackIcon sx={{ transition: 'all 0.3s ease', fontSize: '2rem' }} />}
                        </IconButton>
                        <Box sx={{ width: 'fit-content' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                                {t('customer.orders.detail.pageTitle')}{' '}
                                <span style={{ color: '#D4AF37' }}>{t('customer.orders.detail.pageTitleHighlight')}</span>
                            </Typography>
                            <Box sx={{
                                width: '100%',
                                height: 3,
                                background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                mt: 0.5,
                            }} />
                        </Box>
                    </Box>
                    <Paper elevation={0} sx={{
                        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                        border: '2px solid #D4AF37',
                        borderRadius: 4,
                        p: 4, textAlign: 'center',
                    }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', mb: 2 }}>
                            {t('customer.orders.notFound')}
                        </Typography>
                        <Button
                            onClick={() => navigate('/my-orders')}
                            startIcon={isRTL ? <ArrowForwardIcon /> : <ArrowBackIcon />}
                            sx={{ color: '#D4AF37', textTransform: 'none', fontWeight: 700 }}
                        >
                            {t('customer.orders.backToList')}
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const pricing = order.pricing || {};
    const shippingInfo = order.shippingInfo || {};

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)',
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 2 },
        }}>
            <Container maxWidth="md">
                <Fade in timeout={1000}>
                    <Box>
                        {/* Back Button + Title */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
                            <IconButton
                                onClick={() => navigate('/my-orders')}
                                size="small"
                                sx={{
                                    color: '#000',
                                    '&:hover svg': {
                                        color: '#D4AF37',
                                        transform: isRTL ? 'scale(1.2) rotate(10deg)' : 'scale(1.2) rotate(-10deg)',
                                    },
                                }}
                            >
                                {isRTL ? <ArrowForwardIcon sx={{ transition: 'all 0.3s ease', fontSize: '2rem' }} /> : <ArrowBackIcon sx={{ transition: 'all 0.3s ease', fontSize: '2rem' }} />}
                            </IconButton>
                            <Box sx={{ width: 'fit-content' }}>
                                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                                    {t('customer.orders.detail.pageTitle')}{' '}
                                    <span style={{ color: '#D4AF37' }}>{t('customer.orders.detail.pageTitleHighlight')}</span>
                                </Typography>
                                <Box sx={{
                                    width: '100%',
                                    height: 3,
                                    background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                    mt: 0.5,
                                }} />
                            </Box>
                        </Box>

                        <Paper elevation={0} sx={{
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                            border: '2px solid #D4AF37',
                            borderRadius: 4,
                            boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
                            overflow: 'hidden',
                        }}>
                            {/* Order Info Grid */}
                            <Grid container spacing={2} sx={{ p: 3 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {isRTL && <ShoppingBagIcon sx={{ color: '#D4AF37', fontSize: 24 }} />}
                                        <Box>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {t('orderSuccess.orderNumber')}
                                            </Typography>
                                            <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700 }}>
                                                {order.orderNumber}
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
                                                {formatDate(order.orderDate)}
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
                                                label={t(`orderSuccess.status.${order.status?.toLowerCase()}`, { defaultValue: order.status })}
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
                                                {formatCurrency(pricing.totalPrice)} {t('orderSuccess.currency')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ borderColor: 'rgba(212,175,55,0.3)', mx: 3 }} />

                            {/* Cancellation Details */}
                            {order.status === 'CANCELLED' && (
                                <Box sx={{ mx: 3, mt: 3, p: 2, borderRadius: 2, background: statusColor.bg, border: `1px solid ${statusColor.border}` }}>
                                    <Typography sx={{ color: statusColor.color, fontWeight: 700, fontSize: '0.95rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CancelIcon /> {t('trackOrder.cancellationDetails')}
                                    </Typography>
                                    {order.cancellationReason && (
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                                            <NoteIcon sx={{ color: statusColor.color, fontSize: 18, mt: 0.2 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {t('trackOrder.cancellationReason')}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                    {order.cancellationReason}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    {order.cancelledAt && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarTodayIcon sx={{ color: statusColor.color, fontSize: 18 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {t('trackOrder.cancelledAt')}
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                    {formatDate(order.cancelledAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Delivery Details */}
                            {order.status === 'DELIVERED' && order.deliveredAt && (
                                <Box sx={{ mx: 3, mt: 3, p: 2, borderRadius: 2, background: statusColor.bg, border: `1px solid ${statusColor.border}` }}>
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
                                                {formatDate(order.deliveredAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {/* Guest/Customer Info */}
                            <Box sx={{ mx: 3, mt: 3, p: 2, borderRadius: 2, background: 'rgba(212,175,55,0.05)' }}>
                                <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem', mb: 1.5 }}>
                                    {isGuest ? t('trackOrder.guestInfo') : t('customer.orders.detail.orderInfo')}
                                </Typography>
                                <Grid container spacing={2}>
                                    {order.customerName && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                                    {order.customerName}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                    {order.email && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EmailIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                                    {order.email}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>

                            {/* Order Items */}
                            <Box sx={{ mx: 3, mt: 3, mb: 3 }}>
                                <Box
                                    onClick={() => showCollapseArrow && setItemsExpanded(!itemsExpanded)}
                                    sx={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        cursor: showCollapseArrow ? 'pointer' : 'default',
                                        mb: 2, pb: 1, borderBottom: '1px solid rgba(212,175,55,0.2)',
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
                                                transform: itemsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                            }}
                                        />
                                    )}
                                </Box>
                                <Collapse in={itemsExpanded}>
                                    <List sx={{ p: 0 }}>
                                        {order.items?.map((item, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    p: 2, mb: 1, borderRadius: 2,
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
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>•</Typography>
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
                            <Box sx={{ mx: 3, mb: 3, p: 2, borderRadius: 2, background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                                <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ReceiptIcon /> {t('orderConfirm.pricing')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{t('orderConfirm.subtotal')}</Typography>
                                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.85rem' }}>{formatCurrency(pricing.subtotal)} {t('orderSuccess.currency')}</Typography>
                                    </Box>
                                    {pricing.discountAmount > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ color: '#9b59b6', fontSize: '0.85rem' }}>
                                                {t('customer.orders.detail.discount')}
                                                {order.couponInfo?.code ? ` (${order.couponInfo.code})` : ''}
                                            </Typography>
                                            <Typography sx={{ color: '#9b59b6', fontSize: '0.85rem' }}>
                                                -{formatCurrency(pricing.discountAmount)} {t('orderSuccess.currency')}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{t('orderConfirm.shippingFee')}</Typography>
                                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.85rem' }}>{formatCurrency(pricing.shippingFee)} {t('orderSuccess.currency')}</Typography>
                                    </Box>
                                    <Divider sx={{ borderColor: 'rgba(212,175,55,0.3)' }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem' }}>{t('orderConfirm.total')}</Typography>
                                        <Typography sx={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.1rem' }}>{formatCurrency(pricing.totalPrice)} {t('orderSuccess.currency')}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Shipping Info */}
                            <Box sx={{ mx: 3, mb: 2 }}>
                                <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem', mb: 1.5, pb: 1, borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                                    {t('orderConfirm.deliverySection')}
                                </Typography>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <LocationOnIcon sx={{ color: '#D4AF37', fontSize: 18, mt: 0.2 }} />
                                            <Box sx={{ flex: 1 }}>
                                                {shippingInfo.governorate && (
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, mb: 0.3 }}>
                                                        {t(`governorates.${shippingInfo.governorate}`, { defaultValue: shippingInfo.governorate })}
                                                    </Typography>
                                                )}
                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                    {shippingInfo.address}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    {shippingInfo.phoneNumber && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                                                <Box>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {t('orderConfirm.phoneNumber')}
                                                    </Typography>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                        {shippingInfo.phoneNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}
                                    {shippingInfo.alternativePhoneNumber && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                                                <Box>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {t('orderConfirm.alternativePhone')}
                                                    </Typography>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                                        {shippingInfo.alternativePhoneNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>

                            {/* Notes */}
                            {order.notes && (
                                <Box sx={{ mx: 3, mb: 2, p: 2, borderRadius: 2, background: 'rgba(212,175,55,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <NoteIcon sx={{ color: '#D4AF37', fontSize: 18, mt: 0.2 }} />
                                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                            {order.notes}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Cancel Button */}
                            {canCancel && (
                                <Fade in={canCancel}>
                                    <Box sx={{
                                        mx: 3, mb: 3, p: 2, borderRadius: 3,
                                        display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'stretch', sm: 'center' },
                                        justifyContent: 'space-between', gap: 2,
                                        background: 'linear-gradient(135deg, rgba(244,67,54,0.08) 0%, rgba(244,67,54,0.03) 100%)',
                                        border: '1px solid rgba(244,67,54,0.25)',
                                    }}>
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
                                                flexShrink: 0, py: 1, px: 2, borderRadius: 2,
                                                fontSize: '0.85rem', fontWeight: 700, textTransform: 'none',
                                                color: '#f44336',
                                                background: 'rgba(244,67,54,0.12)',
                                                border: '1.5px solid #f44336',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: '#f44336', color: '#FFFFFF',
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
                        </Paper>
                    </Box>
                </Fade>
            </Container>

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
                    sx={{ ...fieldSx(), mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5, ml: isRTL ? 1 : 0 }}>
                                <NoteIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />
            </ConfirmationModal>
        </Box>
    );
};

export default CustomerOrderDetails;
