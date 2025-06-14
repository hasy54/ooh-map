import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      ooh_listings: {
        Row: {
          id: string
          name: string
          type: "Billboard" | "Digital Display" | "Transit" | "Street Furniture" | "Mall Display"
          latitude: number
          longitude: number
          address: string
          city: string
          state: string
          size: string
          illumination: "Lit" | "Non-lit" | "Digital"
          visibility: "High" | "Medium" | "Low"
          traffic: string
          monthly_price: number
          currency: string
          availability: "Available" | "Booked" | "Maintenance"
          description: string | null
          images: string[] | null
          features: string[] | null
          footfall: string | null
          target_audience: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: "Billboard" | "Digital Display" | "Transit" | "Street Furniture" | "Mall Display"
          latitude: number
          longitude: number
          address: string
          city: string
          state: string
          size: string
          illumination: "Lit" | "Non-lit" | "Digital"
          visibility: "High" | "Medium" | "Low"
          traffic: string
          monthly_price: number
          currency?: string
          availability: "Available" | "Booked" | "Maintenance"
          description?: string | null
          images?: string[] | null
          features?: string[] | null
          footfall?: string | null
          target_audience?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: "Billboard" | "Digital Display" | "Transit" | "Street Furniture" | "Mall Display"
          latitude?: number
          longitude?: number
          address?: string
          city?: string
          state?: string
          size?: string
          illumination?: "Lit" | "Non-lit" | "Digital"
          visibility?: "High" | "Medium" | "Low"
          traffic?: string
          monthly_price?: number
          currency?: string
          availability?: "Available" | "Booked" | "Maintenance"
          description?: string | null
          images?: string[] | null
          features?: string[] | null
          footfall?: string | null
          target_audience?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          name: string
          type: string
          price: number | null
          availability: boolean | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          code: string | null
          subtype: string | null
          geolocation: { address?: string } | null
          width: number | null
          height: number | null
          city: string | null
          traffic: string | null
          image_urls: string[] | null
          available_date: string | null
          long: string | null
          lat: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          price?: number | null
          availability?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          code?: string | null
          subtype?: string | null
          geolocation?: { address?: string } | null
          width?: number | null
          height?: number | null
          city?: string | null
          traffic?: string | null
          image_urls?: string[] | null
          available_date?: string | null
          long?: string | null
          lat?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          price?: number | null
          availability?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          code?: string | null
          subtype?: string | null
          geolocation?: { address?: string } | null
          width?: number | null
          height?: number | null
          city?: string | null
          traffic?: string | null
          image_urls?: string[] | null
          available_date?: string | null
          long?: string | null
          lat?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          start_date: string
          end_date: string
          client_name: string
          client_email: string
          booking_price: number
          status: "pending" | "confirmed" | "cancelled"
          created_at: string | null
          updated_at: string | null
          media_id: any | null // JSONB
          period: number | null
          booker: string | null
          proposal_id: string | null
          code: number | null
        }
        Insert: {
          id?: string
          start_date: string
          end_date: string
          client_name: string
          client_email: string
          booking_price: number
          status: "pending" | "confirmed" | "cancelled"
          created_at?: string | null
          updated_at?: string | null
          media_id?: any | null
          period?: number | null
          booker?: string | null
          proposal_id?: string | null
          code?: number | null
        }
        Update: {
          id?: string
          start_date?: string
          end_date?: string
          client_name?: string
          client_email?: string
          booking_price?: number
          status?: "pending" | "confirmed" | "cancelled"
          created_at?: string | null
          updated_at?: string | null
          media_id?: any | null
          period?: number | null
          booker?: string | null
          proposal_id?: string | null
          code?: number | null
        }
      }
      users: {
        Row: {
          user_id: string
          name: string | null
          email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          name?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          name?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
