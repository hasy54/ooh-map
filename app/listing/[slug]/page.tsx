import { client, urlFor } from "@/lib/sanity"
import { listingBySlugQuery } from "@/lib/sanity"
import { PortableText } from "@portabletext/react"
import Link from "next/link"
import { MapPin, Calendar, DollarSign, ArrowLeft, ExternalLink } from "lucide-react"
import type { Metadata } from "next"

interface Listing {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  content?: any[]
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
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

async function getListing(slug: string): Promise<Listing | null> {
  return await client.fetch(listingBySlugQuery, { slug })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const listing = await getListing(params.slug)

  if (!listing) {
    return {
      title: "Listing Not Found",
    }
  }

  return {
    title: listing.seo?.metaTitle || listing.title,
    description: listing.seo?.metaDescription || listing.description,
    keywords: listing.seo?.keywords?.join(", "),
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: listing.featuredImage ? [urlFor(listing.featuredImage).width(1200).height(630).url()] : [],
    },
  }
}

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const listing = await getListing(params.slug)

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <Link href="/listing" className="text-blue-600 hover:text-blue-700">
            ← Back to Listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/listing" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Listings
          </Link>
        </div>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {listing.featuredImage && (
            <div className="aspect-video relative overflow-hidden">
              <img
                src={urlFor(listing.featuredImage).width(800).height(450).url() || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              {listing.mediaType && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                  {listing.mediaType}
                </span>
              )}
              {listing.availability && (
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    listing.availability === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {listing.availability}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>

            {listing.description && <p className="text-lg text-gray-600 mb-6">{listing.description}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                {listing.location?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-gray-600">
                        {listing.location.address}
                        {listing.location.city && (
                          <>
                            <br />
                            {listing.location.city}
                          </>
                        )}
                        {listing.location.state && `, ${listing.location.state}`}
                      </p>
                    </div>
                  </div>
                )}

                {listing.price && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Monthly Rate</p>
                      <p className="text-gray-600">₹{listing.price.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Published</p>
                    <p className="text-gray-600">{new Date(listing.publishedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {listing.location?.coordinates && (
                  <div className="pt-4">
                    <Link
                      href={`/?lat=${listing.location.coordinates.lat}&lng=${listing.location.coordinates.lng}&zoom=15`}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Interactive Map
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {listing.content && listing.content.length > 0 && (
              <div className="prose prose-lg max-w-none">
                <PortableText value={listing.content} />
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
