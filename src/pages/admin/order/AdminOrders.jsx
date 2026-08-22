import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    useGetGuestOrdersQuery,
    useGetCustomerOrdersQuery,
} from '../../../redux/api/adminApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import OrderFilters from '../../../components/order/OrderFilters';
import OrderTable from '../../../components/order/OrderTable';

const AdminOrders = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const orderTab = searchParams.get('tab') || 'guest';
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [status, setStatus] = useState('');

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
        setPage(0);
    };

    const sharedParams = {
        page,
        size: rowsPerPage,
        status: status || undefined,
    };

    const { data: guestResponse, isLoading: isGuestLoading } = useGetGuestOrdersQuery(sharedParams, {
        skip: orderTab !== 'guest',
    });

    const { data: customerResponse, isLoading: isCustomerLoading } = useGetCustomerOrdersQuery(sharedParams, {
        skip: orderTab !== 'customer',
    });

    const activeData = orderTab === 'guest' ? guestResponse : customerResponse;
    const orders = activeData?.data?.content || [];
    const totalElements = activeData?.data?.page?.totalElements || 0;
    const isLoading = orderTab === 'guest' ? isGuestLoading : isCustomerLoading;

    const handleView = (order) => {
        navigate(`/admin-panel/orders/${order.orderNumber}`, {
            state: { email: order.customerEmail, tab: orderTab }
        });
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(0);
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
                                        {t('admin.order.title')}{' '}
                                        <span style={{ color: '#D4AF37' }}>{t('admin.order.titleHighlight')}</span>
                                    </Typography>
                                    <Box sx={{
                                        width: { xs: '100%', sm: isRTL ? 160 : 300 },
                                        height: 3,
                                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                        mt: 1,
                                    }} />
                                </Box>
                            </Box>

                            {/* Segmented Control + Filter Row */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                gap: { xs: 2, sm: 2.5 },
                                flexWrap: 'wrap',
                                mb: { xs: 2, sm: 3 },
                            }}>
                                {/* Segmented Control */}
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        background: 'linear-gradient(145deg, #1a1a1a 0%, #000000 100%)',
                                        borderRadius: '14px',
                                        p: '5px',
                                        border: '1.5px solid rgba(212,175,55,0.25)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                                        width: { xs: '100%', sm: 'auto' },
                                    }}
                                >
                                    {[
                                        { key: 'guest', icon: <PersonIcon sx={{ fontSize: 18 }} /> },
                                        { key: 'customer', icon: <GroupIcon sx={{ fontSize: 18 }} /> },
                                    ].map(({ key, icon }) => {
                                        const isActive = orderTab === key;
                                        return (
                                            <Box
                                                key={key}
                                                onClick={() => handleTabChange(key)}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 1,
                                                    px: { xs: 2, sm: 3.5 },
                                                    py: 1.1,
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    flex: { xs: 1, sm: 'unset' },
                                                    userSelect: 'none',
                                                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    background: isActive
                                                        ? 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)'
                                                        : 'transparent',
                                                    color: isActive ? '#000' : 'rgba(255,255,255,0.5)',
                                                    fontWeight: isActive ? 700 : 500,
                                                    fontSize: { xs: '0.82rem', sm: '0.88rem' },
                                                    boxShadow: isActive
                                                        ? '0 4px 15px rgba(212,175,55,0.35)'
                                                        : 'none',
                                                    '&:hover': {
                                                        background: isActive
                                                            ? 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)'
                                                            : 'rgba(212,175,55,0.08)',
                                                        color: isActive ? '#000' : 'rgba(255,255,255,0.8)',
                                                    },
                                                }}
                                            >
                                                {icon}
                                                <span>{t(`admin.order.tab.${key}`)}</span>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                {/* Filters */}
                                <OrderFilters
                                    status={status}
                                    onStatusChange={handleStatusChange}
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
                            <OrderTable
                                orders={orders}
                                isLoading={isLoading}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                totalElements={totalElements}
                                onPageChange={(_, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                onView={handleView}
                                emptyMessage={t('admin.order.table.noResults')}
                            />
                        </Box>
                    </Slide>
                </Fade>
            </Container>
        </Box>
    );
};

export default AdminOrders;
