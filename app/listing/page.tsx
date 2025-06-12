import { client } from "@/lib/sanity"
import { listingsQuery } from "@/lib/sanity"
import Link from "next/link"
import { urlFor } from "@/lib/sanity"
import { MapPin, Calendar, DollarSign } from "lucide-react"

interface Listing {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  featuredImage?: any
  location?: {
    address?: string
    city?: string
    state?: string
    coordinates?: {
      lat: number
      lng: number
    }
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
  const listings = await getListings()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OOH Advertising Listings</h1>
          <p className="text-lg text-gray-600">Discover premium outdoor advertising opportunities across India</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <article
              key={listing._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {listing.featuredImage && (
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={urlFor(listing.featuredImage).width(400).height(225).url() || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  {listing.mediaType && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {listing.mediaType}
                    </span>
                  )}
                  {listing.availability && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        listing.availability === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {listing.availability}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
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

                <div className="flex gap-2">
                  <Link
                    href={`/listing/${listing.slug.current}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    View Details
                  </Link>

                  {listing.location?.coordinates && (
                    <Link
                      href={`/?lat=${listing.location.coordinates.lat}&lng=${listing.location.coordinates.lng}&zoom=15`}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      View on Map
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings published yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
