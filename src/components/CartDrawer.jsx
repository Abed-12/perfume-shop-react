import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearCart,
    removeFromCart,
    selectCartItems,
    selectCartCount,
    selectCartTotal,
    updateCartItemQuantity,
} from '../redux/slices/cartSlice';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Tooltip from '@mui/material/Tooltip';

const drawerMotionSx = {
    '@keyframes cartRowIn': {
        from: { opacity: 0, transform: 'translateY(14px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes bagFloat': {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-8px)' },
    },
    '@keyframes headerGlow': {
        '0%, 100%': { boxShadow: '0 4px 12px rgba(212, 175, 55, 0.35)' },
        '50%': { boxShadow: '0 6px 20px rgba(212, 175, 55, 0.55)' },
    },
};

const getDrawerPaperSx = (anchor) => ({
    width: { xs: '100%', sm: 420 },
    maxWidth: '100%',
    background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)',
    boxSizing: 'border-box',
    ...(anchor === 'right'
        ? {
            borderLeft: { xs: 'none', sm: '2px solid rgba(212, 175, 55, 0.35)' },
            boxShadow: '-8px 0 32px rgba(0,0,0,0.45)',
        }
        : {
            borderRight: { xs: 'none', sm: '2px solid rgba(212, 175, 55, 0.35)' },
            boxShadow: '8px 0 32px rgba(0,0,0,0.45)',
        }),
});

const goldBtnSx = {
    py: 1.1,
    fontWeight: 800,
    textTransform: 'none',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '0.95rem',
    borderRadius: '12px',
    color: '#000',
    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    boxShadow: '0 4px 18px rgba(212,175,55,0.35)',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(212,175,55,0.45)',
    },
    '&:active': {
        transform: 'translateY(0)',
    },
};

const CartDrawer = ({ open, onClose }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const items = useSelector(selectCartItems);
    const count = useSelector(selectCartCount);
    const total = useSelector(selectCartTotal);

    const [removingId, setRemovingId] = useState(null);

    const formattedNumber = (value) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(value);

    const lineTotal = (item) => Number(item.price) * item.quantity;

    const empty = items.length === 0;

    const anchor = useMemo(() => (isRTL ? 'left' : 'right'), [isRTL]);

    const translateSize = (code) =>
        t(`perfumeDetails.enums.sizes.${code}`, { defaultValue: code });

    const handleQty = (item, delta) => {
        const next = item.quantity + delta;
        dispatch(updateCartItemQuantity({ id: item.id, quantity: next }));
    };

    const handleRemove = (id) => {
        setRemovingId(id);
        window.setTimeout(() => {
            dispatch(removeFromCart(id));
            setRemovingId(null);
        }, 120);
    };

    const goShop = () => {
        onClose();
        navigate('/perfumes');
    };

    const goOrderConfirm = () => {
        onClose();
        navigate('/order/confirm');
    };

    return (
        <Drawer
            anchor={anchor}
            open={open}
            onClose={onClose}
            transitionDuration={{ enter: 380, exit: 280 }}
            PaperProps={{ sx: getDrawerPaperSx(anchor) }}
            ModalProps={{
                keepMounted: false,
            }}
        >
            <Box
                dir={isRTL ? 'rtl' : 'ltr'}
                sx={{
                    ...drawerMotionSx,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: "'Montserrat', sans-serif",
                    pt: { xs: 'env(safe-area-inset-top, 0px)', sm: 0 },
                    pb: { xs: 'env(safe-area-inset-bottom, 0px)', sm: 0 },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
                        background: 'rgba(212, 175, 55, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: '#D4AF37',
                                color: '#000',
                                animation: 'headerGlow 3s ease-in-out infinite',
                            }}
                        >
                            <ShoppingBagOutlinedIcon />
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    color: '#D4AF37',
                                    fontWeight: 800,
                                    fontSize: { xs: '1rem', sm: '1.05rem' },
                                    letterSpacing: 0.3,
                                }}
                            >
                                {t('cart.title')}
                            </Typography>
                            <Typography
                                sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem' }}
                            >
                                {t('cart.itemsCount', { count })}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        {!empty && (
                            <Tooltip title={t('cart.clear')} arrow placement="bottom">
                                <IconButton
                                    onClick={() => dispatch(clearCart())}
                                    aria-label={t('cart.clear')}
                                    size="small"
                                    sx={{
                                        color: 'rgba(255,255,255,0.45)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            color: '#ff8a8a',
                                            bgcolor: 'rgba(255, 107, 107, 0.12)',
                                            transform: 'scale(1.08)',
                                        },
                                    }}
                                >
                                    <DeleteSweepIcon fontSize="small" />
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
                </Box>

                {/* Body */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: { xs: 1.5, sm: 2 },
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    {empty ? (
                        <Box
                            sx={{
                                height: '100%',
                                minHeight: 220,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gap: 2,
                                px: { xs: 1, sm: 2 },
                            }}
                        >
                            <ShoppingBagOutlinedIcon
                                sx={{
                                    fontSize: { xs: 48, sm: 56 },
                                    color: 'rgba(212,175,55,0.35)',
                                    animation: 'bagFloat 2.8s ease-in-out infinite',
                                }}
                            />
                            <Typography sx={{ color: '#fff', fontWeight: 700 }}>
                                {t('cart.emptyTitle')}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'rgba(255,255,255,0.6)',
                                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                }}
                            >
                                {t('cart.emptySubtitle')}
                            </Typography>
                            <Button
                                fullWidth
                                sx={{ ...goldBtnSx, maxWidth: 360 }}
                                onClick={goShop}
                            >
                                {t('cart.continueShopping')}
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {items.map((item, index) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '72px 1fr auto',
                                            sm: '88px 1fr auto',
                                        },
                                        gap: { xs: 1, sm: 1.25 },
                                        p: { xs: 1, sm: 1.25 },
                                        borderRadius: '14px',
                                        border: '1px solid rgba(212,175,55,0.22)',
                                        background:
                                            'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.2) 100%)',
                                        opacity: removingId === item.id ? 0.45 : 1,
                                        transition:
                                            'opacity 0.15s ease, transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                                        animation: 'cartRowIn 0.45s ease forwards',
                                        animationDelay: `${Math.min(index, 8) * 0.06}s`,
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow:
                                                '0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,175,55,0.25)',
                                            borderColor: 'rgba(212,175,55,0.45)',
                                        },
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={item.imageUrl}
                                        alt={item.name}
                                        sx={{
                                            width: { xs: 72, sm: 88 },
                                            height: { xs: 92, sm: 110 },
                                            objectFit: 'contain',
                                            borderRadius: '10px',
                                            bgcolor: 'rgba(0,0,0,0.35)',
                                            border: '1px solid rgba(212,175,55,0.15)',
                                            transition: 'transform 0.35s ease',
                                            '&:hover': { transform: 'scale(1.03)' },
                                        }}
                                    />
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                color: '#fff',
                                                fontWeight: 800,
                                                fontSize: { xs: '0.85rem', sm: '0.92rem' },
                                                lineHeight: 1.35,
                                                mb: 0.35,
                                            }}
                                            noWrap
                                        >
                                            {item.name}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: 'rgba(255,255,255,0.55)',
                                                fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                                mb: 0.75,
                                            }}
                                            noWrap
                                        >
                                            {item.brand} · {translateSize(item.size)}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(212,175,55,0.35)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleQty(item, -1)}
                                                    sx={{
                                                        color: '#D4AF37',
                                                        borderRadius: 0,
                                                        transition: 'background-color 0.2s ease, transform 0.2s ease',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(212,175,55,0.12)',
                                                            transform: 'scale(1.08)',
                                                        },
                                                        '&:active': { transform: 'scale(0.95)' },
                                                    }}
                                                >
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <Typography
                                                    sx={{
                                                        minWidth: 28,
                                                        textAlign: 'center',
                                                        color: '#fff',
                                                        fontWeight: 800,
                                                        fontSize: '0.85rem',
                                                    }}
                                                >
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleQty(item, 1)}
                                                    sx={{
                                                        color: '#D4AF37',
                                                        borderRadius: 0,
                                                        transition: 'background-color 0.2s ease, transform 0.2s ease',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(212,175,55,0.12)',
                                                            transform: 'scale(1.08)',
                                                        },
                                                        '&:active': { transform: 'scale(0.95)' },
                                                    }}
                                                >
                                                    <AddIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            <Typography
                                                sx={{
                                                    color: '#D4AF37',
                                                    fontWeight: 800,
                                                    fontSize: { xs: '0.82rem', sm: '0.9rem' },
                                                }}
                                            >
                                                {formattedNumber(lineTotal(item))}{' '}
                                                {t('perfumeDetails.currency')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemove(item.id)}
                                        sx={{
                                            color: 'rgba(255,255,255,0.45)',
                                            alignSelf: 'flex-start',
                                            transition: 'color 0.2s ease, transform 0.2s ease',
                                            '&:hover': {
                                                color: '#ff6b6b',
                                                bgcolor: 'rgba(255,107,107,0.08)',
                                                transform: 'scale(1.1)',
                                            },
                                        }}
                                        aria-label={t('cart.remove')}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {!empty && (
                    <>
                        <Divider sx={{ borderColor: 'rgba(212, 175, 55, 0.25)' }} />
                        <Box sx={{ p: { xs: 1.5, sm: 2 }, pt: 1.5 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    justifyContent: 'space-between',
                                    mb: 1.5,
                                    gap: 1,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                                    {t('cart.subtotal')}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: '#D4AF37',
                                        fontWeight: 900,
                                        fontSize: { xs: '1.05rem', sm: '1.15rem' },
                                    }}
                                >
                                    {formattedNumber(total)} {t('perfumeDetails.currency')}
                                </Typography>
                            </Box>
                            <Button fullWidth sx={goldBtnSx} onClick={goOrderConfirm}>
                                {t('cart.confirmOrder')}
                            </Button>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={goShop}
                                sx={{
                                    mt: 0.75,
                                    color: 'rgba(255,255,255,0.72)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontFamily: "'Montserrat', sans-serif",
                                    fontSize: '0.88rem',
                                    py: 0.75,
                                    borderRadius: '10px',
                                    '&:hover': {
                                        color: '#D4AF37',
                                        bgcolor: 'rgba(212, 175, 55, 0.08)',
                                    },
                                }}
                            >
                                {t('cart.continueShopping')}
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default CartDrawer;