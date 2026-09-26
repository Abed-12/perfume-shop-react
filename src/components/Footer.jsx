import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Facebook from '@mui/icons-material/Facebook';
import Instagram from '@mui/icons-material/Instagram';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import LocationOn from '@mui/icons-material/LocationOn';
import LocalMall from '@mui/icons-material/LocalMall';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../redux/slices/authSlice';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Instagram />, url: '#', label: 'Instagram' }
  ];

  const getQuickLinks = () => {
    const links = [{ text: t('navbar.home'), path: '/' }];

    if (!isAuthenticated) {
      links.push({ text: t('navbar.perfume'), path: '/perfumes' });
      links.push({ text: t('navbar.register'), path: '/register' });
      links.push({ text: t('navbar.login'), path: '/login' });
    } else if (userRole === 'ADMIN') {
      links.push({ text: t('navbar.perfume'), path: '/admin-panel/perfumes' });
      links.push({ text: t('navbar.coupon'), path: '/admin-panel/coupon' });
      links.push({ text: t('navbar.deliveryFees'), path: '/admin-panel/delivery-fees' });
      links.push({ text: t('navbar.orders'), path: '/admin-panel/orders' });
      links.push({ text: t('navbar.customers'), path: '/admin-panel/customers' });
      links.push({ text: t('navbar.devices'), path: '/admin-panel/devices' });
      links.push({ text: t('navbar.profile'), path: '/admin-panel/profile' });
    } else if (userRole === 'CUSTOMER') {
      links.push({ text: t('navbar.perfume'), path: '/perfumes' });
      links.push({ text: t('navbar.myOrders'), path: '/my-orders' });
      links.push({ text: t('navbar.profile'), path: '/profile' });
    }

    return links;
  };

  const quickLinks = getQuickLinks();

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
        color: '#FFFFFF',
        p: 4,
        pb: 2,
        mt: 'auto',
        position: 'relative',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
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
      <Container maxWidth="xl">
        <Grid container spacing={4}  justifyContent="space-between" columns={12}>
          {/* Brand Section */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  bgcolor: '#D4AF37',
                  borderRadius: '50%',
                  width: 38,
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                }}
              >
                <LocalMall sx={{ color: '#000000', fontSize: 18 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: '#D4AF37',
                  fontSize: '1.1rem',
                }}
              >
                {t('footer.brandName')}
              </Typography>
            </Box>
            <Typography
              sx={{
                mb: 3,
                lineHeight: 1.7,
                maxWidth: '350px',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              {t('footer.brandDescription')}
            </Typography>

            {/* Social Media */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  size="small"
                  href={social.url}
                  aria-label={social.label}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#D4AF37',
                    borderRadius: '22px',
                    border: '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(212, 175, 55, 0.15)',
                      borderColor: '#D4AF37',
                      color: '#D4AF37',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
            <Typography
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: '0.875rem',
                letterSpacing: '0.5px',
                color: '#D4AF37',
              }}
            >
              {t('footer.quickLinks')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: quickLinks.length > 5 ? '1fr 1fr' : '1fr', gap: 1, columnGap: 3 }}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      color: '#D4AF37',
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <Typography
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: '0.875rem',
                letterSpacing: '0.5px',
                color: '#D4AF37',
              }}
            >
              {t('footer.contactUs')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 22, color: '#D4AF37' }} />
                <Typography variant="body2" sx={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                  perfumeshop.notification@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 22, color: '#D4AF37' }} />
                <Typography variant="body2" sx={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                  +962 7 9999 9999
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 22, color: '#D4AF37', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {t('footer.address')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: 2,
            borderColor: 'rgba(212, 175, 55, 0.3)',
            borderWidth: 1,
          }}
        />

        {/* Bottom Section */}
        <Box sx={{ textAlign: 'center', py: 0.5 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>
            © {new Date().getFullYear()} {t('footer.brandName')}. {t('footer.copyright')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;