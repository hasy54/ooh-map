"use client"

import type { OOHListing } from "../types/ooh"
import { Badge } from "@/components/ui/badge"
import { MapPin, Eye, Zap } from "lucide-react"

interface ListingCardProps {
  listing: OOHListing
  onClick: () => void
  isSelected?: boolean
}

export function ListingCard({ listing, onClick, isSelected }: ListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Generate SEO description
  const seoDescription = `Discover premium ${listing.type} advertising at ${listing.name}. Located in ${listing.location.city}, this site offers ${listing.specifications.visibility} visibility and is an ideal spot for brands looking to capture daily foot traffic. The space is currently marked as '${listing.availability}', making it a great opportunity for quick booking. With a structure size of ${listing.specifications.size}, and ${listing.specifications.illumination} display, it's perfect for both day and night campaigns. This ${listing.type} is managed by ${listing.managedBy || "professional team"}, ensuring reliable operations and support. Book this location now for maximum exposure in ${listing.location.city} and surrounding areas. Perfect for brands looking to dominate local attention with outdoor advertising that works.`

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      {/* SEO Hidden Description */}
      <div className="sr-only" aria-hidden="true">
        {seoDescription}
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: listing.name,
            description: seoDescription,
            category: "Outdoor Advertising",
            brand: {
              "@type": "Brand",
              name: listing.managedBy || "OOH Advertising India",
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
                unitText: "monthly",
              },
            },
            location: {
              "@type": "Place",
              name: listing.location.address,
              address: {
                "@type": "PostalAddress",
                streetAddress: listing.location.address,
                addressLocality: listing.location.city,
                addressRegion: listing.location.state,
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: listing.location.lat,
                longitude: listing.location.lng,
              },
            },
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
                name: "Visibility",
                value: listing.specifications.visibility,
              },
              {
                "@type": "PropertyValue",
                name: "Traffic",
                value: listing.specifications.traffic,
              },
            ],
          }),
        }}
      />

      <div className="flex gap-3">
        {listing.images && listing.images.length > 0 && listing.images[0] ? (
          <img
            src={listing.images[0] || "/placeholder.svg"}
            alt={`${listing.type} advertising space at ${listing.name} in ${listing.location.city}`}
            className="w-20 h-20 object-cover rounded-lg"
          />
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-lg truncate">{listing.name}</h3>
            <Badge variant={listing.availability === "Available" ? "default" : "secondary"}>
              {listing.availability}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{listing.location.address}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{listing.specifications.traffic}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{listing.specifications.illumination}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-600">{formatPrice(listing.pricing.monthly)}</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <Badge variant="outline">{listing.type}</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
