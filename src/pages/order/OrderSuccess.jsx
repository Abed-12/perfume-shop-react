import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectIsCustomer } from '../../redux/slices/authSlice';
import { useTrackGuestOrderQuery } from '../../redux/api/orderApi';
import { useGetCustomerOrderByOrderNumberQuery } from '../../redux/api/customerApi';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NoteIcon from '@mui/icons-material/Note';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

// ─── Shared Styles ────────────────────────────────────────────────────────────────
const submitBtnSx = {
    mt: 2,
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
};

const outlineBtnSx = {
    mt: 2,
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

// ─── Component ────────────────────────────────────────────────────────────────
const OrderSuccess = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();
    const { orderNumber } = useParams();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');

    const isCustomer = useSelector(selectIsCustomer);

    // Determine which query to use based on user type
    const isGuest = !isCustomer && email;
    
    const { data: guestOrderData, isLoading: guestLoading, isError: guestError, refetch: guestRefetch } = useTrackGuestOrderQuery(
        { orderNumber, email },
        { skip: !isGuest, refetchOnMountOrArgChange: true }
    );

    const { data: customerOrderData, isLoading: customerLoading, isError: customerError, refetch: customerRefetch } = useGetCustomerOrderByOrderNumberQuery(
        orderNumber,
        { skip: isGuest || !isCustomer, refetchOnMountOrArgChange: true }
    );

    const orderData = isGuest ? guestOrderData?.data : customerOrderData?.data;
    const isLoading = isGuest ? guestLoading : customerLoading;
    const isError = isGuest ? guestError : customerError;
    const refetch = isGuest ? guestRefetch : customerRefetch;

    // Format helpers
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

    const formatInt = (value) => {
        return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(value);
    };

    const handleTrackOrder = () => {
        if (isGuest && email) {
            navigate(`/?trackOrder=true&orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`, { replace: true });
        } else if (isCustomer) {
            navigate(`/my-orders/${orderNumber}`, {
                replace: true,
                state: { orderType: 'CUSTOMER' },
            });
        }
    };

    const [isOrderSummaryCollapsed, setIsOrderSummaryCollapsed] = useState(false);
    const showCollapseArrow = orderData?.items?.length >= 2;

    // ─── Loading State ───────────────────────────────────────────────────────────
    if (isLoading) {
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
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.15) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    },
                }}
            >
                <Container maxWidth="sm">
                    <Fade in timeout={800}>
                        <Paper
                            sx={{
                                p: 6,
                                borderRadius: 4,
                                border: '2px solid #D4AF37',
                                boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
                                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                textAlign: 'center',
                            }}
                        >
                            <CircularProgress sx={{ color: '#D4AF37', mb: 3 }} />
                            <Typography sx={{ color: '#FFFFFF', fontSize: '1.1rem' }}>
                                {t('orderSuccess.loading')}
                            </Typography>
                        </Paper>
                    </Fade>
                </Container>
            </Box>
        );
    }

    // ─── Error State ─────────────────────────────────────────────────────────────
    if (isError || !orderData) {
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
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.15) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    },
                }}
            >
                <Container maxWidth="sm">
                    <Fade in timeout={800}>
                        <Paper
                            sx={{
                                p: 6,
                                borderRadius: 4,
                                border: '2px solid #D4AF37',
                                boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
                                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h6" sx={{ color: '#D4AF37', fontWeight: 700, mb: 2 }}>
                                {t('orderSuccess.error')}
                            </Typography>
                            <Button onClick={refetch} sx={submitBtnSx}>
                                {t('orderSuccess.retry')}
                            </Button>
                        </Paper>
                    </Fade>
                </Container>
            </Box>
        );
    }

    // ─── Success State ───────────────────────────────────────────────────────────
    const userEmail = isGuest ? orderData.guestInfo?.email : orderData.customerInfo?.email;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)',
                position: 'relative',
                py: { xs: 2, sm: 3, md: 4 },
                px: { xs: 1, sm: 2 },
            }}
        >
            <Container maxWidth="md">
                <Fade in timeout={700}>
                    <Box>
                        {/* ── Page Header ── */}
                        <Slide direction="down" in timeout={600}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 0.5, sm: 1, md: 1.5 }, mb: 4 }}>
                                <IconButton
                                    onClick={() => navigate('/perfumes')}
                                    size="small"
                                    sx={{
                                        color: '#000',
                                        padding: { xs: '4px', sm: '5px', md: '6px' },
                                        transition: 'all 0.3s ease',
                                        flexShrink: 0,
                                        '&:hover svg': {
                                            color: '#D4AF37',
                                            transform: isRTL ? 'scale(1.2) rotate(10deg)' : 'scale(1.2) rotate(-10deg)',
                                        },
                                    }}
                                >
                                    {isRTL ? (
                                        <ArrowForwardIcon sx={{ transition: 'all 0.3s ease', fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' } }} />
                                    ) : (
                                        <ArrowBackIcon sx={{ transition: 'all 0.3s ease', fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' } }} />
                                    )}
                                </IconButton>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            color: '#000',
                                            fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.6rem' },
                                            fontFamily: isRTL ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" : "'Montserrat', sans-serif",
                                        }}
                                    >
                                        {t('orderSuccess.title')}{' '}
                                        <Box component="span" sx={{ color: '#D4AF37' }}>
                                            {t('orderSuccess.titleHighlight')}
                                        </Box>
                                    </Typography>
                                    <Box sx={{
                                        maxWidth: { xs: '100%', sm: isRTL ? 280 : 420, md: isRTL ? 300 : 400 },
                                        marginLeft: isRTL ? 'auto' : 0,
                                        marginRight: isRTL ? 0 : 'auto',
                                        height: { xs: 2, md: 3 },
                                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                        transform: isRTL ? 'scaleX(-1)' : 'none',
                                        mt: { xs: 0.75, md: 1 },
                                        borderRadius: 1,
                                    }} />
                                </Box>
                            </Box>
                        </Slide>

                        {/* ── Success Card ── */}
                        <Slide direction="up" in timeout={700}>
                            <Paper
                                sx={{
                                    p: { xs: 3, sm: 4, md: 5 },
                                    borderRadius: 4,
                                    border: '2px solid #D4AF37',
                                    boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
                                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.12) 0%, transparent 55%)',
                                        pointerEvents: 'none',
                                    },
                                }}
                            >
                                {/* Success Icon */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
                                        }}
                                    >
                                        <CheckCircleIcon sx={{ fontSize: 48, color: '#FFF' }} />
                                    </Avatar>
                                </Box>

                                {/* Title & Subtitle */}
                                <Box sx={{ textAlign: 'center', mb: 4 }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: '#FFFFFF',
                                            fontWeight: 800,
                                            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                                            mb: 1,
                                        }}
                                    >
                                        {t('orderSuccess.title')}{' '}
                                        <Box component="span" sx={{ color: '#D4AF37' }}>
                                            {t('orderSuccess.titleHighlight')}
                                        </Box>
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                                        {t('orderSuccess.subtitle')}
                                    </Typography>
                                </Box>

                                <Divider sx={{ borderColor: 'rgba(212,175,55,0.3)', my: 3 }} />

                                {/* Order Details */}
                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    {/* Order Number */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <ShoppingBagIcon sx={{ color: '#D4AF37', fontSize: 28 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    {t('orderSuccess.orderNumber')}
                                                </Typography>
                                                <Typography sx={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700 }}>
                                                    {orderData.orderNumber}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Order Date */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <CalendarTodayIcon sx={{ color: '#D4AF37', fontSize: 28 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    {t('orderSuccess.orderDate')}
                                                </Typography>
                                                <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 600 }}>
                                                    {formatDate(orderData.orderDate)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Status */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <LocalShippingIcon sx={{ color: '#D4AF37', fontSize: 28 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    {t('orderSuccess.statusLabel')}
                                                </Typography>
                                                <Chip
                                                    label={t(`orderSuccess.status.${orderData.status?.toLowerCase()}`, { defaultValue: orderData.status })}
                                                    size="small"
                                                    sx={{
                                                        background: 'rgba(212,175,55,0.15)',
                                                        border: '1px solid #D4AF37',
                                                        color: '#D4AF37',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 700,
                                                        height: 28,
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Total */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 28, height: 28, background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)' }}>
                                                <MonetizationOnIcon sx={{ fontSize: 18, color: '#000' }} />
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    {t('orderSuccess.total')}
                                                </Typography>
                                                <Typography sx={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700 }}>
                                                    {formatCurrency(orderData.pricing.totalPrice)} {t('orderSuccess.currency')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ borderColor: 'rgba(212,175,55,0.3)', my: 3 }} />

                                {/* Email Notification */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4, p: 2, borderRadius: 2, background: 'rgba(212,175,55,0.08)' }}>
                                    <EmailIcon sx={{ color: '#D4AF37', fontSize: 32 }} />
                                    <Box sx={{ textAlign: isRTL ? 'right' : 'left' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            {t('orderSuccess.emailSent')} <strong style={{ color: '#D4AF37' }}>{userEmail}</strong>
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                                            {t('orderSuccess.checkEmail')}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Order Items */}
                                <Box sx={{ mb: 4 }}>
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
                                        <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem' }}>
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
                                    <Box
                                        sx={{
                                            overflow: 'hidden',
                                            transition: 'max-height 0.4s ease, opacity 0.3s ease',
                                            maxHeight: isOrderSummaryCollapsed ? '0px' : '2000px',
                                            opacity: isOrderSummaryCollapsed ? 0 : 1,
                                        }}
                                    >
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
                                                        '&:hover': { background: 'rgba(212,175,55,0.05)' },
                                                        flexDirection: 'row-reverse',
                                                    }}
                                                >
                                                    <ListItemAvatar sx={{ minWidth: 'auto' }}>
                                                        <Avatar
                                                            src={getImageUrl(item.primaryImageUrl)}
                                                            imgProps={{ onError: (e) => { e.target.src = null; } }}
                                                            sx={{ width: 80, height: 80, border: '1px solid rgba(212,175,55,0.3)' }}
                                                        >
                                                            {!getImageUrl(item.primaryImageUrl) && <ShoppingBagIcon />}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        sx={{ textAlign: isRTL ? 'right' : 'left' }}
                                                        primaryTypographyProps={{ component: 'div' }}
                                                        secondaryTypographyProps={{ component: 'div' }}
                                                        primary={
                                                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '1rem' }}>
                                                                {item.translatedName?.[i18n.language] || item.name}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Box sx={{ mt: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, direction: isRTL ? 'rtl' : 'ltr' }}>
                                                                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                                                        {item.brand}
                                                                    </Typography>
                                                                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                                                        •
                                                                    </Typography>
                                                                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', direction: 'ltr' }}>
                                                                        {t(`perfumeDetails.enums.sizes.${item.size}`, { defaultValue: item.size })}
                                                                    </Typography>
                                                                </Box>
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mt: 0.5 }}>
                                                                    {t('orderConfirm.qty')}: {formatInt(item.quantity)}
                                                                </Typography>
                                                                <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem', mt: 0.5 }}>
                                                                    {formatCurrency(item.subtotal)} {t('orderSuccess.currency')}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </Box>

                                {/* Pricing Details */}
                                <Box sx={{ mb: 4, p: 3, borderRadius: 2, background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ReceiptIcon /> {t('orderConfirm.pricing')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{t('orderConfirm.subtotal')}</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>{formatCurrency(orderData.pricing.subtotal)} {t('orderSuccess.currency')}</Typography>
                                        </Box>
                                        {orderData.pricing.discountAmount > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{t('orderConfirm.discount')}</Typography>
                                                <Typography sx={{ color: '#4CAF50' }}>-{formatCurrency(orderData.pricing.discountAmount)} {t('orderSuccess.currency')}</Typography>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{t('orderConfirm.shippingFee')}</Typography>
                                            <Typography sx={{ color: '#FFFFFF' }}>{formatCurrency(orderData.pricing.shippingFee)} {t('orderSuccess.currency')}</Typography>
                                        </Box>
                                        <Divider sx={{ borderColor: 'rgba(212,175,55,0.3)' }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem' }}>{t('orderConfirm.total')}</Typography>
                                            <Typography sx={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.3rem' }}>{formatCurrency(orderData.pricing.totalPrice)} {t('orderSuccess.currency')}</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Shipping Info */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem', mb: 2, pb: 1, borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                                        {t('orderConfirm.deliverySection')}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <LocationOnIcon sx={{ color: '#D4AF37', fontSize: 20, mt: 0.3 }} />
                                                <Box>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                        {t('governorates.' + orderData.shippingInfo.governorate, { defaultValue: orderData.shippingInfo.governorate })}
                                                    </Typography>
                                                    <Typography sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                                                        {orderData.shippingInfo.address}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <PhoneIcon sx={{ color: '#D4AF37', fontSize: 20, mt: 0.3 }} />
                                                <Box>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                        {t('orderConfirm.phoneNumber')}
                                                    </Typography>
                                                    <Typography sx={{ color: '#FFFFFF', fontSize: '0.95rem', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                                                        {orderData.shippingInfo.phoneNumber}
                                                    </Typography>
                                                    {orderData.shippingInfo.alternativePhoneNumber && (
                                                        <Box sx={{ display: 'flex', flexDirection: isRTL ? 'row' : 'row', gap: 0.5, alignItems: 'center' }}>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                                                {t('orderConfirm.alternativePhone')}:
                                                            </Typography>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', direction: 'ltr' }}>
                                                                {orderData.shippingInfo.alternativePhoneNumber}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    {orderData.notes && (
                                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 2, background: 'rgba(212,175,55,0.05)' }}>
                                            <NoteIcon sx={{ color: '#D4AF37', fontSize: 20, mt: 0.3 }} />
                                            <Box>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {t('orderConfirm.notes')}
                                                </Typography>
                                                <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem' }}>
                                                    {orderData.notes}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>

                                {/* Customer/Guest Info */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.1rem', mb: 2, pb: 1, borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                                        {isGuest ? t('orderConfirm.guestSection') : t('customer.profile.personalData')}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {isGuest ? (
                                            <>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <PersonIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                                                        <Box>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                                {t('orderConfirm.fullName')}
                                                            </Typography>
                                                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                                                                {orderData.guestInfo?.username}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <EmailIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                                                        <Box>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                                {t('orderConfirm.email')}
                                                            </Typography>
                                                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                                                                {orderData.guestInfo?.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </>
                                        ) : (
                                            <>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <PersonIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                                                        <Box>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                                {t('customer.profile.firstName')}
                                                            </Typography>
                                                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                                                                {orderData.customerInfo?.firstName} {orderData.customerInfo?.lastName}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <EmailIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                                                        <Box>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                                                {t('customer.profile.email')}
                                                            </Typography>
                                                            <Typography sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                                                                {orderData.customerInfo?.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                    {orderData.couponInfo && (
                                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                                            <Typography sx={{ color: '#4CAF50', fontWeight: 700, fontSize: '0.9rem' }}>
                                                {t('orderConfirm.couponCode')}: {orderData.couponInfo.code} ({orderData.couponInfo.discountType === 'PERCENTAGE' ? formatInt(orderData.couponInfo.discountValue) + '%' : formatCurrency(orderData.couponInfo.discountValue) + ' ' + t('orderSuccess.currency')})
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Action Buttons */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            fullWidth
                                            onClick={handleTrackOrder}
                                            sx={{
                                                ...submitBtnSx,
                                                '& .MuiButton-startIcon': {
                                                    mr: isRTL ? 0 : 1,
                                                    ml: isRTL ? 1 : 0,
                                                },
                                            }}
                                            startIcon={<LocalShippingIcon />}
                                        >
                                            {t('orderSuccess.trackOrder')}
                                        </Button>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            fullWidth
                                    onClick={() => navigate('/perfumes', { replace: true })}
                                            sx={outlineBtnSx}
                                        >
                                            {t('orderSuccess.continueShopping')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Slide>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default OrderSuccess;
