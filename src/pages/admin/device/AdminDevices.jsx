import { useTranslation } from 'react-i18next';
import { useGetUserDevicesQuery, useRemoveDeviceMutation } from '../../../redux/api/adminApi';
import { handleError, handleSuccess } from '../../../utils/toastHelper';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import DevicesIcon from '@mui/icons-material/Devices';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LaptopIcon from '@mui/icons-material/Laptop';

const TableSkeleton = ({ colCount = 4 }) => (
    <>
        {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
                {[...Array(colCount)].map((__, j) => (
                    <TableCell key={j} align="center">
                        <Skeleton
                            variant="text"
                            width="60%"
                            height={20}
                            sx={{ borderRadius: '6px', mx: 'auto' }}
                        />
                    </TableCell>
                ))}
            </TableRow>
        ))}
    </>
);

const AdminDevices = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const { data, isLoading } = useGetUserDevicesQuery();
    const [removeDevice] = useRemoveDeviceMutation();

    const devices = data?.data || data || [];

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

    const handleRemove = async (deviceId, deviceName) => {
        try {
            await removeDevice(deviceId).unwrap();
            if (deviceName === getDeviceName()) {
                localStorage.removeItem('fcm_device_registered');
            }
            handleSuccess(t('admin.devices.removed'));
        } catch (error) {
            handleError(error?.data?.message || t('admin.devices.removeError'));
        }
    };

    const getDeviceIcon = (deviceType) => {
        if (deviceType === 'MOBILE') return <PhoneIphoneIcon sx={{ color: '#D4AF37', fontSize: 20 }} />;
        return <LaptopIcon sx={{ color: '#D4AF37', fontSize: 20 }} />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)',
                py: { xs: 2, sm: 3, md: 4 },
                px: { xs: 1, sm: 2 },
            }}
        >
            <Container maxWidth="xl">
                <Fade in timeout={1000}>
                    <Slide direction="down" in timeout={1000}>
                        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: { xs: 2, sm: 0 },
                                mb: { xs: 3, sm: 4 },
                            }}>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                                            textAlign: { xs: 'center', sm: isRTL ? 'right' : 'left' },
                                            mb: 0.5,
                                        }}
                                    >
                                        {t('admin.devices.title')}{' '}
                                        <span style={{ color: '#D4AF37' }}>{t('admin.devices.titleHighlight')}</span>
                                    </Typography>
                                    <Box sx={{
                                        width: { xs: '100%', sm: isRTL ? 160 : 300 },
                                        height: 3,
                                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                        mt: 1,
                                    }} />
                                </Box>
                            </Box>
                        </Box>
                    </Slide>
                </Fade>

                <Fade in timeout={1000}>
                    <Slide direction="up" in timeout={1000}>
                        <Box sx={{
                            overflowX: 'auto',
                            width: '100%',
                            WebkitOverflowScrolling: 'touch',
                        }}>
                            <TableContainer
                                component={Paper}
                                elevation={0}
                                sx={{
                                    border: '2px solid #D4AF37',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                                    direction: 'ltr',
                                    overflowX: 'auto',
                                }}
                            >
                                <Table sx={{ minWidth: 600 }}>
                                    <TableHead sx={{ background: 'rgba(212,175,55,0.2)' }}>
                                        <TableRow>
                                            <TableCell align="center" sx={{ width: 60, color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                #
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.devices.table.name')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.devices.table.type')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.devices.table.registeredAt')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: 80, color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.devices.table.actions')}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {isLoading ? (
                                            <TableSkeleton />
                                        ) : devices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 8 }}>
                                                    <DevicesIcon sx={{ fontSize: 60, opacity: 0.3, mb: 1 }} />
                                                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                        {t('admin.devices.noDevices')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            devices.map((device, index) => (
                                                <TableRow
                                                    key={device.id || index}
                                                    sx={{
                                                        '&:hover': { background: 'rgba(212,175,55,0.05)' },
                                                        borderBottom: '1px solid rgba(212,175,55,0.1)',
                                                    }}
                                                >
                                                    <TableCell align="center" sx={{ width: 60 }}>
                                                        {getDeviceIcon(device.deviceType)}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                                                        {device.deviceName || '—'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={device.deviceType || 'WEB'}
                                                            size="small"
                                                            sx={{
                                                                background: 'rgba(212,175,55,0.15)',
                                                                border: '1px solid #D4AF37',
                                                                color: '#D4AF37',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                                        {formatDate(device.createdAt)}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ width: 80 }}>
                                                        <Tooltip title={t('admin.devices.remove')} arrow>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRemove(device.id, device.deviceName)}
                                                                sx={{
                                                                    color: 'rgba(255,255,255,0.3)',
                                                                    '&:hover': { color: '#e74c3c', bgcolor: 'rgba(231,76,60,0.1)' },
                                                                }}
                                                            >
                                                                <DeleteOutlineIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Slide>
                </Fade>
            </Container>
        </Box>
    );
};

export default AdminDevices;
