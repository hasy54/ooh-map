import { client, listingsQuery } from "@/lib/sanity"
import Link from "next/link"
import { urlFor } from "@/lib/sanity"
import { MapPin, Calendar, DollarSign } from "lucide-react"

export const metadata = {
  title: "OOH Listings",
  description: "Browse our out-of-home advertising listings",
}

interface Listing {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  mainImage?: any
  location?: {
    address?: string
    city?: string
    state?: string
    lat?: number
    lng?: number
  }
  mediaType?: string
  price?: number
  availability?: string
  publishedAt: string
}

async function getListings(): Promise<Listing[]> {
  return await client.fetch(listingsQuery)
}

export default async function ListingsPage() {
  // Add error handling for Sanity client
  let listings = []
  try {
    listings = await client.fetch(listingsQuery)
  } catch (error) {
    console.error("Error fetching listings from Sanity:", error)
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">OOH Listings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>No listings found. Please add some listings in the Sanity Studio.</p>
          <p className="mt-4">
            <Link href="/admin" className="text-blue-600 hover:underline">
              Go to Sanity Studio
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">OOH Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing: Listing) => (
          <div key={listing._id} className="bg-white rounded-lg shadow overflow-hidden">
            {listing.mainImage && (
              <div className="h-48 overflow-hidden">
                <img
                  src={urlFor(listing.mainImage).width(400).height(225).url() || "/placeholder.svg"}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/listing/${listing.slug.current}`} className="hover:text-blue-600 transition-colors">
                  {listing.title}
                </Link>
              </h2>
              {listing.description && <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>}

              <div className="space-y-2 mb-4">
                {listing.location?.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {listing.location.city}
                      {listing.location.state && `, ${listing.location.state}`}
                    </span>
                  </div>
                )}

                {listing.price && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    <span>₹{listing.price.toLocaleString()}/month</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(listing.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Link href={`/listing/${listing.slug.current}`} className="text-blue-600 hover:underline">
                  View Details
                </Link>
                {listing.location?.lat && listing.location?.lng && (
                  <Link
                    href={`/?lat=${listing.location.lat}&lng=${listing.location.lng}&zoom=15`}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    View on Map
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
