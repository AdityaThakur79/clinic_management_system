import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const appointmentCommissionApi = createApi({
  reducerPath: "appointmentCommissionApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL + "/appointments",
    credentials: 'include'
  }),
  tagTypes: ["AppointmentCommission"],
  endpoints: (builder) => ({
    addCommission: builder.mutation({
      query: ({ appointmentId, ...data }) => {
        console.log('API - addCommission called with:', { appointmentId, ...data });
        console.log('API - appointmentId type:', typeof appointmentId);
        console.log('API - appointmentId value:', appointmentId);
        
        return { 
          url: `/${appointmentId}/commission`, 
          method: 'POST', 
          body: data, 
          credentials: 'include' 
        };
      },
      invalidatesTags: ["AppointmentCommission"],
    }),
    // markCommissionPaid removed - using separate commission payment structure
  }),
});

export const { 
  useAddCommissionMutation,
} = appointmentCommissionApi;
