import type { OOHListing } from "../types/ooh"

/**
 * Legacy function for backward compatibility
 */
export function getIdFromSlug(slug: string): string | null {
  return slug // Just return the slug as ID for now
}

/**
 * Generate a URL-friendly slug for a listing
 */
export function generateListingSlug(listing: OOHListing): string {
  // For demo listings, use the ID directly
  if (listing.id.startsWith("demo-")) {
    return listing.id
  }

  // For real listings, create a slug from name and ID
  const nameSlug = listing.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()

  // Combine name slug with ID for uniqueness
  return `${nameSlug}-${listing.id.slice(0, 8)}`
}

/**
 * Simple listing finder by ID
 */
export function findListingBySlug(slug: string, listings: OOHListing[]): OOHListing | null {
  return listings.find((listing) => listing.id === slug) || null
}
