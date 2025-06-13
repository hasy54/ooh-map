import Link from "next/link"
import { client, listingsQuery } from "../../lib/sanity"
import Image from "next/image"

export const revalidate = 60 // revalidate this page every 60 seconds

export default async function ListingsPage() {
  const listings = await client.fetch(listingsQuery)

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">OOH Listings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing: any) => (
          <div key={listing._id} className="border rounded-lg overflow-hidden shadow-md">
            {listing.mainImage && (
              <div className="relative h-48 w-full">
                <Image src={listing.imageUrl || "/placeholder.svg"} alt={listing.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
              <p className="text-gray-600 mb-2">{listing.address}</p>
              <p className="text-gray-600 mb-2">
                {listing.city}, {listing.state}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{listing.mediaType}</span>
                <span className="font-bold">${listing.price?.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex justify-between">
                <Link href={`/listing/${listing.slug.current}`} className="text-blue-600 hover:underline">
                  View Details
                </Link>
                <Link
                  href={`/?lat=${listing.lat}&lng=${listing.lng}&zoom=15`}
                  className="text-green-600 hover:underline"
                >
                  View on Map
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
