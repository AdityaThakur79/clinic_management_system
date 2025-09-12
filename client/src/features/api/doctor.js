import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL + "/doctor" }),
  tagTypes: ["Doctor"],
  endpoints: (builder) => ({
    // ✅ Create Doctor
    createDoctor: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Doctor"],
    }),

    // ✅ Get All Doctors (with filters & pagination)
    getAllDoctors: builder.mutation({
      query: (data) => ({
        url: "/all",
        method: "POST",
        body: data, 
        credentials: "include",
      }),
      providesTags: ["Doctor"],
    }),

    // ✅ Get Doctor by ID
    getDoctorById: builder.mutation({
      query: (data) => ({
        url: "/view",
        method: "POST",
        body: data,  
        credentials: "include",
      }),
      providesTags: ["Doctor"],
    }),

    // ✅ Update Doctor
    updateDoctor: builder.mutation({
      query: (data) => ({
        url: "/update",
        method: "PUT",  
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Doctor"],
    }),

    // ✅ Delete Doctor
    deleteDoctor: builder.mutation({
      query: (data) => ({
        url: "/delete",
        method: "DELETE",  
        body: data,  
        credentials: "include",
      }),
      invalidatesTags: ["Doctor"],
    }),

    // ✅ Get Doctors by Branch
    getDoctorsByBranch: builder.mutation({
      query: (data) => ({
        url: "/branch/all",
        method: "POST",
        body: data, 
        credentials: "include",
      }),
      providesTags: ["Doctor"],
    }),

    // ✅ Get Doctors by Specialization
    getDoctorsBySpecialization: builder.mutation({
      query: (data) => ({
        url: "/specialization/all",
        method: "POST",
        body: data, 
        credentials: "include",
      }),
      providesTags: ["Doctor"],
    }),
  }),
});

export const {
  useCreateDoctorMutation,
  useGetAllDoctorsMutation,
  useGetDoctorByIdMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useGetDoctorsByBranchMutation,
  useGetDoctorsBySpecializationMutation,
} = doctorApi;
