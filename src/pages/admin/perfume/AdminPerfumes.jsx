import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    useGetAllPerfumesQuery,
    useLazySearchPerfumesQuery
} from '../../../redux/api/adminApi';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import { ToastContainer } from 'react-toastify';
import PerfumeFilters from '../../../components/perfume/PerfumeFilters';
import PerfumeTable from '../../../components/perfume/PerfumeTable';
import CreatePerfumeDialog from '../../../components/perfume/CreatePerfumeDialog';

const goldBtnSx = {
    py: { xs: 1, sm: 1.2 },
    px: { xs: 2, sm: 3 },
    borderRadius: '10px',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: { xs: '0.85rem', sm: '0.95rem' },
    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
    color: '#000',
    boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
    transition: 'all 0.3s',
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
    },
};

const AdminPerfumes = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const navigate = useNavigate();

    // State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [perfumeType, setPerfumeType] = useState('');
    const [perfumeSeason, setPerfumeSeason] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // API
    const { data: perfumesResponse, isLoading } = useGetAllPerfumesQuery(
        {
            page,
            size: rowsPerPage,
            perfumeType: perfumeType || undefined,
            perfumeSeason: perfumeSeason || undefined
        },
        { skip: searchTerm.length > 0 }
    );

    const [triggerSearch, { data: searchResponse, isLoading: isSearching }] = useLazySearchPerfumesQuery();

    const activeData = searchTerm ? searchResponse : perfumesResponse;
    const perfumes = activeData?.data?.content || [];
    const totalElements = activeData?.data?.page?.totalElements || 0;
    const isLoadingData = isLoading || isSearching;

    // Handlers
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setPage(0);
            triggerSearch({ keyword: searchTerm, page: 0, size: rowsPerPage });
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPage(0);
    };

    const handleTypeChange = (value) => {
        setPerfumeType(value);
        setPage(0);
    };

    const handleSeasonChange = (value) => {
        setPerfumeSeason(value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        if (searchTerm) {
            triggerSearch({ keyword: searchTerm, page: newPage, size: rowsPerPage });
        }
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        if (searchTerm) {
            triggerSearch({ keyword: searchTerm, page: 0, size: newSize });
        }
    };

    const handleView = (id) => {
        navigate(`/admin-panel/perfume/${id}`);
    };

    const handleCreateSuccess = () => {
        setPage(0);
    };

    // Render
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

                        {/* Page Header */}
                        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: { xs: 2, sm: 0 },
                                mb: { xs: 2, sm: 3 }
                            }}>
                                <Box sx={{ width: '100%', sm: 'auto' }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                                            textAlign: { xs: 'center', sm: isRTL ? 'right' : 'left' },
                                            mb: 0.5,
                                            mx: 1,
                                        }}
                                    >
                                        {t('admin.perfume.title')} <span style={{ color: '#D4AF37' }}>{t('admin.perfume.titleHighlight')}</span>
                                    </Typography>
                                    <Box sx={{
                                        width: { xs: '100%', sm: isRTL ? 160 : 350 },
                                        height: 3,
                                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                                        mt: 1
                                    }} />
                                </Box>

                                <Button
                                    startIcon={<AddIcon sx={{ ml: isRTL ? 2 : 0 }} />}
                                    onClick={() => setCreateDialogOpen(true)}
                                    sx={{
                                        ...goldBtnSx,
                                        width: { xs: '100%', sm: 'auto', md: '20%' },
                                        minWidth: { sm: 'auto' }
                                    }}
                                >
                                    {t('admin.perfume.addNew')}
                                </Button>
                            </Box>

                            {/* Filters */}
                            <PerfumeFilters
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                onSearchSubmit={handleSearchSubmit}
                                onClearSearch={handleClearSearch}
                                perfumeType={perfumeType}
                                onTypeChange={handleTypeChange}
                                perfumeSeason={perfumeSeason}
                                onSeasonChange={handleSeasonChange}
                                disabled={!!searchTerm}
                            />
                        </Box>
                    </Slide>
                </Fade>

                <Fade in timeout={1000}>
                    <Slide direction="up" in timeout={1000}>
                        {/* Table */}
                        <Box sx={{
                            overflowX: 'auto',
                            width: '100%',
                            WebkitOverflowScrolling: 'touch',
                        }}>
                            <PerfumeTable
                                perfumes={perfumes}
                                isLoading={isLoadingData}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                totalElements={totalElements}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                onView={handleView}
                                emptyMessage={searchTerm ? (t('admin.perfume.noSearchResults')) : (t('admin.perfume.noPerfumes'))}
                            />
                        </Box>
                    </Slide>
                </Fade>

            </Container>

            {/* Create Perfume Dialog */}
            <CreatePerfumeDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <ToastContainer />
        </Box>
    );
};

export default AdminPerfumes;