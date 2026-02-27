import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';

// Skeleton Loader
const TableSkeleton = () => (
    <>
        {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton variant="rectangular" width={60} height={30} sx={{ borderRadius: '8px' }} /></TableCell>
                <TableCell><Skeleton width="80%" /></TableCell>
                <TableCell><Skeleton width="60%" /></TableCell>
                <TableCell><Skeleton width="40%" /></TableCell>
                <TableCell><Skeleton width="50%" /></TableCell>
                <TableCell><Skeleton width="50%" /></TableCell>
                <TableCell><Skeleton width="70%" /></TableCell>
            </TableRow>
        ))}
    </>
);

// Main Component
const PerfumeTable = ({
    perfumes = [],
    isLoading = false,
    page = 0,
    rowsPerPage = 10,
    totalElements = 0,
    onPageChange,
    onRowsPerPageChange,
    onView,
    emptyMessage,
}) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    const formattedNumber = (value) => {
        if (value == null) return '';

        return new Intl.NumberFormat(
            i18n.language === 'ar' ? 'ar-JO' : 'en-US'
        ).format(value);
    };

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                border: '2px solid #D4AF37',
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                direction: 'ltr',
            }}
        >
            <Table>

                {/* Table Head */}
                <TableHead sx={{ background: 'rgba(212,175,55,0.2)' }}>
                    <TableRow>
                        <TableCell align='center' sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.perfume.table.image')}
                        </TableCell>
                        <TableCell align='center' sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.perfume.table.name')}
                        </TableCell>
                        <TableCell align='center' sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.perfume.table.brand')}
                        </TableCell>
                        <TableCell align='center' sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.perfume.table.lowestPrice')}
                        </TableCell>
                        <TableCell align='center' sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.perfume.table.quantity')}
                        </TableCell>
                        <TableCell align='center' sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.perfume.table.status')}
                        </TableCell>
                        <TableCell align='center' sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.perfume.table.actions')}
                        </TableCell>
                    </TableRow>
                </TableHead>

                {/* Table Body */}
                <TableBody>
                    {isLoading ? (
                        <TableSkeleton />
                    ) : perfumes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                <ImageIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                                <Typography variant="h6">
                                    {emptyMessage || t('admin.perfume.table.noResults')}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        perfumes.map((perfume) => (
                            <TableRow
                                key={perfume.id}
                                sx={{
                                    '&:hover': { background: 'rgba(212,175,55,0.05)' },
                                    borderBottom: '1px solid rgba(212,175,55,0.1)',
                                }}
                            >
                                {/* Image */}
                                <TableCell align='center' width={'10%'}>
                                    <Box
                                        component="img"
                                        src={`${import.meta.env.VITE_API_BASE_URL}${perfume.primaryImageUrl}`}
                                        alt={perfume.name}
                                        sx={{
                                            borderRadius: '8px',
                                            border: '2px solid #D4AF37',
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'contain',
                                            display: 'block',
                                            margin: '0 auto',
                                            backgroundColor: '#fafafa'
                                        }}
                                    />
                                </TableCell>

                                {/* Name */}
                                <TableCell align='center' sx={{ color: '#fff', fontWeight: 600 }}>
                                    <Box>{perfume.name}</Box>
                                    {perfume.translatedName && (
                                        <Box sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                            {perfume.translatedName?.[lang] || '--'}
                                        </Box>
                                    )}
                                </TableCell>

                                {/* Brand */}
                                <TableCell align='center' sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {perfume.brand}
                                </TableCell>

                                {/* Lowest Price */}
                                <TableCell align='center' sx={{ color: '#D4AF37', fontWeight: 600 }}>
                                    {formattedNumber(perfume.lowestPrice)} {t('admin.perfume.table.currency')}
                                </TableCell>

                                {/* Quantity */}
                                <TableCell align='center' sx={{ color: '#fff' }}>
                                    {formattedNumber(perfume.quantity)}
                                </TableCell>

                                {/* Status */}
                                <TableCell align='center'>
                                    <Chip
                                        label={perfume.active ? (t('admin.perfume.table.active')) : (t('admin.perfume.table.inactive'))}
                                        size="small"
                                        sx={{
                                            background: perfume.active ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                                            border: perfume.active ? '1px solid #2ecc71' : '1px solid #e74c3c',
                                            color: perfume.active ? '#2ecc71' : '#e74c3c',
                                            fontWeight: 700,
                                        }}
                                    />
                                </TableCell>

                                {/* Actions */}
                                <TableCell align='center'>
                                    <Box>
                                        <IconButton align='center'
                                            size="small"
                                            onClick={() => onView(perfume.id)}
                                            sx={{
                                                color: '#D4AF37',
                                                borderRadius: '6px',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    color: '#fff',
                                                    backgroundColor: '#D4AF37',
                                                    transform: 'scale(1.2)',
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                                },
                                                '& svg': {
                                                    transition: 'transform 0.3s ease',
                                                },
                                            }}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[]}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('admin.perfume.table.of')} ${count}`
                }
                sx={{
                    color: '#fff',
                    borderTop: '1px solid rgba(212,175,55,0.2)',
                    '& .MuiTablePagination-actions button': { color: '#D4AF37' },
                }}
            />
        </TableContainer>
    );
};

export default PerfumeTable;