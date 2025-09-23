import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL + "/inventory" }),
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
        credentials: "include" 
      }),
      invalidatesTags: ["Inventory"],
    }),
    
    // Update inventory
    update: builder.mutation({
      query: ({ id, ...data }) => ({ 
        url: `/${id}`, 
        method: "PUT", 
        body: data, 
        credentials: "include" 
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
  }),
});

export const { 
  useListQuery: useListInventoriesQuery,
  useGetByIdQuery: useGetInventoryByIdQuery,
  useGetAnalyticsQuery: useGetInventoryAnalyticsQuery,
  useCreateMutation: useCreateInventoryMutation,
  useUpdateMutation: useUpdateInventoryMutation,
  useUpdateStockMutation: useUpdateInventoryStockMutation,
  useRemoveMutation: useDeleteInventoryMutation
} = inventoryApi;

