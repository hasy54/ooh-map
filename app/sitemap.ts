import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.oohindia.in"

  // List of cities
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "All Cities"]

  // List of ad types
  const adTypes = ["Billboard", "Bus Shelter", "Digital Display", "Transit", "Mall Media"]

  // Generate city pages
  const cityPages = cities.map((city) => ({
    url: `${baseUrl}?city=${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  // Generate ad type pages for each city
  const adTypePages = cities.flatMap((city) =>
    adTypes.map((type) => ({
      url: `${baseUrl}?city=${encodeURIComponent(city)}&type=${encodeURIComponent(type)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  )

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...cityPages,
    ...adTypePages,
  ]
}
