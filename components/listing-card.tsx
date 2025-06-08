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

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {listing.images && listing.images.length > 0 && listing.images[0] ? (
          <img
            src={listing.images[0] || "/placeholder.svg"}
            alt={listing.name}
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
