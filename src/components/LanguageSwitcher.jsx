import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexDirection: 'column',
      }}
    > 
      <Box sx={{ display: 'flex', gap: 1}}>
        <Button
          onClick={() => changeLanguage('ar')}
          variant= 'outlined' 
          sx={{
            borderRadius: '20px',
            px: 2.5,
            py: 0.75,
            fontSize: '0.9rem',
            fontWeight: 600,
            textTransform: 'none',
            flex: 'initial',
            ...(i18n.language === 'ar'
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
          العربية
        </Button>

        <Button
          onClick={() => changeLanguage('en')}
          variant= 'outlined' 
          sx={{
            borderRadius: '20px',
            px: 2.5,
            py: 0.75,
            fontSize: '0.9rem',
            fontWeight: 600,
            textTransform: 'none',
            flex: 'initial',
            ...(i18n.language === 'en'
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
    </Box>
  );
};

export default LanguageSwitcher;