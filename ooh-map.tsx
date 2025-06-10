"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { GoogleMap } from "./components/google-map"
import type { OOHListing } from "./types/ooh"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaService } from "./lib/media-service"
import { useSearchParams, useRouter } from "next/navigation"
import { WaterfallResults } from "./components/waterfall-results"
import { ShareModal } from "./components/share-modal"
import { DEFAULT_CENTER } from "./utils/map-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DEMO_LISTINGS: OOHListing[] = [
  {
    id: "demo-1",
    name: "Times Square Billboard",
    type: "Billboard",
    location: {
      lat: 40.758,
      lng: -73.9855,
      address: "Times Square, Manhattan",
      city: "New York",
      state: "NY",
    },
    specifications: {
      size: "48ft x 14ft",
      illumination: "Digital",
      visibility: "High",
      traffic: "500,000+ daily",
    },
    pricing: {
      monthly: 250000,
      currency: "USD",
    },
    availability: "Available",
    images: ["/placeholder.svg?height=300&width=400"],
    description: "Premium digital billboard in the heart of Times Square",
    features: ["Digital Display", "24/7 Visibility", "High Traffic"],
    demographics: {
      footfall: "500,000+ daily",
      targetAudience: "Tourists, Business Professionals",
    },
    managedBy: "Premium Outdoor Media",
  },
  {
    id: "demo-2",
    name: "Highway 101 Billboard",
    type: "Billboard",
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: "Highway 101, San Francisco",
      city: "San Francisco",
      state: "CA",
    },
    specifications: {
      size: "40ft x 12ft",
      illumination: "Lit",
      visibility: "High",
      traffic: "200,000+ daily",
    },
    pricing: {
      monthly: 150000,
      currency: "USD",
    },
    availability: "Available",
    images: ["/placeholder.svg?height=300&width=400"],
    description: "Strategic highway billboard with excellent visibility",
    features: ["Backlit Display", "Highway Location", "High Visibility"],
    demographics: {
      footfall: "200,000+ daily",
      targetAudience: "Commuters, Travelers",
    },
    managedBy: "Highway Media Solutions",
  },
  {
    id: "demo-3",
    name: "Downtown Bus Shelter",
    type: "Bus Shelter",
    location: {
      lat: 34.0522,
      lng: -118.2437,
      address: "Wilshire Blvd, Downtown LA",
      city: "Los Angeles",
      state: "CA",
    },
    specifications: {
      size: "6ft x 4ft",
      illumination: "Lit",
      visibility: "Medium",
      traffic: "50,000+ daily",
    },
    pricing: {
      monthly: 25000,
      currency: "USD",
    },
    availability: "Booked",
    images: ["/placeholder.svg?height=300&width=400"],
    description: "Bus shelter advertising in busy downtown area",
    features: ["Transit Advertising", "Pedestrian Traffic", "Urban Location"],
    demographics: {
      footfall: "50,000+ daily",
      targetAudience: "Urban Commuters, Pedestrians",
    },
    managedBy: "Transit Media Group",
  },
]

// Location filter type
type LocationFilter = {
  type: "state" | "city"
  value: string
}

export default function OOHMap() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedListing, setSelectedListing] = useState<OOHListing | null>(null)
  const [sortBy, setSortBy] = useState("relevance")
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [listings, setListings] = useState<OOHListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true)

  const [panelWidth, setPanelWidth] = useState(320) // 320px = w-80
  const [isResizing, setIsResizing] = useState(false)

  // Location filter state
  const [locationFilters, setLocationFilters] = useState<LocationFilter[]>([])
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)
  const [locationSearchQuery, setLocationSearchQuery] = useState("")
  const [selectedStateForCities, setSelectedStateForCities] = useState<string | null>(null)

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareModalListing, setShareModalListing] = useState<OOHListing | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Get unique states and cities from listings
  const { states, cities, statesByCity } = useMemo(() => {
    const statesSet = new Set<string>()
    const citiesSet = new Set<string>()
    const statesByCityMap = new Map<string, string>()

    listings.forEach((listing) => {
      const { city, state } = listing.location

      if (state && state.trim() !== "") {
        statesSet.add(state)
      }

      if (city && city.trim() !== "") {
        citiesSet.add(city)
        if (state && state.trim() !== "") {
          statesByCityMap.set(city, state)
        }
      }
    })

    return {
      states: Array.from(statesSet).sort(),
      cities: Array.from(citiesSet).sort(),
      statesByCity: statesByCityMap,
    }
  }, [listings])

  // Group cities by state
  const citiesByState = useMemo(() => {
    const grouped = new Map<string, string[]>()

    listings.forEach((listing) => {
      const { city, state } = listing.location

      if (state && state.trim() !== "" && city && city.trim() !== "") {
        if (!grouped.has(state)) {
          grouped.set(state, [])
        }

        const cities = grouped.get(state)!
        if (!cities.includes(city)) {
          cities.push(city)
        }
      }
    })

    // Sort cities within each state
    grouped.forEach((cities, state) => {
      grouped.set(state, cities.sort())
    })

    return grouped
  }, [listings])

  const filteredListings = useMemo(() => {
    let filtered = [...listings]
    console.log("Starting with listings count:", filtered.length)

    // Location filters
    if (locationFilters.length > 0) {
      const stateFilters = locationFilters.filter((f) => f.type === "state").map((f) => f.value)
      const cityFilters = locationFilters.filter((f) => f.type === "city").map((f) => f.value)

      filtered = filtered.filter((listing) => {
        // If no filters are selected, show all
        if (stateFilters.length === 0 && cityFilters.length === 0) {
          return true
        }

        // Check if listing matches any selected state
        const stateMatch = stateFilters.length === 0 || stateFilters.includes(listing.location.state)

        // Check if listing matches any selected city
        const cityMatch = cityFilters.length === 0 || cityFilters.includes(listing.location.city)

        // Show listing if it matches ANY of the selected filters (OR logic)
        // If both state and city filters exist, listing must match at least one
        if (stateFilters.length > 0 && cityFilters.length > 0) {
          return stateMatch || cityMatch
        }

        // If only state filters exist, must match state
        if (stateFilters.length > 0 && cityFilters.length === 0) {
          return stateMatch
        }

        // If only city filters exist, must match city
        if (cityFilters.length > 0 && stateFilters.length === 0) {
          return cityMatch
        }

        return false
      })

      console.log("After location filters:", filtered.length)
      console.log("Applied filters:", locationFilters)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (listing) =>
          listing.name.toLowerCase().includes(query) ||
          listing.location.city.toLowerCase().includes(query) ||
          listing.location.address.toLowerCase().includes(query) ||
          listing.type.toLowerCase().includes(query),
      )
      console.log("After search filter:", filtered.length)
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
  }, [listings, sortBy, searchQuery, locationFilters])

  // Filter location options based on search
  const filteredLocationOptions = useMemo(() => {
    const query = locationSearchQuery.toLowerCase().trim()

    if (!query) {
      return { states, cities }
    }

    return {
      states: states.filter((state) => state.toLowerCase().includes(query)),
      cities: cities.filter((city) => city.toLowerCase().includes(query)),
    }
  }, [states, cities, locationSearchQuery])

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isLocationDropdownOpen && !target.closest(".location-filter-dropdown")) {
        setIsLocationDropdownOpen(false)
        setSelectedStateForCities(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isLocationDropdownOpen])

  // Handle panel resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return

    const newWidth = Math.max(280, Math.min(600, e.clientX))
    setPanelWidth(newWidth)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing])

  // Fetch listings from Supabase
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        setError(null)

        if (isDemoMode) {
          console.log("Using demo data")
          setListings(DEMO_LISTINGS)
          setLoading(false)
          return
        }

        console.log("Fetching all listings")

        const fetchedListings = await MediaService.getListings()

        console.log("Listings count:", fetchedListings.length)
        console.log("Sample listing:", fetchedListings[0])

        setListings(fetchedListings)
      } catch (err) {
        console.error("Error fetching listings:", err)
        setError("Failed to load listings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [isDemoMode]) // Add isDemoMode to dependencies

  // Handle URL parameters for pre-selecting listings
  useEffect(() => {
    const listingId = searchParams.get("listing")
    if (listingId && listings.length > 0) {
      const listing = listings.find((l) => l.id === listingId)
      if (listing) {
        setSelectedListing(listing)
        // Center map on the listing
        setMapCenter({ lat: listing.location.lat, lng: listing.location.lng })
      }
    }
  }, [listings, searchParams])

  // Consolidated click handler for all listing interactions
  const handleListingClick = (listing: OOHListing) => {
    setSelectedListing(listing)

    // If a listing is clicked from the map, we need to navigate the waterfall to show it
    // This will automatically scroll to the listing due to the useEffect in WaterfallResults
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Handle sharing function - now opens modal
  const handleShare = (listing: OOHListing) => {
    setShareModalListing(listing)
    setShareModalOpen(true)
  }

  // Add location filter
  const addLocationFilter = (type: "state" | "city", value: string) => {
    // Check if filter already exists
    const exists = locationFilters.some((f) => f.type === type && f.value === value)
    if (!exists) {
      setLocationFilters([...locationFilters, { type, value }])
    }
    setLocationSearchQuery("")
  }

  // Remove location filter
  const removeLocationFilter = (type: "state" | "city", value: string) => {
    setLocationFilters(locationFilters.filter((f) => !(f.type === type && f.value === value)))
  }

  // Clear all location filters
  const clearLocationFilters = () => {
    setLocationFilters([])
  }

  // Mobile and desktop experience
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Tabs */}
          <Tabs defaultValue="map" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="list">List ({filteredListings.length})</TabsTrigger>
            </TabsList>

            {/* Map Tab */}
            <TabsContent value="map" className="flex-1 mt-2 animate-in fade-in-50 duration-300">
              <div className="h-full relative">
                <GoogleMap
                  listings={filteredListings}
                  selectedListing={selectedListing}
                  onListingClick={handleListingClick}
                  center={mapCenter}
                  zoom={11}
                />
              </div>
            </TabsContent>

            {/* List Tab */}
            <TabsContent
              value="list"
              className="flex-1 mt-2 overflow-hidden animate-in slide-in-from-right-2 duration-300"
            >
              <div className="h-full flex flex-col">
                {/* Mobile Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search OOH locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Mobile Listings */}
                <div className="flex-1 overflow-y-auto">
                  <WaterfallResults
                    listings={filteredListings}
                    loading={loading}
                    onListingClick={handleListingClick}
                    selectedListing={selectedListing}
                    searchQuery={searchQuery}
                    onShare={handleShare}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex-1 flex overflow-hidden">
          {/* Control Panel - New vertical panel similar to the image */}
          <div className="w-16 flex flex-col items-center py-6 space-y-4 bg-gradient-to-b from-orange-100 via-pink-50 to-orange-50 border-r">
            {/* Logo thumbnail */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <img src="/images/yash-ads-logo.png" alt="Yash Advertising" className="w-8 h-8 object-contain" />
            </div>

            {/* Demo Mode Toggle */}
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isDemoMode ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-400 hover:bg-gray-500 text-white"
              }`}
              title={isDemoMode ? "Demo Mode (Click for Real Data)" : "Real Data Mode (Click for Demo)"}
            >
              {isDemoMode ? (
                <span className="text-xs font-bold">DEMO</span>
              ) : (
                <span className="text-xs font-bold">LIVE</span>
              )}
            </button>
          </div>

          {/* Column 1: Listing List */}
          <div
            className="bg-white border-r flex flex-col overflow-hidden relative"
            style={{ width: `${panelWidth}px` }}
          >
            {/* Search Bar */}
            <div className="p-4 border-b flex-shrink-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search map"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-100 border-0 rounded-full"
                />
              </div>

              {/* Location Filter Dropdown */}
              <div className="relative location-filter-dropdown">
                <div
                  className="flex items-center justify-between bg-gray-50 rounded-full px-4 py-2 cursor-pointer border border-gray-200"
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                >
                  <span className="text-sm text-gray-600">
                    {locationFilters.length > 0
                      ? `${locationFilters.length} location${locationFilters.length > 1 ? "s" : ""} selected`
                      : "Filter by location"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>

                {/* Selected filters */}
                {locationFilters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {locationFilters.map((filter) => (
                      <Badge
                        key={`${filter.type}-${filter.value}`}
                        variant="secondary"
                        className="flex items-center gap-1 pl-2 pr-1 py-1"
                      >
                        <span className="text-xs">{filter.value}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 rounded-full hover:bg-gray-200"
                          onClick={() => removeLocationFilter(filter.type, filter.value)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}

                    {locationFilters.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2 hover:bg-gray-200"
                        onClick={clearLocationFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                )}

                {/* Dropdown content */}
                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Search within dropdown */}
                    <div className="p-4 border-b bg-gray-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search..."
                          value={locationSearchQuery}
                          onChange={(e) => setLocationSearchQuery(e.target.value)}
                          className="pl-10 text-sm border-gray-200"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* 2-Column Layout */}
                    <div className="flex h-80">
                      {/* States Column */}
                      <div className="w-1/2 border-r border-gray-200">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700">States</h3>
                        </div>
                        <div className="overflow-y-auto h-full p-2">
                          {filteredLocationOptions.states.map((state) => {
                            const isSelected = locationFilters.some((f) => f.type === "state" && f.value === state)
                            return (
                              <div
                                key={`state-${state}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50"
                              >
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer",
                                    isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white",
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (isSelected) {
                                      removeLocationFilter("state", state)
                                    } else {
                                      addLocationFilter("state", state)
                                    }
                                  }}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <span
                                  className="text-sm text-gray-700 flex-1"
                                  onClick={() =>
                                    setSelectedStateForCities(selectedStateForCities === state ? null : state)
                                  }
                                >
                                  {state}
                                </span>
                              </div>
                            )
                          })}
                          {filteredLocationOptions.states.length === 0 && (
                            <div className="p-4 text-center text-gray-500 text-sm">No states found</div>
                          )}
                        </div>
                      </div>

                      {/* Cities Column */}
                      <div className="w-1/2">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700">
                            {selectedStateForCities ? `Cities in ${selectedStateForCities}` : "Cities"}
                          </h3>
                        </div>
                        <div className="overflow-y-auto h-full p-2">
                          {(selectedStateForCities
                            ? citiesByState.get(selectedStateForCities) || []
                            : filteredLocationOptions.cities
                          ).map((city) => {
                            const isSelected = locationFilters.some((f) => f.type === "city" && f.value === city)
                            return (
                              <div
                                key={`city-${city}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                  if (isSelected) {
                                    removeLocationFilter("city", city)
                                  } else {
                                    addLocationFilter("city", city)
                                  }
                                }}
                              >
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded border-2 flex items-center justify-center",
                                    isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white",
                                  )}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <span className="text-sm text-gray-700">{city}</span>
                                  {statesByCity.get(city) && !selectedStateForCities && (
                                    <div className="text-xs text-gray-500">{statesByCity.get(city)}</div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          {(selectedStateForCities
                            ? (citiesByState.get(selectedStateForCities) || []).length === 0
                            : filteredLocationOptions.cities.length === 0) && (
                            <div className="p-4 text-center text-gray-500 text-sm">No cities found</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
                      <Button variant="outline" className="flex-1" onClick={clearLocationFilters}>
                        Clear
                      </Button>
                      <Button
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                        onClick={() => {
                          setIsLocationDropdownOpen(false)
                          // Force re-render of filtered listings
                          console.log("Applying filters:", locationFilters)
                          setSelectedStateForCities(null)
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Waterfall Content */}
            <div className="flex-1 overflow-y-auto">
              <WaterfallResults
                listings={filteredListings}
                loading={loading}
                onListingClick={handleListingClick}
                selectedListing={selectedListing}
                searchQuery={searchQuery}
                onShare={handleShare}
              />
            </div>

            {/* Resize Handle */}
            <div
              className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors ${
                isResizing ? "bg-blue-500" : "bg-transparent hover:bg-blue-300"
              }`}
              onMouseDown={handleMouseDown}
              title="Drag to resize panel"
            />
          </div>

          {/* Column 2: Map */}
          <div className="flex-1 overflow-hidden">
            <GoogleMap
              listings={filteredListings}
              selectedListing={selectedListing}
              onListingClick={handleListingClick}
              center={mapCenter}
              zoom={11}
            />
          </div>
        </div>
      )}

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
    </div>
  )
}
