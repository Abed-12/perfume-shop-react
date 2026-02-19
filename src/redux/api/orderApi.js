import { baseApi } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Public - Guest Order
        createGuestOrder: builder.mutation({
            query: (body) => ({
                url: '/public/guest-orders',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Orders']
        }),
        getGuestOrderDetails: builder.query({
            query: ({ orderNumber, email }) => ({
                url: '/public/guest-orders/track',
                params: { email, orderNumber }
            }),
            providesTags: ['Orders']
        }),
        cancelGuestOrder: builder.mutation({
            query: ({ orderNumber, cancelData }) => ({
                url: `/public/guest-orders/${orderNumber}/cancel`,
                method: 'PATCH',
                body: cancelData
            }),
            invalidatesTags: ['Orders']
        })
    })
});

export const {
    useCreateGuestOrderMutation,
    useGetGuestOrderDetailsQuery,
    useCancelGuestOrderMutation
} = orderApi;