import { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Determine current value based on location
  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 0;
    if (path.includes('/products')) return 1;
    if (path.includes('/profile')) return 2;
    if (path.includes('/logout')) return 3;
    return 0;
  };

  const [value, setValue] = useState(getCurrentValue());

  const handleChange = (event, newValue) => {
    setValue(newValue);
    
    // Navigation logic
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/products');
        break;
      case 2:
        navigate('/profile');
        break;
      case 3:
        navigate('/logout');
        break;
      default:
        break;
    }
  };

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
        borderTop: '2px solid #D4AF37',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          background: 'transparent',
          height: 70,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(255, 255, 255, 0.5)',
            minWidth: 'auto',
            padding: '6px 12px',
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              color: '#D4AF37',
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.2)',
              },
            },
            '&:hover': {
              color: '#D4AF37',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 600,
            marginTop: '4px',
            '&.Mui-selected': {
              fontSize: '0.75rem',
              fontWeight: 700,
            },
          },
        }}
      >
        <BottomNavigationAction
          label={t('navbar.home')}
          icon={<HomeIcon />}
          sx={{
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': {
                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.5))',
              },
            },
          }}
        />
        <BottomNavigationAction
          label={t('footer.products')}
          icon={<CategoryIcon />}
          sx={{
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': {
                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.5))',
              },
            },
          }}
        />
        <BottomNavigationAction
          label={t('navbar.profile')}
          icon={<PersonIcon />}
          sx={{
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': {
                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.5))',
              },
            },
          }}
        />
        <BottomNavigationAction
          label={t('navbar.logout')}
          icon={<LogoutIcon />}
          sx={{
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': {
                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.5))',
              },
            },
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;