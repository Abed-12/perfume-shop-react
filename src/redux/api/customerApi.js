import { baseApi } from './baseApi';

export const customerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Auth
        customerRegister: builder.mutation({
            query: (body) => ({
                url: '/customer/auth/register',
                method: 'POST',
                body
            })
        }),
        customerLogin: builder.mutation({
            query: (body) => ({
                url: '/customer/auth/login',
                method: 'POST',
                body
            })
        }),
        customerForgotPassword: builder.mutation({
            query: (body) => ({
                url: '/customer/auth/forgot-password',
                method: 'POST',
                body
            })
        }),
        customerResetPassword: builder.mutation({
            query: (body) => ({
                url: '/customer/auth/reset-password',
                method: 'POST',
                body
            })
        }),

        // Coupon
        validateCoupon: builder.mutation({
            query: (body) => ({
                url: '/customer/coupons/validate',
                method: 'POST',
                body
            })
        }),

        // Order
        createCustomerOrder: builder.mutation({
            query: (body) => ({
                url: '/customer/orders',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Orders']
        }),
        getCustomerOrders: builder.query({
            query: ({ page = 0, size = 10, status }) => {
                const params = { page, size };

                if (status) params.status = status;

                return {
                    url: '/customer/orders',
                    params
                };
            },
            providesTags: ['Orders']
        }),
        getCustomerOrderByOrderNumber: builder.query({
            query: (orderNumber) => `/customer/orders/${orderNumber}`,
            providesTags: ['Orders']
        }),
        cancelCustomerOrder: builder.mutation({
            query: ({ orderNumber, cancelData }) => ({
                url: `/customer/orders/${orderNumber}/cancel`,
                method: 'PATCH',
                body: cancelData
            }),
            invalidatesTags: ['Orders']
        }),

        // Profile
        getCustomerProfile: builder.query({
            query: () => '/customer/profile',
            providesTags: ['Profile']
        }),
        updateCustomerProfile: builder.mutation({
            query: (body) => ({
                url: '/customer/profile',
                method: 'PUT',
                body
            }),
            invalidatesTags: ['Profile']
        }),
        updateCustomerPassword: builder.mutation({
            query: (body) => ({
                url: '/customer/profile/update-password',
                method: 'PUT',
                body
            })
        })
    })
});

export const {
    // Auth
    useCustomerRegisterMutation,
    useCustomerLoginMutation,
    useCustomerForgotPasswordMutation,
    useCustomerResetPasswordMutation,

    // Coupon
    useValidateCouponMutation,

    // Orders
    useCreateCustomerOrderMutation,
    useGetCustomerOrdersQuery,
    useGetCustomerOrderByOrderNumberQuery,
    useCancelCustomerOrderMutation,

    // Profile
    useGetCustomerProfileQuery,
    useUpdateCustomerProfileMutation,
    useUpdateCustomerPasswordMutation,
} = customerApi;
