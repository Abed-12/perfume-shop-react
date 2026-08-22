import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    useGetNotificationsQuery,
    useHasUnreadNotificationsQuery,
    useMarkAllAsSeenMutation,
    useDeleteNotificationMutation,
    useClearAllMutation,
    useRegisterTokenMutation,
} from '../redux/api/adminApi';
import { handleError, handleSuccess } from '../utils/toastHelper';
import { getFcmToken } from '../config/firebase';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SpaIcon from '@mui/icons-material/Spa';

const bellAnimations = {
    '@keyframes bellRing': {
        '0%': { transform: 'rotate(0deg)' },
        '10%': { transform: 'rotate(14deg)' },
        '20%': { transform: 'rotate(-12deg)' },
        '30%': { transform: 'rotate(10deg)' },
        '40%': { transform: 'rotate(-8deg)' },
        '50%': { transform: 'rotate(5deg)' },
        '60%': { transform: 'rotate(-3deg)' },
        '70%': { transform: 'rotate(2deg)' },
        '80%': { transform: 'rotate(-1deg)' },
        '90%': { transform: 'rotate(0.5deg)' },
        '100%': { transform: 'rotate(0deg)' },
    },
    '@keyframes pulseGlow': {
        '0%, 100%': { boxShadow: '0 0 4px rgba(212,175,55,0.3)' },
        '50%': { boxShadow: '0 0 16px rgba(212,175,55,0.6)' },
    },
    '@keyframes glowPulse': {
        '0%, 100%': { boxShadow: '0 0 4px rgba(231,76,60,0.4)' },
        '50%': { boxShadow: '0 0 12px rgba(231,76,60,0.9)' },
    },
    '@keyframes rowSlideIn': {
        from: { opacity: 0, transform: 'translateY(12px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes shimmer': {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
    },
    '@keyframes emptyFloat': {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-6px)' },
    },
};

const NotificationBell = ({ isRTL, liveNotifications = [] }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const anchorRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const notifSupported = typeof Notification !== 'undefined';
    const notifEnabled = notifSupported && Notification.permission === 'granted';

    const { data: notificationsData, isLoading: notifLoading } = useGetNotificationsQuery(undefined, {
        skip: !notifEnabled,
    });
    const { data: unreadData } = useHasUnreadNotificationsQuery(undefined, {
        pollingInterval: 60000,
        skip: !notifEnabled,
    });
    const [markAllAsSeen] = useMarkAllAsSeenMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const [clearAll] = useClearAllMutation();
    const [registerToken] = useRegisterTokenMutation();
    const registeredRef = useRef(false);

    const getDeviceName = () => {
        const ua = navigator.userAgent;
        let browser = 'Other';
        let os = 'Other';

        if (navigator.brave || ua.includes('Brave')) browser = 'Brave';
        else if (ua.includes('Edg/')) browser = 'Edge';
        else if (ua.includes('OPR/')) browser = 'Opera';
        else if (ua.includes('Firefox/')) browser = 'Firefox';
        else if (ua.includes('Chrome/')) browser = 'Chrome';
        else if (ua.includes('Safari/')) browser = 'Safari';

        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

        return `${browser} on ${os}`;
    };

    const REGISTERED_KEY = 'fcm_device_registered';

    const autoRegister = useCallback(async () => {
        if (!notifEnabled || registeredRef.current) return;
        registeredRef.current = true;
        try {
            const token = await getFcmToken();
            if (!token) {
                registeredRef.current = false;
                return;
            }
            if (localStorage.getItem(REGISTERED_KEY) === token) return;
            await registerToken({ token, deviceType: 'WEB', deviceName: getDeviceName() }).unwrap();
            localStorage.setItem(REGISTERED_KEY, token);
        } catch (err) {
            registeredRef.current = false;
            handleError(err?.data?.message || 'Failed to register device');
        }
    }, [notifEnabled, registerToken]);

    useEffect(() => {
        autoRegister();
    }, [autoRegister]);

    const apiNotifications = notificationsData?.data || notificationsData || [];
    const allNotifications = [
        ...liveNotifications,
        ...apiNotifications.filter((api) =>
            !liveNotifications.some((live) => live.subject === (api.subject || api.message))
        ),
    ];
    const notifications = allNotifications;
    const hasUnread = (unreadData?.data ?? unreadData ?? false) || liveNotifications.length > 0;
    const notifCount = Array.isArray(notifications) ? notifications.length : 0;

    const handleOpen = (e) => {
        setAnchorEl(e.currentTarget);
        autoRegister();
        if (hasUnread) {
            markAllAsSeen().unwrap().catch(() => {});
        }
    };

    const handleClose = () => setAnchorEl(null);

    const handleNotifClick = async (notif) => {
        const orderNumber = notif.data?.orderNumber;
        if (orderNumber) {
            const isGuest = orderNumber.startsWith('GST-');
            handleClose();
            navigate(`/admin-panel/orders/${orderNumber}`, {
                state: isGuest ? { email: notif.data?.email, tab: 'guest' } : { tab: 'customer' },
            });
            try {
                await deleteNotification(notif.id || notif.userNotificationId).unwrap();
            } catch { /* deleted by clearAll anyway */ }
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id).unwrap();
            handleSuccess(t('notification.deleted'));
        } catch {
            handleError(t('notification.deleteError'));
        }
    };

    const handleClearAll = async () => {
        try {
            await clearAll().unwrap();
            handleSuccess(t('notification.clearedAll'));
        } catch {
            handleError(t('notification.clearError'));
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);
        if (diffMin < 1) return t('notification.justNow');
        if (diffMin < 60) return t('notification.minutesAgo', { count: diffMin });
        if (diffHr < 24) return t('notification.hoursAgo', { count: diffHr });
        if (diffDay < 7) return t('notification.daysAgo', { count: diffDay });
        return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const getNotifIcon = (notif) => {
        const text = (notif.subject || notif.message || '').toLowerCase();
        if (text.includes('order') || text.includes('طلب')) return <ReceiptLongIcon sx={{ fontSize: 18 }} />;
        return <SpaIcon sx={{ fontSize: 18 }} />;
    };

    const bellBtnSx = {
        color: open ? '#D4AF37' : '#FFFFFF',
        borderRadius: '22px',
        transition: 'all 0.3s ease',
        background: open ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        border: '1px solid',
        borderColor: open ? '#D4AF37' : 'transparent',
        px: 0.75,
        py: 0.6,
        transform: open ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: open ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none',
        animation: hasUnread ? 'pulseGlow 2s ease-in-out infinite' : 'none',
        ...bellAnimations,
        '&:hover': {
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            borderColor: '#D4AF37',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
            color: '#D4AF37',
        },
    };

    return (
        <>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <Tooltip title={t('notification.title')} arrow>
                    <IconButton
                        ref={anchorRef}
                        size="small"
                        onClick={handleOpen}
                        sx={bellBtnSx}
                    >
                        <NotificationsNoneIcon
                            sx={{
                                fontSize: 22,
                                animation: hasUnread ? 'bellRing 1s ease-in-out' : 'none',
                                ...bellAnimations,
                            }}
                        />
                    </IconButton>
                </Tooltip>
                {hasUnread && (
                    <Box sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#e74c3c',
                        animation: 'glowPulse 2s ease-in-out infinite',
                        ...bellAnimations,
                    }} />
                )}
            </Box>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: isRTL ? 'left' : 'right' }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1.5,
                            width: { xs: 340, sm: 420 },
                            maxHeight: 'calc(100vh - 100px)',
                            borderRadius: 4,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 50%, #111111 100%)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(212,175,55,0.1), inset 0 1px 0 rgba(212,175,55,0.1)',
                            overflow: 'hidden',
                            direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                            ...bellAnimations,
                        },
                    },
                }}
            >
                {/* Header */}
                <Box sx={{
                    px: 2.5,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(212,175,55,0.15)',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)',
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '10%',
                        right: '10%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
                    },
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                            border: '1px solid rgba(212,175,55,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <NotificationsNoneIcon sx={{ color: '#D4AF37', fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography sx={{
                                color: '#D4AF37',
                                fontWeight: 700,
                                fontSize: '1rem',
                                fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'Montserrat', sans-serif",
                                lineHeight: 1.2,
                            }}>
                                {t('notification.title')}
                            </Typography>
                            {notifCount > 0 && (
                                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', mt: 0.2 }}>
                                    {t('notification.count', { count: notifCount })}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Tooltip
                            title={notifEnabled ? t('notification.settings.statusOn') : t('notification.settings.statusOff')}
                            arrow
                        >
                            <Box
                                onClick={() => {
                                    if (notifEnabled) {
                                        handleSuccess(t('notification.settings.statusOn'));
                                    } else {
                                        handleError(t('notification.settings.browserBlocked'));
                                    }
                                }}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: notifEnabled ? '#2ecc71' : '#e74c3c',
                                    boxShadow: notifEnabled
                                        ? '0 0 6px rgba(46,204,113,0.8)'
                                        : '0 0 6px rgba(231,76,60,0.8)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    animation: notifEnabled ? 'pulseGlow 2s ease-in-out infinite' : 'none',
                                    ...bellAnimations,
                                    '&:hover': {
                                        transform: 'scale(1.3)',
                                        boxShadow: notifEnabled
                                            ? '0 0 10px rgba(46,204,113,1)'
                                            : '0 0 10px rgba(231,76,60,1)',
                                    },
                                }}
                            />
                        </Tooltip>
                        {notifCount > 0 && (
                            <Tooltip title={t('notification.clearAll')} arrow>
                                <IconButton
                                    onClick={handleClearAll}
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
                                    <DeleteSweepIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ overflowY: 'auto', maxHeight: 420, px: 0.5 }}>
                    {notifLoading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                            <CircularProgress size={36} sx={{ color: '#D4AF37' }} />
                            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                                {t('common.loading')}
                            </Typography>
                        </Box>
                    ) : !Array.isArray(notifications) || notifications.length === 0 ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            py: 8,
                            px: 3,
                        }}>
                            <Box sx={{
                                width: 72,
                                height: 72,
        borderRadius: '22px',
                                background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))',
                                border: '1px solid rgba(212,175,55,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                animation: 'emptyFloat 3s ease-in-out infinite',
                                ...bellAnimations,
                            }}>
                                <NotificationsOffOutlinedIcon sx={{ fontSize: 32, color: 'rgba(212,175,55,0.3)' }} />
                            </Box>
                            <Typography sx={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'Montserrat', sans-serif",
                            }}>
                                {t('notification.empty')}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', mt: 0.5 }}>
                                {t('notification.emptyHint')}
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ py: 0.5 }}>
                            {notifications.map((notif, index) => (
                                <Box
                                    key={notif.id || notif.userNotificationId || `live-${notif.subject}-${notif.receivedAt}`}
                                    onClick={() => handleNotifClick(notif)}
                                    sx={{
                                        mx: 1,
                                        my: 0.5,
                                        px: 2,
                                        py: 1.5,
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1.5,
                                        borderRadius: 2.5,
                                        transition: 'all 0.25s ease',
                                        background: !notif.seen
                                            ? 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.02) 100%)'
                                            : 'transparent',
                                        border: '1px solid',
                                        borderColor: !notif.seen ? 'rgba(212,175,55,0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        animation: `rowSlideIn 0.3s ease ${index * 0.05}s both`,
                                        ...bellAnimations,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.04) 100%)',
                                            borderColor: 'rgba(212,175,55,0.2)',
                                            transform: 'translateX(4px)',
                                        },
                                    }}
                                >
                                    {/* Icon */}
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '12px',
                                        background: !notif.seen
                                            ? 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))'
                                            : 'rgba(255,255,255,0.03)',
                                        border: '1px solid',
                                        borderColor: !notif.seen ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        color: !notif.seen ? '#D4AF37' : 'rgba(255,255,255,0.25)',
                                        transition: 'all 0.3s ease',
                                    }}>
                                        {getNotifIcon(notif)}
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                                            {!notif.seen && (
                                                <Box sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #D4AF37, #F4D03F)',
                                                    boxShadow: '0 0 6px rgba(212,175,55,0.5)',
                                                    flexShrink: 0,
                                                }} />
                                            )}
                                            <Typography sx={{
                                                color: !notif.seen ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                                                fontSize: '0.85rem',
                                                fontWeight: !notif.seen ? 600 : 400,
                                                lineHeight: 1.4,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}>
                                                {notif.subject || notif.message || t('notification.newNotification')}
                                            </Typography>
                                        </Box>
                                        {notif.body && (
                                            <Typography sx={{
                                                color: 'rgba(255,255,255,0.3)',
                                                fontSize: '0.75rem',
                                                lineHeight: 1.3,
                                                mt: 0.3,
                                            }}>
                                                {notif.body}
                                            </Typography>
                                        )}
                                        <Typography sx={{
                                            color: 'rgba(255,255,255,0.2)',
                                            fontSize: '0.7rem',
                                            mt: 0.5,
                                            fontFamily: "'Montserrat', sans-serif",
                                        }}>
                                            {formatTime(notif.receivedAt || notif.createdAt)}
                                        </Typography>
                                    </Box>

                                    {/* Delete */}
                                    <IconButton
                                        onClick={(e) => { e.stopPropagation(); handleDelete(notif.id || notif.userNotificationId); }}
                                        size="small"
                                        sx={{
                                            color: 'rgba(255,255,255,0.45)',
                                            mt: 0.25,
                                            flexShrink: 0,
                                            transition: 'color 0.2s ease, transform 0.2s ease',
                                            '&:hover': {
                                                color: '#ff6b6b',
                                                bgcolor: 'rgba(255,107,107,0.08)',
                                                transform: 'scale(1.1)',
                                            },
                                        }}
                                    >
                                        <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default NotificationBell;
