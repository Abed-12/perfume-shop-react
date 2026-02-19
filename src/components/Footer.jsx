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

const Footer = () => {
  const { t } = useTranslation();

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Instagram />, url: '#', label: 'Instagram' }
  ];

  const quickLinks = [
    { text: t('footer.home'), url: '#' },
    { text: t('footer.profile'), url: '#' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(200deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
        color: '#FFFFFF',
        p: 4,
        mt: 'auto',
        borderTop: '2px solid #D4AF37',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}  justifyContent="space-between" columns={12}>
          {/* Brand Section */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  bgcolor: '#D4AF37',
                  borderRadius: '12px',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                }}
              >
                <LocalMall sx={{ color: '#000000', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: '#D4AF37',
                }}
              >
                {t('footer.brandName')}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                opacity: 0.9,
                lineHeight: 1.7,
                maxWidth: '350px',
                color: '#FFFFFF',
              }}
            >
              {t('footer.brandDescription')}
            </Typography>

            {/* Social Media */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.url}
                  aria-label={social.label}
                  sx={{
                    bgcolor: 'rgba(212, 175, 55, 0.1)',
                    color: '#D4AF37',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#D4AF37',
                      color: '#000000',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 16px rgba(212, 175, 55, 0.4)',
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
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: '1.1rem',
                color: '#D4AF37',
              }}
            >
              {t('footer.quickLinks')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.url}
                  sx={{
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    opacity: 0.9,
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    '&:hover': {
                      opacity: 1,
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
          <Grid  sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: '1.1rem',
                color: '#D4AF37',
              }}
            >
              {t('footer.contactUs')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20, opacity: 0.9, color: '#D4AF37' }} />
                <Typography variant="body2" sx={{ opacity: 0.9, color: '#FFFFFF' }}>
                  perfumeshop.notification@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ fontSize: 20, opacity: 0.9, color: '#D4AF37' }} />
                <Typography variant="body2" sx={{ opacity: 0.9, color: '#FFFFFF' }}>
                  +962 7 9999 9999
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOn sx={{ fontSize: 20, opacity: 0.9, color: '#D4AF37' }} />
                <Typography variant="body2" sx={{ opacity: 0.9, color: '#FFFFFF' }}>
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
          }}
        />

        {/* Bottom Section */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.8, color: '#FFFFFF' }}>
            © {new Date().getFullYear()} {t('footer.brandName')}. {t('footer.copyright')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;