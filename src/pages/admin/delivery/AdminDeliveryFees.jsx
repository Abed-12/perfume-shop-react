import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useGetAdminDeliveryFeesQuery,
    useUpdateDeliveryFeeMutation,
} from '../../../redux/api/adminApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { handleSuccess, handleError } from '../../../utils/toastHelper';

// Shared Styles (site-wide dialog theme)
const goldBtnSx = {
    py: 1.1,
    px: 3,
    borderRadius: '10px',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: '0.9rem',
    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    color: '#000',
    minWidth: '130px',
    boxShadow: '0 6px 30px rgba(212, 175, 55, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
        transition: 'left 0.7s',
    },
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 35px rgba(212, 175, 55, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        '&::before': { left: '100%' },
    },
    '&:active': { transform: 'translateY(-1px)' },
    '&.Mui-disabled': {
        background: 'rgba(212,175,55,0.3)',
        color: 'rgba(0,0,0,0.5)',
        cursor: 'not-allowed',
        transform: 'none',
        boxShadow: 'none',
    },
};

const cancelBtnSx = {
    py: 1.1,
    px: 3,
    borderRadius: '10px',
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    minWidth: '130px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(255, 255, 255, 0.15)',
    },
    '&:active': { transform: 'translateY(-1px)' },
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
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
};

const labelSx = {
    fontSize: '0.80rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.5)',
    mb: 0.8,
    mx: 1,
};

const AdminDeliveryFees = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const { data: feesResponse, isLoading, isError } = useGetAdminDeliveryFeesQuery();
    const [updateFee, { isLoading: isSaving }] = useUpdateDeliveryFeeMutation();

    const fees = feesResponse?.data || [];

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [price, setPrice] = useState('');
    const [active, setActive] = useState(true);

    const formattedNumber = (value) => {
        if (value == null) return '';
        return new Intl.NumberFormat(
            i18n.language === 'ar' ? 'ar-JO' : 'en-US',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        ).format(value);
    };

    const openEditDialog = (fee) => {
        setEditingFee(fee);
        setPrice(fee.shippingFee != null ? String(fee.shippingFee) : '');
        setActive(fee.active !== false);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingFee(null);
        setPrice('');
        setActive(true);
    };

    const handleSave = async () => {
        const parsed = parseFloat(price);
        if (!price.trim() || Number.isNaN(parsed)) {
            handleError(t('admin.deliveryFees.validation.priceRequired'));
            return;
        }
        if (parsed <= 0) {
            handleError(t('admin.deliveryFees.validation.pricePositive'));
            return;
        }
        try {
            const response = await updateFee({
                id: editingFee.id,
                shippingFee: parsed,
                active,
            }).unwrap();
            handleSuccess(response.message || t('admin.deliveryFees.saved'));
            closeDialog();
        } catch (error) {
            handleError(error?.data?.message);
        }
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
            <Container maxWidth="lg">
                <Fade in timeout={1000}>
                    <Slide direction="down" in timeout={1000}>
                        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                            {/* Header */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'center', sm: 'center' },
                                justifyContent: 'flex-start',
                                gap: 2,
                                mb: { xs: 3, sm: 4 },
                            }}>
                                <Box sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                                            textAlign: { xs: 'center', sm: isRTL ? 'right' : 'left' },
                                            color: '#000',
                                            mb: 0.5,
                                        }}
                                    >
                                        {t('admin.deliveryFees.title')}{' '}
                                        <span style={{ color: '#D4AF37' }}>{t('admin.deliveryFees.titleHighlight')}</span>
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: 'rgba(0,0,0,0.55)',
                                            fontSize: { xs: '0.85rem', sm: '0.92rem' },
                                            textAlign: { xs: 'center', sm: isRTL ? 'right' : 'left' },
                                        }}
                                    >
                                        {t('admin.deliveryFees.subtitle')}
                                    </Typography>
                                    <Box sx={{
                                        width: '100%',
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
                                <Table sx={{ minWidth: 640 }}>
                                    <TableHead sx={{ background: 'rgba(212,175,55,0.2)' }}>
                                        <TableRow>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.deliveryFees.table.governorate')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.deliveryFees.table.fee')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.deliveryFees.table.status')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.deliveryFees.table.actions')}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isLoading && (
                                            [0, 1, 2, 3].map((i) => (
                                                <TableRow key={i}>
                                                    <TableCell colSpan={4}>
                                                        <Skeleton variant="text" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                        {!isLoading && (isError || fees.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 8 }}>
                                                    <LocalShippingIcon sx={{ fontSize: 60, opacity: 0.3, mb: 1 }} />
                                                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                        {t('admin.deliveryFees.empty')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!isLoading && !isError && fees.map((fee) => (
                                            <TableRow
                                                key={fee.id}
                                                sx={{
                                                    '&:hover': { background: 'rgba(212,175,55,0.05)' },
                                                    borderBottom: '1px solid rgba(212,175,55,0.1)',
                                                }}
                                            >
                                                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                                                    {t(`governorates.${fee.governorate}`, { defaultValue: fee.governorate })}
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: '#F4D03F', fontWeight: 700, fontSize: '0.88rem' }}>
                                                    {formattedNumber(fee.shippingFee)} {t('admin.deliveryFees.currency')}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={fee.active ? t('admin.deliveryFees.active') : t('admin.deliveryFees.inactive')}
                                                        sx={{
                                                            background: fee.active ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                                                            border: fee.active ? '1px solid #2ecc71' : '1px solid #e74c3c',
                                                            color: fee.active ? '#2ecc71' : '#e74c3c',
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title={t('admin.deliveryFees.editTitle')} arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => openEditDialog(fee)}
                                                            sx={{
                                                                color: '#D4AF37',
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    bgcolor: 'rgba(212,175,55,0.12)',
                                                                    transform: 'scale(1.2) rotate(-12deg)',
                                                                    filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.7))',
                                                                },
                                                                '&:active': { transform: 'scale(0.95)' },
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Slide>
                </Fade>
            </Container>

            {/* Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                maxWidth="xs"
                fullWidth
                disableScrollLock
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                        border: '2px solid #D4AF37',
                        borderRadius: '20px',
                        mx: { xs: 1, sm: 2, md: 'auto' },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
                            pointerEvents: 'none',
                        },
                    },
                }}
            >
                <DialogTitle sx={{ p: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
                        {t('admin.deliveryFees.editTitle')}
                    </Typography>
                    <IconButton
                        onClick={closeDialog}
                        sx={{
                            color: '#D4AF37',
                            transition: 'transform 0.4s ease',
                            '&:hover': { backgroundColor: 'rgba(212, 175, 55, 0.1)', transform: 'rotate(180deg)' },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography sx={labelSx}>{t('admin.deliveryFees.governorate')}</Typography>
                    <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1rem', mb: 2, mx: 1 }}>
                        {editingFee && t(`governorates.${editingFee.governorate}`, { defaultValue: editingFee.governorate })}
                    </Typography>
                    <Typography sx={labelSx}>{t('admin.deliveryFees.feeLabel')}</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={price}
                        onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+(\.\d{0,2})?$/.test(v)) setPrice(v); }}
                        placeholder="0.00"
                        inputProps={{ min: 0.01, step: '0.01' }}
                        error={price !== '' && parseFloat(price) <= 0}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <span style={{ color: '#D4AF37', fontWeight: 700 }}>{t('admin.deliveryFees.currency')}</span>
                                </InputAdornment>
                            )
                        }}
                        sx={{ ...fieldSx, mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mx: 1 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600 }}>
                            {t('admin.deliveryFees.activeLabel')}
                        </Typography>
                        <Switch
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#2ecc71' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2ecc71' },
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.5, justifyContent: 'center' }}>
                    <Button onClick={closeDialog} sx={cancelBtnSx}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} sx={goldBtnSx}>
                        {isSaving ? <CircularProgress size={22} sx={{ color: '#000' }} /> : t('admin.deliveryFees.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDeliveryFees;
