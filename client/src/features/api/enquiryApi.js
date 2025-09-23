import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const enquiryApi = createApi({
  reducerPath: "enquiryApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL + "/enquiry",
    credentials: "include",
  }),
  tagTypes: ["Enquiry"],
  endpoints: (builder) => ({
    // Create new enquiry (public endpoint)
    createEnquiry: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enquiry"],
    }),

    // Get all enquiries (with filters and pagination)
    getAllEnquiries: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            searchParams.append(key, params[key]);
          }
        });
        return `/all?${searchParams.toString()}`;
      },
      providesTags: ["Enquiry"],
    }),

    // Get enquiry by ID
    getEnquiryById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Enquiry", id }],
    }),

    // Update enquiry
    updateEnquiry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Enquiry", id },
        "Enquiry",
      ],
    }),

    // Add note to enquiry
    addNoteToEnquiry: builder.mutation({
      query: ({ id, note }) => ({
        url: `/${id}/notes`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Enquiry", id },
        "Enquiry",
      ],
    }),

    // Delete enquiry
    deleteEnquiry: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enquiry"],
    }),

    // Get enquiry statistics
    getEnquiryStats: builder.query({
      query: () => "/stats",
      providesTags: ["Enquiry"],
    }),
  }),
});

export const {
  useCreateEnquiryMutation,
  useGetAllEnquiriesQuery,
  useGetEnquiryByIdQuery,
  useUpdateEnquiryMutation,
  useAddNoteToEnquiryMutation,
  useDeleteEnquiryMutation,
  useGetEnquiryStatsQuery,
} = enquiryApi;
