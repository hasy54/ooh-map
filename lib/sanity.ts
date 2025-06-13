import { createClient } from "next-sanity"
import imageUrlBuilder from "@sanity/image-url"

// Hardcode a valid dataset name to avoid configuration issues
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ""
const dataset = "production" // Hardcoded to ensure validity

// Create the client
export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2023-05-03",
  useCdn: false,
})

// Create an image URL builder
const builder = imageUrlBuilder(client)

// Helper function to get image URLs
export function urlFor(source: any) {
  return builder.image(source)
}

// Export GROQ queries
export const listingsQuery = `*[_type == "listing"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  location,
  price,
  mediaType,
  availability
}`

export const listingBySlugQuery = `*[_type == "listing" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  content,
  mainImage,
  gallery,
  publishedAt,
  location,
  price,
  mediaType,
  availability,
  seo
}`
