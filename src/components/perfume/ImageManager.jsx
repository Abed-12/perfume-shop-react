import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ImageManager = ({
    images = [],
    onAddImage,
    onDeleteImage,
    onReplaceImage,
    readOnly = false,
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const replaceInputRef = useRef(null);
    const addInputRef = useRef(null);

    const [replacingImage, setReplacingImage] = useState(null);
    const [pendingReplace, setPendingReplace] = useState(null);
    const [pendingNewImages, setPendingNewImages] = useState([]);
    const [confirmingIndex, setConfirmingIndex] = useState(null);

    const MAX_IMAGES = 5;

    // Replace Handlers
    const handleReplaceClick = (imageId, index) => {
        setReplacingImage({ id: imageId, index });
        replaceInputRef.current?.click();
    };

    const handleReplaceFile = (e) => {
        const file = e.target.files?.[0];
        if (file && replacingImage) {
            setPendingReplace({
                id: replacingImage.id,
                index: replacingImage.index,
                file,
                preview: URL.createObjectURL(file),
                isPrimary: images[replacingImage.index]?.isPrimary ?? false,
            });
            setReplacingImage(null);
        }
        if (replaceInputRef.current) replaceInputRef.current.value = '';
    };

    const confirmReplace = () => {
        if (pendingReplace && onReplaceImage) {
            onReplaceImage(pendingReplace.id, pendingReplace.index, pendingReplace.file, pendingReplace.isPrimary);
            setPendingReplace(null);
        }
    };

    const cancelReplace = () => setPendingReplace(null);

    // Add Handlers
    const handleAddFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const pending = files.map(f => ({
            file: f,
            preview: URL.createObjectURL(f),
            isPrimary: false,
        }));
        setPendingNewImages(prev => [...prev, ...pending]);
        if (addInputRef.current) addInputRef.current.value = '';
    };

    const confirmAddImage = async (index) => {
        const img = pendingNewImages[index];
        if (!img || !onAddImage) return;

        setConfirmingIndex(index);
        try {
            await onAddImage(img.file, img.isPrimary);
            setPendingNewImages(prev => prev.filter((_, i) => i !== index));
        } finally {
            setConfirmingIndex(null);
        }
    };

    const cancelAddImage = (index) => {
        setPendingNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const togglePendingNewPrimary = (index) => {
        setPendingNewImages(prev => prev.map((img, i) => ({
            ...img,
            isPrimary: i === index ? !img.isPrimary : img.isPrimary,
        })));
    };

    const togglePendingReplacePrimary = () => {
        setPendingReplace(prev => ({ ...prev, isPrimary: !prev.isPrimary }));
    };

    // Pending Card
    const PendingCard = ({ preview, isPrimary, onTogglePrimary, onConfirm, onCancel, confirmLabel, title, isLoading }) => (
        <Box sx={{
            p: { xs: 1.5, sm: 2, md: 2.5 },
            border: '1px solid rgba(244,208,63,0.35)',
            borderRadius: '14px',
            background: 'rgba(244,208,63,0.03)',
            mb: { xs: 1.5, sm: 2 },
        }}>
            <Typography sx={{ color: '#F4D03F', fontWeight: 700, fontSize: { xs: '0.74rem', sm: '0.78rem', md: '0.82rem' }, mb: { xs: 1.5, sm: 2 } }}>
                {title}
            </Typography>

            <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Box sx={{
                    width: { xs: 72, sm: 80, md: 90 },
                    height: { xs: 72, sm: 80, md: 90 },
                    borderRadius: '10px', overflow: 'hidden',
                    border: `2px solid ${isPrimary ? '#D4AF37' : 'rgba(255,255,255,0.15)'}`,
                    flexShrink: 0,
                }}>
                    <img src={preview} alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 100 }}>
                    <Box
                        onClick={onTogglePrimary}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2 },
                            cursor: 'pointer', mb: { xs: 1.5, sm: 2 },
                            p: { xs: 1, sm: 1.3 }, borderRadius: '10px',
                            border: `1px solid ${isPrimary ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                            background: isPrimary ? 'rgba(212,175,55,0.08)' : 'transparent',
                            transition: 'all 0.2s',
                            userSelect: 'none',
                            '&:hover': { background: isPrimary ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)' },
                        }}
                    >
                        {isPrimary
                            ? <StarIcon sx={{ color: '#D4AF37', fontSize: { xs: 15, sm: 17, md: 19 } }} />
                            : <StarBorderIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: { xs: 15, sm: 17, md: 19 } }} />
                        }
                        <Typography sx={{
                            fontSize: { xs: '0.72rem', sm: '0.76rem', md: '0.8rem' }, fontWeight: 600,
                            color: isPrimary ? '#D4AF37' : 'rgba(255,255,255,0.45)',
                        }}>
                            {isPrimary
                                ? t('admin.perfume.image.setAsPrimary')
                                : t('admin.perfume.image.notPrimary')
                            }
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: { xs: 0.8, sm: 1 } }}>
                        <Button
                            size="small"
                            startIcon={isLoading
                                ? <CircularProgress size={11} sx={{ color: '#000', ml: isRTL ? 1 : 0 }} />
                                : <CheckCircleIcon sx={{ ml: isRTL ? 1 : 0, mr: isRTL ? -1 : 0, fontSize: { xs: '0.9rem', sm: '1rem' } }} />
                            }
                            onClick={onConfirm}
                            disabled={isLoading}
                            sx={{
                                background: 'linear-gradient(135deg, #D4AF37, #F4D03F)',
                                color: '#000', fontWeight: 700,
                                textTransform: 'none', borderRadius: '8px',
                                fontSize: { xs: '0.7rem', sm: '0.74rem', md: '0.78rem' },
                                px: { xs: 0.8, sm: 1 },
                                '&:hover': { background: 'linear-gradient(135deg, #F4D03F, #D4AF37)' },
                                '&.Mui-disabled': { background: 'rgba(212,175,55,0.25)', color: 'rgba(0,0,0,0.4)' },
                            }}
                        >
                            {isLoading ? t('admin.perfume.image.uploading') : confirmLabel}
                        </Button>
                        <Button
                            size="small"
                            onClick={onCancel}
                            disabled={isLoading}
                            sx={{
                                color: 'rgba(255,255,255,0.45)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                textTransform: 'none', borderRadius: '8px',
                                fontSize: { xs: '0.7rem', sm: '0.74rem', md: '0.78rem' },
                                px: { xs: 1, sm: 1.5 },
                                '&:hover': { background: 'rgba(255,255,255,0.04)' },
                            }}
                        >
                            {t('admin.perfume.image.cancelBtn')}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box>
            <input ref={replaceInputRef} type="file" hidden accept="image/*" onChange={handleReplaceFile} />
            <input ref={addInputRef} type="file" hidden multiple accept="image/*" onChange={handleAddFileChange} />

            {/* Upload Button */}
            {!readOnly && (
                <Tooltip title={(images.length + pendingNewImages.length) >= MAX_IMAGES
                    ? t('admin.perfume.image.maxImagesReached')
                    : ''
                }>
                    <span>
                        <Button
                            onClick={() => addInputRef.current?.click()}
                            fullWidth
                            startIcon={<AddPhotoAlternateIcon sx={{ ml: isRTL ? 1 : 0, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' } }} />}
                            sx={{
                                py: { xs: 1.3, sm: 1.6, md: 2 },
                                mb: { xs: 2, sm: 2.5, md: 3 },
                                fontSize: { xs: '0.78rem', sm: '0.84rem', md: '0.9rem' },
                                border: '2px dashed rgba(212,175,55,0.5)',
                                borderRadius: '15px',
                                color: '#D4AF37',
                                background: 'rgba(212,175,55,0.05)',
                                '&:hover': { background: 'rgba(212,175,55,0.1)', borderColor: '#D4AF37' },
                                '&.Mui-disabled': {
                                    color: 'rgba(212,175,55,0.5)',
                                },
                            }}
                            disabled={(images.length + pendingNewImages.length) >= MAX_IMAGES}
                        >
                            {t('admin.perfume.image.addImages')}
                        </Button>
                    </span>
                </Tooltip>
            )}

            {/* Pending New Images */}
            {pendingNewImages.length > 0 && (
                <>
                    <Typography sx={{ color: '#F4D03F', fontWeight: 700, fontSize: { xs: '0.74rem', sm: '0.78rem', md: '0.82rem' }, mb: { xs: 1, sm: 1.5 } }}>
                        ✨ {t('admin.perfume.image.pendingNew')}
                    </Typography>
                    {pendingNewImages.map((img, index) => (
                        <PendingCard
                            key={index}
                            preview={img.preview}
                            isPrimary={img.isPrimary}
                            isLoading={confirmingIndex === index}
                            onTogglePrimary={() => togglePendingNewPrimary(index)}
                            onConfirm={() => confirmAddImage(index)}
                            onCancel={() => cancelAddImage(index)}
                            confirmLabel={t('admin.perfume.image.confirmAdd')}
                            title={`🖼️ ${t('admin.perfume.image.newImageTitle')} ${index + 1}`}
                        />
                    ))}
                    <Divider sx={{ borderColor: 'rgba(212,175,55,0.15)', my: { xs: 1.5, sm: 2, md: 2.5 } }} />
                </>
            )}

            {/* Pending Replace */}
            {pendingReplace && (
                <>
                    <PendingCard
                        preview={pendingReplace.preview}
                        isPrimary={pendingReplace.isPrimary}
                        isLoading={false}
                        onTogglePrimary={togglePendingReplacePrimary}
                        onConfirm={confirmReplace}
                        onCancel={cancelReplace}
                        confirmLabel={t('admin.perfume.image.confirmBtn')}
                        title={`🔄 ${t('admin.perfume.image.confirmReplace')}`}
                    />
                    <Divider sx={{ borderColor: 'rgba(212,175,55,0.15)', my: { xs: 1.5, sm: 2, md: 2.5 } }} />
                </>
            )}

            {/* Existing Images */}
            {images.length > 0 && (
                <>
                    {!readOnly && (
                        <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: { xs: '0.68rem', sm: '0.72rem', md: '0.75rem' }, mb: { xs: 1, sm: 1.5 } }}>
                            🖼️ {t('admin.perfume.image.existingImages')}
                        </Typography>
                    )}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(auto-fill, minmax(100px, 1fr))',
                            sm: 'repeat(auto-fill, minmax(120px, 1fr))',
                            md: 'repeat(auto-fill, minmax(130px, 1fr))',
                            lg: 'repeat(auto-fill, minmax(140px, 1fr))',
                        },
                        gap: { xs: 1.2, sm: 1.5, md: 2 },
                    }}>
                        {images.map((image, index) => (
                            <Box key={image.id || index} sx={{
                                position: 'relative', borderRadius: { xs: '10px', sm: '11px', md: '12px' }, overflow: 'hidden',
                                border: image.isPrimary ? '3px solid #D4AF37' : '2px solid rgba(212,175,55,0.2)',
                                aspectRatio: '1',
                            }}>
                                <img src={image.url} alt={`Image ${index + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

                                {!readOnly && onReplaceImage && (
                                    <Tooltip title={t('admin.perfume.image.replaceImage')} placement="top">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleReplaceClick(image.id, index)}
                                            sx={{
                                                position: 'absolute',
                                                top: { xs: 4, sm: 5, md: 6 },
                                                left: { xs: 4, sm: 5, md: 6 },
                                                width: { xs: 22, sm: 24, md: 28 },
                                                height: { xs: 22, sm: 24, md: 28 },
                                                background: 'rgba(244,208,63,0.92)',
                                                '&:hover': { background: '#F4D03F' },
                                            }}>
                                            <SwapHorizIcon sx={{ color: '#000', fontSize: { xs: 13, sm: 15, md: 17 } }} />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {!readOnly && onDeleteImage && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: { xs: 4, sm: 5, md: 6 },
                                        right: { xs: 4, sm: 5, md: 6 },
                                    }}>
                                        <Tooltip
                                            title={image.isPrimary
                                                ? t('admin.perfume.image.cannotDeletePrimary')
                                                : t('admin.perfume.image.deleteImage')}
                                            placement="top"
                                        >
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDeleteImage(image.id, index)}
                                                    disabled={image.isPrimary}
                                                    sx={{
                                                        width: { xs: 22, sm: 24, md: 28 },
                                                        height: { xs: 22, sm: 24, md: 28 },
                                                        background: image.isPrimary ? 'rgba(231,76,60,0.3)' : 'rgba(231,76,60,0.92)',
                                                        '&:hover': { background: image.isPrimary ? 'rgba(231,76,60,0.3)' : '#e74c3c' },
                                                        '&.Mui-disabled': { background: 'rgba(231,76,60,0.3)' },
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ color: '#fff', fontSize: { xs: 13, sm: 15, md: 17 } }} />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Box>
                                )}

                                <Box sx={{
                                    position: 'absolute',
                                    bottom: { xs: 4, sm: 5, md: 6 },
                                    left: { xs: 4, sm: 5, md: 6 },
                                    background: 'rgba(0,0,0,0.72)', color: '#D4AF37',
                                    borderRadius: '50%',
                                    width: { xs: 18, sm: 20, md: 22 },
                                    height: { xs: 18, sm: 20, md: 22 },
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: { xs: '0.6rem', sm: '0.66rem', md: '0.72rem' }, fontWeight: 700,
                                }}>
                                    {index + 1}
                                </Box>

                                {image.isPrimary && (
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: { xs: 4, sm: 5, md: 6 },
                                        right: { xs: 4, sm: 5, md: 6 },
                                        background: 'rgba(212,175,55,0.92)', color: '#000',
                                        px: { xs: 0.6, sm: 0.8, md: 1 },
                                        py: { xs: 0.2, sm: 0.25, md: 0.3 },
                                        borderRadius: '8px',
                                        fontSize: { xs: '0.56rem', sm: '0.62rem', md: '0.68rem' }, fontWeight: 700,
                                        display: 'flex', alignItems: 'center', gap: 0.3,
                                    }}>
                                        <StarIcon sx={{ fontSize: { xs: 9, sm: 11, md: 12 } }} />
                                        {t('admin.perfume.image.primary')}
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </>
            )}

            {/* Empty State */}
            {images.length === 0 && pendingNewImages.length === 0 && (
                <Box sx={{
                    textAlign: 'center',
                    py: { xs: 4, sm: 5, md: 6 },
                    border: '2px dashed rgba(212,175,55,0.3)',
                    borderRadius: '15px',
                    background: 'rgba(212,175,55,0.03)',
                }}>
                    <AddPhotoAlternateIcon sx={{ fontSize: { xs: 44, sm: 52, md: 60 }, color: 'rgba(212,175,55,0.3)', mb: { xs: 1, sm: 1.5, md: 2 } }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.95rem' } }}>
                        {t('admin.perfume.image.noImages')}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default ImageManager;