import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAllCustomersQuery } from '../../../redux/api/adminApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';

const searchFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
        '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
        '&:hover fieldset': { borderColor: '#D4AF37' },
        '&.Mui-focused fieldset': { borderColor: '#D4AF37', borderWidth: '2px' },
    },
};

const TableSkeleton = ({ colCount = 6 }) => (
    <>
        {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
                {[...Array(colCount)].map((__, j) => (
                    <TableCell key={j} align="center">
                        <Skeleton
                            variant={j === 0 ? 'circular' : 'text'}
                            width={j === 0 ? 32 : '60%'}
                            height={j === 0 ? 32 : 20}
                            sx={{ borderRadius: '6px', mx: 'auto' }}
                        />
                    </TableCell>
                ))}
            </TableRow>
        ))}
    </>
);

const AdminCustomers = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [emailSearch, setEmailSearch] = useState('');
    const [debouncedEmail, setDebouncedEmail] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedEmail(emailSearch.trim());
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [emailSearch]);

    const { data, isLoading } = useGetAllCustomersQuery({
        page,
        size: rowsPerPage,
        email: debouncedEmail || undefined,
    });

    const customers = data?.data?.content || [];
    const totalElements = data?.data?.page?.totalElements || 0;

    const formatInt = (value) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(value);

    const getInitials = (customer) => {
        const first = customer?.firstName?.charAt(0) || '';
        const last = customer?.lastName?.charAt(0) || '';
        return (first + last).toUpperCase() || '?';
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EFEFEF 100%)',
                py: { xs: 2, sm: 3, md: 4 },
                px: { xs: 1, sm: 2 },
            }}
        >
            <Container maxWidth="xl">
                <Fade in timeout={1000}>
                    <Slide direction="down" in timeout={1000}>
                        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                            {/* Header */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: { xs: 2, sm: 0 },
                                mb: { xs: 3, sm: 4 },
                            }}>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                                            textAlign: { xs: 'center', sm: isRTL ? 'right' : 'left' },
                                            mb: 0.5,
                                        }}
                                    >
                                        {t('admin.customer.title')}{' '}
                                        <span style={{ color: '#D4AF37' }}>{t('admin.customer.titleHighlight')}</span>
                                    </Typography>
                                    <Box sx={{
                                        width: { xs: '100%', sm: isRTL ? 160 : 300 },
                                        height: 3,
                                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                        mt: 1,
                                    }} />
                                </Box>
                            </Box>

                            {/* Search Bar */}
                            <Box sx={{ maxWidth: { xs: '100%', sm: 480 }, mb: { xs: 2, sm: 3 } }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={emailSearch}
                                    onChange={(e) => setEmailSearch(e.target.value)}
                                    placeholder={t('admin.customer.searchPlaceholder')}
                                    sx={searchFieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#D4AF37' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: emailSearch && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setEmailSearch('')}>
                                                    <CloseIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>
                    </Slide>
                </Fade>

                <Fade in timeout={1000}>
                    <Slide direction="up" in timeout={1000}>
                        <Box sx={{
                            overflowX: 'auto',
                            width: '100%',
                            WebkitOverflowScrolling: 'touch',
                        }}>
                            <TableContainer
                                component={Paper}
                                elevation={0}
                                sx={{
                                    border: '2px solid #D4AF37',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 100%)',
                                    direction: 'ltr',
                                    overflowX: 'auto',
                                }}
                            >
                                <Table sx={{ minWidth: 760 }}>
                                    <TableHead sx={{ background: 'rgba(212,175,55,0.2)' }}>
                                        <TableRow>
                                            <TableCell align="center" sx={{ width: 60, color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                #
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.customer.table.name')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.customer.table.email')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.customer.table.phone')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.customer.table.governorate')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('admin.customer.table.address')}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {isLoading ? (
                                            <TableSkeleton />
                                        ) : customers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 8 }}>
                                                    <GroupIcon sx={{ fontSize: 60, opacity: 0.3, mb: 1 }} />
                                                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                        {t('admin.customer.noResults')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            customers.map((customer, index) => (
                                                <TableRow
                                                    key={customer.email + index}
                                                    sx={{
                                                        '&:hover': { background: 'rgba(212,175,55,0.05)' },
                                                        borderBottom: '1px solid rgba(212,175,55,0.1)',
                                                    }}
                                                >
                                                    <TableCell align="center" sx={{ width: 60 }}>
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                fontSize: '0.78rem',
                                                                fontWeight: 700,
                                                                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                                                color: '#000',
                                                                mx: 'auto',
                                                            }}
                                                        >
                                                            {getInitials(customer)}
                                                        </Avatar>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                                                        {customer.firstName} {customer.lastName}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                                        {customer.email}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: '#fff', fontSize: '0.85rem', direction: 'ltr' }}>
                                                        {customer.phoneNumber}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={t(`governorates.${customer.governorate}`, { defaultValue: customer.governorate })}
                                                            size="small"
                                                            sx={{
                                                                background: 'rgba(52,152,219,0.15)',
                                                                border: '1px solid #3498db',
                                                                color: '#3498db',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                                        {customer.address || '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                <TablePagination
                                    component="div"
                                    count={totalElements}
                                    page={page}
                                    onPageChange={(_, newPage) => setPage(newPage)}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={(e) => {
                                        setRowsPerPage(parseInt(e.target.value, 10));
                                        setPage(0);
                                    }}
                                    rowsPerPageOptions={[]}
                                    labelDisplayedRows={({ from, to, count }) =>
                                        `${formatInt(from)}-${formatInt(to)} ${t('admin.order.table.of')} ${formatInt(count)}`
                                    }
                                    sx={{
                                        color: '#fff',
                                        borderTop: '1px solid rgba(212,175,55,0.2)',
                                        '& .MuiTablePagination-actions button': { color: '#D4AF37' },
                                    }}
                                />
                            </TableContainer>
                        </Box>
                    </Slide>
                </Fade>
            </Container>
        </Box>
    );
};

export default AdminCustomers;
