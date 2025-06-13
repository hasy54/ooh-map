import { createClient } from "next-sanity"

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: "production",
  apiVersion: "2023-05-03",
  useCdn: false,
})

export const listingsQuery = `*[_type == "listing"] {
  _id,
  title,
  slug,
  description,
  mainImage,
  address,
  city,
  state,
  lat,
  lng,
  mediaType,
  price,
  available,
  publishedAt,
  "imageUrl": mainImage.asset->url
}`

export const listingBySlugQuery = `*[_type == "listing" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  mainImage,
  address,
  city,
  state,
  lat,
  lng,
  mediaType,
  price,
  available,
  publishedAt,
  seo,
  "imageUrl": mainImage.asset->url
}`
