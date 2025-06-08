"use client"

import { useState, useMemo, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoogleMap } from "./components/google-map"
import { ListingCard } from "./components/listing-card"
import { Filters } from "./components/filters"
import type { OOHListing } from "./types/ooh"
import { CitySelector } from "./components/city-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Share, Phone, Eye, Zap } from "lucide-react"
import { MediaService } from "./lib/media-service"
import { ShareModal } from "./components/share-modal"
import { MUMBAI_CENTER } from "./utils/map-utils"

export default function OOHMap() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedListing, setSelectedListing] = useState<OOHListing | null>(null)
  const [sortBy, setSortBy] = useState("relevance")
  const [filters, setFilters] = useState<any>({
    priceRange: [0, 300000],
    types: [],
    availability: "all",
    illumination: "all",
  })
  const [selectedCity, setSelectedCity] = useState("all")
  const [mapCenter, setMapCenter] = useState(MUMBAI_CENTER)
  const [listings, setListings] = useState<OOHListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch listings from Supabase
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching listings with city filter only:", {
          city: selectedCity === "all" ? undefined : selectedCity === "mumbai" ? "Mumbai" : undefined,
        })

        const fetchedListings = await MediaService.getListings({
          city: selectedCity === "all" ? undefined : selectedCity === "mumbai" ? "Mumbai" : undefined,
        })

        console.log("Raw fetched listings count:", fetchedListings.length)
        console.log("Sample listing:", fetchedListings[0])
        console.log("All listings:", fetchedListings)

        setListings(fetchedListings)
      } catch (err) {
        console.error("Error fetching listings:", err)
        setError("Failed to load listings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [selectedCity, searchQuery, filters])

  const filteredListings = useMemo(() => {
    let filtered = [...listings]
    console.log("Starting with listings count:", filtered.length)

    // Type filter from chips (priority over sidebar type filter)
    if (selectedTypeFilter) {
      console.log("Applying chip type filter:", selectedTypeFilter)
      filtered = filtered.filter((listing) => listing.type === selectedTypeFilter)
      console.log("After chip type filter:", filtered.length)
    }
    // Type filter from sidebar (client-side since it's an array)
    else if (filters.types.length > 0) {
      console.log("Applying sidebar type filter:", filters.types)
      filtered = filtered.filter((listing) => filters.types.includes(listing.type))
      console.log("After sidebar type filter:", filtered.length)
    }

    // Sort listings
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.pricing.monthly - b.pricing.monthly)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.pricing.monthly - a.pricing.monthly)
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    console.log("Final filtered listings count:", filtered.length)
    return filtered
  }, [listings, filters.types, sortBy, selectedTypeFilter])

  // Consolidated click handler for all listing interactions
  const handleListingClick = (listing: OOHListing) => {
    setSelectedListing(listing)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Mobile and desktop experience
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Fixed height */}
      <header className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src="/images/yash-ads-logo.png" alt="Yash Advertising" className="h-8" />
          </div>

          {/* Search - Full width center */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search OOH locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* City Selector - Right side */}
          <div className="flex-shrink-0">
            <CitySelector
              selectedCity={selectedCity}
              onCityChange={(city, center) => {
                setSelectedCity(city)
                setMapCenter(center)
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Tabs */}
          <Tabs defaultValue="map" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="list">List ({filteredListings.length})</TabsTrigger>
            </TabsList>

            {/* Map Tab */}
            <TabsContent value="map" className="flex-1 mt-2">
              <div className="h-full relative">
                <GoogleMap
                  listings={filteredListings}
                  selectedListing={selectedListing}
                  onListingClick={handleListingClick}
                  center={mapCenter}
                  zoom={11}
                  onTypeFilterChange={setSelectedTypeFilter}
                />
              </div>
            </TabsContent>

            {/* List Tab */}
            <TabsContent value="list" className="flex-1 mt-2 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Mobile Filters */}
                <div className="px-4 pb-2">
                  <Filters onFiltersChange={setFilters} />
                </div>

                {/* Mobile Listings */}
                <div className="flex-1 overflow-y-auto px-4">
                  <div className="space-y-3 pb-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading listings...</p>
                      </div>
                    ) : filteredListings.length > 0 ? (
                      filteredListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          onClick={() => handleListingClick(listing)}
                          isSelected={selectedListing?.id === listing.id}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No listings found matching your criteria</div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Mobile Bottom Sheet for Selected Listing */}
          {selectedListing && (
            <div className="fixed inset-x-0 bottom-0 bg-white border-t shadow-lg z-50 max-h-[70vh] overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Bottom Sheet Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-lg truncate flex-1">{selectedListing.name}</h3>
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="p-1 hover:bg-gray-100 rounded-full ml-2"
                    aria-label="Close details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Bottom Sheet Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    {/* Image */}
                    {selectedListing.images && selectedListing.images.length > 0 && selectedListing.images[0] && (
                      <img
                        src={selectedListing.images[0] || "/placeholder.svg"}
                        alt={selectedListing.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}

                    {/* Basic Info */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={selectedListing.availability === "Available" ? "default" : "secondary"}>
                          {selectedListing.availability}
                        </Badge>
                        <span className="text-sm text-gray-600">{selectedListing.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {selectedListing.location.address}, {selectedListing.location.city}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {formatPrice(selectedListing.pricing.monthly)}/month
                      </div>
                    </div>

                    {/* Mobile Tabs for Details */}
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="specs">Specs</TabsTrigger>
                        <TabsTrigger value="pricing">Pricing</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-3 mt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span>{selectedListing.specifications.traffic} daily traffic</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gray-500" />
                            <span>{selectedListing.specifications.illumination}</span>
                          </div>
                          {selectedListing.managedBy && (
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>Managed by {selectedListing.managedBy}</span>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="specs" className="space-y-3 mt-4">
                        <div className="space-y-3">
                          {selectedListing.type === "Bus Shelter" ? (
                            <>
                              <div>
                                <h4 className="font-semibold text-sm">Front Panel</h4>
                                <p className="text-gray-600 text-sm">
                                  Front Panel - {selectedListing.specifications.size}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">Back Panel</h4>
                                <p className="text-gray-600 text-sm">
                                  Back Panel - {selectedListing.specifications.size}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div>
                              <h4 className="font-semibold text-sm">Size</h4>
                              <p className="text-gray-600 text-sm">{selectedListing.specifications.size}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-sm">Visibility</h4>
                            <p className="text-gray-600 text-sm">{selectedListing.specifications.visibility}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Traffic</h4>
                            <p className="text-gray-600 text-sm">{selectedListing.specifications.traffic}</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="pricing" className="space-y-3 mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatPrice(selectedListing.pricing.monthly)}
                          </div>
                          <div className="text-gray-600 text-sm">per month</div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="p-4 border-t bg-white">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex flex-col items-center p-2 h-auto"
                      onClick={() => window.open(`tel:9893423245`, "_blank")}
                    >
                      <Phone className="w-4 h-4 mb-1" />
                      <span className="text-xs">Call</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex flex-col items-center p-2 h-auto"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share className="w-4 h-4 mb-1" />
                      <span className="text-xs">Share</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex flex-col items-center p-2 h-auto"
                      onClick={() => {
                        const message = `Hi! I'm interested in booking this OOH space: ${selectedListing.name} in ${selectedListing.location.city}. Please share more details.`
                        const encodedMessage = encodeURIComponent(message)
                        const whatsappUrl = `https://wa.me/919892320184?text=${encodedMessage}`
                        window.open(whatsappUrl, "_blank")
                      }}
                    >
                      <svg className="w-4 h-4 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      const message = `Hi! I'm interested in booking this OOH space:

*${selectedListing.name}*
📍 ${selectedListing.location.address}, ${selectedListing.location.city}
📏 Size: ${selectedListing.specifications.size}
💡 Type: ${selectedListing.type}
💰 Price: ${formatPrice(selectedListing.pricing.monthly)}/month
🚦 Traffic: ${selectedListing.specifications.traffic}
⚡ Illumination: ${selectedListing.specifications.illumination}

Please share more details and availability.`

                      const encodedMessage = encodeURIComponent(message)
                      const whatsappUrl = `https://wa.me/919892320184?text=${encodedMessage}`
                      window.open(whatsappUrl, "_blank")
                    }}
                  >
                    BOOK THIS SPACE
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout - Existing 3 column layout */
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Listing List */}
          <div className="w-80 bg-white border-r flex flex-col overflow-hidden">
            {/* Results header - Fixed */}
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Results</h2>
                <span className="text-sm text-gray-600">
                  {loading ? "Loading..." : `${filteredListings.length} listings`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filters - Fixed */}
            <div className="flex-shrink-0">
              <Filters onFiltersChange={setFilters} />
            </div>

            {/* Listings - Scrollable area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading listings...</p>
                  </div>
                ) : filteredListings.length > 0 ? (
                  filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => handleListingClick(listing)}
                      isSelected={selectedListing?.id === listing.id}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No listings found matching your criteria</div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Map */}
          <div className="flex-1 overflow-hidden">
            <GoogleMap
              listings={filteredListings}
              selectedListing={selectedListing}
              onListingClick={handleListingClick}
              center={mapCenter}
              zoom={11}
              onTypeFilterChange={setSelectedTypeFilter}
            />
          </div>

          {/* Column 3: Listing Details - Only shown when a listing is selected */}
          {selectedListing && (
            <div className="w-96 bg-white border-l flex flex-col overflow-hidden">
              {/* Header Image - Fixed height */}
              {selectedListing.images && selectedListing.images.length > 0 && selectedListing.images[0] ? (
                <div className="relative h-48 flex-shrink-0">
                  <img
                    src={selectedListing.images[0] || "/placeholder.svg"}
                    alt={selectedListing.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                    aria-label="Close details"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-x"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative h-12 flex-shrink-0 bg-white border-b">
                  {/* Close button only */}
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="absolute top-2 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                    aria-label="Close details"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-x"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
              )}

              {/* Content - Scrollable area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-1">{selectedListing.name}</h2>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">(4.5)</span>
                      </div>
                      <Badge variant={selectedListing.availability === "Available" ? "default" : "secondary"}>
                        {selectedListing.availability}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{selectedListing.type}</p>
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="specs">Specs</TabsTrigger>
                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div>
                        <p className="text-gray-600 mb-4">
                          {selectedListing.description ||
                            `${selectedListing.name} - ${selectedListing.type} in ${selectedListing.location.city}`}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              {selectedListing.location.address}, {selectedListing.location.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{selectedListing.specifications.traffic} daily traffic</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{selectedListing.specifications.illumination}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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
                            <span className="text-sm">
                              {selectedListing.location.lat.toFixed(6)}, {selectedListing.location.lng.toFixed(6)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span className="text-sm">Managed by {selectedListing.managedBy || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="specs" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 gap-4">
                        {selectedListing.type === "Bus Shelter" ? (
                          <>
                            <div>
                              <h4 className="font-semibold text-sm">Front Panel</h4>
                              <p className="text-gray-600">Front Panel - {selectedListing.specifications.size}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Back Panel</h4>
                              <p className="text-gray-600">Back Panel - {selectedListing.specifications.size}</p>
                            </div>
                          </>
                        ) : (
                          <div>
                            <h4 className="font-semibold text-sm">Size</h4>
                            <p className="text-gray-600">{selectedListing.specifications.size}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-sm">Visibility</h4>
                          <p className="text-gray-600">{selectedListing.specifications.visibility}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">Traffic</h4>
                          <p className="text-gray-600">{selectedListing.specifications.traffic}</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-4 mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatPrice(selectedListing.pricing.monthly)}
                        </div>
                        <div className="text-gray-600 text-sm">per month</div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex flex-col items-center p-3 h-auto"
                      onClick={() => window.open(`tel:9893423245`, "_blank")}
                    >
                      <Phone className="w-4 h-4 mb-1" />
                      <span className="text-xs">Call</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex flex-col items-center p-3 h-auto"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share className="w-4 h-4 mb-1" />
                      <span className="text-xs">Share</span>
                    </Button>
                  </div>

                  {/* Main CTA */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      const message = `Hi! I'm interested in booking this OOH space:

*${selectedListing.name}*
📍 ${selectedListing.location.address}, ${selectedListing.location.city}
📏 Size: ${selectedListing.specifications.size}
💡 Type: ${selectedListing.type}
💰 Price: ${formatPrice(selectedListing.pricing.monthly)}/month
🚦 Traffic: ${selectedListing.specifications.traffic}
⚡ Illumination: ${selectedListing.specifications.illumination}

Please share more details and availability.`

                      const encodedMessage = encodeURIComponent(message)
                      const whatsappUrl = `https://wa.me/919892320184?text=${encodedMessage}`
                      window.open(whatsappUrl, "_blank")
                    }}
                  >
                    BOOK THIS SPACE
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {selectedListing && (
        <ShareModal listing={selectedListing} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}
