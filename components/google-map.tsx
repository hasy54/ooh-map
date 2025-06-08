"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import type { OOHListing } from "../types/ooh"

interface GoogleMapProps {
  listings: OOHListing[]
  selectedListing: OOHListing | null
  onListingClick: (listing: OOHListing) => void
  center?: { lat: number; lng: number }
  zoom?: number
  onTypeFilterChange?: (type: string | null) => void
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function GoogleMap({
  listings,
  selectedListing,
  onListingClick,
  center,
  zoom = 12,
  onTypeFilterChange,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(zoom)

  // Add state for types and selected type filter
  const [types, setTypes] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Default center to Bangalore
  const defaultCenter = center || { lat: 12.9716, lng: 77.5946 }

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google) {
        setIsLoaded(true)
        return
      }

      try {
        // Fetch the script URL from our server-side API route
        const response = await fetch("/api/maps-api-url")
        if (!response.ok) {
          throw new Error("Failed to load Google Maps API URL")
        }

        const { url } = await response.json()

        // Create and load the script
        const script = document.createElement("script")
        script.src = url
        script.async = true
        script.defer = true

        window.initMap = () => {
          setIsLoaded(true)
        }

        document.head.appendChild(script)

        return () => {
          document.head.removeChild(script)
          delete window.initMap
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
      }
    }

    loadGoogleMaps()
  }, [])

  // Add useEffect to fetch types when component mounts
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const { MediaService } = await import("../lib/media-service")
        // Get unique types from listings instead of subtypes
        const allListings = await MediaService.getListings()
        const uniqueTypes = [...new Set(allListings.map((listing) => listing.type))]
        setTypes(uniqueTypes)
      } catch (error) {
        console.error("Error fetching types:", error)
      }
    }

    fetchTypes()
  }, [])

  // Add function to handle type filter
  const handleTypeFilter = (type: string) => {
    const newSelectedType = selectedType === type ? null : type
    setSelectedType(newSelectedType)

    // Notify parent component about the filter change
    if (onTypeFilterChange) {
      onTypeFilterChange(newSelectedType)
    }
  }

  // Filter listings based on selected type
  const filteredListingsByType = useMemo(() => {
    if (!selectedType) return listings

    return listings.filter((listing) => {
      return listing.type === selectedType
    })
  }, [listings, selectedType])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return

    // Initialize map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: "greedy",
    })

    // Add zoom change listener
    mapInstanceRef.current.addListener("zoom_changed", () => {
      const newZoom = mapInstanceRef.current.getZoom()
      setCurrentZoom(newZoom)
    })

    // Initialize info window
    infoWindowRef.current = new window.google.maps.InfoWindow()

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add markers for filtered listings
    filteredListingsByType.forEach((listing) => {
      const marker = new window.google.maps.Marker({
        position: { lat: listing.location.lat, lng: listing.location.lng },
        map: mapInstanceRef.current,
        title: listing.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getMarkerColor(listing),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        zIndex: selectedListing?.id === listing.id ? 1000 : 1,
      })

      // Add click listener - handle everything in one click
      marker.addListener("click", () => {
        handleListingClick(listing, marker)
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all filtered markers
    if (filteredListingsByType.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      filteredListingsByType.forEach((listing) => {
        bounds.extend({ lat: listing.location.lat, lng: listing.location.lng })
      })
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [isLoaded, filteredListingsByType, defaultCenter, zoom])

  // Handle listing click - consolidate all actions
  const handleListingClick = (listing: OOHListing, marker?: any) => {
    // 1. Update the selected listing state
    onListingClick(listing)

    // 2. Center the map immediately
    const listingPosition = {
      lat: listing.location.lat,
      lng: listing.location.lng,
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(18)
      mapInstanceRef.current.panTo(listingPosition)
      setCurrentZoom(18)
    }

    // 3. Show info window if marker is provided (clicked from map)
    if (marker && infoWindowRef.current) {
      const content = createInfoWindowContent(listing)
      infoWindowRef.current.setContent(content)
      infoWindowRef.current.open(mapInstanceRef.current, marker)
    }
  }

  // Update selected marker style
  useEffect(() => {
    if (!selectedListing || !markersRef.current.length) return

    markersRef.current.forEach((marker, index) => {
      const listing = listings[index]
      const isSelected = listing?.id === selectedListing.id

      marker.setIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: isSelected ? 15 : 12,
        fillColor: getMarkerColor(listing),
        fillOpacity: 1,
        strokeColor: isSelected ? "#1f2937" : "#ffffff",
        strokeWeight: isSelected ? 3 : 2,
      })

      marker.setZIndex(isSelected ? 1000 : 1)
    })
  }, [selectedListing, listings])

  // Handle external listing selection (from sidebar)
  useEffect(() => {
    if (!selectedListing || !mapInstanceRef.current) return

    // Center map when listing is selected from sidebar
    const listingPosition = {
      lat: selectedListing.location.lat,
      lng: selectedListing.location.lng,
    }

    mapInstanceRef.current.setZoom(18)
    mapInstanceRef.current.panTo(listingPosition)
    setCurrentZoom(18)

    // Find and show info window for the selected listing
    const markerIndex = listings.findIndex((l) => l.id === selectedListing.id)
    if (markerIndex !== -1 && markersRef.current[markerIndex] && infoWindowRef.current) {
      const content = createInfoWindowContent(selectedListing)
      infoWindowRef.current.setContent(content)
      infoWindowRef.current.open(mapInstanceRef.current, markersRef.current[markerIndex])
    }
  }, [selectedListing, listings])

  const getMarkerColor = (listing: OOHListing) => {
    switch (listing.availability) {
      case "Available":
        return "#10b981" // green
      case "Booked":
        return "#ef4444" // red
      case "Maintenance":
        return "#f59e0b" // yellow
      default:
        return "#6b7280" // gray
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const createInfoWindowContent = (listing: OOHListing) => {
    const hasImage = listing.images && listing.images.length > 0 && listing.images[0]

    return `
    <div style="max-width: 300px; padding: 8px;">
      ${
        hasImage
          ? `<img src="${listing.images[0]}" 
             alt="${listing.name}" 
             style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
          : ""
      }
      <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${listing.name}</h3>
      <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${listing.type}</p>
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">${listing.location.address}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 18px; font-weight: 700; color: #10b981;">${formatPrice(listing.pricing.monthly)}</span>
        <span style="font-size: 12px; background: ${listing.availability === "Available" ? "#dcfce7" : "#fee2e2"}; 
                     color: ${listing.availability === "Available" ? "#166534" : "#991b1b"}; 
                     padding: 2px 8px; border-radius: 12px;">${listing.availability}</span>
      </div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
        <div>📏 ${listing.specifications.size}</div>
        <div>👁️ ${listing.specifications.traffic}</div>
        <div>💡 ${listing.specifications.illumination}</div>
      </div>
    </div>
  `
  }

  const calculateZoomPercentage = (zoomLevel: number) => {
    // Fixed calculation to ensure level 18 shows as 89%
    if (zoomLevel === 18) {
      return 89 // Exactly match the reference image showing 89%
    }

    // For other zoom levels, use a scale where 18 is 89%
    const minZoom = 1
    const maxZoom = 21
    const basePercentage = ((zoomLevel - minZoom) / (maxZoom - minZoom)) * 100

    // Adjust the scale to match our reference points and round to whole numbers
    if (zoomLevel > 18) {
      return Math.round(Math.min(100, 89 + ((zoomLevel - 18) / (maxZoom - 18)) * 11))
    } else {
      return Math.round(Math.max(0, (zoomLevel / 18) * 89))
    }
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Zoom Indicator and Subtype Filters */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        {/* Zoom Indicator */}
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg">
          <div className="text-sm font-medium text-gray-700">Zoom: {calculateZoomPercentage(currentZoom)}%</div>
          <div className="text-xs text-gray-500">Level {currentZoom.toFixed(1)}</div>
        </div>

        {/* Subtype Filter Chips */}
        {types.length > 0 && (
          <div className="flex gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all shadow-lg ${
                  selectedType === type ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {type}
              </button>
            ))}
            {selectedType && (
              <button
                onClick={() => {
                  setSelectedType(null)
                  if (onTypeFilterChange) {
                    onTypeFilterChange(null)
                  }
                }}
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 transition-all shadow-lg"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
