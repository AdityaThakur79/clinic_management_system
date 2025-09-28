import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/BaseUrl';

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + '/blogs',
    credentials: 'include',
  }),
  tagTypes: ['Blog'],
  endpoints: (builder) => ({
    // Admin endpoints
    createBlog: builder.mutation({
      query: (formData) => ({
        url: '/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Blog'],
    }),
    
    getBlogs: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
          }
        });
        return `/?${searchParams.toString()}`;
      },
      providesTags: ['Blog'],
    }),
    
    getBlogById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),
    
    updateBlog: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, 'Blog'],
    }),
    
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
    }),
    
    // Public endpoints
    getPublicBlogs: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
          }
        });
        return `/public?${searchParams.toString()}`;
      },
      providesTags: ['Blog'],
    }),
    
    getBlogBySlug: builder.query({
      query: (slug) => `/public/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Blog', slug }],
    }),
    
    getRelatedBlogs: builder.query({
      query: ({ id, limit = 3 }) => `/public/${id}/related?limit=${limit}`,
      providesTags: ['Blog'],
    }),
    
    getFeaturedBlogs: builder.query({
      query: (limit = 5) => `/public/featured?limit=${limit}`,
      providesTags: ['Blog'],
    }),
    
    getPopularBlogs: builder.query({
      query: (limit = 5) => `/public/popular?limit=${limit}`,
      providesTags: ['Blog'],
    }),
    
    incrementBlogLikes: builder.mutation({
      query: (id) => ({
        url: `/public/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),
  }),
});

export const {
  useCreateBlogMutation,
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetPublicBlogsQuery,
  useGetBlogBySlugQuery,
  useGetRelatedBlogsQuery,
  useGetFeaturedBlogsQuery,
  useGetPopularBlogsQuery,
  useIncrementBlogLikesMutation,
} = blogApi;
