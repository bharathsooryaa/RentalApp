// Supabase Generated Types
export type Highlight = 
  | 'HighSpeedInternetAccess'
  | 'WasherDryer'
  | 'AirConditioning'
  | 'Heating'
  | 'SmokeFree'
  | 'CableReady'
  | 'SatelliteTV'
  | 'DoubleVanities'
  | 'TubShower'
  | 'Intercom'
  | 'SprinklerSystem'
  | 'RecentlyRenovated'
  | 'CloseToTransit'
  | 'GreatView'
  | 'QuietNeighborhood'

export type Amenity = 
  | 'WasherDryer'
  | 'AirConditioning'
  | 'Dishwasher'
  | 'HighSpeedInternet'
  | 'HardwoodFloors'
  | 'WalkInClosets'
  | 'Microwave'
  | 'Refrigerator'
  | 'Pool'
  | 'Gym'
  | 'Parking'
  | 'PetsAllowed'
  | 'WiFi'

export type PropertyType = 
  | 'Rooms'
  | 'Tinyhouse'
  | 'Apartment'
  | 'Villa'
  | 'Townhouse'
  | 'Cottage'

export type ApplicationStatus = 
  | 'Pending'
  | 'Denied'
  | 'Approved'

export type PaymentStatus = 
  | 'Pending'
  | 'Paid'
  | 'PartiallyPaid'
  | 'Overdue'

// Database Table Types
export interface Location {
  id: number
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  coordinates: string | null // geography(Point, 4326)
}

export interface Manager {
  id: number
  cognito_id: string
  name: string
  email: string
  phone_number: string
}

export interface Tenant {
  id: number
  cognito_id: string
  name: string
  email: string
  phone_number: string
}

export interface Property {
  id: number
  name: string
  description: string
  price_per_month: number
  security_deposit: number
  application_fee: number
  photo_urls: string[]
  amenities: Amenity[]
  highlights: Highlight[]
  is_pets_allowed: boolean
  is_parking_included: boolean
  beds: number
  baths: number
  square_feet: number
  property_type: PropertyType
  posted_date: string
  average_rating: number | null
  number_of_reviews: number | null
  location_id: number
  manager_cognito_id: string
}

export interface Lease {
  id: number
  start_date: string
  end_date: string
  rent: number
  deposit: number
  property_id: number
  tenant_cognito_id: string
}

export interface Application {
  id: number
  application_date: string
  status: ApplicationStatus
  property_id: number
  tenant_cognito_id: string
  name: string
  email: string
  phone_number: string
  message: string | null
  lease_id: number | null
}

export interface Payment {
  id: number
  amount_due: number
  amount_paid: number
  due_date: string
  payment_date: string
  payment_status: PaymentStatus
  lease_id: number
}

export interface TenantFavorite {
  id: number
  tenant_cognito_id: string
  property_id: number
  created_at: string
}

export interface TenantProperty {
  id: number
  tenant_cognito_id: string
  property_id: number
  created_at: string
}

// Database Response Types
export type Database = {
  public: {
    Tables: {
      location: {
        Row: Location
        Insert: Omit<Location, 'id'>
        Update: Partial<Omit<Location, 'id'>>
      }
      manager: {
        Row: Manager
        Insert: Omit<Manager, 'id'>
        Update: Partial<Omit<Manager, 'id'>>
      }
      tenant: {
        Row: Tenant
        Insert: Omit<Tenant, 'id'>
        Update: Partial<Omit<Tenant, 'id'>>
      }
      property: {
        Row: Property
        Insert: Omit<Property, 'id' | 'posted_date' | 'average_rating' | 'number_of_reviews'>
        Update: Partial<Omit<Property, 'id'>>
      }
      lease: {
        Row: Lease
        Insert: Omit<Lease, 'id'>
        Update: Partial<Omit<Lease, 'id'>>
      }
      application: {
        Row: Application
        Insert: Omit<Application, 'id'>
        Update: Partial<Omit<Application, 'id'>>
      }
      payment: {
        Row: Payment
        Insert: Omit<Payment, 'id'>
        Update: Partial<Omit<Payment, 'id'>>
      }
      tenant_favorites: {
        Row: TenantFavorite
        Insert: Omit<TenantFavorite, 'id' | 'created_at'>
        Update: Partial<Omit<TenantFavorite, 'id'>>
      }
      tenant_properties: {
        Row: TenantProperty
        Insert: Omit<TenantProperty, 'id' | 'created_at'>
        Update: Partial<Omit<TenantProperty, 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      highlight: Highlight
      amenity: Amenity
      property_type: PropertyType
      application_status: ApplicationStatus
      payment_status: PaymentStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}