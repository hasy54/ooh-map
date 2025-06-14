"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef } from "react"
import { ChevronRight, MapPin, Eye, Zap, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ShareModal } from "./share-modal"
import type { OOHListing } from "../types/ooh"

interface WaterfallResultsProps {
  listings: OOHListing[]
  loading: boolean
  onListingClick: (listing: OOHListing) => void
  selectedListing: OOHListing | null
  searchQuery?: string
  onShare?: (listing: OOHListing) => void
}

export function WaterfallResults({
  listings,
  loading,
  onListingClick,
  selectedListing,
  searchQuery,
  onShare,
}: WaterfallResultsProps) {
  const listingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedListingDetails, setSelectedListingDetails] = useState<OOHListing | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareModalListing, setShareModalListing] = useState<OOHListing | null>(null)

  // Group listings by type and count them
  const typeGroups = useMemo(() => {
    const groups = listings.reduce(
      (acc, listing) => {
        const type = listing.type
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(listing)
        return acc
      },
      {} as Record<string, OOHListing[]>,
    )

    return Object.entries(groups).map(([type, listings]) => ({
      type,
      count: listings.length,
      listings,
    }))
  }, [listings])

  // Handle external listing selection (from map clicks)
  useEffect(() => {
    if (selectedListing) {
      // Find which type this listing belongs to
      const listingType = selectedListing.type

      // If we're not already showing this type, navigate to it
      if (selectedType !== listingType) {
        setSelectedType(listingType)
      }

      // Show the listing details
      setSelectedListingDetails(selectedListing)

      // Scroll to the listing if it exists in the current view
      if (listingRefs.current[selectedListing.id]) {
        setTimeout(() => {
          listingRefs.current[selectedListing.id]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }, 100)
      }
    }
  }, [selectedListing])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleShareClick = (listing: OOHListing, event?: React.MouseEvent) => {
    if (event && event.stopPropagation) {
      event.stopPropagation() // Prevent triggering the listing click
    }
    setShareModalListing(listing)
    setShareModalOpen(true)
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listings...</p>
        </div>
      </div>
    )
  }

  // Search results view - simplified cards
  if (searchQuery && searchQuery.trim()) {
    return (
      <>
        <div className="p-4 animate-in slide-in-from-right-2 duration-300">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Search Results</h2>
            <p className="text-sm text-gray-600">
              {listings.length} listings found for "{searchQuery}"
            </p>
          </div>

          {/* Simplified Search Results List */}
          <div className="space-y-3">
            {listings.map((listing, index) => (
              <div
                key={listing.id}
                ref={(el) => {
                  listingRefs.current[listing.id] = el
                }}
                onClick={() => {
                  setSelectedListingDetails(listing)
                  onListingClick(listing)
                }}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md transform hover:scale-[1.01] ${
                  selectedListing?.id === listing.id
                    ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.01]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="flex gap-3">
                  {/* Smaller image */}
                  {listing.images && listing.images.length > 0 && listing.images[0] ? (
                    <img
                      src={listing.images[0] || "/placeholder.svg"}
                      alt={listing.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Title and availability */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base truncate pr-2">{listing.name}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => handleShareClick(listing, e)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          title="Share listing"
                        >
                          <Share2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <Badge
                          variant={listing.availability === "Available" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {listing.availability}
                        </Badge>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm truncate">{listing.location.city}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <Badge variant="outline" className="text-xs">
                        {listing.type}
                      </Badge>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{formatPrice(listing.pricing.monthly)}</div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {listings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No listings found for "{searchQuery}"
              <div className="mt-2 text-sm">
                Try searching for cities like "Mumbai", "Delhi", or types like "Billboard", "Digital"
              </div>
            </div>
          )}
        </div>

        {/* Share Modal */}
        {shareModalListing && (
          <ShareModal
            listing={shareModalListing}
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false)
              setShareModalListing(null)
            }}
          />
        )}
      </>
    )
  }

  // Show type selection view
  if (!selectedType) {
    return (
      <div className="p-4 animate-in slide-in-from-left-2 duration-300">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-1">Media Types</h2>
          <p className="text-sm text-gray-600">{listings.length} total listings</p>
        </div>

        <div className="space-y-2">
          {typeGroups.map(({ type, count }, index) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-[1.01]"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  {type === "Billboard" && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h18v12H3V3zm2 2v8h14V5H5zm2 2h10v4H7V7z" />
                    </svg>
                  )}
                  {type === "Digital Display" && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16v10H4V6zm2 2v6h12V8H6zm1 1h10v4H7V9z" />
                    </svg>
                  )}
                  {type === "Bus Shelter" && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.95 5.16-.21 9-4.4 9-9.95V7l-10-5z" />
                    </svg>
                  )}
                  {type === "Transit" && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                    </svg>
                  )}
                  {!["Billboard", "Digital Display", "Bus Shelter", "Transit"].includes(type) && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{type}</div>
                  <div className="text-sm text-gray-600">{count} listings</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {typeGroups.length === 0 && (
          <div className="text-center py-8 text-gray-500">No listings found matching your criteria</div>
        )}
      </div>
    )
  }

  // Show listing details view
  if (selectedListingDetails) {
    return (
      <>
        <div className="p-4 animate-in slide-in-from-right-2 duration-300">
          {/* Back button with slide animation */}
          <div className="sticky top-0 bg-white z-10 pb-4 mb-4 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => setSelectedListingDetails(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 transition-transform duration-200 hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {selectedType}
            </button>
            <h2 className="text-lg font-semibold">{selectedListingDetails.name}</h2>
            <p className="text-sm text-gray-600">{selectedListingDetails.type}</p>
          </div>

          {/* Listing Details Content with staggered animations */}
          <div className="space-y-4">
            {/* Image with fade-in */}
            <div className="animate-in fade-in-50 duration-500 delay-100">
              {selectedListingDetails.images &&
              selectedListingDetails.images.length > 0 &&
              selectedListingDetails.images[0] ? (
                <img
                  src={selectedListingDetails.images[0] || "/placeholder.svg"}
                  alt={selectedListingDetails.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Basic Info with slide-in */}
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300 delay-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {selectedListingDetails.location.address}, {selectedListingDetails.location.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{selectedListingDetails.specifications.traffic} daily traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{selectedListingDetails.specifications.illumination}</span>
              </div>
            </div>

            {/* Pricing with scale animation */}
            <div className="bg-green-50 p-4 rounded-xl text-center animate-in zoom-in-50 duration-300 delay-300">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatPrice(selectedListingDetails.pricing.monthly)}
              </div>
              <div className="text-gray-600 text-sm">per month</div>
            </div>

            {/* Specifications */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span>{selectedListingDetails.specifications.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visibility:</span>
                  <span>{selectedListingDetails.specifications.visibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <Badge variant={selectedListingDetails.availability === "Available" ? "default" : "secondary"}>
                    {selectedListingDetails.availability}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons with slide-up animation */}
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300 delay-400">
              <a href={`/listings/${selectedListingDetails.id}/booking`} className="block">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors">
                  Book Now
                </button>
              </a>

              <button
                onClick={(e) => handleShareClick(selectedListingDetails, e)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>

              <button
                onClick={() => {
                  const message = `Hi! I'm interested in booking this OOH space:

*${selectedListingDetails.name}*
📍 ${selectedListingDetails.location.address}, ${selectedListingDetails.location.city}
📏 Size: ${selectedListingDetails.specifications.size}
💡 Type: ${selectedListingDetails.type}
💰 Price: ${formatPrice(selectedListingDetails.pricing.monthly)}/month
🚦 Traffic: ${selectedListingDetails.specifications.traffic}
⚡ Illumination: ${selectedListingDetails.specifications.illumination}

Please share more details and availability.`

                  const encodedMessage = encodeURIComponent(message)
                  const whatsappUrl = `https://wa.me/919892320184?text=${encodedMessage}`
                  window.open(whatsappUrl, "_blank")
                }}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
              >
                Book via WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {shareModalListing && (
          <ShareModal
            listing={shareModalListing}
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false)
              setShareModalListing(null)
            }}
          />
        )}
      </>
    )
  }

  // Show listings for selected type - simplified cards
  const selectedTypeListings = typeGroups.find((group) => group.type === selectedType)?.listings || []

  return (
    <>
      <div className="p-4 animate-in slide-in-from-right-2 duration-300">
        {/* Back button and header with slide animation */}
        <div className="sticky top-0 bg-white z-10 pb-4 mb-4 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => setSelectedType(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to types
          </button>
          <h2 className="text-lg font-semibold">{selectedType}</h2>
          <p className="text-sm text-gray-600">{selectedTypeListings.length} listings</p>
        </div>

        {/* Simplified listings */}
        <div className="space-y-3">
          {selectedTypeListings.map((listing, index) => (
            <div
              key={listing.id}
              ref={(el) => {
                listingRefs.current[listing.id] = el
              }}
              onClick={() => {
                setSelectedListingDetails(listing)
                onListingClick(listing)
              }}
              className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md transform hover:scale-[1.01] ${
                selectedListing?.id === listing.id
                  ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.01]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex gap-3">
                {/* Smaller image */}
                {listing.images && listing.images.length > 0 && listing.images[0] ? (
                  <img
                    src={listing.images[0] || "/placeholder.svg"}
                    alt={listing.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Title and availability */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base truncate pr-2">{listing.name}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleShareClick(listing, e)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        title="Share listing"
                      >
                        <Share2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <Badge
                        variant={listing.availability === "Available" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {listing.availability}
                      </Badge>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="text-sm truncate">{listing.location.city}</span>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{formatPrice(listing.pricing.monthly)}</div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {shareModalListing && (
        <ShareModal
          listing={shareModalListing}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false)
            setShareModalListing(null)
          }}
        />
      )}
    </>
  )
}
