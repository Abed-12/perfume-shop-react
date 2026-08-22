import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import Divider from '@mui/material/Divider';
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
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [trackOrderParams, setTrackOrderParams] = useState(null);
  const cartCount = useSelector(selectCartCount);
  const formattedCartCount = cartCount > 0 ? new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(cartCount) : undefined;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isCompact = useMediaQuery(theme.breakpoints.down('lg'));
  const isRTL = i18n.language === 'ar';
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      text: t('navbar.devices'),
      icon: <DevicesIcon />,
      path: '/admin-panel/devices',
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
      text: t('navbar.profile'),
      icon: <PersonIcon />,
      path: '/admin-panel/profile',
      roles: ['ADMIN'],
      requiresAuth: true
    },

    {
      text: t('navbar.profile'),
      icon: <PersonIcon />,
      path: '/profile',
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
    },

    {
      text: t('navbar.logout'),
      icon: <LogoutIcon />,
      requiresAuth: true,
      action: handleLogout
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
                bgcolor: '#D4AF37',
                color: '#000000',
                width: 40,
                height: 40,
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              }}
            >
              <ShoppingIcon sx={{ fontSize: 25 }} /> {/* edit: logo */}
            </Avatar>

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
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#FFFFFF',
                  minWidth: 40,
                  '& .MuiSvgIcon-root': { fontSize: 24 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '1rem',
                  },
                }}
              />
            </ListItemButton>
          ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(212, 175, 55, 0.3)' }} />

      {/* Language Switcher in Drawer */}
      <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'center' }}>
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
          borderBottom: '2px solid #D4AF37',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Avatar
                  sx={{
                    bgcolor: '#D4AF37',
                    color: '#000000',
                    width: { xs: 38, sm: 42 },
                    height: { xs: 38, sm: 42 },
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <ShoppingIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                </Avatar>
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
                        color: '#FFFFFF',
                        borderRadius: '22px',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid transparent',
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
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer - Always from left */}
      <Drawer
        anchor={isRTL ? "right" : "left"}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
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