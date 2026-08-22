import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, selectCartTotal, clearCart } from '../../redux/slices/cartSlice';
import { selectIsCustomer } from '../../redux/slices/authSlice';
import { useCreateGuestOrderMutation } from '../../redux/api/orderApi';
import { useGetDeliveryFeesQuery } from '../../redux/api/deliveryApi';
import { useCreateCustomerOrderMutation, useValidateCouponMutation } from '../../redux/api/customerApi';
import { handleSuccess, handleError } from '../../utils/toastHelper';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Chip from '@mui/material/Chip';

import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

// ─── Constants ────────────────────────────────────────────────────────────────
const GOVERNORATES = [
    'AMMAN', 'ZARQA', 'IRBID', 'AQABA', 'MAFRAQ',
    'KARAK', 'MADABA', 'AJLOUN', 'JERASH', 'BALQA', 'TAFILAH', 'MAAN',
];

const JO_PHONE_REGEX = /^(\+962)?7[789]\d{7}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Shared Styles (same as CustomerRegister / CustomerLogin) ────────────────
const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        '& input, & textarea': { color: '#FFFFFF' },
        '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37' },
    },
    '& .MuiFormHelperText-root': { color: '#f44336', marginLeft: 0 },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
};

const selectSx = {
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.3)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37' },
    '& .MuiSvgIcon-root': { color: '#D4AF37' },
};

const menuProps = {
    PaperProps: {
        sx: {
            background: '#1a1a1a',
            border: '1px solid rgba(212,175,55,0.3)',
            '& .MuiMenuItem-root': {
                color: '#FFF',
                '&:hover': { backgroundColor: 'rgba(212,175,55,0.15)' },
                '&.Mui-selected': { backgroundColor: 'rgba(212,175,55,0.25)', color: '#D4AF37' },
            },
        },
    },
};

const submitBtnSx = {
    mt: 1,
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
    '&.Mui-disabled': {
        background: 'rgba(212,175,55,0.3)',
        color: 'rgba(0,0,0,0.5)',
    },
};

const labelSx = {
    color: '#FFFFFF',
    m: 1,
    fontWeight: 600,
    fontSize: { xs: '0.9rem', sm: '1rem' },
};

const sectionTitleSx = {
    color: '#D4AF37',
    fontWeight: 700,
    fontSize: { xs: '1rem', sm: '1.1rem' },
    mb: 2,
    pb: 1,
    borderBottom: '1px solid rgba(212,175,55,0.2)',
};

// ─── Component ────────────────────────────────────────────────────────────────
const OrderConfirm = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isCustomer = useSelector(selectIsCustomer);
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);

    const [createGuestOrder, { isLoading: guestLoading }] = useCreateGuestOrderMutation();
    const [createCustomerOrder, { isLoading: customerLoading }] = useCreateCustomerOrderMutation();
    const { data: deliveryFeesData } = useGetDeliveryFeesQuery();
    const [validateCoupon, { isLoading: couponLoading }] = useValidateCouponMutation();

    const isLoading = guestLoading || customerLoading;

    // ── Form state ──
    const [guestData, setGuestData] = useState({ username: '', email: '' });
    const [delivery, setDelivery] = useState({
        phoneNumber: '',
        alternativePhoneNumber: '',
        governorate: '',
        address: '',
        notes: '',
    });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // ── Helpers ──
    const formattedNumber = (val) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(val);

    const formatInt = (val) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(val);

    const translateSize = (code) =>
        t(`perfumeDetails.enums.sizes.${code}`, { defaultValue: code });

    const discountAmount = useMemo(() => {
        if (!appliedCoupon) return 0;
        const { discountType, discountValue } = appliedCoupon;
        const value = Number(discountValue) || 0;
        if (discountType === 'PERCENTAGE') return Math.min((cartTotal * value) / 100, cartTotal);
        return Math.min(value, cartTotal);
    }, [appliedCoupon, cartTotal]);

    const shippingFee = useMemo(() => {
        if (!delivery.governorate || !deliveryFeesData?.data) return 0;
        const fee = deliveryFeesData.data.find(
            item => item.governorate === delivery.governorate
        );
        return fee ? fee.shippingFee : 0;
    }, [delivery.governorate, deliveryFeesData]);

    const finalTotal = Math.max(cartTotal - discountAmount + shippingFee, 0);

    // ── Phone helpers (same as CustomerRegister) ──
    const formatPhoneDisplay = (fullPhone) => {
        if (!fullPhone) return '';
        let digits = fullPhone.replace(/\D/g, '');
        if (digits.startsWith('962')) digits = digits.slice(3);
        if (digits.startsWith('0')) digits = digits.slice(1);
        if (digits.startsWith('7') && digits.length === 9) {
            return digits.replace(/(\d)(\d{4})(\d{4})/, '$1 $2 $3');
        }
        return digits;
    };

    const handlePhoneInput = (fieldName, inputValue) => {
        let digits = inputValue.replace(/\D/g, '');
        if (digits.startsWith('962')) digits = digits.slice(3);
        if (digits.startsWith('0')) digits = digits.slice(1);
        digits = digits.slice(0, 9);
        const fullNumber = digits ? '+962' + digits : '';
        setDelivery((p) => ({ ...p, [fieldName]: fullNumber }));
    };

    // ── Validation ──
    const validate = () => {
        const errors = [];

        if (!isCustomer) {
            if (!guestData.username.trim())
                errors.push(t('orderConfirm.validation.fullNameRequired'));
            if (!guestData.email.trim())
                errors.push(t('orderConfirm.validation.emailRequired'));
            else if (!EMAIL_REGEX.test(guestData.email))
                errors.push(t('orderConfirm.validation.emailInvalid'));
        }

        if (!delivery.phoneNumber.trim()) {
            errors.push(t('orderConfirm.validation.phoneRequired'));
        } else if (!JO_PHONE_REGEX.test(delivery.phoneNumber)) {
            errors.push(t('orderConfirm.validation.phoneInvalid'));
        }

        if (delivery.alternativePhoneNumber && delivery.alternativePhoneNumber.trim()) {
            if (!JO_PHONE_REGEX.test(delivery.alternativePhoneNumber)) {
                errors.push(t('orderConfirm.validation.altPhoneInvalid'));
            } else if (delivery.alternativePhoneNumber === delivery.phoneNumber) {
                errors.push(t('orderConfirm.validation.phonesSame'));
            }
        }

        if (!delivery.governorate)
            errors.push(t('orderConfirm.validation.governorateRequired'));
        if (!delivery.address.trim())
            errors.push(t('orderConfirm.validation.addressRequired'));

        if (errors.length > 0) {
            const msg = errors.map((e, i) => `${i + 1}. ${e}`).join('\n');
            handleError(msg);
            return false;
        }
        return true;
    };

    // ── Apply Coupon ──
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await validateCoupon({
                couponCode: couponCode.trim(),
                orderTotal: cartTotal,
            }).unwrap();
            setAppliedCoupon(res.data || res);
            handleSuccess(t('orderConfirm.couponApplied'));
        } catch (err) {
            const msg = err?.data?.message || err?.data?.error || 'Invalid coupon';
            handleError(msg);
            setAppliedCoupon(null);
        }
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!validate()) return;

        const items = cartItems.map((item) => ({
            itemId: item.perfumeId,
            perfumeSize: item.size,
            quantity: item.quantity,
        }));

        try {
            if (isCustomer) {
                const body = {
                    governorate: delivery.governorate,
                    address: delivery.address.trim(),
                    phoneNumber: delivery.phoneNumber.trim(),
                    alternativePhoneNumber: delivery.alternativePhoneNumber.trim() || null,
                    notes: delivery.notes.trim(),
                    couponCode: appliedCoupon ? couponCode.trim() : null,
                    items,
                };
                const res = await createCustomerOrder(body).unwrap();
                const orderNumber = res?.orderNumber || res?.data?.orderNumber;
                if (!orderNumber) {
                    handleError(t('orderConfirm.orderNumberMissing'));
                    return;
                }
                dispatch(clearCart());
                navigate(`/order/success/${encodeURIComponent(orderNumber)}`, { replace: true });
            } else {
                const body = {
                    username: guestData.username.trim(),
                    email: guestData.email.trim(),
                    phoneNumber: delivery.phoneNumber.trim(),
                    alternativePhoneNumber: delivery.alternativePhoneNumber.trim() || null,
                    governorate: delivery.governorate,
                    address: delivery.address.trim(),
                    notes: delivery.notes.trim(),
                    items,
                };
                const res = await createGuestOrder(body).unwrap();
                const orderNumber = res?.orderNumber || res?.data?.orderNumber;
                if (!orderNumber) {
                    handleError(t('orderConfirm.orderNumberMissing'));
                    return;
                }
                dispatch(clearCart());
                const email = encodeURIComponent(guestData.email.trim());
                navigate(`/order/success/${encodeURIComponent(orderNumber)}?email=${email}`, { replace: true });
            }
        } catch (err) {
            const errorData = err?.data?.data || err?.data || err;
            let msg;
            
            if (errorData && typeof errorData === 'object') {
                const fieldErrors = Object.entries(errorData)
                    .filter(([key, value]) => key !== 'message' && key !== 'statusCode' && value && typeof value === 'string')
                    .map(([, value]) => value);
                
                msg = fieldErrors.length > 0 ? fieldErrors[0] : errorData.message || err?.data?.message || err?.message || 'Error placing order';
            } else {
                msg = err?.data?.message || err?.message || 'Error placing order';
            }
            
            handleError(msg);
        }
    };

    // ─── Empty Cart ───────────────────────────────────────────────────────────
    if (cartItems.length === 0) {
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
                <Container maxWidth="xs">
                    <Fade in timeout={800}>
                        <Slide direction="up" in timeout={800}>
                            <Paper
                                sx={{
                                    p: 5,
                                    borderRadius: 4,
                                    border: '2px solid #D4AF37',
                                    boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
                                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                    textAlign: 'center',
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
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        mx: 'auto',
                                        mb: 2.5,
                                        background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)',
                                        border: '2px solid rgba(212,175,55,0.4)',
                                    }}
                                >
                                    <ShoppingBagOutlinedIcon sx={{ fontSize: 38, color: 'rgba(212,175,55,0.7)' }} />
                                </Avatar>
                                <Typography variant="h5" sx={{ color: '#D4AF37', fontWeight: 700, mb: 1 }}>
                                    {t('orderConfirm.emptyCart')}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3.5, fontSize: '0.95rem' }}>
                                    {t('orderConfirm.emptyCartMsg')}
                                </Typography>
                                <Button
                                    fullWidth
                                    onClick={() => navigate('/perfumes')}
                                    startIcon={<StorefrontOutlinedIcon />}
                                    sx={{
                                        ...submitBtnSx,
                                        '& .MuiButton-startIcon': {
                                            mr: isRTL ? 0 : 1,
                                            ml: isRTL ? 1 : 0,
                                        },
                                    }}
                                >
                                    {t('orderConfirm.shopNow')}
                                </Button>
                            </Paper>
                        </Slide>
                    </Fade>
                </Container>
            </Box>
        );
    }

    // ─── Main Page ────────────────────────────────────────────────────────────
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)',
                position: 'relative',
                py: { xs: 2, sm: 3, md: 4 },
                px: { xs: 1, sm: 2 }
            }}
        >
            <Container maxWidth="lg">
                <Fade in timeout={700}>
                    <Box>
                        {/* ── Page Header ── */}
                        <Slide direction="down" in timeout={600}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 0.5, sm: 1, md: 1.5 }, mb: 4 }}>
                                <IconButton
                                    onClick={() => navigate(-1)}
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
                                            animation: 'titleFromTop 0.7s ease both',
                                            '@keyframes titleFromTop': {
                                                from: { opacity: 0, transform: 'translateY(-14px)' },
                                                to: { opacity: 1, transform: 'translateY(0)' },
                                            },
                                        }}
                                    >
                                        <Box component="span" sx={{ color: '#000' }}>
                                            {t('orderConfirm.pageTitle')} -{' '}
                                        </Box>
                                        <Box component="span" sx={{ color: '#D4AF37' }}>
                                            {isCustomer ? t('orderConfirm.customerOrder') : t('orderConfirm.guestOrder')}
                                        </Box>
                                    </Typography>
                                    <Box sx={{
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
                                    }} />
                                    <Typography sx={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.85rem', mt: 0.5 }}>
                                    </Typography>
                                </Box>
                            </Box>
                        </Slide>

                        {/* ── Two columns ── */}
                        <Grid container spacing={3} alignItems="flex-start">

                            {/* ── LEFT COLUMN ── */}
                            <Grid size={{ xs: 12, lg: 7 }}>
                                <Slide direction="up" in timeout={700}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                                        {/* ── Guest Info Card ── */}
                                        {!isCustomer && (
                                            <Paper
                                                sx={{
                                                    p: { xs: 2.5, sm: 3.5 },
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
                                                        backgroundImage: 'radial-gradient(circle at 15% 80%, rgba(212,175,55,0.1) 0%, transparent 55%)',
                                                        pointerEvents: 'none',
                                                    },
                                                }}
                                            >
                                                <Typography sx={sectionTitleSx}>
                                                    {t('orderConfirm.guestSection')}
                                                </Typography>

                                                <Grid container spacing={2}>
                                                    {/* Full Name */}
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography sx={labelSx}>
                                                            {t('orderConfirm.fullName')}
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={guestData.username}
                                                            onChange={(e) => setGuestData((p) => ({ ...p, username: e.target.value }))}
                                                            placeholder={t('orderConfirm.fullNamePlaceholder')}
                                                            sx={fieldSx}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <PersonIcon sx={{ color: '#D4AF37', fontSize: 20, mr: isRTL ? 2 : 0 }} />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>
                                                    {/* Email */}
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography sx={labelSx}>
                                                            {t('orderConfirm.email')}
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            type="email"
                                                            value={guestData.email}
                                                            onChange={(e) => setGuestData((p) => ({ ...p, email: e.target.value }))}
                                                            placeholder={t('orderConfirm.emailPlaceholder')}
                                                            sx={fieldSx}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <EmailIcon sx={{ color: '#D4AF37', fontSize: 20, mr: isRTL ? 2 : 0 }} />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        )}

                                        {/* ── Delivery Card ── */}
                                        <Paper
                                            sx={{
                                                p: { xs: 2.5, sm: 3.5 },
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
                                            <Typography sx={sectionTitleSx}>
                                                {t('orderConfirm.deliverySection')}
                                            </Typography>

                                            <Grid container spacing={2}>
                                                {/* Phone + Alt Phone — map pattern (same as CustomerRegister) */}
                                                {[
                                                    {
                                                        fieldName: 'phoneNumber',
                                                        label: t('orderConfirm.phoneNumber'),
                                                        required: true,
                                                    },
                                                    {
                                                        fieldName: 'alternativePhoneNumber',
                                                        label: t('orderConfirm.alternativePhone'),
                                                        required: false,
                                                    },
                                                ].map(({ fieldName, label, required }) => (
                                                    <Grid size={{ xs: 12, sm: 6 }} mb={0} key={fieldName}>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                color: '#FFFFFF',
                                                                m: 1,
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                                                textAlign: 'start',
                                                            }}
                                                        >
                                                            {label}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, direction: 'ltr' }}>
                                                            {/* Fixed +962 badge */}
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.5,
                                                                    p: 1,
                                                                    height: '40px',
                                                                    borderRadius: 2,
                                                                    border: '1px solid rgba(212,175,55,0.3)',
                                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                                }}
                                                            >
                                                                <Typography sx={{ fontSize: '1rem', color: '#D4AF37' }}>
                                                                    🇯🇴
                                                                </Typography>
                                                                <Typography
                                                                    sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem' }}
                                                                >
                                                                    +962
                                                                </Typography>
                                                            </Box>
                                                            <TextField
                                                                fullWidth
                                                                required={required}
                                                                size="small"
                                                                value={formatPhoneDisplay(delivery[fieldName])}
                                                                onChange={(e) => handlePhoneInput(fieldName, e.target.value)}
                                                                placeholder="7 XXXX XXXX"
                                                                inputProps={{ inputMode: 'numeric' }}
                                                                sx={fieldSx}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <PhoneAndroidIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                ))}


                                                {/* Governorate */}
                                                <Grid size={{ xs: 12 }}>
                                                    <Typography sx={labelSx}>
                                                        {t('orderConfirm.governorate')}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                                        <FormControl fullWidth>
                                                            <Select
                                                                value={delivery.governorate}
                                                                onChange={(e) => setDelivery((p) => ({ ...p, governorate: e.target.value }))}
                                                                displayEmpty
                                                                size="small"
                                                                sx={selectSx}
                                                                MenuProps={menuProps}
                                                                startAdornment={
                                                                    <InputAdornment position="start">
                                                                        <LocationOnIcon sx={{ color: '#D4AF37', mr: isRTL ? 2 : 0, fontSize: 20 }} />
                                                                    </InputAdornment>
                                                                }
                                                            >
                                                                <MenuItem value="" disabled sx={{ color: 'rgba(255,255,255,0.35)' }}>
                                                                    {t('orderConfirm.governoratePlaceholder')}
                                                                </MenuItem>
                                                                {GOVERNORATES.map((gov) => {
                                                                    const fee = deliveryFeesData?.data?.find(item => item.governorate === gov);
                                                                    const shippingPrice = fee ? formattedNumber(fee.shippingFee) : formattedNumber(0);
                                                                    return (
                                                                        <MenuItem key={gov} value={gov}>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                                                                                <Typography>{t(`governorates.${gov}`, { defaultValue: gov })}</Typography>
                                                                                <Typography sx={{ color: '#D4AF37', fontWeight: 600 }}>
                                                                                    {shippingPrice} {t('orderConfirm.currency')}
                                                                                </Typography>
                                                                            </Box>
                                                                        </MenuItem>
                                                                    );
                                                                })}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                </Grid>

                                                {/* Address */}
                                                <Grid size={{ xs: 12 }}>
                                                    <Typography sx={labelSx}>
                                                        {t('orderConfirm.address')}
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        multiline
                                                        rows={2}
                                                        value={delivery.address}
                                                        onChange={(e) => setDelivery((p) => ({ ...p, address: e.target.value }))}
                                                        placeholder={t('orderConfirm.addressPlaceholder')}
                                                        sx={fieldSx}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1, ml: isRTL ? 1 : 0 }}>
                                                                    <HomeIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>

                                                {/* Notes */}
                                                <Grid size={{ xs: 12 }}>
                                                    <Typography sx={labelSx}>
                                                        {t('orderConfirm.notes')}
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        multiline
                                                        rows={2}
                                                        value={delivery.notes}
                                                        onChange={(e) => setDelivery((p) => ({ ...p, notes: e.target.value }))}
                                                        placeholder={t('orderConfirm.notesPlaceholder')}
                                                        sx={fieldSx}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1, ml: isRTL ? 1 : 0 }}>
                                                                    <NoteAltOutlinedIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Paper>

                                        {/* ── Coupon Card ── */}
                                        <Paper
                                            sx={{
                                                p: { xs: 2.5, sm: 3.5 },
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
                                                    backgroundImage: 'radial-gradient(circle at 15% 80%, rgba(212,175,55,0.1) 0%, transparent 55%)',
                                                    pointerEvents: 'none',
                                                },
                                            }}
                                        >
                                            <Typography sx={sectionTitleSx}>
                                                {t('orderConfirm.couponSection')}
                                            </Typography>

                                            {isCustomer ? (
                                                appliedCoupon ? (
                                                    /* Coupon Applied */
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.5,
                                                            p: 2,
                                                            borderRadius: 2,
                                                            background: 'rgba(76,175,80,0.08)',
                                                            border: '1px solid rgba(76,175,80,0.35)',
                                                        }}
                                                    >
                                                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography sx={{ color: '#4caf50', fontWeight: 700, fontSize: '0.9rem' }}>
                                                                {t('orderConfirm.couponApplied')}
                                                            </Typography>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
                                                                {couponCode.toUpperCase()} — {t('orderConfirm.discount')}: {formattedNumber(discountAmount)} {t('orderConfirm.currency')}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label="✕"
                                                            size="small"
                                                            onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                                                            sx={{
                                                                background: 'rgba(255,107,107,0.15)',
                                                                color: '#ff6b6b',
                                                                border: '1px solid rgba(255,107,107,0.3)',
                                                                cursor: 'pointer',
                                                                fontWeight: 700,
                                                                '&:hover': { background: 'rgba(255,107,107,0.25)' },
                                                            }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    /* Coupon Input */
                                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography sx={labelSx}>
                                                                {t('orderConfirm.couponCode')}
                                                            </Typography>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                value={couponCode}
                                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                                placeholder={t('orderConfirm.couponPlaceholder')}
                                                                sx={fieldSx}
                                                                inputProps={{ dir: 'ltr', style: { letterSpacing: '0.12em', fontWeight: 700 } }}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <LocalOfferIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                            />
                                                        </Box>
                                                        <Button
                                                            onClick={handleApplyCoupon}
                                                            disabled={couponLoading || !couponCode.trim()}
                                                            sx={{
                                                                ...submitBtnSx,
                                                                mt: 0,
                                                                px: 3,
                                                                py: 0.9,
                                                                mb: '1px',
                                                                fontSize: '0.9rem',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {couponLoading ? (
                                                                <CircularProgress size={18} sx={{ color: '#000' }} />
                                                            ) : (
                                                                t('orderConfirm.applyCoupon')
                                                            )}
                                                        </Button>
                                                    </Box>
                                                )
                                            ) : (
                                                /* Guest - locked */
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1px dashed rgba(255,255,255,0.15)',
                                                    }}
                                                >
                                                    <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 28 }} />
                                                    <Box>
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', mb: 0.5 }}>
                                                            {t('orderConfirm.couponLoginHint')}
                                                        </Typography>
                                                        <Button
                                                            size="small"
                                                            onClick={() => navigate('/login')}
                                                            sx={{
                                                                color: '#D4AF37',
                                                                textTransform: 'none',
                                                                fontWeight: 700,
                                                                fontSize: '0.82rem',
                                                                p: 0,
                                                                minWidth: 0,
                                                                '&:hover': { background: 'transparent', textDecoration: 'underline' },
                                                            }}
                                                        >
                                                            {t('orderConfirm.loginToUseCoupon')} {isRTL ? '←' : '→'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Paper>
                                    </Box>
                                </Slide>
                            </Grid>

                            {/* ── RIGHT COLUMN: Order Summary ── */}
                            <Grid size={{ xs: 12, lg: 5 }}>
                                <Slide direction="up" in timeout={900}>
                                    <Paper
                                        sx={{
                                            p: { xs: 2.5, sm: 3.5 },
                                            borderRadius: 4,
                                            border: '2px solid #D4AF37',
                                            boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
                                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                            position: { xs: 'relative', lg: 'sticky' },
                                            top: { lg: 100 },
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                inset: 0,
                                                backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.13) 0%, transparent 55%)',
                                                pointerEvents: 'none',
                                            },
                                        }}
                                    >
                                        <Typography sx={sectionTitleSx}>
                                            {t('orderConfirm.orderSummary')}
                                        </Typography>

                                        {/* Items */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
                                            {cartItems.map((item) => (
                                                <Box
                                                    key={item.id}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        p: 1.25,
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(212,175,55,0.2)',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        transition: 'all 0.25s ease',
                                                        '&:hover': {
                                                            borderColor: 'rgba(212,175,55,0.45)',
                                                            background: 'rgba(212,175,55,0.05)',
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        sx={{
                                                            width: 58,
                                                            height: 70,
                                                            objectFit: 'contain',
                                                            borderRadius: 1.5,
                                                            bgcolor: 'rgba(0,0,0,0.4)',
                                                            border: '1px solid rgba(212,175,55,0.15)',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            noWrap
                                                            sx={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', mb: 0.25 }}
                                                        >
                                                            {item.name}
                                                        </Typography>
                                                        <Typography
                                                            sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}
                                                        >
                                                            {item.brand} · {translateSize(item.size)}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                                                {t('orderConfirm.qty')}: {formatInt(item.quantity)}
                                                            </Typography>
                                                            <Typography sx={{ color: '#D4AF37', fontWeight: 800, fontSize: '0.88rem' }}>
                                                                {formattedNumber(Number(item.price) * item.quantity)} {t('orderConfirm.currency')}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>

                                        <Divider sx={{ borderColor: 'rgba(212,175,55,0.2)', mb: 2 }} />

                                        {/* Pricing */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                                    {t('orderConfirm.subtotal')}
                                                </Typography>
                                                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {formattedNumber(cartTotal)} {t('orderConfirm.currency')}
                                                </Typography>
                                            </Box>

                                            {appliedCoupon && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ color: '#4caf50', fontSize: '0.9rem' }}>
                                                        {t('orderConfirm.discount')}
                                                    </Typography>
                                                    <Typography sx={{ color: '#4caf50', fontWeight: 600, fontSize: '0.9rem' }}>
                                                        - {formattedNumber(discountAmount)} {t('orderConfirm.currency')}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {delivery.governorate && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                                        {t('orderConfirm.shippingFee')}
                                                    </Typography>
                                                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                                                        {formattedNumber(shippingFee)} {t('orderConfirm.currency')}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Divider sx={{ borderColor: 'rgba(212,175,55,0.15)' }} />

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <Typography sx={{ color: '#D4AF37', fontWeight: 800, fontSize: '1rem' }}>
                                                    {t('orderConfirm.total')}
                                                </Typography>
                                                <Typography sx={{ color: '#D4AF37', fontWeight: 900, fontSize: '1.4rem' }}>
                                                    {formattedNumber(finalTotal)} {t('orderConfirm.currency')}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Place Order Button */}
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            sx={submitBtnSx}
                                        >
                                            {isLoading ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CircularProgress size={20} sx={{ color: '#000' }} />
                                                    <span>{t('orderConfirm.placingOrder')}</span>
                                                </Box>
                                            ) : (
                                                t('orderConfirm.placeOrder')
                                            )}
                                        </Button>
                                    </Paper>
                                </Slide>
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default OrderConfirm;
