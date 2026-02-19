import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreatePerfumeMutation } from '../../redux/api/adminApi';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';
import SaveIcon from '@mui/icons-material/Save';
import { handleSuccess, handleError } from '../../utils/toastHelper';

const labelSx = {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.5)',
    mb: 0.8,
    mx: 1,
};

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        color: '#FFFFFF',
        '& input, & textarea': { color: '#FFFFFF' },
        '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#D4AF37' },
    '& .MuiSelect-icon': { color: '#D4AF37' },
    '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
    },
};

const goldBtnSx = {
    py: 1.3,
    px: 3,
    borderRadius: '10px',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: '0.95rem',
    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    color: '#000',
    boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
    transition: 'all 0.3s',
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
    },
    '&.Mui-disabled': {
        background: 'rgba(212,175,55,0.3)',
        color: 'rgba(0,0,0,0.5)',
    },
};

const menuProps = {
    PaperProps: {
        sx: {
            background: "#1a1a1a",
            border: "1px solid rgba(212,175,55,0.3)",
            "& .MuiMenuItem-root": {
                color: "#FFF",
                "&:hover": { backgroundColor: "rgba(212,175,55,0.15)" },
                "&.Mui-selected": {
                    backgroundColor: "rgba(212,175,55,0.25)",
                    color: "#D4AF37",
                },
            },
        },
    },
};

const PERFUME_SIZES = ['SIZE_50', 'SIZE_100'];
const LOCALES = ['en', 'ar'];
const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_SIZE_MB = 25;

const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(1);
const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return (bytes / 1024).toFixed(0) + ' KB';
    return mb.toFixed(1) + ' MB';
};

const INITIAL_FORM = {
    name: '',
    brand: '',
    perfumeType: '',
    perfumeSeasons: [],
    translations: [{ locale: '', name: '', description: '' }],
    prices: [{ perfumeSize: '', price: '', quantity: '' }],
    images: [],
    primaryImageIndex: 0,
};

const CreatePerfumeDialog = ({ open, onClose, onSuccess }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [createPerfume, { isLoading }] = useCreatePerfumeMutation();
    const [formData, setFormData] = useState(INITIAL_FORM);

    // Basic handlers 
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Translations 
    const handleTranslationChange = (index, field, value) => {
        const updated = [...formData.translations];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, translations: updated }));
    };

    const addTranslation = () => {
        setFormData(prev => ({
            ...prev,
            translations: [...prev.translations, { locale: '', name: '', description: '' }],
        }));
    };

    const removeTranslation = (index) => {
        setFormData(prev => ({
            ...prev,
            translations: prev.translations.filter((_, i) => i !== index),
        }));
    };

    // Prices 
    const handlePriceChange = (index, field, value) => {
        const updated = [...formData.prices];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, prices: updated }));
    };

    const addPrice = () => {
        setFormData(prev => ({
            ...prev,
            prices: [...prev.prices, { perfumeSize: '', price: '', quantity: '' }],
        }));
    };

    const removePrice = (index) => {
        setFormData(prev => ({
            ...prev,
            prices: prev.prices.filter((_, i) => i !== index),
        }));
    };

    // Images 
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const input = e.target;

        // max 5 MB
        const oversized = files.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
        if (oversized.length > 0) {
            handleError(
                t('admin.perfume.create.fileTooLarge', {
                    name: oversized[0].name,
                    size: toMB(oversized[0].size),
                    max: MAX_FILE_SIZE_MB,
                })
            );
            input.value = '';
            return;
        }

        // max 5
        setFormData(prev => {
            const remaining = MAX_IMAGES - prev.images.length;
            if (remaining <= 0) {
                handleError(t('admin.perfume.create.maxImagesReached', { max: MAX_IMAGES }));
                return prev;
            }

            const toAdd = files.slice(0, remaining);
            if (files.length > remaining) {
                handleError(t('admin.perfume.create.maxImagesReached', { max: MAX_IMAGES }));
            }

            // max 25 MB
            const currentTotal = prev.images.reduce((sum, f) => sum + f.size, 0);
            const addingTotal = toAdd.reduce((sum, f) => sum + f.size, 0);

            if (currentTotal + addingTotal > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
                handleError(
                    t('admin.perfume.create.totalSizeExceeded', {
                        current: toMB(currentTotal + addingTotal),
                        max: MAX_TOTAL_SIZE_MB,
                    })
                );
                return prev;
            }

            return { ...prev, images: [...prev.images, ...toAdd] };
        });

        setTimeout(() => { input.value = ''; }, 0);
    };

    const removeImage = (index) => {
        setFormData(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);

            let newPrimaryIndex = prev.primaryImageIndex;
            if (prev.primaryImageIndex === index) {
                newPrimaryIndex = 0;
            } else if (prev.primaryImageIndex > index) {
                newPrimaryIndex = prev.primaryImageIndex - 1;
            }

            return { ...prev, images: newImages, primaryImageIndex: newPrimaryIndex };
        });
    };

    // Validation
    const validateTranslations = () => {
        for (let i = 0; i < formData.translations.length; i++) {
            const tr = formData.translations[i];
            if (!tr.locale) { handleError(t('admin.perfume.create.localeRequired')); return false; }
            if (!tr.name.trim()) { handleError(t('admin.perfume.create.translationNameRequired')); return false; }
        }
        return true;
    };

    const validatePrices = () => {
        for (let i = 0; i < formData.prices.length; i++) {
            const p = formData.prices[i];
            if (!p.perfumeSize) { handleError(t('admin.perfume.create.sizeRequired')); return false; }
            if (!p.price || isNaN(p.price) || parseFloat(p.price) <= 0) { handleError(t('admin.perfume.create.priceInvalid')); return false; }
            if (!p.quantity || isNaN(p.quantity) || parseInt(p.quantity) < 1) { handleError(t('admin.perfume.create.quantityInvalid')); return false; }
        }
        return true;
    };

    // Submit 
    const handleSubmit = async () => {
        if (!formData.name.trim()) { handleError(t('admin.perfume.create.nameRequired')); return; }
        if (!formData.brand.trim()) { handleError(t('admin.perfume.create.brandRequired')); return; }
        if (!formData.perfumeType) { handleError(t('admin.perfume.create.typeRequired')); return; }
        if (formData.perfumeSeasons.length === 0) { handleError(t('admin.perfume.create.seasonRequired')); return; }
        if (!validateTranslations()) return;
        if (!validatePrices()) return;
        if (formData.images.length === 0) { handleError(t('admin.perfume.create.imageRequired')); return; }

        try {
            const createPerfumeRequest = {
                name: formData.name,
                brand: formData.brand,
                perfumeType: formData.perfumeType,
                perfumeSeasons: formData.perfumeSeasons,
                translations: formData.translations.map(tr => ({
                    locale: tr.locale,
                    name: tr.name.trim(),
                    description: tr.description.trim(),
                })),
                prices: formData.prices.map(p => ({
                    perfumeSize: p.perfumeSize,
                    price: parseFloat(p.price),
                    quantity: parseInt(p.quantity),
                })),
                primaryImageIndex: formData.primaryImageIndex,
                imageOrder: formData.images.map((_, i) => i),
            };

            console.log(createPerfumeRequest)

            const response = await createPerfume({ perfumeData: createPerfumeRequest, images: formData.images }).unwrap();
            handleSuccess(response.message);
            onSuccess?.();
            handleClose();
        } catch (error) {
            handleError(error?.data?.message);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setFormData(INITIAL_FORM);
        onClose();
    };

    // Current total MB
    const currentTotalBytes = formData.images.reduce((sum, f) => sum + f.size, 0);
    const currentTotalMB = currentTotalBytes / (1024 * 1024);

    // Render 
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                    border: '2px solid #D4AF37',
                    borderRadius: '20px',
                    maxHeight: '90vh',
                    mx: { xs: 1, sm: 2, md: 'auto' },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    },
                },
            }}
        >
            {/* Title */}
            <DialogTitle sx={{ p: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#D4AF37', fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
                    {t('admin.perfume.create.createNew')}
                </Typography>
                <IconButton
                    onClick={handleClose}
                    disabled={isLoading}
                    sx={{
                        color: '#D4AF37',
                        transition: 'transform 0.4s ease',
                        '&:hover': { backgroundColor: 'rgba(212, 175, 55, 0.1)', transform: 'rotate(180deg)' },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* Basic Info */}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={labelSx}>{t('admin.perfume.create.name')}</Typography>
                            <TextField fullWidth size="small" name="name" value={formData.name} onChange={handleFormChange} sx={fieldSx} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={labelSx}>{t('admin.perfume.create.brand')}</Typography>
                            <TextField fullWidth size="small" name="brand" value={formData.brand} onChange={handleFormChange} sx={fieldSx} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={labelSx}>{t('admin.perfume.create.type')}</Typography>
                            <FormControl fullWidth size="small" sx={fieldSx}>
                                <Select name="perfumeType" value={formData.perfumeType} onChange={handleFormChange} MenuProps={menuProps} displayEmpty
                                    renderValue={(val) => val ? t(`admin.perfume.create.${val.toLowerCase()}`) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                                >
                                    <MenuItem value="FEMALE">{t('admin.perfume.create.female')}</MenuItem>
                                    <MenuItem value="MALE">{t('admin.perfume.create.male')}</MenuItem>
                                    <MenuItem value="UNISEX">{t('admin.perfume.create.unisex')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={labelSx}>{t('admin.perfume.create.seasons')}</Typography>
                            <FormControl fullWidth size="small" sx={fieldSx}>
                                <Select multiple name="perfumeSeasons" value={formData.perfumeSeasons} onChange={handleFormChange} MenuProps={menuProps} displayEmpty
                                    renderValue={(selected) => selected.length === 0
                                        ? <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
                                        : <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={t(`admin.perfume.create.${value.toLowerCase()}`)} size="small" sx={{ color: '#D4AF37', height: 20, fontSize: '0.7rem' }} />
                                            ))}
                                        </Box>
                                    }
                                >
                                    <MenuItem value="SPRING">{t('admin.perfume.create.spring')}</MenuItem>
                                    <MenuItem value="SUMMER">{t('admin.perfume.create.summer')}</MenuItem>
                                    <MenuItem value="FALL">{t('admin.perfume.create.fall')}</MenuItem>
                                    <MenuItem value="WINTER">{t('admin.perfume.create.winter')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Translations */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography sx={{ ...labelSx, mb: 0 }}>{t('admin.perfume.create.translations')}</Typography>
                            {formData.translations.length < LOCALES.length && (
                                <Button size="small" startIcon={<AddIcon sx={{ ml: isRTL ? 1 : 0 }} />} onClick={addTranslation} sx={{ color: '#D4AF37', textTransform: 'none' }}>
                                    {t('admin.perfume.create.addTranslation')}
                                </Button>
                            )}
                        </Box>

                        {formData.translations.map((tr, index) => (
                            <Box key={index} sx={{ mb: 2, p: { xs: 1.5, sm: 2 }, border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px' }}>
                                <Grid container spacing={2} alignItems="flex-start">
                                    <Grid size={{ xs: 4, sm: 2 }}>
                                        <FormControl fullWidth size="small" sx={fieldSx}>
                                            <Select value={tr.locale} onChange={(e) => handleTranslationChange(index, 'locale', e.target.value)} displayEmpty MenuProps={menuProps}
                                                renderValue={(val) => val ? val.toUpperCase() : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{t('admin.perfume.create.localePlaceholder')}</span>}
                                            >
                                                {LOCALES
                                                    .filter(l => !formData.translations.some((tr, i) => i !== index && tr.locale === l))
                                                    .map(locale => <MenuItem key={locale} value={locale}>
                                                        {t(`admin.perfume.create.${locale}`)}
                                                    </MenuItem>
                                                    )
                                                }
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 7, sm: 9 }}>
                                        <TextField fullWidth size="small" placeholder={t('admin.perfume.create.translationName')} value={tr.name}
                                            onChange={(e) => handleTranslationChange(index, 'name', e.target.value)}
                                            inputProps={{ dir: tr.locale === 'ar' ? 'rtl' : 'ltr' }} sx={fieldSx} />
                                    </Grid>

                                    <Grid size={{ xs: 1 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconButton onClick={() => removeTranslation(index)} disabled={formData.translations.length === 1} size="small" sx={{ color: '#e74c3c' }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <TextField fullWidth size="small" multiline rows={2} placeholder={t('admin.perfume.create.translationDescription')} value={tr.description}
                                            onChange={(e) => handleTranslationChange(index, 'description', e.target.value)}
                                            inputProps={{ dir: tr.locale === 'ar' ? 'rtl' : 'ltr' }} sx={fieldSx} />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Box>

                    {/* Prices */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography sx={{ ...labelSx, mb: 0 }}>{t('admin.perfume.create.prices')}</Typography>
                            {formData.prices.length < PERFUME_SIZES.length && (
                                <Button size="small" startIcon={<AddIcon sx={{ ml: isRTL ? 1 : 0 }} />} onClick={addPrice} sx={{ color: '#D4AF37', textTransform: 'none' }}>
                                    {t('admin.perfume.create.addSize')}
                                </Button>
                            )}
                        </Box>

                        {formData.prices.map((price, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }} alignItems="center">
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <FormControl fullWidth size="small" sx={fieldSx}>
                                        <Select value={price.perfumeSize} onChange={(e) => handlePriceChange(index, 'perfumeSize', e.target.value)} displayEmpty MenuProps={menuProps}
                                            renderValue={(val) =>
                                                val
                                                    ? t(`admin.perfume.create.${val.replace('SIZE_', '')}`)
                                                    : <span style={{ color: 'rgba(255,255,255,0.3)' }}>{t('admin.perfume.create.sizePlaceholder')}</span>
                                            }
                                        >
                                            {PERFUME_SIZES
                                                .filter(s => !formData.prices.some((p, i) => i !== index && p.perfumeSize === s))
                                                .map(size => <MenuItem key={size} value={size}>
                                                    {t(`admin.perfume.create.${size.replace('SIZE_', '')}`)}
                                                </MenuItem>
                                                )
                                            }
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 5, sm: 3 }}>
                                    <TextField fullWidth size="small" type="number" placeholder={t('admin.perfume.create.pricePlaceholder')} value={price.price}
                                        onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+(\.\d{0,2})?$/.test(v)) handlePriceChange(index, 'price', v); }}
                                        inputProps={{ min: 0.01, step: '0.01' }} error={price.price !== '' && parseFloat(price.price) <= 0} sx={fieldSx}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <span style={{ color: '#D4AF37', fontWeight: 700 }}>{t(`admin.perfume.create.currency`)}</span>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 5, sm: 3 }}>
                                    <TextField fullWidth size="small" type="number" placeholder={t('admin.perfume.create.quantityPlaceholder')} value={price.quantity}
                                        onChange={(e) => { const v = e.target.value; if (v === '' || /^[1-9]\d*$/.test(v)) handlePriceChange(index, 'quantity', v); }}
                                        inputProps={{ min: 1, step: 1 }} error={price.quantity !== '' && parseInt(price.quantity) < 1} sx={fieldSx} />
                                </Grid>

                                <Grid size={{ xs: 2, sm: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <IconButton onClick={() => removePrice(index)} disabled={formData.prices.length === 1} size="small" sx={{ color: '#e74c3c' }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                    </Box>

                    {/* Images */}
                    <Box>
                        {formData.images.length < MAX_IMAGES && (
                            <Button component="label" fullWidth startIcon={<AddIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                                sx={{
                                    py: 2, border: '2px dashed rgba(212,175,55,0.5)', borderRadius: '10px',
                                    color: '#D4AF37', textTransform: 'none',
                                    '&:hover': { borderColor: '#D4AF37', background: 'rgba(212,175,55,0.05)' },
                                }}
                            >
                                {t('admin.perfume.create.uploadImages')}
                                <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                            </Button>
                        )}

                        {formData.images.length > 0 && (
                            <Box sx={{ direction: 'ltr', display: 'flex', justifyContent: 'space-between', mt: 1, mx: 1 }}>
                                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                    {formData.images.length} / {MAX_IMAGES} {t('admin.perfume.create.images')}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.75rem',
                                    color: currentTotalMB > MAX_TOTAL_SIZE_MB * 0.8 ? '#e74c3c' : 'rgba(255,255,255,0.4)',
                                }}>
                                    {formatSize(currentTotalBytes)} / {MAX_TOTAL_SIZE_MB} MB
                                </Typography>
                            </Box>
                        )}

                        {formData.images.length > 0 && (
                            <Box sx={{ direction: 'ltr', display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                {formData.images.map((img, index) => (
                                    <Box key={index} onClick={() => setFormData(prev => ({ ...prev, primaryImageIndex: index }))}
                                        sx={{
                                            position: 'relative', cursor: 'pointer', flexShrink: 0,
                                            width: { xs: 65, sm: 80 }, height: { xs: 65, sm: 80 },
                                            border: index === formData.primaryImageIndex ? '2px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)',
                                            borderRadius: '8px', overflow: 'hidden',
                                        }}
                                    >
                                        <img src={URL.createObjectURL(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                            sx={{ position: 'absolute', top: 2, right: 2, background: 'rgba(231,76,60,0.9)', p: '2px', '&:hover': { background: '#e74c3c' } }}
                                        >
                                            <DeleteIcon sx={{ color: '#fff', fontSize: 14 }} />
                                        </IconButton>
                                        {index === formData.primaryImageIndex && (
                                            <Box sx={{ position: 'absolute', bottom: 2, left: 2, background: '#D4AF37', color: '#000', px: 0.5, py: 0.1, borderRadius: '4px', fontSize: '0.55rem', fontWeight: 700 }}>
                                                ⭐
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                </Box>
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
                <Button fullWidth onClick={handleSubmit} disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} sx={{ color: '#000', ml: isRTL ? 1 : 0 }} /> : <SaveIcon sx={{ ml: isRTL ? 1 : 0 }} />}
                    sx={goldBtnSx}
                >
                    {isLoading ? t('admin.perfume.create.creating') : t('admin.perfume.create.create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreatePerfumeDialog;