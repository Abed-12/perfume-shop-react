import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useUpdateAdminPasswordMutation,
} from '../../../redux/api/adminApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../../../utils/toastHelper';

// Shared Styles
const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        '& input': { color: '#FFFFFF' },
        '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: '2px' },
        '&.Mui-disabled': {
            '& input': {
                WebkitTextFillColor: 'rgba(255,255,255,0.4)',
            },
            '& fieldset': { borderColor: 'rgba(212,175,55,0.1)' },
        },
    },
};

const labelSx = {
    fontSize: '0.80rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.5)',
    mb: 0.8,
    mx: 1
};

const goldBtnSx = {
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '0.95rem',
    textTransform: 'none',
    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    color: '#000',
    boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
    transition: 'all 0.3s',
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
    },
};

const outlineBtnSx = {
    py: 1.3,
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '0.95rem',
    textTransform: 'none',
    background: 'transparent',
    color: '#D4AF37',
    border: '1px solid #D4AF37',
    transition: 'all 0.3s',
    '&:hover': {
        background: 'rgba(212,175,55,0.1)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(212,175,55,0.2)',
    },
};

// Skeleton Loader
const ProfileSkeleton = () => (
    <Paper
        elevation={0}
        sx={{
            background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
            border: '2px solid #D4AF37',
            borderRadius: '20px',
            overflow: 'hidden',
        }}
    >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={72} height={72} sx={{ bgcolor: 'rgba(212,175,55,0.1)', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="45%" height={30} sx={{ bgcolor: 'rgba(212,175,55,0.1)' }} />
                <Skeleton variant="rounded" width={80} height={22} sx={{ bgcolor: 'rgba(212,175,55,0.1)', mt: 0.5, borderRadius: '20px' }} />
            </Box>
        </Box>
        <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="25%" height={18} sx={{ bgcolor: 'rgba(212,175,55,0.08)', mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px' }} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px' }} />
            </Box>
            <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px', mb: 3 }} />
            <Skeleton variant="rounded" height={1} sx={{ bgcolor: 'rgba(212,175,55,0.15)', mb: 3 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Skeleton variant="rounded" height={48} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px' }} />
                <Skeleton variant="rounded" height={48} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px' }} />
            </Box>
        </Box>
    </Paper>
);

// Main Component
const AdminProfile = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // API
    const { data: profileResponse, isLoading: profileLoading, isError: profileError } = useGetAdminProfileQuery();
    const [updateProfile, { isLoading: isSaving }] = useUpdateAdminProfileMutation();
    const [updatePassword, { isLoading: isChangingPassword }] = useUpdateAdminPasswordMutation();

    const profile = profileResponse?.data;

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    // Password State
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!profile || isEditing) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
        });
    }, [profile, isEditing]);


    // Helpers
    const handleFormChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        })
        );
    }

    const handlePasswordChange = (e) => {
        setPasswordData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            firstName: profile?.firstName || '',
            lastName: profile?.lastName || '',
            email: profile?.email || '',
        });
    };

    const handleClosePasswordDialog = () => {
        setPasswordOpen(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowOldPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);
    };

    // Save Profile
    const handleSaveProfile = async () => {
        try {
            const result = await updateProfile(formData).unwrap();
            handleSuccess(result?.message);
            setIsEditing(false);
        } catch (error) {
            if (error?.data?.data) {
                const messages = Object.values(error.data.data).map((error, index) => `${index + 1}. ${error}`).join("\n");
                handleError(messages);
            } else {
                handleError(error?.data?.message);
            }
        }
    };

    // Save Password
    const handleSavePassword = async (e) => {
        e.preventDefault();

        if (!passwordData.oldPassword.trim()) {
            handleError(t('admin.profile.oldPasswordRequired'));
            return;
        }
        if (!passwordData.newPassword.trim()) {
            handleError(t('admin.profile.newPasswordRequired'));
            return;
        }
        if (!passwordData.confirmPassword.trim()) {
            handleError(t('admin.profile.confirmPasswordRequired'));
            return;
        }
        if (passwordData.newPassword.length < 8) {
            handleError(t('admin.profile.passwordMinLength'));
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            handleError(t('admin.profile.passwordsNotMatch'));
            return;
        }

        try {
            const result = await updatePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            }).unwrap();
            handleSuccess(result?.message);
            handleClosePasswordDialog();
        } catch (error) {
            if (error?.data?.data) {
                const messages = Object.values(error.data.data).map((error, index) => `${index + 1}. ${error}`).join("\n");
                handleError(messages);
            } else {
                handleError(error?.data?.message);
            }
        }
    };

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
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
                }
            }}
        >
            <Container maxWidth="sm">
                <Fade in timeout={1000}>
                    <Slide direction="up" in timeout={1000}>

                        <Box>
                            {/* Page Title */}
                            <Slide direction="down" in timeout={1000}>
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#000', '& span': { color: '#D4AF37' } }}>
                                        <span>{t('admin.profile.profile')}</span>
                                    </Typography>
                                    <Box sx={{ width: 250, height: 3, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', mx: 'auto', mt: 1 }} />
                                </Box>
                            </Slide>

                            {/* Loading */}
                            {profileLoading && <ProfileSkeleton />}

                            {/* Error */}
                            {profileError && !profileLoading && (
                                <Paper elevation={0} sx={{ background: 'linear-gradient(145deg, #000 0%, #1a1a1a 100%)', border: '2px solid #D4AF37', borderRadius: '20px', p: 4, textAlign: 'center' }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                                        {t('admin.profile.loadError')}
                                    </Typography>
                                    <Button onClick={() => window.location.reload()} sx={{ ...goldBtnSx, px: 3 }}>
                                        {t('admin.profile.retry')}
                                    </Button>
                                </Paper>
                            )}

                            {/* Main Card */}
                            {!profileLoading && !profileError && profile && (
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
                                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.03)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>

                                        {/* Avatar */}
                                        <Box sx={{ position: 'relative' }}>
                                            <Avatar
                                                sx={{
                                                    width: 72, height: 72,
                                                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                                    color: '#000', fontSize: '1.6rem', fontWeight: 800,
                                                    boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
                                                }}
                                            />
                                            <Box sx={{
                                                position: 'absolute', inset: -5, borderRadius: '50%',
                                                border: '2px solid transparent',
                                                borderTopColor: '#D4AF37',
                                                borderRightColor: 'rgba(212,175,55,0.3)',
                                                animation: 'spin 6s linear infinite',
                                                '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                                            }} />
                                        </Box>

                                        {/* Name & Role */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="h6" sx={{ color: '#D4AF37', fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {profile.firstName} {profile.lastName}
                                            </Typography>
                                            <Chip
                                                label={t('admin.profile.adminRole')}
                                                size="small"
                                                sx={{ mt: 0.5, background: 'rgba(212,175,55,0.12)', border: '1px solid #D4AF37', color: '#D4AF37', fontSize: '0.7rem', fontWeight: 700, height: 24 }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Body */}
                                    <Box sx={{ p: 3 }}>

                                        {/* Section Label */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, '&::after': { content: '""', flex: 1, height: '1px', background: 'rgba(212,175,55,0.25)' } }}>
                                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#D4AF37', whiteSpace: 'nowrap' }}>
                                                {t('admin.profile.personalData')}
                                            </Typography>
                                        </Box>

                                        {/* Names Grid */}
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                                            <Box>
                                                <Typography sx={labelSx}>{t('admin.profile.firstName')}</Typography>
                                                <TextField
                                                    fullWidth name="firstName" value={formData.firstName}
                                                    onChange={handleFormChange} disabled={!isEditing} size="small" sx={fieldSx}
                                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment> }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography sx={labelSx}>{t('admin.profile.lastName')}</Typography>
                                                <TextField
                                                    fullWidth name="lastName" value={formData.lastName}
                                                    onChange={handleFormChange} disabled={!isEditing} size="small" sx={fieldSx}
                                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment> }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Email */}
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={labelSx}>{t('admin.profile.email')}</Typography>
                                            <TextField
                                                fullWidth name="email" type="email" value={formData.email}
                                                onChange={handleFormChange} disabled={!isEditing} size="small" sx={fieldSx}
                                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment> }}
                                            />
                                        </Box>

                                        <Divider sx={{ borderColor: 'rgba(212,175,55,0.2)', mb: 3 }} />

                                        {/* Buttons */}
                                        {!isEditing ? (
                                            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                                                <Button fullWidth startIcon={<EditIcon sx={{ ml: isRTL ? 1 : 0 }} />} onClick={() => setIsEditing(true)} sx={goldBtnSx}>
                                                    {t('admin.profile.editData')}
                                                </Button>
                                                <Button fullWidth startIcon={<LockIcon sx={{ ml: isRTL ? 1 : 0 }} />} onClick={() => setPasswordOpen(true)} sx={outlineBtnSx}>
                                                    {t('admin.profile.changePassword')}
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                <Button
                                                    fullWidth
                                                    startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#000', ml: isRTL ? 1 : 0 }} /> : <SaveIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                                                    onClick={handleSaveProfile}
                                                    disabled={isSaving}
                                                    sx={goldBtnSx}
                                                >
                                                    {isSaving ? t('admin.profile.saving') : t('admin.profile.saveChanges')}
                                                </Button>
                                                <Button
                                                    startIcon={<CloseIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                                                    onClick={handleCancelEdit}
                                                    disabled={isSaving}
                                                    sx={{
                                                        py: 1.3, px: 2.5, borderRadius: '10px', fontWeight: 700, textTransform: 'none',
                                                        fontSize: '0.95rem', background: 'transparent', color: 'rgba(255,255,255,0.7)',
                                                        border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s',
                                                        '&:hover': { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.4)' },
                                                    }}
                                                >
                                                    {t('admin.profile.cancel')}
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            )}
                        </Box>

                    </Slide>
                </Fade>
            </Container>

            {/* Password Dialog */}
            <Dialog
                open={passwordOpen}
                onClose={handleClosePasswordDialog}
                disableRestoreFocus={false}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                        border: '2px solid #D4AF37',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.15)',
                    },
                }}
            >
                <DialogTitle sx={{ p: 3, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{ width: 38, height: 38, background: 'linear-gradient(135deg, #D4AF37, #F4D03F)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <VpnKeyIcon sx={{ color: '#000', fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.2rem' }}>
                            {t('admin.profile.changePassword')}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleClosePasswordDialog}
                        sx={{
                            color: '#D4AF37',
                            transition: 'transform 0.4s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                transform: 'rotate(180deg)',
                            },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSavePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

                        {/* Old Password */}
                        <Box>
                            <Typography sx={labelSx}>{t('admin.profile.currentPassword')}</Typography>
                            <TextField
                                fullWidth name="oldPassword" type={showOldPass ? 'text' : 'password'}
                                value={passwordData.oldPassword} onChange={handlePasswordChange} required size="small" sx={fieldSx}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowOldPass((p) => !p)} sx={{ color: '#D4AF37', p: 0.5 }}>
                                                {showOldPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* New Password */}
                        <Box>
                            <Typography sx={labelSx}>{t('admin.profile.newPassword')}</Typography>
                            <TextField
                                fullWidth name="newPassword" type={showNewPass ? 'text' : 'password'}
                                value={passwordData.newPassword} onChange={handlePasswordChange} required size="small" sx={fieldSx}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowNewPass((p) => !p)} sx={{ color: '#D4AF37', p: 0.5 }}>
                                                {showNewPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* Confirm Password */}
                        <Box>
                            <Typography sx={labelSx}>{t('admin.profile.confirmPassword')}</Typography>
                            <TextField
                                fullWidth name="confirmPassword" type={showConfirmPass ? 'text' : 'password'}
                                value={passwordData.confirmPassword} onChange={handlePasswordChange} required size="small" sx={fieldSx}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirmPass((p) => !p)} sx={{ color: '#D4AF37', p: 0.5 }}>
                                                {showConfirmPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* Submit */}
                        <Button
                            type="submit" fullWidth disabled={isChangingPassword}
                            startIcon={isChangingPassword ? <CircularProgress size={16} sx={{ color: '#000', ml: isRTL ? 1 : 0 }} /> : <SaveIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                            sx={{ ...goldBtnSx, mt: 1, py: 1.4, fontSize: '1rem', textTransform: 'none' }}
                        >
                            {isChangingPassword ? t('admin.profile.saving') : t('admin.profile.saveNewPassword')}
                        </Button>

                    </Box>
                </DialogContent>
            </Dialog>

            <ToastContainer />
        </Box>
    );
};

export default AdminProfile;