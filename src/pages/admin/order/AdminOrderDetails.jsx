import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    useGetGuestOrderDetailsQuery,
    useGetCustomerOrderDetailsQuery,
    useUpdateOrderStatusMutation,
} from '../../../redux/api/adminApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { handleError, handleSuccess } from '../../../utils/toastHelper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import NoteIcon from '@mui/icons-material/Note';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

const statusConfig = {
    PENDING: { bg: 'rgba(243,156,18,0.15)', border: '#f39c12', color: '#f39c12', icon: <InventoryIcon /> },
    PROCESSING: { bg: 'rgba(52,152,219,0.15)', border: '#3498db', color: '#3498db', icon: <ShoppingBagIcon /> },
    DELIVERED: { bg: 'rgba(46,204,113,0.15)', border: '#2ecc71', color: '#2ecc71', icon: <CheckCircleIcon /> },
    CANCELLED: { bg: 'rgba(231,76,60,0.15)', border: '#e74c3c', color: '#e74c3c', icon: <CancelIcon /> },
};

const DetailsSkeleton = () => (
    <Paper elevation={0} sx={{
        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
        border: '2px solid #D4AF37',
        borderRadius: { xs: '14px', md: '20px' },
        overflow: 'hidden',
    }}>
        <Box sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.1)', borderRadius: '10px', mb: 2 }} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={50} sx={{ bgcolor: 'rgba(212,175,55,0.07)', borderRadius: '10px', mb: 1.5 }} />
                    ))}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={50} sx={{ bgcolor: 'rgba(212,175,55,0.07)', borderRadius: '10px', mb: 1.5 }} />
                    ))}
                </Grid>
            </Grid>
        </Box>
    </Paper>
);

const InfoBlock = ({ icon, label, children }) => (
    <Box sx={{
        display: 'flex', alignItems: 'flex-start', gap: 1.5,
        py: 1.2,
        borderBottom: '1px solid rgba(212,175,55,0.07)',
    }}>
        <Box sx={{ color: '#D4AF37', mt: 0.15, flexShrink: 0, opacity: 0.8, '& svg': { fontSize: '17px' } }}>
            {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 0.4 }}>
                {label}
            </Typography>
            {children}
        </Box>
    </Box>
);

const SectionTitle = ({ children, sx }) => (
    <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, my: 2,
        '&::after': { content: '""', flex: 1, height: '1px', background: 'rgba(212,175,55,0.18)' },
        ...sx,
    }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#D4AF37', whiteSpace: 'nowrap' }}>
            {children}
        </Typography>
    </Box>
);

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
});

const AdminOrderDetails = () => {
    const { orderNumber } = useParams();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();

    const isGuest = orderNumber?.startsWith('GST-');
    const email = location.state?.email;
    const fromTab = location.state?.tab || 'guest';

    const [itemsExpanded, setItemsExpanded] = useState(true);

    const { data: guestResponse, isLoading: isGuestLoading } = useGetGuestOrderDetailsQuery(
        { orderNumber, email },
        { skip: !isGuest }
    );

    const { data: customerResponse, isLoading: isCustomerLoading } = useGetCustomerOrderDetailsQuery(
        orderNumber,
        { skip: isGuest }
    );

    const response = isGuest ? guestResponse : customerResponse;
    const isLoading = isGuest ? isGuestLoading : isCustomerLoading;
    const order = response?.data;

    const showCollapseArrow = order?.items?.length >= 2;

    const formattedNumber = (value) => {
        if (value == null) return '';
        return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            minimumFractionDigits: 2,
        }).format(value);
    };

    const formattedInt = (value) => {
        if (value == null) return '';
        return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(value);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(dateStr));
    };

    const SIZE_LABELS = { SIZE_50: '50 ml', SIZE_100: '100 ml' };

    const displayItemName = (item) => item.translatedName?.[i18n.language] || item.name;

    const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    const [forwardModalOpen, setForwardModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    const forwardTransition = order?.status === 'PENDING'
        ? 'PROCESSING'
        : order?.status === 'PROCESSING' ? 'DELIVERED' : null;

    const forwardColor = forwardTransition === 'DELIVERED'
        ? { main: '#2ecc71', bg: 'rgba(46,204,113,0.12)', shadow: 'rgba(46,204,113,0.4)' }
        : { main: '#3498db', bg: 'rgba(52,152,219,0.12)', shadow: 'rgba(52,152,219,0.4)' };

    const canCancel = order?.status === 'PENDING' || order?.status === 'PROCESSING';

    const updateStatus = async (status) => {
        try {
            await updateOrderStatus({
                orderNumber,
                body: {
                    status,
                    ...(status === 'CANCELLED' ? { cancellationReason: cancellationReason.trim() } : {}),
                },
            }).unwrap();
            handleSuccess(t('admin.order.detail.statusUpdated'));
        } catch (err) {
            const message = err?.data?.message || err?.data || err?.message;
            if (message === 'order.status.same') {
                handleError(t('admin.order.detail.statusSame'));
            } else if (message === 'order.cancellation.reason.required') {
                handleError(t('admin.order.detail.cancellationReasonRequired'));
            } else if (message === 'order.status.transition.not.allowed') {
                handleError(t('admin.order.detail.transitionNotAllowed'));
            } else if (message === 'order.status.cannot.be.changed') {
                handleError(t('admin.order.detail.cannotChange'));
            } else {
                handleError(message || t('admin.order.detail.statusUpdateError'));
            }
        }
    };

    const handleForward = async () => {
        if (!forwardTransition) return;
        await updateStatus(forwardTransition);
        setForwardModalOpen(false);
    };

    const handleCancelOrder = async () => {
        if (!cancellationReason.trim()) {
            handleError(t('admin.order.detail.cancellationReasonRequired'));
            return;
        }
        await updateStatus('CANCELLED');
        setCancelModalOpen(false);
        setCancellationReason('');
    };

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)', py: 4, px: 2 }}>
                <Container maxWidth="lg"><DetailsSkeleton /></Container>
            </Box>
        );
    }

    if (!order) {
        return (
            <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)', py: 4, px: 2 }}>
                <Container maxWidth="lg">
                    <Paper elevation={0} sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(145deg, #000 0%, #1a1a1a 100%)', border: '2px solid #D4AF37', borderRadius: '20px' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
                            {t('admin.order.detail.notFound')}
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const st = statusConfig[order.status] || statusConfig.PENDING;
    const customerInfo = isGuest ? order.guestInfo : order.customerInfo;
    const customerName = isGuest ? customerInfo?.username : `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`.trim();
    const customerEmail = customerInfo?.email;

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)',
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 2 },
        }}>
            <Container maxWidth="lg">
                <Fade in timeout={1000}>
                    <Box>
                        {/* Back Button + Title */}
                        <Slide direction="down" in timeout={1000}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
                                <IconButton
                                    onClick={() => navigate(`/admin-panel/orders?tab=${fromTab}`)}
                                    size="small"
                                    sx={{
                                        color: '#000',
                                        '&:hover svg': {
                                            color: '#D4AF37',
                                            transform: isRTL ? 'scale(1.2) rotate(10deg)' : 'scale(1.2) rotate(-10deg)',
                                        },
                                    }}
                                >
                                    {isRTL
                                        ? <ArrowForwardIcon sx={{ transition: 'all 0.3s ease', fontSize: '2rem' }} />
                                        : <ArrowBackIcon sx={{ transition: 'all 0.3s ease', fontSize: '2rem' }} />
                                    }
                                </IconButton>
                                <Box>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 800, color: '#000', lineHeight: 1.1,
                                        fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                                    }}>
                                        {t('admin.order.detail.title')}{' '}
                                        <span style={{ color: '#D4AF37' }}>{order.orderNumber}</span>
                                    </Typography>
                                    <Box sx={{
                                        width: { xs: '100%', sm: 400 },
                                        height: 3,
                                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                        mt: 1,
                                    }} />
                                </Box>
                            </Box>
                        </Slide>

                        {/* Main Card */}
                        <Slide direction="up" in timeout={1000}>
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                                border: { xs: '1.5px solid #D4AF37', md: '2px solid #D4AF37' },
                                borderRadius: { xs: '14px', md: '20px' },
                                overflow: 'hidden',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 40px rgba(212,175,55,0.05)',
                            }}>

                                {/* Card Header */}
                                <Box sx={{
                                    p: { xs: 2, sm: 3 },
                                    borderBottom: '1px solid rgba(212,175,55,0.18)',
                                    background: 'rgba(212,175,55,0.025)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    flexWrap: 'wrap', gap: 2,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 50, height: 50, borderRadius: '14px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: st.bg, border: `1.5px solid ${st.border}`,
                                            color: st.color,
                                        }}>
                                            {st.icon}
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1rem' }}>
                                                {order.orderNumber}
                                            </Typography>
                                            <Chip
                                                label={t(`admin.order.status.${order.status}`)}
                                                size="small"
                                                sx={{
                                                    mt: 0.5,
                                                    background: st.bg,
                                                    border: `1px solid ${st.border}`,
                                                    color: st.color,
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip
                                            label={isGuest ? t('admin.order.detail.guestOrder') : t('admin.order.detail.customerOrder')}
                                            size="small"
                                            sx={{
                                                background: isGuest ? 'rgba(155,89,182,0.15)' : 'rgba(52,152,219,0.15)',
                                                border: `1px solid ${isGuest ? '#9b59b6' : '#3498db'}`,
                                                color: isGuest ? '#9b59b6' : '#3498db',
                                                fontWeight: 700, fontSize: '0.72rem',
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* Card Body */}
                                <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>

                                        {/* LEFT COLUMN */}
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            {/* Customer Info */}
                                            <SectionTitle>{t('admin.order.detail.customerInfo')}</SectionTitle>
                                            <InfoBlock icon={<PersonIcon />} label={t('admin.order.detail.name')}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.93rem' }}>
                                                    {customerName || '—'}
                                                </Typography>
                                            </InfoBlock>
                                            <InfoBlock icon={<EmailIcon />} label={t('admin.order.detail.email')}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.93rem' }}>
                                                    {customerEmail || '—'}
                                                </Typography>
                                            </InfoBlock>

                                            {/* Shipping Info */}
                                            <SectionTitle>{t('admin.order.detail.shippingInfo')}</SectionTitle>
                                            <InfoBlock icon={<PhoneIcon />} label={t('admin.order.detail.phone')}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.93rem' }}>
                                                    {order.shippingInfo?.phoneNumber || '—'}
                                                </Typography>
                                            </InfoBlock>
                                            {order.shippingInfo?.alternativePhoneNumber && (
                                                <InfoBlock icon={<PhoneIcon />} label={t('admin.order.detail.altPhone')}>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.93rem' }}>
                                                        {order.shippingInfo.alternativePhoneNumber}
                                                    </Typography>
                                                </InfoBlock>
                                            )}
                                            <InfoBlock icon={<LocationOnIcon />} label={t('admin.order.detail.governorate')}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.93rem' }}>
                                                    {order.shippingInfo?.governorate ? t(`governorates.${order.shippingInfo.governorate}`) : '—'}
                                                </Typography>
                                            </InfoBlock>
                                            <InfoBlock icon={<LocationOnIcon />} label={t('admin.order.detail.address')}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.93rem', lineHeight: 1.6 }}>
                                                    {order.shippingInfo?.address || '—'}
                                                </Typography>
                                            </InfoBlock>
                                        </Grid>

                                        {/* RIGHT COLUMN */}
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            {/* Order Info */}
                                            <SectionTitle>{t('admin.order.detail.orderInfo')}</SectionTitle>
                                            <InfoBlock icon={<CalendarTodayIcon />} label={t('admin.order.detail.orderDate')}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.93rem' }}>
                                                    {formatDate(order.orderDate)}
                                                </Typography>
                                            </InfoBlock>
                                            {order.deliveredAt && (
                                                <InfoBlock icon={<CheckCircleIcon />} label={t('admin.order.detail.deliveredAt')}>
                                                    <Typography sx={{ color: '#2ecc71', fontSize: '0.93rem' }}>
                                                        {formatDate(order.deliveredAt)}
                                                    </Typography>
                                                </InfoBlock>
                                            )}
                                            {order.cancelledAt && (
                                                <InfoBlock icon={<CancelIcon />} label={t('admin.order.detail.cancelledAt')}>
                                                    <Typography sx={{ color: '#e74c3c', fontSize: '0.93rem' }}>
                                                        {formatDate(order.cancelledAt)}
                                                    </Typography>
                                                </InfoBlock>
                                            )}
                                            {order.cancellationReason && (
                                                <InfoBlock icon={<CancelIcon />} label={t('admin.order.detail.cancellationReason')}>
                                                    <Typography sx={{ color: '#e74c3c', fontSize: '0.93rem', lineHeight: 1.6 }}>
                                                        {order.cancellationReason}
                                                    </Typography>
                                                </InfoBlock>
                                            )}
                                            {order.notes && (
                                                <InfoBlock icon={<StickyNote2Icon />} label={t('admin.order.detail.notes')}>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.93rem', lineHeight: 1.6 }}>
                                                        {order.notes}
                                                    </Typography>
                                                </InfoBlock>
                                            )}

                                            {/* Coupon Info */}
                                            {order.couponInfo && (
                                                <>
                                                    <SectionTitle>{t('admin.order.detail.couponInfo')}</SectionTitle>
                                                    <Box sx={{
                                                        display: 'flex', alignItems: 'center', gap: 2,
                                                        p: 2, borderRadius: '12px',
                                                        background: 'rgba(155,89,182,0.08)',
                                                        border: '1px solid rgba(155,89,182,0.25)',
                                                    }}>
                                                        <LocalOfferIcon sx={{ color: '#9b59b6' }} />
                                                        <Box>
                                                            <Typography sx={{ color: '#9b59b6', fontWeight: 700, fontSize: '0.9rem' }}>
                                                                {order.couponInfo.code}
                                                            </Typography>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                                                                {order.couponInfo.discountType === 'FIXED'
                                                                    ? `${formattedNumber(order.couponInfo.discountValue)} ${t('admin.order.table.currency')}`
                                                                    : `${formattedInt(order.couponInfo.discountValue)}%`
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </>
                                            )}
                                        </Grid>
                                    </Grid>

                                    {/* Items */}
                                    <Box
                                        onClick={() => showCollapseArrow && setItemsExpanded(!itemsExpanded)}
                                        sx={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            cursor: showCollapseArrow ? 'pointer' : 'default',
                                            mb: 2, pb: 1, borderBottom: '1px solid rgba(212,175,55,0.15)',
                                        }}
                                    >
                                        <SectionTitle sx={{ mb: 0, pb: 0, borderBottom: 'none' }}>{t('admin.order.detail.items')}</SectionTitle>
                                        {showCollapseArrow && (
                                            <ExpandMoreIcon sx={{
                                                color: '#D4AF37',
                                                transition: 'transform 0.3s ease',
                                                transform: itemsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                mb: -2
                                            }} />
                                        )}
                                    </Box>
                                    <Box sx={{
                                        display: 'flex', flexDirection: 'column', gap: 1.5,
                                        overflow: 'hidden',
                                        transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
                                        maxHeight: itemsExpanded ? '2000px' : '0px',
                                        opacity: itemsExpanded ? 1 : 0,
                                    }}>
                                        {order.items?.map((item, index) => (
                                            <Box key={item.itemId} sx={{
                                                display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 },
                                                p: { xs: 1.5, sm: 2 },
                                                background: 'rgba(212,175,55,0.03)',
                                                border: '1px solid rgba(212,175,55,0.12)',
                                                borderRadius: '14px',
                                                transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                                                transitionDelay: itemsExpanded ? `${index * 0.08}s` : '0s',
                                                transform: itemsExpanded ? 'translateY(0)' : 'translateY(-12px)',
                                                opacity: itemsExpanded ? 1 : 0,
                                                '&:hover': {
                                                    background: 'rgba(212,175,55,0.06)',
                                                    borderColor: 'rgba(212,175,55,0.25)',
                                                },
                                            }}>
                                                <Box
                                                    component="img"
                                                    src={`${import.meta.env.VITE_API_BASE_URL}${item.primaryImageUrl}`}
                                                    alt={item.name}
                                                    sx={{
                                                        width: { xs: 60, sm: 75 },
                                                        height: { xs: 60, sm: 75 },
                                                        borderRadius: '10px',
                                                        border: '1.5px solid rgba(212,175,55,0.3)',
                                                        objectFit: 'contain',
                                                        backgroundColor: '#fafafa',
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                                                        {displayItemName(item)}
                                                    </Typography>
                                                    {item.brand && (
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', mt: 0.3 }}>
                                                            {item.brand}
                                                        </Typography>
                                                    )}
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.8, flexWrap: 'wrap' }}>
                                                        <Chip
                                                            label={t(`perfumeDetails.enums.sizes.${item.size}`, { defaultValue: SIZE_LABELS[item.size] || item.size })}
                                                            size="small"
                                                            sx={{
                                                                background: 'rgba(212,175,55,0.1)',
                                                                border: '1px solid rgba(212,175,55,0.25)',
                                                                color: '#D4AF37',
                                                                fontSize: '0.68rem', fontWeight: 700, height: 22,
                                                            }}
                                                        />
                                                        <Chip
                                                            label={`${t('admin.order.detail.qty')}: ${formattedInt(item.quantity)}`}
                                                            size="small"
                                                            sx={{
                                                                background: 'rgba(255,255,255,0.05)',
                                                                color: 'rgba(255,255,255,0.6)',
                                                                fontSize: '0.68rem', height: 22,
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                                                        {formattedNumber(item.subtotal)} {t('admin.order.table.currency')}
                                                    </Typography>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', mt: 0.3 }}>
                                                        {formattedNumber(item.unitPrice)} × {formattedInt(item.quantity)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>

                                    {/* Pricing */}
                                    <Divider sx={{ borderColor: 'rgba(212,175,55,0.15)', my: 3 }} />
                                    <Box sx={{ maxWidth: 350, ml: 'auto' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
                                                {t('admin.order.detail.subtotal')}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
                                                {formattedNumber(order.pricing?.subtotal)} {t('admin.order.table.currency')}
                                            </Typography>
                                        </Box>
                                        {order.pricing?.discountAmount > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
                                                <Typography sx={{ color: '#9b59b6', fontSize: '0.88rem' }}>
                                                    {t('admin.order.detail.discount')}
                                                </Typography>
                                                <Typography sx={{ color: '#9b59b6', fontSize: '0.88rem' }}>
                                                    -{formattedNumber(order.pricing.discountAmount)} {t('admin.order.table.currency')}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
                                                {t('admin.order.detail.shippingFee')}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
                                                {formattedNumber(order.pricing?.shippingFee)} {t('admin.order.table.currency')}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ borderColor: 'rgba(212,175,55,0.2)', mb: 1.5 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.05rem' }}>
                                                {t('admin.order.detail.total')}
                                            </Typography>
                                            <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.05rem' }}>
                                                {formattedNumber(order.pricing?.totalPrice)} {t('admin.order.table.currency')}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Action Buttons */}
                                    {(forwardTransition || canCancel) && (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: { xs: 1.5, sm: 2 },
                                            flexWrap: 'wrap',
                                            mt: 3,
                                            pt: 3,
                                            borderTop: '1px solid rgba(212,175,55,0.15)',
                                        }}>
                                            {forwardTransition && (
                                                <Button
                                                    onClick={() => setForwardModalOpen(true)}
                                                    startIcon={forwardTransition === 'DELIVERED' ? <LocalShippingIcon sx={{ ml: isRTL ? 1 : 0 }} /> : <PlaylistAddCheckIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                                                    sx={{
                                                        flexShrink: 0,
                                                        py: 1.2,
                                                        px: 3,
                                                        borderRadius: 2,
                                                        fontSize: '0.9rem',
                                                        fontWeight: 700,
                                                        textTransform: 'none',
                                                        color: forwardColor.main,
                                                        background: forwardColor.bg,
                                                        border: `1.5px solid ${forwardColor.main}`,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: forwardColor.main,
                                                            color: '#000',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: `0 6px 16px ${forwardColor.shadow}`,
                                                        },
                                                        '&:active': { transform: 'translateY(0)' },
                                                    }}
                                                >
                                                    {forwardTransition === 'DELIVERED'
                                                        ? t('admin.order.detail.markDelivered')
                                                        : t('admin.order.detail.startProcessing')}
                                                </Button>
                                            )}
                                            {canCancel && (
                                                <Button
                                                    onClick={() => setCancelModalOpen(true)}
                                                    startIcon={<CancelIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                                                    sx={{
                                                        flexShrink: 0,
                                                        py: 1.2,
                                                        px: 3,
                                                        borderRadius: 2,
                                                        fontSize: '0.9rem',
                                                        fontWeight: 700,
                                                        textTransform: 'none',
                                                        color: '#f44336',
                                                        background: 'rgba(244,67,54,0.12)',
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
                                                    {t('admin.order.detail.cancelOrder')}
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Slide>
                    </Box>
                </Fade>
            </Container>

            {/* Forward Status Confirmation */}
            <ConfirmationModal
                open={forwardModalOpen}
                onClose={() => setForwardModalOpen(false)}
                onConfirm={handleForward}
                title={forwardTransition === 'DELIVERED'
                    ? t('admin.order.detail.markDeliveredTitle')
                    : t('admin.order.detail.startProcessingTitle')}
                message={forwardTransition === 'DELIVERED'
                    ? t('admin.order.detail.markDeliveredMessage')
                    : t('admin.order.detail.startProcessingMessage')}
                confirmText={t('admin.order.detail.confirm')}
                cancelText={t('admin.order.detail.cancel')}
                loading={isUpdating}
            />

            {/* Cancel Order Confirmation */}
            <ConfirmationModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleCancelOrder}
                title={t('trackOrder.cancelOrderTitle')}
                message={t('trackOrder.cancelOrderMessage')}
                confirmText={t('trackOrder.confirmCancel')}
                cancelText={t('common.cancel')}
                loading={isUpdating}
            >
                <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
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

export default AdminOrderDetails;
