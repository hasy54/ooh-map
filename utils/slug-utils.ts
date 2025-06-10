import type { OOHListing } from "../types/ooh"

/**
 * Legacy function for backward compatibility
 */
export function getIdFromSlug(slug: string): string | null {
  return slug // Just return the slug as ID for now
}

/**
 * Simple slug generation for basic use
 */
export function generateListingSlug(listing: OOHListing): string {
  return listing.id // Just use the ID as slug
}

/**
 * Simple listing finder by ID
 */
export function findListingBySlug(slug: string, listings: OOHListing[]): OOHListing | null {
  return listings.find((listing) => listing.id === slug) || null
}
