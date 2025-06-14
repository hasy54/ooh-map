import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MediaService } from "../../lib/media-service"
import { BookingFlow } from "./booking-flow"

interface PageProps {
  searchParams: {
    listing?: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  if (!searchParams.listing) {
    return {
      title: "Book OOH Advertising Space",
      description: "Book premium outdoor advertising space across India",
      robots: "noindex", // Don't index booking pages
    }
  }

  try {
    const listing = await MediaService.getListingById(searchParams.listing)

    if (!listing) {
      return {
        title: "Booking Not Found",
        description: "The booking page you're looking for doesn't exist.",
      }
    }

    const title = `Book ${listing.name} - ${listing.type} in ${listing.location.city} | OOH Advertising`
    const description = `Book premium ${listing.type} at ${listing.name} in ${listing.location.city}. Secure your outdoor advertising space with our easy booking process.`

    return {
      title,
      description,
      robots: "noindex", // Don't index booking pages
    }
  } catch (error) {
    console.error("Error generating booking metadata:", error)
    return {
      title: "Book OOH Advertising Space",
      description: "Book premium outdoor advertising space across India",
    }
  }
}

export default async function BookingPage({ searchParams }: PageProps) {
  // Redirect to home if no listing ID is provided
  if (!searchParams.listing) {
    redirect("/")
  }

  try {
    console.log("Rendering booking page for listing ID:", searchParams.listing)

    // Fetch the listing by ID
    const listing = await MediaService.getListingById(searchParams.listing)

    if (!listing) {
      console.log("No listing found for booking, calling notFound()")
      notFound()
    }

    console.log("Found listing for booking:", listing.name)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Listing
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link href="/">
                <img src="/images/yash-ads-logo.png" alt="Yash Advertising" className="h-8" />
              </Link>
              <div className="flex-1" />
              <div className="text-sm text-gray-600">
                Booking: <span className="font-medium">{listing.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="h-[calc(100vh-72px)] max-w-7xl mx-auto px-4 py-8 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 h-full">
            {/* Booking Flow - Left Side */}
            <div className="order-2 lg:order-1 overflow-y-auto pr-2 pb-8">
              <BookingFlow listing={listing} />
            </div>

            {/* Media Details - Right Side */}
            <div className="order-1 lg:order-2 overflow-y-auto pr-2 pb-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Media Image */}
                <div className="relative h-64">
                  {listing.images && listing.images.length > 0 && listing.images[0] ? (
                    <img
                      src={listing.images[0] || "/placeholder.svg"}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        listing.availability === "Available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {listing.availability}
                    </span>
                  </div>
                </div>

                {/* Media Info */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{listing.name}</h2>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>
                      {listing.location.address}, {listing.location.city}
                    </span>
                  </div>

                  {/* Key Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{listing.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{listing.specifications.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Illumination:</span>
                      <span className="font-medium">{listing.specifications.illumination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Traffic:</span>
                      <span className="font-medium">{listing.specifications.traffic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visibility:</span>
                      <span className="font-medium">{listing.specifications.visibility}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(listing.pricing.monthly)}
                    </div>
                    <div className="text-gray-600 text-sm">per month</div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>+91 98932 32018</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>support@yashadvertising.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error rendering booking page:", error)
    notFound()
  }
}

// Enable ISR with revalidation
export const revalidate = 3600 // Revalidate every hour
