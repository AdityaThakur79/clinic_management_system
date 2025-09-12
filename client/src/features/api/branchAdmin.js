import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const branchAdminApi = createApi({
  reducerPath: "branchAdminApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL + "/branch-admin" }),
  tagTypes: ["BranchAdmin"],
  endpoints: (builder) => ({
    // ✅ Create Branch Admin
    createBranchAdmin: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["BranchAdmin"],
    }),

    // ✅ Get All Branch Admins (with pagination + search)
    getAllBranchAdmins: builder.mutation({
      query: (data) => ({
        url: "/all",
        method: "POST",
        body: data, // { page, limit, branch, q }
        credentials: "include",
      }),
      providesTags: ["BranchAdmin"],
    }),

    // ✅ Get Branch Admin by ID
    getBranchAdminById: builder.mutation({
      query: (data) => ({
        url: "/view",
        method: "POST",
        body: data, // { id }
        credentials: "include",
      }),
      providesTags: ["BranchAdmin"],
    }),

    // ✅ Update Branch Admin
    updateBranchAdmin: builder.mutation({
      query: (data) => ({
        url: "/update",
        method: "PUT", 
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["BranchAdmin"],
    }),

    // ✅ Delete Branch Admin
    deleteBranchAdmin: builder.mutation({
      query: (data) => ({
        url: "/delete",
        method: "DELETE", // backend uses POST not DELETE
        body: data, 
        credentials: "include",
      }),
      invalidatesTags: ["BranchAdmin"],
    }),

    // ✅ Get Branch Admins by Branch
    getBranchAdminsByBranch: builder.mutation({
      query: (data) => ({
        url: "/branch/all",
        method: "POST",
        body: data, 
        credentials: "include",
      }),
      providesTags: ["BranchAdmin"],
    }),
  }),
});

export const {
  useCreateBranchAdminMutation,
  useGetAllBranchAdminsMutation,
  useGetBranchAdminByIdMutation,
  useUpdateBranchAdminMutation,
  useDeleteBranchAdminMutation,
  useGetBranchAdminsByBranchMutation,
} = branchAdminApi;
