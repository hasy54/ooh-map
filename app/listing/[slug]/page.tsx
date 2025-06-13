import { client, listingBySlugQuery } from "../../../lib/sanity"
import Image from "next/image"
import Link from "next/link"

export const revalidate = 60 // revalidate this page every 60 seconds

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const listing = await client.fetch(listingBySlugQuery, { slug: params.slug })

  if (!listing) {
    return <div className="container mx-auto py-10 px-4">Listing not found</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Link href="/listing" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Listings
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {listing.mainImage && (
            <div className="relative h-80 w-full rounded-lg overflow-hidden">
              <Image src={listing.imageUrl || "/placeholder.svg"} alt={listing.title} fill className="object-cover" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
          <div className="mb-6">
            <p className="text-gray-600">{listing.address}</p>
            <p className="text-gray-600">
              {listing.city}, {listing.state}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{listing.mediaType}</span>
            <span
              className={`${listing.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-3 py-1 rounded-full text-sm`}
            >
              {listing.available ? "Available" : "Not Available"}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">${listing.price?.toLocaleString()}</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{listing.description}</p>
          </div>

          <Link
            href={`/?lat=${listing.lat}&lng=${listing.lng}&zoom=15`}
            className="bg-green-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-green-700 transition-colors"
          >
            View on Map
          </Link>
        </div>
      </div>
    </div>
  )
}
