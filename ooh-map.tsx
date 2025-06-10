"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { GoogleMap } from "./components/google-map"
import type { OOHListing } from "./types/ooh"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaService } from "./lib/media-service"
import { useSearchParams, useRouter } from "next/navigation"
import { WaterfallResults } from "./components/waterfall-results"
import { ShareModal } from "./components/share-modal"
import { DEFAULT_CENTER } from "./utils/map-utils"

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

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareModalListing, setShareModalListing] = useState<OOHListing | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  const filteredListings = useMemo(() => {
    let filtered = [...listings]
    console.log("Starting with listings count:", filtered.length)

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
  }, [listings, sortBy, searchQuery])

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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
            <div className="p-4 border-b flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search map"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-100 border-0 rounded-full"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                </div>
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
