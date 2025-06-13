import { client, listingBySlugQuery, urlFor } from "@/lib/sanity"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const listing = await client.fetch(listingBySlugQuery, { slug: params.slug })

    if (!listing) {
      return {
        title: "Listing Not Found",
        description: "The requested listing could not be found.",
      }
    }

    return {
      title: listing.title,
      description: listing.excerpt || `${listing.title} - OOH Advertising Listing`,
      openGraph: listing.mainImage
        ? {
            images: [urlFor(listing.mainImage).width(1200).height(630).url()],
          }
        : undefined,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "OOH Listing",
      description: "Out-of-home advertising listing",
    }
  }
}

export default async function ListingPage({ params }: { params: { slug: string } }) {
  let listing

  try {
    listing = await client.fetch(listingBySlugQuery, { slug: params.slug })
  } catch (error) {
    console.error("Error fetching listing:", error)
  }

  if (!listing) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/listing" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Listings
        </Link>

        <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>

        {listing.location && (
          <div className="text-gray-600 mb-6">
            {listing.location.address && <p>{listing.location.address}</p>}
            <p>
              {listing.location.city}
              {listing.location.state && `, ${listing.location.state}`}
            </p>
          </div>
        )}

        {listing.mainImage && (
          <div className="mb-8">
            <img
              src={urlFor(listing.mainImage).width(800).height(500).url() || "/placeholder.svg"}
              alt={listing.title}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        {listing.excerpt && <div className="text-lg text-gray-700 mb-6">{listing.excerpt}</div>}

        {listing.body && (
          <div className="prose max-w-none mb-8">
            {/* In a real implementation, you would use a PortableText component here */}
            <div dangerouslySetInnerHTML={{ __html: listing.body }} />
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-8">
          {listing.mediaType && <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">{listing.mediaType}</div>}
          {listing.price && <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">₹{listing.price}/month</div>}
          {listing.available !== undefined && (
            <div
              className={`px-3 py-1 rounded-full text-sm ${listing.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {listing.available ? "Available" : "Booked"}
            </div>
          )}
        </div>

        {listing.location?.lat && listing.location?.lng && (
          <div className="mt-8">
            <Link
              href={`/?lat=${listing.location.lat}&lng=${listing.location.lng}&zoom=15`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              View on Interactive Map
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
