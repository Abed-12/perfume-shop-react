import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuthenticated, selectUserRole } from '../redux/slices/authSlice';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingIcon from '@mui/icons-material/LocalMall';
import SpaIcon from '@mui/icons-material/Spa';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isRTL = i18n.language === 'ar';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

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
      text: t('navbar.coupon'),
      icon: <LocalOfferIcon />,
      path: '/admin-panel/coupon',
      roles: ['ADMIN'],
      requiresAuth: true
    },

    {
      text: t('navbar.perfume'),
      icon: <SpaIcon  />,
      path: '/admin-panel/perfume',
      roles: ['ADMIN'],
      requiresAuth: true
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
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
      <List sx={{ flex: 1 }}>
        {menuItems
          .filter(item => {
            if (item.requiresAuth === true && !isAuthenticated) return false;
            if (item.requiresAuth === false && isAuthenticated) return false;

            if (item.roles && !item.roles.includes(userRole)) return false;

            return true;
          })
          .map((item, index) => (
            <ListItem
              button
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
            </ListItem>
          ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(212, 175, 55, 0.3)' }} />

      {/* Language Switcher in Drawer */}
      <Box sx={{ p: 0.5 }}>
        <LanguageSwitcher />
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
            }}
          >
            {/* Left Side - Always Menu Button on Mobile (Left in LTR) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isMobile && (
                <IconButton
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
                  <MenuIcon />
                </IconButton>
              )}

              {/* Brand */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    bgcolor: '#D4AF37',
                    color: '#000000',
                    width: { xs: 42, sm: 48 },
                    height: { xs: 42, sm: 48 },
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <ShoppingIcon sx={{ fontSize: { xs: 16, sm: 20 } }} /> {/* edit: logo perfume */}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      color: '#D4AF37',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                      lineHeight: 1.2,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {t('navbar.brandName')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Center - Desktop Menu */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {menuItems
                  .filter(item => {
                    if (item.requiresAuth === true && !isAuthenticated) return false;
                    if (item.requiresAuth === false && isAuthenticated) return false;

                    if (item.roles && !item.roles.includes(userRole)) return false;

                    return true;
                  })
                  .map((item, index) => (
                    <IconButton
                      key={index}
                      onClick={() => {
                        if (item.action) item.action();
                        else navigate(item.path);
                      }}
                      sx={{
                        color: '#FFFFFF',
                        borderRadius: '24px',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(212, 175, 55, 0.15)',
                          borderColor: '#D4AF37',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                          color: '#D4AF37',
                        },
                      }}
                    >
                      {item.icon}
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, mx: 0.5 }}>
                        {item.text}
                      </Typography>
                    </IconButton>
                  ))}
              </Box>
            )}

            {/* Right - Language Switcher */}
            {!isMobile && (
              <Box>
                <LanguageSwitcher />
              </Box>
            )}
            
            {/* Spacer for mobile to center brand */}
            {isMobile && <Box sx={{ width: 40 }} />}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer - Always from left */}
      <Drawer
        anchor= {isRTL ? "right" : "left"}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;