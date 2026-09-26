import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuthenticated, selectUserRole } from '../redux/slices/authSlice';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingIcon from '@mui/icons-material/LocalMall';
import SpaIcon from '@mui/icons-material/Spa';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupIcon from '@mui/icons-material/Group';
import DevicesIcon from '@mui/icons-material/Devices';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CartDrawer from './CartDrawer';
import { selectCartCount } from '../redux/slices/cartSlice';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import TrackOrderDialog from './TrackOrderDialog';
import NotificationBell from './NotificationBell';
import SearchIcon from '@mui/icons-material/Search';

const Navbar = ({ liveNotifications = [] }) => {
  const { t, i18n } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [trackOrderParams, setTrackOrderParams] = useState(null);
  const [bottomNavEnabled, setBottomNavEnabled] = useState(() => {
    return localStorage.getItem('bottomNavEnabled') !== 'false';
  });
  const cartCount = useSelector(selectCartCount);
  const formattedCartCount = cartCount > 0 ? new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(cartCount) : undefined;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isCompact = useMediaQuery(theme.breakpoints.down('lg'));
  const isRTL = i18n.language === 'ar';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const [searchParams] = useSearchParams();

  // Check for track order query params
  useEffect(() => {
    const shouldTrack = searchParams.get('trackOrder');
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');
    
    if (shouldTrack === 'true' && orderNumber && email) {
      setTrackOrderParams({ orderNumber, email });
      setTrackOrderOpen(true);
      // Clean up URL
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Active route highlight (exact for '/', prefix for the rest)
  const isActivePath = (path) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      text: t('navbar.home'),
      icon: <HomeIcon />,
      path: '/'
    },

    {
      text: t('navbar.perfume'),
      icon: <SpaIcon />,
      path: '/perfumes',
      excludeRoles: ['ADMIN']
    },

    {
      text: t('navbar.perfume'),
      icon: <SpaIcon />,
      path: '/admin-panel/perfumes',
      roles: ['ADMIN'],
      requiresAuth: true
    },

    {
      text: t('navbar.coupon'),
      icon: <LocalOfferIcon />,
      path: '/admin-panel/coupon',
      roles: ['ADMIN'],
      requiresAuth: true
    },

    {
      text: t('navbar.deliveryFees'),
      icon: <LocalShippingIcon />,
      path: '/admin-panel/delivery-fees',
      roles: ['ADMIN'],
      requiresAuth: true
    },

    {
      text: t('navbar.orders'),
      icon: <ReceiptLongIcon />,
      path: '/admin-panel/orders',
      roles: ['ADMIN'],
      requiresAuth: true
    },

    {
      text: t('navbar.customers'),
      icon: <GroupIcon />,
      path: '/admin-panel/customers',
      roles: ['ADMIN'],
      requiresAuth: true
    },

    {
      text: t('navbar.myOrders'),
      icon: <ReceiptLongIcon />,
      path: '/my-orders',
      roles: ['CUSTOMER'],
      requiresAuth: true
    },

    {
      text: t('navbar.register'),
      icon: <PersonAddIcon />,
      path: '/register',
      requiresAuth: false
    },

    {
      text: t('navbar.login'),
      icon: <LoginIcon />,
      path: '/login',
      requiresAuth: false
    }
  ];

  const drawerContent = (
    <Box
      sx={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      role="presentation"
    >
      {/* Drawer Header */}
      <Box sx={{
        p: 1,
        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
        background: 'rgba(212, 175, 55, 0.05)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: '#0a0a0c',
                  width: 32,
                  height: 32,
                  border: '1.5px solid #D4AF37',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                  '& img': { objectFit: 'contain', padding: '3px' },
                }}
                src="/images/favicon.png"
                alt="logo"
              />

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#D4AF37',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  fontSize: isRTL ? '1.30rem' : '1rem'
                }}
              >
                {t('navbar.brandName')}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={toggleDrawer(false)}
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

      {/* Menu Items */}
      <List sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}>
        {menuItems
          .filter(item => {
            if (item.requiresAuth === true && !isAuthenticated) return false;
            if (item.requiresAuth === false && isAuthenticated) return false;

            if (item.roles && !item.roles.includes(userRole)) return false;

            if (item.excludeRoles && item.excludeRoles.includes(userRole)) return false;

            return true;
          })
          .map((item, index) => (
            <ListItemButton
              key={index}
              selected={isActivePath(item.path)}
              onClick={() => {
                setDrawerOpen(false);
                if (item.action) item.action();
                else navigate(item.path);
              }}
              sx={{
                py: 0.5,
                px: isRTL ? 4 : 2,
                ml: isRTL ? 1 : -1,
                mr: isRTL ? 0 : 0,
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  transform: 'translateX(8px)',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(212, 175, 55, 0.18)',
                  boxShadow: '0 0 14px rgba(212, 175, 55, 0.35)',
                  '&:hover': { backgroundColor: 'rgba(212, 175, 55, 0.25)' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActivePath(item.path) ? '#F4D03F' : '#FFFFFF',
                  minWidth: 40,
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                    filter: isActivePath(item.path) ? 'drop-shadow(0 0 6px rgba(212,175,55,0.8))' : 'none',
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    color: isActivePath(item.path) ? '#F4D03F' : '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1rem',
                  },
                }}
              />
            </ListItemButton>
          ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(212, 175, 55, 0.3)' }} />

      {/* Bottom Nav Toggle */}
      <Box sx={{ px: 2, pt: 0.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem' }}>
          {t('navbar.bottomNav')}
        </Typography>
        <Switch
          checked={bottomNavEnabled}
          onChange={(e) => {
            const val = e.target.checked;
            setBottomNavEnabled(val);
            localStorage.setItem('bottomNavEnabled', val);
            window.dispatchEvent(new Event('bottomNavToggle'));
          }}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#D4AF37',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#D4AF37',
            },
          }}
        />
      </Box>

      {/* Language Switcher in Drawer */}
      <Box sx={{ pt: 0.5, pb: 1, display: 'flex', justifyContent: 'center' }}>
        <LanguageSwitcher isMobile={false} isDrawer />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #F4D03F 50%, #D4AF37 80%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'goldShimmer 5s ease-in-out infinite',
          },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              py: 0.75,
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            {/* Left Side - Always Menu Button on Mobile (Left in LTR) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {isMobile && (
                <IconButton
                  size="small"
                  onClick={toggleDrawer(true)}
                  sx={{
                    color: '#D4AF37',
                    bgcolor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(212, 175, 55, 0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <MenuIcon fontSize="small" />
                </IconButton>
              )}

              {/* Brand */}
              <Box
                onClick={() => navigate('/')}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#0a0a0c',
                    width: { xs: 30, sm: 34 },
                    height: { xs: 30, sm: 34 },
                    border: '1.5px solid #D4AF37',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                    '& img': { objectFit: 'contain', padding: '3px' },
                  }}
                  src="/images/favicon.png"
                  alt="logo"
                />
                <Typography
                  component="div"
                  sx={{
                    color: '#D4AF37',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    lineHeight: 1.2,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {t('navbar.brandName')}
                </Typography>
              </Box>
            </Box>

            {/* Center - Desktop Menu */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                {menuItems
                  .filter(item => {
                    if (item.requiresAuth === true && !isAuthenticated) return false;
                    if (item.requiresAuth === false && isAuthenticated) return false;

                    if (item.roles && !item.roles.includes(userRole)) return false;

                    if (item.excludeRoles && item.excludeRoles.includes(userRole)) return false;

                    return true;
                  })
                  .map((item, index) => (
                    <Tooltip title={item.text} key={index} arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (item.action) item.action();
                        else navigate(item.path);
                      }}
                      sx={{
                        color: isActivePath(item.path) ? '#F4D03F' : '#FFFFFF',
                        borderRadius: '22px',
                        transition: 'all 0.3s ease',
                        background: isActivePath(item.path) ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid',
                        borderColor: isActivePath(item.path) ? '#D4AF37' : 'transparent',
                        boxShadow: isActivePath(item.path) ? '0 0 14px rgba(212, 175, 55, 0.45)' : 'none',
                        px: isCompact ? 0.75 : 1.25,
                        py: 0.55,
                        gap: isCompact ? 0 : 0.6,
                        '&:hover': {
                          backgroundColor: 'rgba(212, 175, 55, 0.15)',
                          borderColor: '#D4AF37',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                          color: '#D4AF37',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { fontSize: 21 } }}>
                        {item.icon}
                      </Box>
                      {!isCompact && (
                        <Typography sx={{ fontSize: '0.825rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {item.text}
                        </Typography>
                      )}
                    </IconButton>
                    </Tooltip>
                  ))}
              </Box>
            )}

            {/* Right - Notification + Track Order + Cart + Language */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {isAuthenticated && userRole === 'ADMIN' && (
                <NotificationBell isRTL={isRTL} liveNotifications={liveNotifications} />
              )}
              {!isAuthenticated && (
                <Tooltip title={t('trackOrder.title')} arrow>
                  <IconButton
                    size="small"
                    onClick={() => setTrackOrderOpen(true)}
                    sx={{
                      color: '#FFFFFF',
                      borderRadius: '22px',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid transparent',
                      px: 0.75,
                      py: 0.6,
                      '&:hover': {
                        backgroundColor: 'rgba(212, 175, 55, 0.15)',
                        borderColor: '#D4AF37',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                        color: '#D4AF37',
                      },
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('cart.title')} arrow>
                <IconButton
                  size="small"
                  onClick={() => setCartOpen(true)}
                  sx={{
                    color: '#FFFFFF',
                    borderRadius: '22px',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid transparent',
                    px: 0.75,
                    py: 0.6,
                    '&:hover': {
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      borderColor: '#D4AF37',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                      color: '#D4AF37',
                    },
                  }}
                >
                  <Badge
                    badgeContent={formattedCartCount}
                    color="warning"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#D4AF37',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        minWidth: 20,
                        height: 20,
                        padding: '0 4px',
                      },
                    }}
                  >
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              {!isMobile && <LanguageSwitcher isMobile={isMobile} />}
              {isAuthenticated && (
                <>
                  <Tooltip title={t('navbar.profile')} arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => setProfileAnchor(e.currentTarget)}
                      sx={{ p: 0.3 }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: 'rgba(212, 175, 55, 0.12)',
                          border: '2px solid #D4AF37',
                          color: '#F4D03F',
                          boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 0 18px rgba(212, 175, 55, 0.7)',
                            transform: 'scale(1.06)',
                          },
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={profileAnchor}
                    open={Boolean(profileAnchor)}
                    onClose={() => setProfileAnchor(null)}
                    disableScrollLock
                    anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: isRTL ? 'left' : 'right' }}
                    PaperProps={{
                      sx: {
                        mt: 1.2,
                        minWidth: 200,
                        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        borderRadius: '14px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.6), 0 0 16px rgba(212,175,55,0.15)',
                        overflow: 'hidden',
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setProfileAnchor(null);
                        navigate(userRole === 'ADMIN' ? '/admin-panel/profile' : '/profile');
                      }}
                      sx={{
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        py: 1.2,
                        gap: 1.5,
                        '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.12)', color: '#F4D03F' },
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 20, color: '#D4AF37' }} />
                      {t('navbar.profile')}
                    </MenuItem>
                    {userRole === 'ADMIN' && (
                      <MenuItem
                        onClick={() => {
                          setProfileAnchor(null);
                          navigate('/admin-panel/devices');
                        }}
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          py: 1.2,
                          gap: 1.5,
                          '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.12)', color: '#F4D03F' },
                        }}
                      >
                        <DevicesIcon sx={{ fontSize: 20, color: '#D4AF37' }} />
                        {t('navbar.devices')}
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        setProfileAnchor(null);
                        handleLogout();
                      }}
                      sx={{
                        color: '#e74c3c',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        py: 1.2,
                        gap: 1.5,
                        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
                        '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.1)' },
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: 20 }} />
                      {t('navbar.logout')}
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer - Always from left */}
      <Drawer
        anchor={isRTL ? "right" : "left"}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ disableScrollLock: true }}
      >
        {drawerContent}
      </Drawer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <TrackOrderDialog
        key={trackOrderParams?.orderNumber || 'default'}
        open={trackOrderOpen}
        onClose={() => {
          setTrackOrderOpen(false);
          setTrackOrderParams(null);
        }}
        initialOrderNumber={trackOrderParams?.orderNumber}
        initialEmail={trackOrderParams?.email}
      />
    </>
  );
};

export default Navbar;