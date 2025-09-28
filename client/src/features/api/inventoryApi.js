import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL + "/inventory",
    credentials: 'include'
  }),
  tagTypes: ["Inventory"],
  endpoints: (builder) => ({
    // List inventories with filters
    list: builder.query({
      query: (params) => ({ 
        url: "", 
        params, 
        credentials: "include" 
      }),
      providesTags: ["Inventory"],
    }),
    
    // Get single inventory
    getById: builder.query({
      query: (id) => ({ 
        url: `/${id}`, 
        credentials: "include" 
      }),
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),
    
    // Get inventory analytics
    getAnalytics: builder.query({
      query: (params) => ({ 
        url: "/analytics", 
        params, 
        credentials: "include" 
      }),
      providesTags: ["Inventory"],
    }),
    
    // Create inventory
    create: builder.mutation({
      query: (data) => ({ 
        url: "", 
        method: "POST", 
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
      invalidatesTags: ["Inventory"],
    }),
    
    // Update inventory
    update: builder.mutation({
      query: ({ id, body, ...data }) => ({ 
        url: `/${id}`, 
        method: "PUT", 
        body: body || data, 
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
      invalidatesTags: (result, error, { id }) => [
        { type: "Inventory", id },
        "Inventory"
      ],
    }),
    
    // Update stock
    updateStock: builder.mutation({
      query: ({ id, operation, quantity, notes }) => ({ 
        url: `/${id}/stock`, 
        method: "PATCH", 
        body: { operation, quantity, notes }, 
        credentials: "include" 
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Inventory", id },
        "Inventory"
      ],
    }),
    
    // Delete inventory
    remove: builder.mutation({
      query: (id) => ({ 
        url: `/${id}`, 
        method: "DELETE", 
        credentials: "include" 
      }),
      invalidatesTags: ["Inventory"],
    }),

    // Check inventory thresholds
    checkThresholds: builder.query({
      query: (params) => {
        // Filter out null/undefined values to prevent "null" string in URL
        const cleanParams = {};
        if (params?.branchId && params.branchId !== null && params.branchId !== 'null') {
          cleanParams.branchId = params.branchId;
        }
        return { 
          url: "/thresholds/check", 
          params: cleanParams, 
          credentials: "include" 
        };
      },
      providesTags: ["Inventory"],
    }),

    // Send inventory alerts
    sendAlerts: builder.mutation({
      query: (params) => {
        // Filter out null/undefined values
        const cleanParams = {};
        if (params?.branchId && params.branchId !== null && params.branchId !== 'null') {
          cleanParams.branchId = params.branchId;
        }
        return { 
          url: "/thresholds/alerts", 
          method: "POST", 
          body: cleanParams, 
          credentials: "include" 
        };
      },
      invalidatesTags: ["Inventory"],
    }),
  }),
});

export const { 
  useListQuery: useListInventoriesQuery,
  useGetByIdQuery: useGetInventoryByIdQuery,
  useGetAnalyticsQuery: useGetInventoryAnalyticsQuery,
  useCreateMutation: useCreateInventoryMutation,
  useUpdateMutation: useUpdateInventoryMutation,
  useUpdateStockMutation: useUpdateInventoryStockMutation,
  useRemoveMutation: useDeleteInventoryMutation,
  useCheckThresholdsQuery: useCheckInventoryThresholdsQuery,
  useSendAlertsMutation: useSendInventoryAlertsMutation
} = inventoryApi;

