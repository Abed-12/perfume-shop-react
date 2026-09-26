import { useState, useEffect, useRef } from 'react';
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
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Spa as SpaIcon,
  ReceiptLong as OrdersIcon,
  LocalOffer as CouponIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../redux/slices/authSlice';

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('bottomNavEnabled') !== 'false';
  });

  const [hidden, setHidden] = useState(false);
  const lastNavRef = useRef(0);

  // Show bar + grace period on every route change (ignore layout-shift scrolls)
  useEffect(() => {
    lastNavRef.current = Date.now();
    setHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => {
      setEnabled(localStorage.getItem('bottomNavEnabled') !== 'false');
    };
    window.addEventListener('bottomNavToggle', handler);
    return () => window.removeEventListener('bottomNavToggle', handler);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      if (Date.now() - lastNavRef.current < 900) {
        lastY = window.scrollY;
        return;
      }
      const y = window.scrollY;
      const diff = y - lastY;
      if (Math.abs(diff) > 8) {
        setHidden(diff > 0);
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getItems = () => {
    if (!isAuthenticated) {
      return [
        { label: t('navbar.home'), icon: <HomeIcon />, path: '/' },
        { label: t('navbar.perfume'), icon: <SpaIcon />, path: '/perfumes' },
        { label: t('navbar.register'), icon: <RegisterIcon />, path: '/register' },
        { label: t('navbar.login'), icon: <LoginIcon />, path: '/login' },
      ];
    }
    if (userRole === 'ADMIN') {
      return [
        { label: t('navbar.home'), icon: <HomeIcon />, path: '/' },
        { label: t('navbar.perfume'), icon: <SpaIcon />, path: '/admin-panel/perfumes' },
        { label: t('navbar.orders'), icon: <OrdersIcon />, path: '/admin-panel/orders' },
        { label: t('navbar.coupon'), icon: <CouponIcon />, path: '/admin-panel/coupon' },
      ];
    }
    return [
      { label: t('navbar.home'), icon: <HomeIcon />, path: '/' },
      { label: t('navbar.perfume'), icon: <SpaIcon />, path: '/perfumes' },
      { label: t('navbar.myOrders'), icon: <OrdersIcon />, path: '/my-orders' },
      { label: t('navbar.profile'), icon: <PersonIcon />, path: '/profile' },
    ];
  };

  const items = getItems();

  const getCurrentValue = () => {
    const path = location.pathname;
    const idx = items.findIndex((item) => {
      if (!item.path) return false;
      if (item.path === '/') return path === '/';
      return path.includes(item.path);
    });
    return idx >= 0 ? idx : 0;
  };

  const value = getCurrentValue();

  const handleChange = (event, newValue) => {
    const item = items[newValue];
    if (!item) return;
    if (item.path) navigate(item.path);
  };

  if (!isMobile || !enabled)   if (!isMobile || !enabled) return null;

  return (
      <Paper
      sx={{
        position: 'fixed',
        bottom: hidden ? -96 : 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'bottom 0.3s ease',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #F4D03F 50%, #D4AF37 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'goldShimmer 5s ease-in-out infinite',
        },
      }}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          background: 'transparent',
          height: 64,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(255, 255, 255, 0.5)',
            minWidth: 'auto',
            padding: '6px 0',
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              color: '#D4AF37',
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.15)',
                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.5))',
              },
            },
            '&:hover': {
              color: '#D4AF37',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            fontWeight: 600,
            marginTop: '4px',
            '&.Mui-selected': {
              fontSize: '0.7rem',
              fontWeight: 700,
            },
          },
        }}
      >
        {items.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;