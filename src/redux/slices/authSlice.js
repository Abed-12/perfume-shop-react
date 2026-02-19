import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const getInitialAuthState = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return {
            token: null,
            role: null,
            isAuthenticated: false
        };
    }

    try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            return {
                token: null,
                role: null,
                isAuthenticated: false
            };
        }

        return {
            token,
            role: decoded.role || null,
            isAuthenticated: true
        };
    } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem('token');
        return {
            token: null,
            role: null,
            isAuthenticated: false
        };
    }
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token } = action.payload;
            state.token = token;
            state.isAuthenticated = !!token;

            try {
                const decoded = jwtDecode(token);
                state.role = decoded.role || null;
            } catch (err) {
                console.error("Invalid token", err);
                state.role = null;
            }

            localStorage.setItem('token', token);
        },
        logout: (state) => {
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;

            localStorage.removeItem('token');
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.role === 'ADMIN';
export const selectIsCustomer = (state) => state.auth.role === 'CUSTOMER';
export const selectUserRole = (state) => state.auth.role;

export default authSlice.reducer;