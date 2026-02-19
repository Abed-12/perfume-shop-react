import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectIsCustomer, selectIsAuthenticated } from '../redux/slices/authSlice';
import NotFound from '../pages/NotFound'; 

export const AdminRoute = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);

    if (!isAuthenticated) {
        return <Navigate to="/admin-panel/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <NotFound />;
    }

    return children;
};

export const CustomerRoute = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isCustomer = useSelector(selectIsCustomer);

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isCustomer) {
        return <NotFound />;
    }

    return children;
};