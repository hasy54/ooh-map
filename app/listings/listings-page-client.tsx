"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { MapPin, Eye, Zap, ArrowRight, Loader2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OOHListing } from "../../types/ooh"
import { Input } from "@/components/ui/input"

interface FiltersData {
  cities: string[]
  types: string[]
  subtypes: string[]
  priceRange: { min: number; max: number }
}

interface ListingsPageClientProps {
  filtersData: FiltersData
  totalCount: number
}

export function ListingsPageClient({ filtersData, totalCount }: ListingsPageClientProps) {
  const [listings, setListings] = useState<OOHListing[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadedCount, setLoadedCount] = useState(0)

  // Remove all filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")

  // Format price helper function - moved inside component
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Update fetchListingsBatch to remove filters
  const fetchListingsBatch = useCallback(
    async (page = 0, reset = false) => {
      try {
        if (page === 0 && reset) {
          setLoading(true)
          setError(null)
          setListings([])
          setLoadedCount(0)
        } else {
          setLoadingMore(true)
        }

        console.log(`Fetching batch ${page + 1} (100 listings)...`)

        const response = await fetch("/api/listings/paginated", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            limit: 100,
            filters: {
              searchQuery: searchQuery || undefined,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const newListings = await response.json()
        console.log(`Received ${newListings.length} listings in batch ${page + 1}`)

        if (reset || page === 0) {
          setListings(newListings)
          setLoadedCount(newListings.length)
        } else {
          setListings((prev) => {
            const combined = [...prev, ...newListings]
            setLoadedCount(combined.length)
            return combined
          })
        }

        setHasMore(newListings.length === 100)
        setCurrentPage(page)
      } catch (err) {
        console.error("Error fetching listings batch:", err)
        setError("Failed to load listings. Please try again.")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [searchQuery], // Add searchQuery back as dependency
  )

  // Load more listings manually
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchListingsBatch(currentPage + 1)
    }
  }, [fetchListingsBatch, currentPage, loadingMore, hasMore])

  // Remove filter change effects, keep only initial load
  useEffect(() => {
    console.log("Starting initial batch load...")
    fetchListingsBatch(0, true)
  }, [])

  // Auto-load next batch every 2 seconds
  useEffect(() => {
    if (!loading && !loadingMore && hasMore && listings.length > 0) {
      console.log(`Auto-loading next batch in 2 seconds... (currently have ${listings.length} listings)`)
      const timer = setTimeout(() => {
        fetchListingsBatch(currentPage + 1)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [loading, loadingMore, hasMore, listings.length, currentPage, fetchListingsBatch])

  // Remove search effect since we're removing search
  // Remove filter reset effects

  // Add back the search effect:
  useEffect(() => {
    if (searchQuery === "") return

    const timer = setTimeout(() => {
      console.log("Search query changed, resetting...")
      setCurrentPage(0)
      setHasMore(true)
      fetchListingsBatch(0, true)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Client-side sorting
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "city":
        return a.location.city.localeCompare(b.location.city)
      case "price-low":
        return a.pricing.monthly - b.pricing.monthly
      case "price-high":
        return b.pricing.monthly - a.pricing.monthly
      case "type":
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })

  // Simplify the filters section to just show sort:
  return (
    <>
      {/* Simplified Filters - Just Sort */}
      <div className="flex flex-wrap gap-4 items-center mb-8">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search listings, locations, cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="city">City A-Z</SelectItem>
            <SelectItem value="type">Type A-Z</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading Progress */}
      {(loading || loadingMore) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-blue-800">
                {loading ? "Loading initial listings..." : "Loading more listings..."}
              </div>
              <div className="text-xs text-blue-600">
                Loaded {loadedCount} of {totalCount} listings
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Listings</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button size="sm" onClick={() => fetchListingsBatch(0, true)}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {sortedListings.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <div className="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  {/* Image */}
                  {listing.images && listing.images.length > 0 && listing.images[0] ? (
                    <img
                      src={listing.images[0] || "/placeholder.svg"}
                      alt={listing.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{listing.name}</h3>
                      <Badge variant={listing.availability === "Available" ? "default" : "secondary"} className="ml-2">
                        {listing.availability}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {listing.location.address}, {listing.location.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{listing.specifications.traffic}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          <span>{listing.specifications.illumination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold text-green-600">{formatPrice(listing.pricing.monthly)}</div>
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{listing.type}</Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMore} disabled={loadingMore} variant="outline" size="lg">
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading more...
                  </>
                ) : (
                  "Load More Listings"
                )}
              </Button>
            </div>
          )}

          {/* Results info */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Showing {sortedListings.length} of {totalCount} listings
            {loadingMore && " (loading more...)"}
          </div>
        </>
      )}

      {/* No Results */}
      {!loading && sortedListings.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-4">There are currently no listings available</p>
          <Button onClick={() => fetchListingsBatch(0, true)}>Refresh</Button>
        </div>
      )}
    </>
  )
}
