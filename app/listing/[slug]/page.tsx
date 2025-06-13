import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { client, listingBySlugQuery, urlFor } from "@/lib/sanity"

export const revalidate = 60 // Revalidate every 60 seconds

async function getListing(slug: string) {
  try {
    return await client.fetch(listingBySlugQuery, { slug })
  } catch (error) {
    console.error("Error fetching listing:", error)
    return null
  }
}

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const listing = await getListing(params.slug)

  if (!listing) {
    notFound()
  }

  // Create map URL with coordinates if available
  const mapUrl =
    listing.location?.lat && listing.location?.lng
      ? `/?lat=${listing.location.lat}&lng=${listing.location.lng}&zoom=15`
      : "/"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/listing" className="text-blue-600 hover:underline flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Main image */}
        {listing.mainImage && (
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={urlFor(listing.mainImage).url() || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
            />
            {listing.availability && (
              <span
                className={`absolute top-4 right-4 px-3 py-1 text-sm font-medium rounded ${
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

        {/* Content */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {listing.mediaType && (
              <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                {listing.mediaType.charAt(0).toUpperCase() + listing.mediaType.slice(1).replace("_", " ")}
              </span>
            )}
            {listing.price && (
              <span className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-medium text-blue-700">
                ₹{listing.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Location */}
          {listing.location && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <div className="text-gray-700">
                {listing.location.address && <p>{listing.location.address}</p>}
                {listing.location.city && listing.location.state && (
                  <p>
                    {listing.location.city}, {listing.location.state}
                  </p>
                )}
              </div>

              {/* View on Map button */}
              <Link
                href={mapUrl}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                View on Map
              </Link>
            </div>
          )}

          {/* Content */}
          {listing.content && (
            <div className="prose max-w-none mt-6">
              {/* Simple rendering of content - in a real app, you'd use PortableText */}
              <div className="text-gray-700">
                {typeof listing.content === "string" ? listing.content : "View detailed description in the admin panel"}
              </div>
            </div>
          )}

          {/* Gallery */}
          {listing.gallery && listing.gallery.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.gallery.map((image, index) => (
                  <div key={index} className="relative h-40 rounded-lg overflow-hidden">
                    <Image
                      src={urlFor(image).url() || "/placeholder.svg"}
                      alt={`${listing.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
