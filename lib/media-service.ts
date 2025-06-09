import { supabase } from "./supabase"
import type { Database } from "./supabase"
import type { OOHListing } from "../types/ooh"

type MediaRow = Database["public"]["Tables"]["media"]["Row"]

async function convertToOOHListing(row: MediaRow): Promise<OOHListing> {
  // Parse coordinates directly without validation
  let coordinates = { lat: 19.076, lng: 72.8777 } // Default to Mumbai center

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
      state: "",
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
      let query = supabase.from("media").select("*")

      // Remove city filter - we'll fetch all and filter client-side
      // if (filters?.city && filters.city !== "all") {
      //   query = query.eq("city", filters.city)
      // }

      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type)
      }

      if (filters?.availability && filters.availability !== "all") {
        // Convert string availability to boolean
        const isAvailable = filters.availability === "Available"
        query = query.eq("availability", isAvailable)
      }

      if (filters?.illumination && filters.illumination !== "all") {
        // Map illumination to subtype
        let subtype = ""
        if (filters.illumination === "Digital") subtype = "Digital"
        else if (filters.illumination === "Lit") subtype = "Backlit"
        else if (filters.illumination === "Non-lit") subtype = "Static"

        if (subtype) {
          query = query.eq("subtype", subtype)
        }
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice)
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice)
      }

      if (filters?.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,geolocation->>address.ilike.%${filters.searchQuery}%`)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching listings:", error)
        throw error
      }

      const allListings = await Promise.all((data || []).map(convertToOOHListing))

      // Client-side filtering for Indian bounds and valid coordinates
      const filteredListings = allListings.filter((listing) => {
        // Check if coordinates exist and are valid
        if (!listing.location.lat || !listing.location.lng) {
          return false
        }

        // Check if coordinates are within Indian bounds
        // India bounds: lat 6.4 to 37.6, lng 68.7 to 97.25
        const lat = listing.location.lat
        const lng = listing.location.lng

        const isInIndiaBounds = lat >= 6.4 && lat <= 37.6 && lng >= 68.7 && lng <= 97.25

        if (!isInIndiaBounds) {
          console.log(`Filtering out listing "${listing.name}" - coordinates outside India bounds: ${lat}, ${lng}`)
          return false
        }

        // Apply city filter client-side if specified
        if (filters?.city && filters.city !== "all") {
          const cityMatch = listing.location.city.toLowerCase() === filters.city.toLowerCase()
          if (!cityMatch) {
            return false
          }
        }

        return true
      })

      console.log(
        `Fetched ${allListings.length} total listings, filtered to ${filteredListings.length} valid listings in India`,
      )

      return filteredListings
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

  // Get listings count for pagination
  static async getListingsCount(filters?: {
    city?: string
    type?: string
    availability?: string
    illumination?: string
    minPrice?: number
    maxPrice?: number
    searchQuery?: string
  }): Promise<number> {
    try {
      // For accurate count, we need to fetch all and filter client-side
      const allListings = await this.getListings(filters)
      return allListings.length
    } catch (error) {
      console.error("Error in getListingsCount:", error)
      return 0
    }
  }

  // Get paginated listings
  static async getPaginatedListings(
    page = 0,
    limit = 100,
    filters?: {
      city?: string
      type?: string
      availability?: string
      illumination?: string
      minPrice?: number
      maxPrice?: number
      searchQuery?: string
    },
  ): Promise<OOHListing[]> {
    try {
      let query = supabase.from("media").select("*")

      // Remove city filter - we'll fetch all and filter client-side
      // if (filters?.city && filters.city !== "all") {
      //   query = query.eq("city", filters.city)
      // }

      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type)
      }

      if (filters?.availability && filters.availability !== "all") {
        const isAvailable = filters.availability === "Available"
        query = query.eq("availability", isAvailable)
      }

      if (filters?.illumination && filters.illumination !== "all") {
        let subtype = ""
        if (filters.illumination === "Digital") subtype = "Digital"
        else if (filters.illumination === "Lit") subtype = "Backlit"
        else if (filters.illumination === "Non-lit") subtype = "Static"

        if (subtype) {
          query = query.eq("subtype", subtype)
        }
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice)
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice)
      }

      if (filters?.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,geolocation->>address.ilike.%${filters.searchQuery}%`)
      }

      // For pagination, we need to fetch more than needed and then filter
      // This is less efficient but ensures we get valid results
      const fetchLimit = limit * 3 // Fetch 3x more to account for filtering
      const from = page * fetchLimit
      const to = from + fetchLimit - 1

      const { data, error } = await query.order("created_at", { ascending: false }).range(from, to)

      if (error) {
        console.error("Error fetching paginated listings:", error)
        throw error
      }

      const allListings = await Promise.all((data || []).map(convertToOOHListing))

      // Client-side filtering for Indian bounds and valid coordinates
      const filteredListings = allListings.filter((listing) => {
        // Check if coordinates exist and are valid
        if (!listing.location.lat || !listing.location.lng) {
          return false
        }

        // Check if coordinates are within Indian bounds
        const lat = listing.location.lat
        const lng = listing.location.lng

        const isInIndiaBounds = lat >= 6.4 && lat <= 37.6 && lng >= 68.7 && lng <= 97.25

        if (!isInIndiaBounds) {
          return false
        }

        // Apply city filter client-side if specified
        if (filters?.city && filters.city !== "all") {
          const cityMatch = listing.location.city.toLowerCase() === filters.city.toLowerCase()
          if (!cityMatch) {
            return false
          }
        }

        return true
      })

      // Return only the requested number of listings
      return filteredListings.slice(0, limit)
    } catch (error) {
      console.error("Error in getPaginatedListings:", error)
      return []
    }
  }
}
