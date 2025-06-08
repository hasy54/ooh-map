import { supabase } from "./supabase"
import type { Database } from "./supabase"
import type { OOHListing } from "../types/ooh"

type OOHListingRow = Database["public"]["Tables"]["ooh_listings"]["Row"]

// Convert database row to OOHListing type
function convertToOOHListing(row: OOHListingRow): OOHListing {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    location: {
      lat: row.latitude,
      lng: row.longitude,
      address: row.address,
      city: row.city,
      state: row.state,
    },
    specifications: {
      size: row.size,
      illumination: row.illumination,
      visibility: row.visibility,
      traffic: row.traffic,
    },
    pricing: {
      monthly: row.monthly_price,
      currency: row.currency,
    },
    availability: row.availability,
    images: row.images || ["/placeholder.svg?height=300&width=400"],
    description: row.description || "",
    features: row.features || [],
    demographics: {
      footfall: row.footfall || "",
      targetAudience: row.target_audience || "",
    },
  }
}

export class OOHService {
  // Get all listings with optional filters
  static async getListings(filters?: {
    city?: string
    type?: string
    availability?: string
    illumination?: string
    minPrice?: number
    maxPrice?: number
    searchQuery?: string
  }): Promise<OOHListing[]> {
    try {
      let query = supabase.from("ooh_listings").select("*")

      // Apply filters
      if (filters?.city && filters.city !== "all") {
        query = query.eq("city", filters.city)
      }

      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type)
      }

      if (filters?.availability && filters.availability !== "all") {
        query = query.eq("availability", filters.availability)
      }

      if (filters?.illumination && filters.illumination !== "all") {
        query = query.eq("illumination", filters.illumination)
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte("monthly_price", filters.minPrice)
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("monthly_price", filters.maxPrice)
      }

      if (filters?.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%`)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching listings:", error)
        throw error
      }

      return data.map(convertToOOHListing)
    } catch (error) {
      console.error("Error in getListings:", error)
      return []
    }
  }

  // Get a single listing by ID
  static async getListing(id: string): Promise<OOHListing | null> {
    try {
      const { data, error } = await supabase.from("ooh_listings").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching listing:", error)
        return null
      }

      return convertToOOHListing(data)
    } catch (error) {
      console.error("Error in getListing:", error)
      return null
    }
  }

  // Get listings by city
  static async getListingsByCity(city: string): Promise<OOHListing[]> {
    return this.getListings({ city })
  }

  // Get listings within a geographic bounds
  static async getListingsInBounds(bounds: {
    north: number
    south: number
    east: number
    west: number
  }): Promise<OOHListing[]> {
    try {
      const { data, error } = await supabase
        .from("ooh_listings")
        .select("*")
        .gte("latitude", bounds.south)
        .lte("latitude", bounds.north)
        .gte("longitude", bounds.west)
        .lte("longitude", bounds.east)

      if (error) {
        console.error("Error fetching listings in bounds:", error)
        throw error
      }

      return data.map(convertToOOHListing)
    } catch (error) {
      console.error("Error in getListingsInBounds:", error)
      return []
    }
  }

  // Create a new listing
  static async createListing(listing: Omit<OOHListing, "id">): Promise<OOHListing | null> {
    try {
      const { data, error } = await supabase
        .from("ooh_listings")
        .insert({
          name: listing.name,
          type: listing.type,
          latitude: listing.location.lat,
          longitude: listing.location.lng,
          address: listing.location.address,
          city: listing.location.city,
          state: listing.location.state,
          size: listing.specifications.size,
          illumination: listing.specifications.illumination,
          visibility: listing.specifications.visibility,
          traffic: listing.specifications.traffic,
          monthly_price: listing.pricing.monthly,
          currency: listing.pricing.currency,
          availability: listing.availability,
          description: listing.description,
          images: listing.images,
          features: listing.features,
          footfall: listing.demographics.footfall,
          target_audience: listing.demographics.targetAudience,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating listing:", error)
        throw error
      }

      return convertToOOHListing(data)
    } catch (error) {
      console.error("Error in createListing:", error)
      return null
    }
  }

  // Update a listing
  static async updateListing(id: string, updates: Partial<OOHListing>): Promise<OOHListing | null> {
    try {
      const updateData: any = {}

      if (updates.name) updateData.name = updates.name
      if (updates.type) updateData.type = updates.type
      if (updates.location) {
        if (updates.location.lat) updateData.latitude = updates.location.lat
        if (updates.location.lng) updateData.longitude = updates.location.lng
        if (updates.location.address) updateData.address = updates.location.address
        if (updates.location.city) updateData.city = updates.location.city
        if (updates.location.state) updateData.state = updates.location.state
      }
      if (updates.specifications) {
        if (updates.specifications.size) updateData.size = updates.specifications.size
        if (updates.specifications.illumination) updateData.illumination = updates.specifications.illumination
        if (updates.specifications.visibility) updateData.visibility = updates.specifications.visibility
        if (updates.specifications.traffic) updateData.traffic = updates.specifications.traffic
      }
      if (updates.pricing) {
        if (updates.pricing.monthly) updateData.monthly_price = updates.pricing.monthly
        if (updates.pricing.currency) updateData.currency = updates.pricing.currency
      }
      if (updates.availability) updateData.availability = updates.availability
      if (updates.description) updateData.description = updates.description
      if (updates.images) updateData.images = updates.images
      if (updates.features) updateData.features = updates.features
      if (updates.demographics) {
        if (updates.demographics.footfall) updateData.footfall = updates.demographics.footfall
        if (updates.demographics.targetAudience) updateData.target_audience = updates.demographics.targetAudience
      }

      const { data, error } = await supabase.from("ooh_listings").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Error updating listing:", error)
        throw error
      }

      return convertToOOHListing(data)
    } catch (error) {
      console.error("Error in updateListing:", error)
      return null
    }
  }

  // Delete a listing
  static async deleteListing(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("ooh_listings").delete().eq("id", id)

      if (error) {
        console.error("Error deleting listing:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error in deleteListing:", error)
      return false
    }
  }

  // Get unique cities
  static async getCities(): Promise<string[]> {
    try {
      const { data, error } = await supabase.from("ooh_listings").select("city").order("city")

      if (error) {
        console.error("Error fetching cities:", error)
        throw error
      }

      const uniqueCities = [...new Set(data.map((item) => item.city))]
      return uniqueCities
    } catch (error) {
      console.error("Error in getCities:", error)
      return []
    }
  }
}
