import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FilterListIcon from '@mui/icons-material/FilterList';

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
            '& .MuiMenuItem-root': {
                '&:hover': { backgroundColor: 'rgba(212,175,55,0.15)' },
                '&.Mui-selected': {
                    backgroundColor: 'rgba(212,175,55,0.25)',
                    color: '#D4AF37',
                },
            },
        },
    },
};

const OrderFilters = ({ status, onStatusChange, disabled = false }) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    displayEmpty
                    sx={selectSx}
                    MenuProps={menuProps}
                    disabled={disabled}
                >
                    <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterListIcon fontSize="small" />
                            <span>{t('admin.order.filter.allStatus')}</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="PENDING">{t('admin.order.status.PENDING')}</MenuItem>
                    <MenuItem value="PROCESSING">{t('admin.order.status.PROCESSING')}</MenuItem>
                    <MenuItem value="DELIVERED">{t('admin.order.status.DELIVERED')}</MenuItem>
                    <MenuItem value="CANCELLED">{t('admin.order.status.CANCELLED')}</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default OrderFilters;
