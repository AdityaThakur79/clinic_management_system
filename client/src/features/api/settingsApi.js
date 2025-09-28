import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL + "/settings" }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    // Get all settings
    getSettings: builder.query({
      query: () => ({ 
        url: "", 
        credentials: "include" 
      }),
      providesTags: ["Settings"],
    }),
    
    // Update all settings
    updateSettings: builder.mutation({
      query: (data) => ({ 
        url: "", 
        method: "PUT", 
        body: data, 
        credentials: "include",
        // Don't set Content-Type for FormData, let browser set it
        prepareHeaders: (headers, { body }) => {
          if (body instanceof FormData) {
            // Don't set Content-Type for FormData
            return headers;
          }
          return headers;
        }
      }),
      invalidatesTags: ["Settings"],
    }),
    
    // Update specific setting
    updateSpecificSetting: builder.mutation({
      query: ({ section, key, value }) => ({ 
        url: "", 
        method: "PATCH", 
        body: { section, key, value }, 
        credentials: "include" 
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { 
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useUpdateSpecificSettingMutation
} = settingsApi;
