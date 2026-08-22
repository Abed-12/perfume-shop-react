import { baseApi } from './baseApi';

export const deliveryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Public
        getDeliveryFees: builder.query({
            query: () => ({
                url: '/public/delivery-fees',
                method: 'GET',
            }),
            providesTags: ['DeliveryFees']
        })
    })
});

export const {
    useGetDeliveryFeesQuery
} = deliveryApi;