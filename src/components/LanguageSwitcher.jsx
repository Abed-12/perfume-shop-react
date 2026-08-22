import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ isMobile, isDrawer }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';

  if (isMobile) {
    return (
      <Tooltip title={currentLang === 'ar' ? 'English' : 'العربية'} arrow>
        <IconButton
          size="small"
          onClick={() => changeLanguage(currentLang === 'ar' ? 'en' : 'ar')}
          sx={{
            color: '#000',
            fontWeight: 700,
            fontSize: '0.8rem',
            borderRadius: '22px',
            px: 0.75,
            py: 0.6,
            transition: 'all 0.3s ease',
            background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(212, 175, 55, 0.5)',
            },
          }}
        >
          {currentLang === 'ar' ? 'EN' : 'عربي'}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Button
        size={isDrawer ? 'medium' : 'small'}
        onClick={() => changeLanguage('ar')}
        variant="outlined"
        sx={{
          borderRadius: '22px',
          minWidth: 'auto',
          px: isDrawer ? 3 : 1.25,
          py: isDrawer ? 1 : 0.6,
          fontSize: isDrawer ? '0.95rem' : '0.8rem',
          fontWeight: 600,
          textTransform: 'none',
          ...(currentLang === 'ar'
            ? {
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                color: '#000000',
                border: 'none',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(212, 175, 55, 0.5)',
                },
              }
            : {
                borderColor: 'rgba(212, 175, 55, 0.5)',
                color: '#FFFFFF',
                backgroundColor: 'transparent',
                '&:hover': {
                  borderColor: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: '#D4AF37',
                },
              }),
          transition: 'all 0.3s ease',
        }}
      >
        عربي
      </Button>
      <Button
        size={isDrawer ? 'medium' : 'small'}
        onClick={() => changeLanguage('en')}
        variant="outlined"
        sx={{
          borderRadius: '22px',
          minWidth: 'auto',
          px: isDrawer ? 3 : 1.25,
          py: isDrawer ? 1 : 0.6,
          fontSize: isDrawer ? '0.95rem' : '0.8rem',
          fontWeight: 600,
          textTransform: 'none',
          ...(currentLang === 'en'
            ? {
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                color: '#000000',
                border: 'none',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(212, 175, 55, 0.5)',
                },
              }
            : {
                borderColor: 'rgba(212, 175, 55, 0.5)',
                color: '#FFFFFF',
                backgroundColor: 'transparent',
                '&:hover': {
                  borderColor: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: '#D4AF37',
                },
              }),
          transition: 'all 0.3s ease',
        }}
      >
        English
      </Button>
    </Box>
  );
};

export default LanguageSwitcher;
