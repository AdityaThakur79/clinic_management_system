import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const branchApi = createApi({
  reducerPath: "branchApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL + "/branch" }),
  tagTypes: ["Branch"],
  endpoints: (builder) => ({
    // ✅ Create Branch
    createBranch: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Branch"],
    }),

    // ✅ Get All Branches (with pagination, search, filter)
    getAllBranches: builder.query({
      query: (params) => ({
        url: `/all?${new URLSearchParams(params).toString()}`,
        credentials: "include",
      }),
      providesTags: ["Branch"],
    }),

    // ✅ Get Branch by ID
    getBranchById: builder.mutation({
      query: (data) => ({
        url: "/view",
        method: "POST",
        body: data,  
        credentials: "include",
      }),
      providesTags: ["Branch"],
    }),

    // ✅ Update Branch
    updateBranch: builder.mutation({
      query: (data) => ({
        url: "/update",
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Branch"],
    }),

    // ✅ Delete Branch
    deleteBranch: builder.mutation({
      query: (data) => ({
        url: "/delete",
        method: "DELETE",
        body: data, // expects { branchId }
        credentials: "include",
      }),
      invalidatesTags: ["Branch"],
    }),
  }),
});

export const {
  useCreateBranchMutation,
  useGetAllBranchesQuery,
  useGetBranchByIdMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi;
