import { supabase } from "./supabase"
import type { Database } from "./supabase"
import type { OOHListing } from "../types/ooh"

type MediaRow = Database["public"]["Tables"]["media"]["Row"]

async function convertToOOHListing(row: MediaRow): Promise<OOHListing> {
  // Parse coordinates directly without validation
  // Default coordinates if parsing fails
  let coordinates = { lat: 0, lng: 0 }

  // Try parsing from lat/long fields
  if (row.lat && row.long) {
    try {
      const lat = typeof row.lat === "string" ? Number.parseFloat(row.lat.trim()) : row.lat
      const lng = typeof row.long === "string" ? Number.parseFloat(row.long.trim()) : row.long

      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = { lat, lng }
      }
    } catch (error) {
      console.warn("Error parsing coordinates:", error)
    }
  }

  // Fetch user name if user_id exists
  let managedBy = null
  if (row.user_id) {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("name")
        .eq("user_id", row.user_id)
        .single()

      if (!userError && userData) {
        managedBy = userData.name
      }
    } catch (error) {
      console.warn("Error fetching user data:", error)
    }
  }

  // Check if image_urls is null, undefined, empty array, or contains only empty strings
  const hasValidImages =
    row.image_urls &&
    Array.isArray(row.image_urls) &&
    row.image_urls.length > 0 &&
    row.image_urls.some((url) => url && url.trim() !== "")

  return {
    id: row.id,
    name: row.name,
    type: row.type as any,
    location: {
      lat: coordinates.lat,
      lng: coordinates.lng,
      address: row.geolocation?.address || "",
      city: row.city || "",
      state: row.States || "", // Changed from row.state to row.States
    },
    specifications: {
      size: `${row.width || 0}ft x ${row.height || 0}ft`,
      illumination: row.subtype === "Digital" ? "Digital" : row.subtype === "Backlit" ? "Lit" : "Non-lit",
      visibility: "High",
      traffic: row.traffic || "",
    },
    pricing: {
      monthly: row.price || 0,
      currency: "INR",
    },
    availability: row.availability ? "Available" : "Booked",
    images: hasValidImages ? row.image_urls : [],
    description: "",
    features: [],
    demographics: {
      footfall: row.traffic || "",
      targetAudience: "",
    },
    managedBy: managedBy,
  }
}

export class MediaService {
  // Get all listings - no filters, no limits
  static async getListings(): Promise<OOHListing[]> {
    try {
      console.log("Fetching ALL listings from database...")

      // First, get the total count
      const { count, error: countError } = await supabase.from("media").select("*", { count: "exact", head: true })

      if (countError) {
        console.error("Error getting count:", countError)
      } else {
        console.log(`Total records in database: ${count}`)
      }

      // Fetch all records in batches to avoid memory issues
      const allListings: MediaRow[] = []
      const batchSize = 1000
      let from = 0
      let hasMore = true

      while (hasMore) {
        console.log(`Fetching batch from ${from} to ${from + batchSize - 1}`)

        const { data, error } = await supabase
          .from("media")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1)

        if (error) {
          console.error("Error fetching batch:", error)
          throw error
        }

        if (data && data.length > 0) {
          allListings.push(...data)
          console.log(`Fetched ${data.length} records, total so far: ${allListings.length}`)

          // If we got less than the batch size, we're done
          if (data.length < batchSize) {
            hasMore = false
          } else {
            from += batchSize
          }
        } else {
          hasMore = false
        }
      }

      console.log(`Total fetched: ${allListings.length} listings`)

      const convertedListings = await Promise.all(allListings.map(convertToOOHListing))

      console.log(`Converted ${convertedListings.length} listings`)

      // Return all listings without any filtering
      return convertedListings
    } catch (error) {
      console.error("Error in getListings:", error)
      return []
    }
  }

  // Get a single listing by ID
  static async getListing(id: string): Promise<OOHListing | null> {
    try {
      const { data, error } = await supabase.from("media").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching listing:", error)
        return null
      }

      return await convertToOOHListing(data)
    } catch (error) {
      console.error("Error in getListing:", error)
      return null
    }
  }

  // Get listings by city - now returns all listings
  static async getListingsByCity(city: string): Promise<OOHListing[]> {
    return this.getListings()
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
        .from("media")
        .select("*")
        .gte("lat", bounds.south.toString())
        .lte("lat", bounds.north.toString())
        .gte("long", bounds.west.toString())
        .lte("long", bounds.east.toString())

      if (error) {
        console.error("Error fetching listings in bounds:", error)
        throw error
      }

      const listings = await Promise.all((data || []).map(convertToOOHListing))
      return listings
    } catch (error) {
      console.error("Error in getListingsInBounds:", error)
      return []
    }
  }

  // Create a new listing
  static async createListing(listing: Omit<OOHListing, "id">): Promise<OOHListing | null> {
    try {
      const { data, error } = await supabase
        .from("media")
        .insert({
          name: listing.name,
          type: listing.type,
          price: listing.pricing.monthly,
          availability: listing.availability === "Available",
          code: "", // Optional
          subtype:
            listing.specifications.illumination === "Digital"
              ? "Digital"
              : listing.specifications.illumination === "Lit"
                ? "Backlit"
                : "Static",
          geolocation: { address: listing.location.address },
          width: Number.parseInt(listing.specifications.size.split("x")[0]) || 0,
          height: Number.parseInt(listing.specifications.size.split("x")[1]) || 0,
          city: listing.location.city,
          States: listing.location.state, // Changed from state to States
          traffic: listing.specifications.traffic,
          image_urls: listing.images,
          lat: listing.location.lat.toString(),
          long: listing.location.lng.toString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating listing:", error)
        throw error
      }

      return await convertToOOHListing(data)
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
        if (updates.location.lat) updateData.lat = updates.location.lat.toString()
        if (updates.location.lng) updateData.long = updates.location.lng.toString()
        if (updates.location.address) {
          updateData.geolocation = {
            ...(updateData.geolocation || {}),
            address: updates.location.address,
          }
        }
        if (updates.location.city) updateData.city = updates.location.city
        if (updates.location.state) updateData.States = updates.location.state // Changed from state to States
      }

      if (updates.specifications) {
        if (updates.specifications.size) {
          const [width, height] = updates.specifications.size.split("x").map((dim) => Number.parseInt(dim.trim()) || 0)
          updateData.width = width
          updateData.height = height
        }
        if (updates.specifications.illumination) {
          updateData.subtype =
            updates.specifications.illumination === "Digital"
              ? "Digital"
              : updates.specifications.illumination === "Lit"
                ? "Backlit"
                : "Static"
        }
        if (updates.specifications.traffic) updateData.traffic = updates.specifications.traffic
      }

      if (updates.pricing?.monthly) updateData.price = updates.pricing.monthly

      if (updates.availability) updateData.availability = updates.availability === "Available"

      if (updates.images) updateData.image_urls = updates.images

      const { data, error } = await supabase.from("media").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Error updating listing:", error)
        throw error
      }

      return await convertToOOHListing(data)
    } catch (error) {
      console.error("Error in updateListing:", error)
      return null
    }
  }

  // Delete a listing
  static async deleteListing(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("media").delete().eq("id", id)

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
      const { data, error } = await supabase.from("media").select("city").not("city", "is", null).order("city")

      if (error) {
        console.error("Error fetching cities:", error)
        throw error
      }

      const uniqueCities = [...new Set(data.map((item) => item.city).filter(Boolean))]
      return uniqueCities as string[]
    } catch (error) {
      console.error("Error in getCities:", error)
      return []
    }
  }

  // Add a new method to get unique subtypes
  static async getSubtypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase.from("media").select("subtype").not("subtype", "is", null).order("subtype")

      if (error) {
        console.error("Error fetching subtypes:", error)
        throw error
      }

      const uniqueSubtypes = [...new Set(data.map((item) => item.subtype).filter(Boolean))]
      return uniqueSubtypes as string[]
    } catch (error) {
      console.error("Error in getSubtypes:", error)
      return []
    }
  }

  // Get filters data quickly (cities, types, price range)
  static async getFiltersData(): Promise<{
    cities: string[]
    types: string[]
    subtypes: string[]
    priceRange: { min: number; max: number }
  }> {
    try {
      // Run all filter queries in parallel for speed
      const [citiesResult, typesResult, subtypesResult, priceResult] = await Promise.all([
        supabase.from("media").select("city").not("city", "is", null),
        supabase.from("media").select("type").not("type", "is", null),
        supabase.from("media").select("subtype").not("subtype", "is", null),
        supabase.from("media").select("price").not("price", "is", null).order("price", { ascending: true }),
      ])

      const cities = [...new Set(citiesResult.data?.map((item) => item.city).filter(Boolean) || [])].sort()
      const types = [...new Set(typesResult.data?.map((item) => item.type).filter(Boolean) || [])].sort()
      const subtypes = [...new Set(subtypesResult.data?.map((item) => item.subtype).filter(Boolean) || [])].sort()

      const prices = priceResult.data?.map((item) => item.price).filter(Boolean) || []
      const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 300000,
      }

      return { cities, types, subtypes, priceRange }
    } catch (error) {
      console.error("Error fetching filters data:", error)
      return { cities: [], types: [], subtypes: [], priceRange: { min: 0, max: 300000 } }
    }
  }

  // Get listings count - no filters
  static async getListingsCount(): Promise<number> {
    try {
      const { count, error } = await supabase.from("media").select("*", { count: "exact", head: true })

      if (error) {
        console.error("Error in getListingsCount:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Error in getListingsCount:", error)
      return 0
    }
  }

  // Get paginated listings - no filters
  static async getPaginatedListings(page = 0, limit = 100): Promise<OOHListing[]> {
    try {
      // Calculate the range for this page
      const from = page * limit
      const to = from + limit - 1

      console.log(`Fetching paginated listings: page ${page}, from ${from} to ${to}`)

      const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) {
        console.error("Error fetching paginated listings:", error)
        throw error
      }

      console.log(`Fetched ${data?.length || 0} listings for page ${page}`)

      const allListings = await Promise.all((data || []).map(convertToOOHListing))

      // Return all listings without coordinate filtering
      return allListings
    } catch (error) {
      console.error("Error in getPaginatedListings:", error)
      return []
    }
  }
}
