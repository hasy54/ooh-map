import { createClient } from "next-sanity"
import imageUrlBuilder from "@sanity/image-url"

// Hardcode a valid dataset name to avoid configuration issues
// Sanity datasets must contain only lowercase letters, numbers, underscores, or dashes
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ""
const dataset = "production" // Hardcoded to ensure validity

if (!projectId) {
  console.warn("Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable")
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// GROQ queries
export const listingsQuery = `*[_type == "listing" && defined(slug.current)] | order(publishedAt desc)`

export const listingBySlugQuery = `*[_type == "listing" && slug.current == $slug][0]`
