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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const statusConfig = {
    PENDING: { bg: 'rgba(243,156,18,0.15)', border: '#f39c12', color: '#f39c12' },
    PROCESSING: { bg: 'rgba(52,152,219,0.15)', border: '#3498db', color: '#3498db' },
    DELIVERED: { bg: 'rgba(46,204,113,0.15)', border: '#2ecc71', color: '#2ecc71' },
    CANCELLED: { bg: 'rgba(231,76,60,0.15)', border: '#e74c3c', color: '#e74c3c' },
};

const TableSkeleton = ({ colCount = 8 }) => (
    <>
        {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
                {[...Array(colCount)].map((__, j) => (
                    <TableCell key={j} align="center">
                        <Skeleton
                            variant={j === 0 ? 'rectangular' : 'text'}
                            width={j === 0 ? 90 : '60%'}
                            height={j === 0 ? 28 : 20}
                            sx={{ borderRadius: '6px', mx: 'auto' }}
                        />
                    </TableCell>
                ))}
            </TableRow>
        ))}
    </>
);

const OrderTable = ({
    orders = [],
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
            <Table sx={{ minWidth: 700 }}>
                <TableHead sx={{ background: 'rgba(212,175,55,0.2)' }}>
                    <TableRow>
                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.order.table.orderNumber')}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.order.table.customerName')}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.order.table.email')}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.order.table.items')}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.order.table.totalPrice')}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.order.table.status')}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.order.table.orderDate')}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.8rem' }}>
                            {t('admin.order.table.actions')}
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
                                    {emptyMessage || t('admin.order.table.noResults')}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map((order) => {
                            const st = statusConfig[order.status] || statusConfig.PENDING;
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

                                    <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                                        {order.customerEmail}
                                    </TableCell>

                                    <TableCell align="center" sx={{ color: '#fff' }}>
                                        {order.itemCount}
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
                                            onClick={() => onView(order)}
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
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
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
    );
};

export default OrderTable;
