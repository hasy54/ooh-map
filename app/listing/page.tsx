import Link from "next/link"
import Image from "next/image"
import { client, listingsQuery, urlFor } from "@/lib/sanity"

export const revalidate = 60 // Revalidate every 60 seconds

async function getListings() {
  try {
    return await client.fetch(listingsQuery)
  } catch (error) {
    console.error("Error fetching listings:", error)
    return []
  }
}

export default async function ListingsPage() {
  const listings = await getListings()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">OOH Listings</h1>

      {listings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No listings found. Create some in the admin panel.</p>
          <Link href="/admin" className="text-blue-600 hover:underline mt-4 inline-block">
            Go to Admin Panel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing._id}
              href={`/listing/${listing.slug.current}`}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {listing.mainImage && (
                <div className="relative h-48 w-full">
                  <Image
                    src={urlFor(listing.mainImage).url() || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                  {listing.availability && (
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${
                        listing.availability === "available"
                          ? "bg-green-100 text-green-800"
                          : listing.availability === "booked"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {listing.availability.charAt(0).toUpperCase() + listing.availability.slice(1)}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                {listing.excerpt && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.excerpt}</p>}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {listing.location?.city && listing.location?.state && (
                      <span>
                        {listing.location.city}, {listing.location.state}
                      </span>
                    )}
                  </div>
                  {listing.price && <div className="font-medium">₹{listing.price.toLocaleString()}</div>}
                </div>
                {listing.mediaType && (
                  <div className="mt-2">
                    <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                      {listing.mediaType.charAt(0).toUpperCase() + listing.mediaType.slice(1).replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
