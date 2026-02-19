import React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Fade ref={ref} {...props} />;
});

const ConfirmationModal = ({ open, message, onConfirm, onCancel, confirmText, cancelText }) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            TransitionComponent={Transition}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 175, 55, 0.3)',
                    p: 0,
                    overflow: 'visible',
                    position: 'relative',
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(12px)',
                }
            }}
        >
            {/* Golden Border Animation */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: '-2px',
                    borderRadius: '24px',
                    padding: '2px',
                    background: 'linear-gradient(45deg, #d4af37, #f4d03f, #d4af37, #f4d03f)',
                    backgroundSize: '300% 300%',
                    animation: 'gradientShift 4s ease infinite',
                    zIndex: -1,
                    '@keyframes gradientShift': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: '2px',
                        borderRadius: '22px',
                        background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                    }
                }}
            />

            {/* Icon Section */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pt: 6,
                    pb: 1,
                    position: 'relative',
                }}
            >
                {/* Glow Effect */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        animation: 'glow 3s ease-in-out infinite',
                        '@keyframes glow': {
                            '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
                            '50%': { opacity: 0.8, transform: 'scale(1.1)' },
                        }
                    }}
                />

                {/* Icon Container */}
                <Box
                    sx={{
                        position: 'relative',
                        width: '120px',
                        height: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'iconAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '@keyframes iconAppear': {
                            '0%': { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
                            '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                        }
                    }}
                >
                    {/* Rotating Gold Ring */}
                    <Box
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: '3px solid transparent',
                            borderTopColor: '#d4af37',
                            borderRightColor: '#f4d03f',
                            animation: 'rotate 3s linear infinite',
                            '@keyframes rotate': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                            }
                        }}
                    />

                    {/* Inner Circle */}
                    <Box
                        sx={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(244, 208, 63, 0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'inset 0 0 30px rgba(212, 175, 55, 0.3)',
                        }}
                    >
                        <WarningAmberRoundedIcon
                            sx={{
                                fontSize: '50px',
                                color: '#d4af37',
                                filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))',
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Decorative Lines */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    my: 3,
                    px: 6,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        height: '1px',
                        background: 'linear-gradient(to right, transparent, #d4af37, transparent)',
                    }}
                />
                <Box
                    sx={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#d4af37',
                        boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
                    }}
                />
                <Box
                    sx={{
                        flex: 1,
                        height: '1px',
                        background: 'linear-gradient(to left, transparent, #d4af37, transparent)',
                    }}
                />
            </Box>

            {/* Content */}
            <DialogContent sx={{ pt: 0, pb: 2, px: 6, textAlign: 'center' }}>
                <Typography
                    sx={{
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        mb: 2,
                        lineHeight: 1.3,
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    {message}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '0.95rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                    }}
                >
                    {t('common.actionCannotBeUndone')}
                </Typography>
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    justifyContent: 'center',
                    gap: 2.5,
                    pb: 6,
                    px: 6,
                    pt: 3,
                }}
            >
                <Button
                    onClick={onCancel}
                    sx={{
                        px: 5,
                        py: 1.8,
                        borderRadius: '14px',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        textTransform: 'none',
                        color: 'rgba(255, 255, 255, 0.9)',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        minWidth: '150px',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 6px 20px rgba(255, 255, 255, 0.15)',
                        },
                        '&:active': {
                            transform: 'translateY(-1px)',
                        }
                    }}
                >
                    {cancelText || t('common.no') || 'No'}
                </Button>

                <Button
                    onClick={onConfirm}
                    sx={{
                        px: 5,
                        py: 1.8,
                        borderRadius: '14px',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        textTransform: 'none',
                        color: '#000000',
                        background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                        border: 'none',
                        minWidth: '150px',
                        boxShadow: '0 6px 30px rgba(212, 175, 55, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
                            transition: 'left 0.7s',
                        },
                        '&:hover': {
                            background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 35px rgba(212, 175, 55, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                            '&::before': {
                                left: '100%',
                            }
                        },
                        '&:active': {
                            transform: 'translateY(-1px)',
                        }
                    }}
                >
                    {confirmText || t('common.yes') || 'Yes'}
                </Button>
            </DialogActions>

            {/* Corner Decorations */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '40px',
                    height: '40px',
                    border: '2px solid transparent',
                    borderTopColor: '#d4af37',
                    borderRightColor: '#d4af37',
                    borderRadius: '0 20px 0 0',
                    opacity: 0.4,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    width: '40px',
                    height: '40px',
                    border: '2px solid transparent',
                    borderBottomColor: '#d4af37',
                    borderLeftColor: '#d4af37',
                    borderRadius: '0 0 0 20px',
                    opacity: 0.4,
                }}
            />
        </Dialog>
    );
};

export default ConfirmationModal;