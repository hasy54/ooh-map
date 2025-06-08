"use client"

import type { OOHListing } from "../types/ooh"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, MapPin, Share, Bookmark, Navigation, Phone } from "lucide-react"

interface ListingDetailModalProps {
  listing: OOHListing | null
  onClose: () => void
}

export function ListingDetailModal({ listing, onClose }: ListingDetailModalProps) {
  if (!listing) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <img src={listing.images[0] || "/placeholder.svg"} alt={listing.name} className="w-full h-64 object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Title and basic info */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold">{listing.name}</h2>
              <Badge variant={listing.availability === "Available" ? "default" : "secondary"}>
                {listing.availability}
              </Badge>
            </div>
            <p className="text-gray-600 mb-2">{listing.type}</p>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                {listing.location.address}, {listing.location.city}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-6">
            <Button size="sm" variant="outline">
              <Navigation className="w-4 h-4 mr-2" />
              Directions
            </Button>
            <Button size="sm" variant="outline">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>

          {/* Main CTA */}
          <Button className="w-full mb-6" size="lg">
            BOOK THIS SPACE - {formatPrice(listing.pricing.monthly)}/month
          </Button>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specs</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{listing.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Size</h4>
                  <p className="text-gray-600">{listing.specifications.size}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Illumination</h4>
                  <p className="text-gray-600">{listing.specifications.illumination}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Visibility</h4>
                  <p className="text-gray-600">{listing.specifications.visibility}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Daily Traffic</h4>
                  <p className="text-gray-600">{listing.specifications.traffic}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-4">
              <div>
                <h4 className="font-semibold">Daily Footfall</h4>
                <p className="text-gray-600">{listing.demographics.footfall}</p>
              </div>
              <div>
                <h4 className="font-semibold">Target Audience</h4>
                <p className="text-gray-600">{listing.demographics.targetAudience}</p>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{formatPrice(listing.pricing.monthly)}</div>
                  <div className="text-gray-600">per month</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>• Prices are subject to negotiation based on duration</p>
                <p>• Additional charges may apply for installation and maintenance</p>
                <p>• GST applicable as per current rates</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
