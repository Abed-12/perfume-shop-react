import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCustomerOrdersListQuery } from '../../../redux/api/customerApi';
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
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OrderFilters from '../../../components/order/OrderFilters';

const statusConfig = {
    PENDING: { bg: 'rgba(243,156,18,0.15)', border: '#f39c12', color: '#f39c12' },
    PROCESSING: { bg: 'rgba(52,152,219,0.15)', border: '#3498db', color: '#3498db' },
    DELIVERED: { bg: 'rgba(46,204,113,0.15)', border: '#2ecc71', color: '#2ecc71' },
    CANCELLED: { bg: 'rgba(231,76,60,0.15)', border: '#e74c3c', color: '#e74c3c' },
};

const typeConfig = {
    GUEST: { bg: 'rgba(155,89,182,0.15)', border: '#9b59b6', color: '#9b59b6' },
    CUSTOMER: { bg: 'rgba(52,152,219,0.15)', border: '#3498db', color: '#3498db' },
};

const typeSelectSx = {
    borderRadius: '10px',
    backgroundColor: '#fff',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.3)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#D4AF37', borderWidth: '2px' },
};

const typeMenuProps = {
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

const TableSkeleton = ({ colCount = 8 }) => (
    <>
        {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
                {[...Array(colCount)].map((__, j) => (
                    <TableCell key={j} align="center">
                        <Skeleton
                            variant="text"
                            width="60%"
                            height={20}
                            sx={{ borderRadius: '6px', mx: 'auto' }}
                        />
                    </TableCell>
                ))}
            </TableRow>
        ))}
    </>
);

const CustomerOrders = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [status, setStatus] = useState('');
    const [orderType, setOrderType] = useState('');

    const { data, isLoading } = useGetCustomerOrdersListQuery({
        page,
        size: rowsPerPage,
        status: status || undefined,
        orderType: orderType || undefined,
    });

    const orders = data?.data?.content || [];
    const totalElements = data?.data?.page?.totalElements || 0;

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(0);
    };

    const handleTypeChange = (value) => {
        setOrderType(value);
        setPage(0);
    };

    const formatCurrency = (value) => {
        if (value == null) return '';
        return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            minimumFractionDigits: 2,
        }).format(value);
    };

    const formatInt = (value) =>
        new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US').format(value);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
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
                                <Box sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                                            textAlign: { xs: 'center', sm: isRTL ? 'right' : 'left' },
                                            mb: 0.5,
                                        }}
                                    >
                                        {i18n.language === 'ar'
                                            ? <span style={{ color: '#D4AF37' }}>{t('customer.orders.title')}</span>
                                            : (
                                                <>
                                                    {t('customer.orders.title')}{' '}
                                                    <span style={{ color: '#D4AF37' }}>{t('customer.orders.titleHighlight')}</span>
                                                </>
                                            )}
                                    </Typography>
                                    <Box sx={{
                                        width: '100%',
                                        height: 3,
                                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                        mt: 1,
                                    }} />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <FormControl size="small" sx={{ minWidth: 170 }}>
                                        <Select
                                            value={orderType}
                                            onChange={(e) => handleTypeChange(e.target.value)}
                                            displayEmpty
                                            sx={typeSelectSx}
                                            MenuProps={typeMenuProps}
                                        >
                                            <MenuItem value="">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <FilterListIcon fontSize="small" />
                                                    <span>{t('customer.orders.filter.allTypes')}</span>
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="GUEST">{t('customer.orders.type.GUEST')}</MenuItem>
                                            <MenuItem value="CUSTOMER">{t('customer.orders.type.CUSTOMER')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <OrderFilters
                                        status={status}
                                        onStatusChange={handleStatusChange}
                                    />
                                </Box>
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
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('customer.orders.table.orderNumber')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('customer.orders.table.name')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('customer.orders.table.type')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('customer.orders.table.items')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('customer.orders.table.total')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('customer.orders.table.status')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('customer.orders.table.date')}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {t('customer.orders.table.actions')}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {isLoading ? (
                                            <TableSkeleton />
                                        ) : orders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 8 }}>
                                                    <ReceiptLongIcon sx={{ fontSize: 60, opacity: 0.3, mb: 1 }} />
                                                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                        {t('customer.orders.noResults')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            orders.map((order) => {
                                                const st = statusConfig[order.status] || statusConfig.PENDING;
                                                const tc = typeConfig[order.orderType] || typeConfig.CUSTOMER;
                                                return (
                                                    <TableRow
                                                        key={order.orderNumber}
                                                        sx={{
                                                            '&:hover': { background: 'rgba(212,175,55,0.05)' },
                                                            borderBottom: '1px solid rgba(212,175,55,0.1)',
                                                        }}
                                                    >
                                                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 600, fontSize: '0.82rem' }}>
                                                            {order.orderNumber}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ color: '#fff', fontWeight: 500 }}>
                                                            {order.customerName}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={t(`customer.orders.type.${order.orderType}`, { defaultValue: order.orderType })}
                                                                size="small"
                                                                sx={{
                                                                    background: tc.bg,
                                                                    border: `1px solid ${tc.border}`,
                                                                    color: tc.color,
                                                                    fontWeight: 700,
                                                                    fontSize: '0.72rem',
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ color: '#fff' }}>
                                                            {formatInt(order.itemCount)}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 600 }}>
                                                            {formatCurrency(order.totalPrice)} {t('admin.order.table.currency')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={t(`admin.order.status.${order.status}`)}
                                                                size="small"
                                                                sx={{
                                                                    background: st.bg,
                                                                    border: `1px solid ${st.border}`,
                                                                    color: st.color,
                                                                    fontWeight: 700,
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                                            {formatDate(order.orderDate)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => navigate(`/my-orders/${order.orderNumber}`, {
                                                                    state: { orderType: order.orderType, email: order.guestEmail },
                                                                })}
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
                                                                }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
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

export default CustomerOrders;
