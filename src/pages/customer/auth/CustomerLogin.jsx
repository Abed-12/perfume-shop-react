import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useCustomerLoginMutation } from '../../../redux/api/customerApi';
import { setCredentials, selectIsAuthenticated } from '../../../redux/slices/authSlice';
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
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { ToastContainer } from 'react-toastify';
import { handleError } from '../../../utils/toastHelper';

const CustomerLogin = () => {
  const { t, i18n } = useTranslation();
  const [login, { isLoading }] = useCustomerLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="#" replace />;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData).unwrap();
      dispatch(
        setCredentials({
          token: result.data.token,
        })
      );

      setFormData({
        email: '',
        password: ''
      });

      navigate('#', { replace: true });
    } catch (error) {
      handleError(error?.data?.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      {/* Login Container */}
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
              {/* Logo and Title */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Slide direction="down" in timeout={1000}>
                  <Avatar
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      margin: '0 auto 20px',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                      boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)'
                    }}
                  >
                  </Avatar>
                </Slide>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#D4AF37',
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  }}
                >
                  {t('auth.login.welcome')}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#FFFFFF',
                    opacity: 0.9,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  {t('customer.login.subtitle')}
                </Typography>
              </Box>

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                {/* Email Field */}
                <Typography
                  variant="body1"
                  sx={{
                    color: '#FFFFFF',
                    m: 1,
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  {t('auth.login.emailPlaceholder')}
                </Typography>

                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                      '&:hover fieldset': {
                        borderColor: '#D4AF37',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#D4AF37',
                      }
                    }
                  }}
                  size='small'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" >
                        <EmailIcon sx={{ mr: isRTL ? 2 : 0, color: '#D4AF37' }} />
                      </InputAdornment>
                    )
                  }}
                />

                {/* Password Field */}
                <Typography
                  variant="body1"
                  sx={{
                    color: '#FFFFFF',
                    m: 1,
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  {t('auth.login.passwordPlaceholder')}
                </Typography>

                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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
                          onClick={togglePasswordVisibility}
                          sx={{ color: '#D4AF37' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* Forgot Password */}
                <Box sx={{ mb: 2, mr: 1 }}>
                  <Link
                    href="/forgot-password"
                    underline="hover"
                    sx={{
                      color: '#D4AF37',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      m: 1,
                      '&:hover': {
                        color: '#B8941E'
                      }
                    }}
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </Box>

                {/* Login Button */}
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
                      <span>{t('auth.login.loggingIn')}</span>
                    </Box>
                  ) : (
                    t('auth.login.loginButton')
                  )}
                </Button>

                {/* Register link */}
                <Box sx={{ textAlign: "center", mt: 2.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.5)", display: "inline" }}
                  >
                    {t("customer.login.noAccount")}{" "}
                  </Typography>
                  <Link
                    href="/register"
                    underline="hover"
                    sx={{
                      color: "#D4AF37",
                      fontWeight: 600,
                      "&:hover": { color: "#B8941E" },
                    }}
                  >
                    {t("customer.login.registerButton")}
                  </Link>
                </Box>
              </Box>
            </Paper>

          </Slide>
        </Fade>
      </Container>

      <ToastContainer />
    </Box>
  );
};

export default CustomerLogin;