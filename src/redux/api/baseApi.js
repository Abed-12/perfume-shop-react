import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import i18n from "../../i18n/i18n";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            // Token
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            // Language
            const language = i18n.language || localStorage.getItem('language') || 'en';
            headers.set('Accept-Language', language);

            return headers;
        },
    }),
    tagTypes: ['Coupons', 'Customers', 'Devices', 'Orders', 'Perfumes', 'Profile', 'UserNotifications'],
    endpoints: () => ({})
});
