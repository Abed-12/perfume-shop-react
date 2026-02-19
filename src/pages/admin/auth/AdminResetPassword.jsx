import { useState } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAdminResetPasswordMutation } from '../../../redux/api/adminApi';
import { selectIsAuthenticated } from '../../../redux/slices/authSlice';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../../../utils/toastHelper';

const AdminResetPassword = () => {
    const { t, i18n } = useTranslation();
    const [resetPassword, { isLoading }] = useAdminResetPasswordMutation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        code: searchParams.get("code") || "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isAuthenticated = useSelector(selectIsAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/admin-panel/dashboard" replace />;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate code exists
        if (!formData.code || formData.code.trim() === '') {
            handleError(t('auth.resetPassword.codeRequired'));
            return;
        }

        // Validate new password
        if (!formData.newPassword || formData.newPassword.trim() === '') {
            handleError(t('auth.resetPassword.passwordRequired'));
            return;
        }

        // Validate password length
        if (formData.newPassword.length < 8) {
            handleError(t('auth.resetPassword.passwordMinLength'));
            return;
        }

        // Validate confirm password
        if (!formData.confirmPassword || formData.confirmPassword.trim() === '') {
            handleError(t('auth.resetPassword.confirmPasswordRequired'));
            return;
        }

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            handleError(t('auth.resetPassword.passwordsNotMatch'));
            return
        }

        try {
            const resetData = {
                code: formData.code,
                newPassword: formData.newPassword
            }

            const response = await resetPassword(resetData).unwrap();
                handleSuccess(response.message)
                setTimeout(() => {
                navigate("/admin-panel/login");
            }, 3000);
        } catch (error) {
            if (error?.data?.data) {
                const messages = Object.values(error.data.data).join("\n");
                handleError(messages);
            } else {
                handleError(error?.data?.message);
            }
        }
    }

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
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
                }
            }}
        >
            {/* ===== Reset Password Container ===== */}
            <Container maxWidth="sm">
                <Fade in timeout={1000}>
                    <Slide direction="up" in timeout={1000}>

                        <Paper
                            sx={{
                                p: { xs: 2, sm: 2 },
                                borderRadius: 4,
                                border: '2px solid #D4AF37',
                                boxShadow: '0 8px 32px 0 rgba(212, 175, 55, 0.3)',
                                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                            }}
                        >
                            {/* ===== Header ===== */}
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Slide direction="down" in timeout={1000}>
                                    <Avatar
                                        sx={{
                                            width: { xs: 60, sm: 80 },
                                            height: { xs: 60, sm: 80 },
                                            margin: '0 auto 20px',
                                            background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                                        }}
                                    >
                                        <VpnKeyIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#000000' }} />
                                    </Avatar>
                                </Slide>

                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#D4AF37',
                                        mb: 1,
                                        fontSize: { xs: '1.75rem', sm: '2.125rem' }
                                    }}
                                >
                                    {t('auth.resetPassword.title')}
                                </Typography>

                                <Typography
                                    variant="body1"
                                    sx={{ 
                                        color: '#FFFFFF',
                                        opacity: 0.9,
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    {t('auth.resetPassword.subtitle')}
                                </Typography>
                            </Box>

                            {/* ===== Reset Password Form ===== */}
                            <Box component="form" onSubmit={handleSubmit}>
                                {/* Reset Code */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#FFFFFF',
                                        fontWeight: 600,
                                        m: 1,
                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                    }}
                                >
                                    {t('auth.resetPassword.code')}
                                </Typography>

                                <TextField
                                    fullWidth
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    disabled
                                    required
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            '& input': {
                                                color: '#FFFFFF',
                                            },
                                            '& fieldset': {
                                                borderColor: 'rgba(212, 175, 55, 0.3)',
                                            },
                                            '&.Mui-disabled': {
                                                '& input': {
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    WebkitTextFillColor: 'rgba(255, 255, 255, 0.5)',
                                                }
                                            }
                                        }
                                    }}
                                    size='small'
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment  position="start" >
                                                <VpnKeyIcon sx={{ mr: isRTL ? 2 : 0, color: '#D4AF37'}} />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {/* New Password */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#FFFFFF',
                                        fontWeight: 600,
                                        m: 1,
                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                    }}
                                >
                                    {t('auth.resetPassword.newPassword')}
                                </Typography>

                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    sx={{
                                        mb: 1,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            '& input': {
                                                color: '#FFFFFF',
                                            },
                                            '& fieldset': {
                                                borderColor: 'rgba(212, 175, 55, 0.3)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#D4AF37',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#D4AF37',
                                            }
                                        },
                                    }}
                                    size='small'
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ mr: isRTL ? 2 : 0, color: '#D4AF37' }} />
                                            </InputAdornment>
                                        ), 
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    sx={{ color: '#D4AF37' }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {/* Confirm Password */}
                                <Typography 
                                    sx={{ 
                                        color: '#FFFFFF', 
                                        fontWeight: 600,
                                        m: 1,
                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                    }}
                                >
                                    {t('auth.resetPassword.confirmPassword')}
                                </Typography>

                                <TextField
                                    fullWidth
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    sx={{ 
                                        mb: 1,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            '& input': {
                                                color: '#FFFFFF',
                                            },
                                            '& fieldset': {
                                                borderColor: 'rgba(212, 175, 55, 0.3)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#D4AF37',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#D4AF37',
                                            }
                                        },
                                    }}
                                    size='small'
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ ml: isRTL ? 2 : 0, color: '#D4AF37' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    sx={{ color: '#D4AF37' }}
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={isLoading}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                        color: '#000000',
                                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
                                            boxShadow: '0 6px 20px rgba(212, 175, 55, 0.5)',
                                            transform: 'translateY(-2px)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                        '&.Mui-disabled': {
                                            background: 'rgba(212, 175, 55, 0.3)',
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        },
                                    }}
                                >
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={20} sx={{ color: '#000000' }} />
                                            <span>{t('auth.resetPassword.resetting')}</span>
                                        </Box>
                                    ) : (
                                        t('auth.resetPassword.submit')
                                    )}
                                </Button>


                                {/* Login Redirect */}
                                <Typography
                                    variant="body2"
                                    sx={{ color: "#FFFFFF", opacity: 0.8, mt: 2, textAlign: 'center' }}
                                >
                                    {t("auth.resetPassword.rememberPassword")}{" "}
                                    <Link
                                        href="/admin-panel/login"
                                        underline="hover"
                                        sx={{
                                            color: "#D4AF37",
                                            fontWeight: 700,
                                            "&:hover": {
                                                color: "#F4D03F",
                                            },
                                        }}
                                    >
                                        {t('auth.resetPassword.login')}
                                    </Link>
                                </Typography>
                            </Box>
                        </Paper>
                    </Slide>
                </Fade>
            </Container>

            <ToastContainer />
        </Box>
    );
};

export default AdminResetPassword;