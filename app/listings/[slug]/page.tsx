import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Eye, Zap, Map, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MediaService } from "../../../lib/media-service"
import { findListingBySlug, generateListingSlug } from "../../../utils/slug-utils"
import { ListingDetailClient } from "./listing-detail-client"

interface PageProps {
  params: {
    slug: string
  }
}

// Generate static paths for all listings
export async function generateStaticParams() {
  try {
    console.log("Generating static params...")
    const listings = await MediaService.getListings()
    console.log("Found listings:", listings.length)

    const params = listings.map((listing) => {
      const slug = generateListingSlug(listing)
      console.log(`Generated slug for "${listing.name}": ${slug}`)
      return { slug }
    })

    console.log("Generated params:", params.length)
    return params
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

// This makes the page dynamic so it can handle any slug
export const dynamicParams = true

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    console.log("Generating metadata for slug:", params.slug)

    // Get all listings to find the one matching the slug
    const listings = await MediaService.getListings()
    const listing = findListingBySlug(params.slug, listings)

    if (!listing) {
      console.log("No listing found for metadata generation")
      return {
        title: "Listing Not Found",
        description: "The outdoor advertising space you're looking for doesn't exist.",
      }
    }

    console.log("Found listing for metadata:", listing.name)

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(price)
    }

    const title = `${listing.name} - ${listing.type} in ${listing.location.city} | OOH Advertising`
    const description = `Book premium ${listing.type} at ${listing.name} in ${listing.location.city}. ${listing.specifications.size} outdoor advertising space with ${listing.specifications.illumination} display. Starting at ${formatPrice(listing.pricing.monthly)}/month. High visibility hoarding for maximum brand impact across India's outdoor advertising network.`

    const keywords = [
      `${listing.type} ${listing.location.city}`,
      `Outdoor advertising ${listing.location.city}`,
      `Hoarding ${listing.location.city}`,
      `Billboard ${listing.location.city}`,
      `OOH advertising ${listing.location.city}`,
      listing.name,
      `${listing.specifications.illumination} display`,
      "Outdoor advertising India",
      "Hoarding booking",
      "Billboard rental",
    ]

    return {
      title,
      description,
      keywords: keywords.join(", "),
      openGraph: {
        title,
        description,
        type: "website",
        images:
          listing.images && listing.images.length > 0
            ? [
                {
                  url: listing.images[0],
                  width: 1200,
                  height: 630,
                  alt: listing.name,
                },
              ]
            : [],
        siteName: "OOH Advertising India",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: listing.images && listing.images.length > 0 ? [listing.images[0]] : [],
      },
      alternates: {
        canonical: `/listings/${params.slug}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "OOH Advertising Space",
      description: "Premium outdoor advertising and hoarding opportunities across India",
    }
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  try {
    console.log("Rendering page for slug:", params.slug)

    // Get all listings to find the one matching the slug
    const listings = await MediaService.getListings()
    console.log("Fetched listings count:", listings.length)

    const listing = findListingBySlug(params.slug, listings)

    if (!listing) {
      console.log("No listing found, calling notFound()")
      notFound()
    }

    console.log("Found listing:", listing.name)

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(price)
    }

    // Generate JSON-LD structured data for SEO
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: listing.name,
      description: `Premium ${listing.type} outdoor advertising space in ${listing.location.city}. ${listing.specifications.size} display with ${listing.specifications.illumination} illumination.`,
      image: listing.images && listing.images.length > 0 ? listing.images : [],
      brand: {
        "@type": "Brand",
        name: "OOH Advertising India",
      },
      offers: {
        "@type": "Offer",
        price: listing.pricing.monthly,
        priceCurrency: "INR",
        availability:
          listing.availability === "Available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: listing.pricing.monthly,
          priceCurrency: "INR",
          unitText: "MONTH",
        },
      },
      location: {
        "@type": "Place",
        name: listing.location.address,
        address: {
          "@type": "PostalAddress",
          streetAddress: listing.location.address,
          addressLocality: listing.location.city,
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: listing.location.lat,
          longitude: listing.location.lng,
        },
      },
      category: "Outdoor Advertising",
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Size",
          value: listing.specifications.size,
        },
        {
          "@type": "PropertyValue",
          name: "Illumination",
          value: listing.specifications.illumination,
        },
        {
          "@type": "PropertyValue",
          name: "Daily Traffic",
          value: listing.specifications.traffic,
        },
        {
          "@type": "PropertyValue",
          name: "Visibility",
          value: listing.specifications.visibility,
        },
      ],
    }

    return (
      <>
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/listings">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Listings
                    </Button>
                  </Link>
                  <Link href="/">
                    <img src="/images/yash-ads-logo.png" alt="Yash Advertising" className="h-8" />
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/?listing=${listing.id}`}>
                    <Button variant="outline">
                      <Map className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <div className="bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Image */}
                <div className="relative">
                  {listing.images && listing.images.length > 0 && listing.images[0] ? (
                    <img
                      src={listing.images[0] || "/placeholder.svg"}
                      alt={listing.name}
                      className="w-full h-96 lg:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-96 lg:h-full bg-gray-200 flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant={listing.availability === "Available" ? "default" : "secondary"}>
                      {listing.availability}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.name}</h1>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">(4.5)</span>
                      </div>
                      <Badge variant="outline">{listing.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {listing.location.address}, {listing.location.city}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Daily Traffic</span>
                      </div>
                      <div className="text-lg font-semibold">{listing.specifications.traffic}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Illumination</span>
                      </div>
                      <div className="text-lg font-semibold">{listing.specifications.illumination}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Size</div>
                      <div className="text-lg font-semibold">{listing.specifications.size}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Visibility</div>
                      <div className="text-lg font-semibold">{listing.specifications.visibility}</div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-green-50 p-6 rounded-lg mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {formatPrice(listing.pricing.monthly)}
                      </div>
                      <div className="text-gray-600">per month</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <a href="tel:9893423245" className="block">
                      <Button variant="outline" className="w-full flex flex-col items-center p-4 h-auto">
                        <Phone className="w-5 h-5 mb-2" />
                        <span>Call Now</span>
                      </Button>
                    </a>
                    <a
                      href={`https://wa.me/919892320184?text=${encodeURIComponent(`Hi! I'm interested in booking this OOH space: ${listing.name} in ${listing.location.city}. Please share more details.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full flex flex-col items-center p-4 h-auto">
                        <svg className="w-5 h-5 mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                        <span>WhatsApp</span>
                      </Button>
                    </a>
                  </div>

                  {/* Main CTA */}
                  <a
                    href={`https://wa.me/919892320184?text=${encodeURIComponent(`Hi! I'm interested in booking this OOH space:

*${listing.name}*
📍 ${listing.location.address}, ${listing.location.city}
📏 Size: ${listing.specifications.size}
💡 Type: ${listing.type}
💰 Price: ${formatPrice(listing.pricing.monthly)}/month
🚦 Traffic: ${listing.specifications.traffic}
⚡ Illumination: ${listing.specifications.illumination}

Please share more details and availability.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full" size="lg">
                      BOOK THIS SPACE - {formatPrice(listing.pricing.monthly)}/month
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Client-side interactive components */}
          <ListingDetailClient listing={listing} />
        </div>
      </>
    )
  } catch (error) {
    console.error("Error rendering listing page:", error)
    notFound()
  }
}

// Enable ISR with revalidation
export const revalidate = 3600 // Revalidate every hour
