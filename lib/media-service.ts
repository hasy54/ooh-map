import { supabase } from "./supabase"
import type { Database } from "./supabase"
import type { OOHListing } from "../types/ooh"

type MediaRow = Database["public"]["Tables"]["media"]["Row"]

// Coordinate validation and correction utilities
class CoordinateParser {
  // India bounds for validation
  static readonly INDIA_BOUNDS = {
    north: 37.6,
    south: 6.4,
    east: 97.25,
    west: 68.7,
  }

  // Parse and validate coordinates
  static parseCoordinates(lat: string | number, lng: string | number): { lat: number; lng: number } | null {
    try {
      let parsedLat = typeof lat === "string" ? Number.parseFloat(lat.trim()) : lat
      let parsedLng = typeof lng === "string" ? Number.parseFloat(lng.trim()) : lng

      // Handle invalid numbers
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        console.warn("Invalid coordinate format:", { lat, lng })
        return null
      }

      // Fix common coordinate swapping (if lat is in lng range and vice versa)
      if (this.isInLongitudeRange(parsedLat) && this.isInLatitudeRange(parsedLng)) {
        console.warn("Coordinates appear swapped, fixing:", { original: { lat: parsedLat, lng: parsedLng } })
        const temp = parsedLat
        parsedLat = parsedLng
        parsedLng = temp
      }

      // Fix decimal point issues (coordinates with too many or too few decimal places)
      parsedLat = this.fixDecimalPlaces(parsedLat, "latitude")
      parsedLng = this.fixDecimalPlaces(parsedLng, "longitude")

      // Validate coordinates are within India bounds
      if (!this.isValidIndiaCoordinate(parsedLat, parsedLng)) {
        console.warn("Coordinates outside India bounds:", { lat: parsedLat, lng: parsedLng })

        // Try to fix common issues
        const fixed = this.attemptCoordinateFix(parsedLat, parsedLng)
        if (fixed && this.isValidIndiaCoordinate(fixed.lat, fixed.lng)) {
          console.log("Fixed coordinates:", fixed)
          return fixed
        }

        return null
      }

      return { lat: parsedLat, lng: parsedLng }
    } catch (error) {
      console.error("Error parsing coordinates:", error, { lat, lng })
      return null
    }
  }

  // Check if coordinate is in valid India bounds
  static isValidIndiaCoordinate(lat: number, lng: number): boolean {
    return (
      lat >= this.INDIA_BOUNDS.south &&
      lat <= this.INDIA_BOUNDS.north &&
      lng >= this.INDIA_BOUNDS.west &&
      lng <= this.INDIA_BOUNDS.east
    )
  }

  // Check if value is in typical latitude range for India
  static isInLatitudeRange(value: number): boolean {
    return value >= this.INDIA_BOUNDS.south && value <= this.INDIA_BOUNDS.north
  }

  // Check if value is in typical longitude range for India
  static isInLongitudeRange(value: number): boolean {
    return value >= this.INDIA_BOUNDS.west && value <= this.INDIA_BOUNDS.east
  }

  // Fix decimal place issues
  static fixDecimalPlaces(coord: number, type: "latitude" | "longitude"): number {
    const coordStr = coord.toString()

    // If coordinate has no decimal places but should (like 1297 instead of 12.97)
    if (!coordStr.includes(".") && coordStr.length >= 4) {
      if (type === "latitude" && coordStr.length === 4) {
        // Convert 1297 to 12.97
        return Number.parseFloat(coordStr.substring(0, 2) + "." + coordStr.substring(2))
      }
      if (type === "longitude" && coordStr.length === 4) {
        // Convert 7759 to 77.59
        return Number.parseFloat(coordStr.substring(0, 2) + "." + coordStr.substring(2))
      }
      if (type === "longitude" && coordStr.length === 5) {
        // Convert 77594 to 77.594
        return Number.parseFloat(coordStr.substring(0, 2) + "." + coordStr.substring(2))
      }
    }

    // If coordinate has too many digits before decimal (like 1297.46 instead of 12.9746)
    if (coordStr.includes(".")) {
      const [whole, decimal] = coordStr.split(".")
      if (whole.length > 2 && type === "latitude") {
        // Convert 1297.46 to 12.9746
        return Number.parseFloat(whole.substring(0, 2) + "." + whole.substring(2) + decimal)
      }
      if (whole.length > 2 && type === "longitude") {
        // Convert 7759.46 to 77.5946
        return Number.parseFloat(whole.substring(0, 2) + "." + whole.substring(2) + decimal)
      }
    }

    return coord
  }

  // Attempt to fix common coordinate issues
  static attemptCoordinateFix(lat: number, lng: number): { lat: number; lng: number } | null {
    // Try dividing by 10 if coordinates are too large
    if (lat > 100 || lng > 100) {
      const fixedLat = lat / 10
      const fixedLng = lng / 10
      if (this.isValidIndiaCoordinate(fixedLat, fixedLng)) {
        return { lat: fixedLat, lng: fixedLng }
      }
    }

    // Try multiplying by 10 if coordinates are too small
    if (lat < 1 || lng < 1) {
      const fixedLat = lat * 10
      const fixedLng = lng * 10
      if (this.isValidIndiaCoordinate(fixedLat, fixedLng)) {
        return { lat: fixedLat, lng: fixedLng }
      }
    }

    // Try adding missing digits for common Indian coordinate patterns
    if (lat > 6 && lat < 38 && lng > 68 && lng < 98) {
      // Coordinates might be missing decimal precision
      return { lat, lng }
    }

    return null
  }

  // Parse coordinates from various string formats
  static parseFromString(coordString: string): { lat: number; lng: number } | null {
    if (!coordString || typeof coordString !== "string") return null

    // Remove common prefixes and clean the string
    const cleaned = coordString
      .replace(/[^\d.,\-\s]/g, "") // Remove non-numeric characters except comma, dot, dash, space
      .trim()

    // Try different parsing patterns
    const patterns = [
      /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/, // "12.34, 56.78" or "12.34 56.78"
      /^(-?\d+\.?\d*),(-?\d+\.?\d*)$/, // "12.34,56.78"
      /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/, // "12.34 56.78"
    ]

    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (match) {
        const lat = Number.parseFloat(match[1])
        const lng = Number.parseFloat(match[2])
        return this.parseCoordinates(lat, lng)
      }
    }

    return null
  }
}

async function convertToOOHListing(row: MediaRow): Promise<OOHListing> {
  // Parse and validate coordinates
  let coordinates = null

  // Try parsing from lat/long fields
  if (row.lat && row.long) {
    coordinates = CoordinateParser.parseCoordinates(row.lat, row.long)
  }

  // If that fails, try parsing from geolocation field if it contains coordinates
  if (!coordinates && row.geolocation) {
    const geoStr = typeof row.geolocation === "string" ? row.geolocation : JSON.stringify(row.geolocation)
    coordinates = CoordinateParser.parseFromString(geoStr)
  }

  // Default to Mumbai center if coordinates are invalid
  if (!coordinates) {
    console.warn(`Invalid coordinates for listing ${row.id}:`, { lat: row.lat, long: row.long })
    coordinates = { lat: 19.076, lng: 72.8777 } // Mumbai center
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

      // Filter out listings with missing coordinates
      query = query.not("lat", "is", null).not("long", "is", null).neq("lat", "").neq("long", "")

      // Apply filters
      if (filters?.city && filters.city !== "all") {
        query = query.eq("city", filters.city)
      }

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

      const listings = await Promise.all((data || []).map(convertToOOHListing))
      return listings
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
}
