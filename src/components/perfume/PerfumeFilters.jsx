import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

const searchFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
        '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: '2px' },
    },
};

const selectSx = {
    borderRadius: '10px',
    backgroundColor: '#fff',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.3)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37', borderWidth: '2px' },
};

const menuProps = {
    PaperProps: {
        sx: {
            "& .MuiMenuItem-root": {
                "&:hover": { backgroundColor: "rgba(212,175,55,0.15)" },
                "&.Mui-selected": {
                    backgroundColor: "rgba(212,175,55,0.25)",
                    color: "#D4AF37",
                },
            },
        },
    },
};

const PerfumeFilters = ({
    searchTerm,
    onSearchChange,
    onSearchSubmit,
    onClearSearch,
    perfumeType,
    onTypeChange,
    perfumeSeason,
    onSeasonChange,
    disabled = false
}) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Search Bar */}
            <Box
                component="form"
                onSubmit={onSearchSubmit}
                sx={{ flex: '1 1 300px', minWidth: 250 }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('admin.perfume.filter.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    sx={searchFieldSx}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#D4AF37' }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={onClearSearch}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Type Filter */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                    value={perfumeType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    displayEmpty
                    sx={selectSx}
                    MenuProps={menuProps}
                    disabled={disabled}
                >
                    <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterListIcon fontSize="small" />
                            <span>{t('admin.perfume.filter.allTypes')}</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="FEMALE">{t('admin.perfume.filter.female')}</MenuItem>
                    <MenuItem value="MALE">{t('admin.perfume.filter.male')}</MenuItem>
                    <MenuItem value="UNISEX">{t('admin.perfume.filter.unisex')}</MenuItem>
                </Select>
            </FormControl>

            {/* Season Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                    value={perfumeSeason}
                    onChange={(e) => onSeasonChange(e.target.value)}
                    displayEmpty
                    sx={selectSx}
                    MenuProps={menuProps}
                    disabled={disabled}
                >
                    <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterListIcon fontSize="small" />
                            <span>{t('admin.perfume.filter.allSeasons')}</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="SPRING">{t('admin.perfume.filter.spring')}</MenuItem>
                    <MenuItem value="SUMMER">{t('admin.perfume.filter.summer')}</MenuItem>
                    <MenuItem value="FALL">{t('admin.perfume.filter.fall')}</MenuItem>
                    <MenuItem value="WINTER">{t('admin.perfume.filter.winter')}</MenuItem>
                </Select>
            </FormControl>

        </Box>
    );
};

export default PerfumeFilters;