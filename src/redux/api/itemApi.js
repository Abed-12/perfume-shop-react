import { baseApi } from './baseApi';

export const itemApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Public - Perfume
        getActivePerfumes: builder.query({
            query: ({ page = 0, size = 10, perfumeType, perfumeSeason }) => {
                const params = { page, size };

                if (perfumeType) params.perfumeType = perfumeType;
                if (perfumeSeason) params.perfumeSeason = perfumeSeason;

                return {
                    url: '/public/perfumes',
                    params
                };
            },
            providesTags: ['Perfumes']
        }),
        getPerfumeById: builder.query({
            query: (perfumeId) => `/public/perfumes/${perfumeId}`,
            providesTags: ['Perfumes']
        }),
        searchPublicPerfumes: builder.query({
            query: ({ page = 0, size = 10, keyword }) => ({
                url: '/public/perfumes/search',
                params: { page, size, keyword }
            }),
            providesTags: ['Perfumes']
        })
    })
});

export const {
    useGetActivePerfumesQuery,
    useGetPerfumeByIdQuery,
    useSearchPublicPerfumesQuery,
} = itemApi;