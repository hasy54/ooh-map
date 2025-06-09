import type { OOHListing } from "../types/ooh"

/**
 * Generates a URL-friendly slug from a listing without UUID
 */
export function generateListingSlug(listing: OOHListing): string {
  // Clean and normalize the name
  const cleanName = listing.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

  // Clean and normalize the type
  const cleanType = listing.type.toLowerCase().trim().replace(/\s+/g, "-")

  // Clean and normalize the illumination
  const cleanIllumination = listing.specifications.illumination.toLowerCase().trim().replace(/\s+/g, "-")

  // Combine them with hyphens
  const slug = `${cleanType}-${cleanIllumination}-${cleanName}`

  // Final cleanup
  return slug
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
}

/**
 * Find listing by slug with improved matching
 */
export function findListingBySlug(slug: string, listings: OOHListing[]): OOHListing | null {
  console.log("Looking for slug:", slug)
  console.log("Available listings count:", listings.length)

  // First try exact match
  for (const listing of listings) {
    const generatedSlug = generateListingSlug(listing)
    console.log(`Comparing "${slug}" with "${generatedSlug}" for listing: ${listing.name}`)

    if (generatedSlug === slug) {
      console.log("Found exact match!")
      return listing
    }
  }

  // If no exact match, try partial matching
  console.log("No exact match found, trying partial matching...")

  const slugParts = slug.split("-").filter((part) => part.length > 0)
  let bestMatch: { listing: OOHListing; score: number } | null = null

  for (const listing of listings) {
    const generatedSlug = generateListingSlug(listing)
    const listingParts = generatedSlug.split("-").filter((part) => part.length > 0)

    // Calculate match score
    let score = 0
    for (const part of slugParts) {
      if (listingParts.includes(part)) {
        score++
      }
    }

    // Normalize score by total parts
    const normalizedScore = score / Math.max(slugParts.length, listingParts.length)

    console.log(`Listing "${listing.name}" score: ${score}/${slugParts.length} (${normalizedScore})`)

    if (normalizedScore > 0.6 && (!bestMatch || normalizedScore > bestMatch.score)) {
      bestMatch = { listing, score: normalizedScore }
    }
  }

  if (bestMatch) {
    console.log("Found partial match:", bestMatch.listing.name)
    return bestMatch.listing
  }

  console.log("No match found")
  return null
}

/**
 * Legacy function for backward compatibility
 */
export function getIdFromSlug(slug: string): string | null {
  return null
}
