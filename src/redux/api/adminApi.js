import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Auth
        adminLogin: builder.mutation({
            query: (body) => ({
                url: '/admin/auth/login',
                method: 'POST',
                body
            })
        }),
        adminForgotPassword: builder.mutation({
            query: (body) => ({
                url: '/admin/auth/forgot-password',
                method: 'POST',
                body
            })
        }),
        adminResetPassword: builder.mutation({
            query: (body) => ({
                url: '/admin/auth/reset-password',
                method: 'POST',
                body
            })
        }),

        // Coupon
        createCoupon: builder.mutation({
            query: (body) => ({
                url: '/admin/coupons',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Coupons']
        }),
        getActiveCoupon: builder.query({
            query: () => '/admin/coupons/active',
            providesTags: ['Coupons'],
        }),
        deactivateCoupon: builder.mutation({
            query: () => ({
                url: '/admin/coupons/deactivate',
                method: 'PATCH'
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        baseApi.util.upsertQueryData('getActiveCoupon', undefined, { data: null })
                    );
                } catch (error) {
                    console.error("Error deactivating coupon:", error);
                }
            },
            invalidatesTags: ['Coupons']
        }),

        // Customer
        getAllCustomers: builder.query({
            query: ({ page = 0, size = 10, email }) => {
                const params = { page, size };

                if (email) params.email = email;

                return {
                    url: '/admin/customers',
                    params
                };
            },
            providesTags: ['Customers']
        }),

        // Device Token
        registerToken: builder.mutation({
            query: (body) => ({
                url: '/admin/devices',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Devices']
        }),
        getUserDevices: builder.query({
            query: () => '/admin/devices',
            providesTags: ['Devices']
        }),
        removeDevice: builder.mutation({
            query: (deviceId) => ({
                url: `/admin/devices/${deviceId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Devices']
        }),

        // Order
        getCustomerOrders: builder.query({
            query: ({ page = 0, size = 10, status }) => {
                const params = { page, size };

                if (status) params.status = status;

                return {
                    url: '/admin/orders/customer',
                    params
                };
            },
            providesTags: ['Orders']
        }),
        getGuestOrders: builder.query({
            query: ({ page = 0, size = 10, status }) => {
                const params = { page, size };

                if (status) params.status = status;

                return {
                    url: '/admin/orders/guest',
                    params
                };
            },
            providesTags: ['Orders']
        }),
        getCustomerOrderDetails: builder.query({
            query: (orderNumber) => `/admin/orders/customer/${orderNumber}`,
            providesTags: ['Orders']
        }),
        getGuestOrderDetails: builder.query({
            query: ({ orderNumber, email }) => ({
                url: `/admin/orders/guest/${orderNumber}`,
                params: { email }
            }),
            providesTags: ['Orders']
        }),
        updateOrderStatus: builder.mutation({
            query: ({ orderNumber, body }) => ({
                url: `/admin/orders/${orderNumber}/status`,
                method: 'PATCH',
                body
            }),
            invalidatesTags: ['Orders']
        }),

        // Perfume
        getAllPerfumes: builder.query({
            query: ({ page = 0, size = 10, perfumeType, perfumeSeason }) => {
                const params = { page, size };

                if (perfumeType) params.perfumeType = perfumeType;
                if (perfumeSeason) params.perfumeSeason = perfumeSeason;

                return {
                    url: '/admin/perfumes',
                    params
                };
            },
            providesTags: ['Perfumes']
        }),
        searchPerfumes: builder.query({
            query: ({ page = 0, size = 10, keyword }) => ({
                url: '/admin/perfumes/search',
                params: { page, size, keyword }
            }),
            providesTags: ['Perfumes']
        }),
        createPerfume: builder.mutation({
            query: ({ perfumeData, images }) => {
                const formData = new FormData();

                formData.append('createPerfumeRequest', new Blob([JSON.stringify(perfumeData)], {
                    type: 'application/json',
                }));

                images.forEach((image) => {
                    formData.append('images', image);
                });

                return {
                    url: '/admin/perfumes',
                    method: 'POST',
                    body: formData
                };
            },
            invalidatesTags: ['Perfumes']
        }),
        updatePerfumeByID: builder.mutation({
            query: ({ perfumeId, body }) => ({
                url: `/admin/perfumes/${perfumeId}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['Perfumes']
        }),
        addPerfumeImage: builder.mutation({
            query: ({ perfumeId, image, isPrimary = false }) => {
                const formData = new FormData();
                formData.append('image', image);
                formData.append('isPrimary', isPrimary);
                
                return {
                    url: `/admin/perfumes/${perfumeId}/images`,
                    method: 'POST',
                    body: formData
                };
            },
            invalidatesTags: ['Perfumes']
        }),
        updatePerfumeImage: builder.mutation({
            query: ({ perfumeId, imageId, image, isPrimary = false }) => {
                const formData = new FormData();
                formData.append('image', image);
                formData.append('isPrimary', isPrimary);

                return {
                    url: `/admin/perfumes/${perfumeId}/images/${imageId}`,
                    method: 'PUT',
                    body: formData
                };
            },
            invalidatesTags: ['Perfumes']
        }),
        deletePerfumeImage: builder.mutation({
            query: ({ perfumeId, imageId }) => ({
                url: `/admin/perfumes/${perfumeId}/images/${imageId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Perfumes']
        }),

        // Profile
        getAdminProfile: builder.query({
            query: () => '/admin/profile',
            providesTags: ['Profile']
        }),
        updateAdminProfile: builder.mutation({
            query: (body) => ({
                url: '/admin/profile',
                method: 'PUT',
                body
            }),
            invalidatesTags: ['Profile']
        }),
        updateAdminPassword: builder.mutation({
            query: (body) => ({
                url: '/admin/profile/update-password',
                method: 'PUT',
                body
            })
        }),

        // UserNotification
        getNotifications: builder.query({
            query: () => '/admin/notifications',
            providesTags: ['UserNotifications']
        }),
        hasUnreadNotifications: builder.query({
            query: () => '/admin/notifications/has-unread',
            providesTags: ['UserNotifications']
        }),
        markAllAsSeen: builder.mutation({
            query: () => ({
                url: '/admin/notifications/seen-all',
                method: 'PATCH'
            }),
            invalidatesTags: ['UserNotifications']
        }),
        deleteNotification: builder.mutation({
            query: (userNotificationId) => ({
                url: `/admin/notifications/${userNotificationId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['UserNotifications']
        }),
        clearAll: builder.mutation({
            query: () => ({
                url: '/admin/notifications/clear-all',
                method: 'DELETE'
            }),
            invalidatesTags: ['UserNotifications']
        })
    })
});

export const {
    // Auth
    useAdminLoginMutation,
    useAdminForgotPasswordMutation,
    useAdminResetPasswordMutation,

    // Coupons
    useCreateCouponMutation,
    useGetActiveCouponQuery,
    useDeactivateCouponMutation,

    // Customers
    useGetAllCustomersQuery,

    // Devices
    useRegisterTokenMutation,
    useGetUserDevicesQuery,
    useRemoveDeviceMutation,

    // Orders
    useGetCustomerOrdersQuery,
    useGetGuestOrdersQuery,
    useGetCustomerOrderDetailsQuery,
    useGetGuestOrderDetailsQuery,
    useUpdateOrderStatusMutation,

    // Perfumes
    useGetAllPerfumesQuery,
    useLazySearchPerfumesQuery,
    useCreatePerfumeMutation,
    useUpdatePerfumeByIDMutation,
    useAddPerfumeImageMutation,
    useUpdatePerfumeImageMutation,
    useDeletePerfumeImageMutation,

    // Profile
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useUpdateAdminPasswordMutation,

    // Notifications
    useGetNotificationsQuery,
    useHasUnreadNotificationsQuery,
    useMarkAllAsSeenMutation,
    useDeleteNotificationMutation,
    useClearAllMutation,
} = adminApi;