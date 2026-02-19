import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useGetCustomerProfileQuery,
    useUpdateCustomerProfileMutation,
    useUpdateCustomerPasswordMutation,
} from '../../../redux/api/customerApi';
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
import MenuItem from '@mui/material/MenuItem';
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import HomeIcon from '@mui/icons-material/Home';
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
        color: '#FFFFFF',
        '& input': { color: '#FFFFFF' },
        '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: '2px' },
        '&.Mui-disabled': {
            '& input, & textarea': { WebkitTextFillColor: 'rgba(255,255,255,0.4)' },
            '& fieldset': { borderColor: 'rgba(212,175,55,0.1)' },
        }
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

const selectSx = {
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#FFFFFF",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.3)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D4AF37" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D4AF37" },
    "& .MuiSvgIcon-root": { color: "#D4AF37" },
    "&.Mui-disabled": {
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.1)" },
        "& .MuiSelect-select": { WebkitTextFillColor: "rgba(255,255,255,0.4)" },
    }
};

const menuProps = {
    PaperProps: {
        sx: {
            background: "#1a1a1a",
            border: "1px solid rgba(212,175,55,0.3)",
            "& .MuiMenuItem-root": {
                color: "#FFF",
                "&:hover": { backgroundColor: "rgba(212,175,55,0.15)" },
                "&.Mui-selected": {
                    backgroundColor: "rgba(212,175,55,0.25)",
                    color: "#D4AF37",
                },
            },
        },
    },
};

// Governorates List
const GOVERNORATES = [
    'AMMAN',
    'IRBID',
    'ZARQA',
    'BALQA',
    'MADABA',
    'KARAK',
    'TAFILAH',
    'MAAN',
    'AQABA',
    'JERASH',
    'AJLOUN',
    'MAFRAQ'
];

const JO_PHONE_REGEX = /^(\+962)?7[789]\d{7}$/;

// Skeleton Loader
const ProfileSkeleton = () => (
    <Paper
        elevation={0}
        sx={{
            background: 'linear-gradient(145deg, #000 0%, #1a1a1a 100%)',
            border: '2px solid #D4AF37',
            borderRadius: '20px',
            overflow: 'hidden',
        }}
    >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={72} height={72} sx={{ bgcolor: 'rgba(212,175,55,0.1)' }} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={28} sx={{ bgcolor: 'rgba(212,175,55,0.1)', mb: 1 }} />
                <Skeleton variant="rounded" width={100} height={24} sx={{ bgcolor: 'rgba(212,175,55,0.1)', borderRadius: '20px' }} />
            </Box>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3 }}>
            {/* Section Title */}
            <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: 'rgba(212,175,55,0.08)', mb: 2 }} />

            {/* Name Fields */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px' }} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px' }} />
            </Box>

            {/* Email */}
            <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px', mb: 2 }} />

            {/* Phone Numbers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px' }} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px' }} />
            </Box>

            {/* Governorate */}
            <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px', mb: 2 }} />

            {/* Address */}
            <Skeleton variant="rounded" height={60} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px', mb: 3 }} />

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rounded" height={48} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px', flex: 1 }} />
                <Skeleton variant="rounded" height={48} sx={{ bgcolor: 'rgba(212,175,55,0.08)', borderRadius: '10px', flex: 1 }} />
            </Box>
        </Box>
    </Paper>
);

// Main Component
const CustomerProfile = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // API
    const { data: profileResponse, isLoading: profileLoading, isError: profileError } = useGetCustomerProfileQuery();
    const [updateProfile, { isLoading: isSaving }] = useUpdateCustomerProfileMutation();
    const [updatePassword, { isLoading: isChangingPassword }] = useUpdateCustomerPasswordMutation();

    const profile = profileResponse?.data;

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        alternativePhoneNumber: '',
        governorate: 'AMMAN',
        address: ''
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
            phoneNumber: profile.phoneNumber || '',
            alternativePhoneNumber: profile.alternativePhoneNumber || '',
            governorate: profile.governorate || 'AMMAN',
            address: profile.address || ''
        });
    }, [profile, isEditing]);


    // Helpers
    const handleFormChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
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
            phoneNumber: profile?.phoneNumber || '',
            alternativePhoneNumber: profile?.alternativePhoneNumber || '',
            governorate: profile?.governorate || 'AMMAN',
            address: profile?.address || ''
        });
    };

    const handleClosePasswordDialog = () => {
        setPasswordOpen(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowOldPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);
    };

    // Format phone for display: +962797298546 → 7 9729 8546
    const formatPhoneDisplay = (fullPhone) => {
        if (!fullPhone) return "";

        let digits = fullPhone.replace(/\D/g, "");

        if (digits.startsWith("962")) {
            digits = digits.slice(3);
        }

        if (digits.startsWith("7") && digits.length === 9) {
            return digits.replace(/(\d)(\d{4})(\d{4})/, "$1 $2 $3");
        }

        return digits;
    };

    // Handle phone input and store as +962XXXXXXXXX
    const handlePhoneInput = (fieldName, inputValue) => {
        let digits = inputValue.replace(/\D/g, "");

        if (digits.startsWith("962")) {
            digits = digits.slice(3);
        }

        if (digits.startsWith("0")) {
            digits = digits.slice(1);
        }

        digits = digits.slice(0, 9);

        const fullNumber = digits ? "+962" + digits : "";

        handleFormChange({
            target: {
                name: fieldName,
                value: fullNumber
            }
        });
    };

    // Save Profile
    const handleSaveProfile = async () => {
        try {
            const dataToSend = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                governorate: formData.governorate,
                address: formData.address
            };

            const errors = [];

            // Add alternativePhoneNumber only if it has a value
            if (formData.alternativePhoneNumber && formData.alternativePhoneNumber.trim()) {
                dataToSend.alternativePhoneNumber = formData.alternativePhoneNumber;
            }

            if (!JO_PHONE_REGEX.test(formData.phoneNumber)) {
                errors.push(t("customer.profile.invalidPhone"));
            }

            if (
                formData.alternativePhoneNumber &&
                formData.alternativePhoneNumber.trim() &&
                !JO_PHONE_REGEX.test(formData.alternativePhoneNumber)
            ) {
                errors.push(t("customer.profile.invalidAlternativePhone"));
            }

            if (
                formData.alternativePhoneNumber &&
                formData.alternativePhoneNumber.trim() &&
                formData.alternativePhoneNumber === formData.phoneNumber
            ) {
                errors.push(t("customer.profile.phoneNumbersSame"));
            }

            if (errors.length > 0) {
                const allErrors = errors.map((error, index) => `${index + 1}. ${error}`).join("\n");
                handleError(allErrors);
                return;
            }

            const result = await updateProfile(dataToSend).unwrap();
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
            handleError(t('customer.profile.oldPasswordRequired'));
            return;
        }
        if (!passwordData.newPassword.trim()) {
            handleError(t('customer.profile.newPasswordRequired'));
            return;
        }
        if (!passwordData.confirmPassword.trim()) {
            handleError(t('customer.profile.confirmPasswordRequired'));
            return;
        }
        if (passwordData.newPassword.length < 8) {
            handleError(t('customer.profile.passwordMinLength'));
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            handleError(t('customer.profile.passwordsNotMatch'));
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
                                        <span>{t('customer.profile.profile')}</span>
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
                                        {t('customer.profile.loadError')}
                                    </Typography>
                                    <Button onClick={() => window.location.reload()} sx={{ ...goldBtnSx, px: 3 }}>
                                        {t('customer.profile.retry')}
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
                                                label={t('customer.profile.customerRole')}
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
                                                {t('customer.profile.personalData')}
                                            </Typography>
                                        </Box>

                                        {/* Names Grid */}
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                                            <Box>
                                                <Typography sx={labelSx}>{t('customer.profile.firstName')}</Typography>
                                                <TextField
                                                    fullWidth name="firstName" value={formData.firstName}
                                                    onChange={handleFormChange} disabled={!isEditing} size="small" sx={fieldSx}
                                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment> }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography sx={labelSx}>{t('customer.profile.lastName')}</Typography>
                                                <TextField
                                                    fullWidth name="lastName" value={formData.lastName}
                                                    onChange={handleFormChange} disabled={!isEditing} size="small" sx={fieldSx}
                                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment> }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Email */}
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={labelSx}>{t('customer.profile.email')}</Typography>
                                            <TextField
                                                fullWidth name="email" type="email" value={formData.email}
                                                onChange={handleFormChange} disabled={!isEditing} size="small" sx={fieldSx}
                                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment> }}
                                            />
                                        </Box>

                                        {/* Phone Numbers Grid */}
                                        <Grid container spacing={2}>
                                            {[
                                                {
                                                    fieldName: "phoneNumber",
                                                    label: t("customer.profile.phoneNumber"),
                                                    required: true,
                                                },
                                                {
                                                    fieldName: "alternativePhoneNumber",
                                                    label: t("customer.profile.alternativePhoneNumber"),
                                                    required: false,
                                                },
                                            ].map(({ fieldName, label, required }) => (
                                                <Grid size={{ xs: 12, sm: 6 }} mb={2} key={fieldName}>
                                                    <Typography sx={labelSx}>
                                                        {label}
                                                    </Typography>
                                                    <Box sx={{ display: "flex", gap: 1, direction: "ltr" }}>
                                                        {/* Fixed +962 badge */}
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 0.5,
                                                                p: 1,

                                                                height: "40px",
                                                                borderRadius: 2,
                                                                border: "1px solid rgba(212,175,55,0.3)",
                                                                backgroundColor: "rgba(255,255,255,0.05)"
                                                            }}
                                                        >
                                                            <Typography sx={{ fontSize: "1rem", color: "#D4AF37" }}>
                                                                🇯🇴
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    color: "#D4AF37",
                                                                    fontWeight: 700,
                                                                    fontSize: "0.9rem",
                                                                }}
                                                            >
                                                                +962
                                                            </Typography>
                                                        </Box>

                                                        <TextField
                                                            fullWidth
                                                            required={required}
                                                            value={formatPhoneDisplay(formData[fieldName])}
                                                            onChange={(e) => handlePhoneInput(fieldName, e.target.value)}
                                                            disabled={!isEditing}
                                                            size="small"
                                                            sx={fieldSx}
                                                            placeholder="7 XXXX XXXX"
                                                            inputProps={{ inputMode: "numeric" }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <PhoneAndroidIcon
                                                                            sx={{ color: "#D4AF37", fontSize: 18 }}
                                                                        />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        {/* Governorate */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography sx={labelSx}>{t('customer.profile.governorate')}</Typography>

                                            <FormControl fullWidth>
                                                <Select
                                                    name="governorate"
                                                    value={formData.governorate}
                                                    onChange={handleFormChange}
                                                    disabled={!isEditing}
                                                    size="small"
                                                    sx={selectSx}
                                                    MenuProps={menuProps}
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <LocationOnIcon
                                                                sx={{ color: "#D4AF37", mr: isRTL ? 2 : 0, ml: isRTL ? -3 : 0, fontSize: 18 }}
                                                            />
                                                        </InputAdornment>
                                                    }
                                                >
                                                    {GOVERNORATES.map((gov) => (
                                                        <MenuItem key={gov} value={gov}>
                                                            {t(`governorates.${gov}`, { defaultValue: gov })}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        {/* Address */}
                                        <Box sx={{ mb: 3 }}>
                                            <Typography sx={labelSx}>{t('customer.profile.address')}</Typography>
                                            <TextField
                                                fullWidth
                                                name="address"
                                                value={formData.address}
                                                onChange={handleFormChange}
                                                disabled={!isEditing}
                                                size="small"
                                                multiline
                                                rows={2}
                                                sx={fieldSx}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1, ml: isRTL ? 1 : 0 }}><HomeIcon sx={{ color: '#D4AF37', fontSize: 18 }} /></InputAdornment>
                                                }}
                                            />
                                        </Box>

                                        <Divider sx={{ borderColor: 'rgba(212,175,55,0.2)', mb: 3 }} />

                                        {/* Buttons */}
                                        {!isEditing ? (
                                            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                                                <Button fullWidth startIcon={<EditIcon sx={{ ml: isRTL ? 1 : 0 }} />} onClick={() => setIsEditing(true)} sx={goldBtnSx}>
                                                    {t('customer.profile.editData')}
                                                </Button>
                                                <Button fullWidth startIcon={<LockIcon sx={{ ml: isRTL ? 1 : 0 }} />} onClick={() => setPasswordOpen(true)} sx={outlineBtnSx}>
                                                    {t('customer.profile.changePassword')}
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
                                                    {isSaving ? t('customer.profile.saving') : t('customer.profile.saveChanges')}
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
                                                    {t('customer.profile.cancel')}
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
                            {t('customer.profile.changePassword')}
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
                            <Typography sx={labelSx}>{t('customer.profile.currentPassword')}</Typography>
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
                            <Typography sx={labelSx}>{t('customer.profile.newPassword')}</Typography>
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
                            <Typography sx={labelSx}>{t('customer.profile.confirmPassword')}</Typography>
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
                            {isChangingPassword ? t('customer.profile.saving') : t('customer.profile.saveNewPassword')}
                        </Button>

                    </Box>
                </DialogContent>
            </Dialog>

            <ToastContainer />
        </Box>
    );
};

export default CustomerProfile;