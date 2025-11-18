import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase/supabaseClient";

export interface Tenant {
  id: number;
  cognito_id: string;
  name: string;
  email: string;
  phone_number: string;
}

export interface Manager {
  id: number;
  cognito_id: string;
  name: string;
  email: string;
  phone_number: string;
}

export interface Location {
  id: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  coordinates?: any;
}

export interface Property {
  id: number;
  name: string;
  description: string;
  price_per_month: number;
  security_deposit: number;
  application_fee: number;
  photo_urls: string[];
  amenities: string[];
  highlights: string[];
  is_pets_allowed: boolean;
  is_parking_included: boolean;
  beds: number;
  baths: number;
  square_feet: number;
  property_type: string;
  posted_date: string;
  average_rating: number;
  number_of_reviews: number;
  location: Location;
  manager_cognito_id?: string;
}

export interface Application {
  id: number;
  application_date: string;
  status: 'Pending' | 'Approved' | 'Denied';
  property_id: number;
  tenant_cognito_id: string;
  name: string;
  email: string;
  phone_number: string;
  message?: string;
  lease_id?: number;
  property: Property;
  tenant?: Tenant;
  lease?: Lease;
}

export interface Favorite {
  id: number;
  created_at: string;
  property: Property;
}

export interface Lease {
  id: number;
  start_date: string;
  end_date: string;
  rent: number;
  deposit: number;
  property_id?: number;
  tenant_cognito_id?: string;
  property?: Property & {
    manager: Manager;
  };
}

export interface Payment {
  id: number;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  payment_date: string;
  payment_status: 'Pending' | 'Paid' | 'PartiallyPaid' | 'Overdue';
  lease_id: number;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      // Get the current session to retrieve the access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
      }
      
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Tenant", "Manager", "Applications", "Favorites", "Residences", "Payments", "Properties"],
  endpoints: (build) => ({
    // Tenant endpoints
    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => `/tenants/${cognitoId}`,
      providesTags: ["Tenant"],
    }),
    updateTenant: build.mutation<Tenant, { cognitoId: string; data: Partial<Tenant> }>({
      query: ({ cognitoId, data }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Tenant"],
    }),

    // Tenant Application endpoints
    getTenantApplications: build.query<Application[], string>({
      query: (cognitoId) => `/tenants/${cognitoId}/applications`,
      providesTags: ["Applications"],
    }),
    createApplication: build.mutation<Application, {
      tenant_cognito_id: string;
      property_id: number;
      name: string;
      email: string;
      phone_number: string;
      message?: string;
    }>({
      query: (data) => ({
        url: `/tenants/applications`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Applications"],
    }),

    // Favorites endpoints
    getTenantFavorites: build.query<Favorite[], string>({
      query: (cognitoId) => `/tenants/${cognitoId}/favorites`,
      providesTags: ["Favorites"],
    }),
    addFavorite: build.mutation<Favorite, { tenant_cognito_id: string; property_id: number }>({
      query: (data) => ({
        url: `/tenants/favorites`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Favorites"],
    }),
    removeFavorite: build.mutation<{ message: string }, { cognitoId: string; propertyId: number }>({
      query: ({ cognitoId, propertyId }) => ({
        url: `/tenants/${cognitoId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favorites"],
    }),

    // Residences endpoints
    getTenantResidences: build.query<Lease[], string>({
      query: (cognitoId) => `/tenants/${cognitoId}/residences`,
      providesTags: ["Residences"],
    }),
    getLeasePayments: build.query<Payment[], number>({
      query: (leaseId) => `/tenants/leases/${leaseId}/payments`,
      providesTags: ["Payments"],
    }),

    // Manager endpoints
    getManager: build.query<Manager, string>({
      query: (cognitoId) => `/managers/${cognitoId}`,
      providesTags: ["Manager"],
    }),
    updateManager: build.mutation<Manager, { cognitoId: string; data: Partial<Manager> }>({
      query: ({ cognitoId, data }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Manager"],
    }),

    // Manager Properties endpoints
    getManagerProperties: build.query<Property[], string>({
      query: (cognitoId) => `/managers/${cognitoId}/properties`,
      providesTags: ["Properties"],
    }),
    getPropertyById: build.query<Property, number>({
      query: (propertyId) => `/managers/properties/${propertyId}`,
      providesTags: ["Properties"],
    }),
    createProperty: build.mutation<Property, {
      manager_cognito_id: string;
      name: string;
      description: string;
      price_per_month: number;
      security_deposit: number;
      application_fee: number;
      photo_urls?: string[];
      amenities?: string[];
      highlights?: string[];
      is_pets_allowed?: boolean;
      is_parking_included?: boolean;
      beds: number;
      baths: number;
      square_feet: number;
      property_type: string;
      location: {
        address: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
        coordinates?: any;
      };
    }>({
      query: (data) => ({
        url: `/managers/properties`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Properties"],
    }),
    updateProperty: build.mutation<Property, { propertyId: number; data: Partial<Property> }>({
      query: ({ propertyId, data }) => ({
        url: `/managers/properties/${propertyId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Properties"],
    }),
    deleteProperty: build.mutation<{ message: string }, number>({
      query: (propertyId) => ({
        url: `/managers/properties/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Properties"],
    }),

    // Manager Applications endpoints
    getManagerApplications: build.query<Application[], string>({
      query: (cognitoId) => `/managers/${cognitoId}/applications`,
      providesTags: ["Applications"],
    }),
    updateApplicationStatus: build.mutation<Application, { applicationId: number; status: 'Approved' | 'Denied' | 'Pending' }>({
      query: ({ applicationId, status }) => ({
        url: `/managers/applications/${applicationId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications"],
    }),
    createLeaseForApplication: build.mutation<Lease, {
      applicationId: number;
      start_date: string;
      end_date: string;
      rent: number;
      deposit: number;
    }>({
      query: ({ applicationId, ...data }) => ({
        url: `/managers/applications/${applicationId}/lease`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Applications", "Residences"],
    }),
  }),
});

export const {
  useGetTenantQuery,
  useUpdateTenantMutation,
  useGetTenantApplicationsQuery,
  useCreateApplicationMutation,
  useGetTenantFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetTenantResidencesQuery,
  useGetLeasePaymentsQuery,
  useGetManagerQuery,
  useUpdateManagerMutation,
  useGetManagerPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetManagerApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateLeaseForApplicationMutation,
} = api;
