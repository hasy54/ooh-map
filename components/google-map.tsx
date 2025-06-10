"use client"

import { useEffect, useRef, useState } from "react"
import type { OOHListing } from "../types/ooh"

interface GoogleMapProps {
  listings: OOHListing[]
  selectedListing: OOHListing | null
  onListingClick: (listing: OOHListing) => void
  center?: { lat: number; lng: number }
  zoom?: number
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function GoogleMap({ listings, selectedListing, onListingClick, center, zoom = 12 }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(zoom)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  // Default center to Bangalore
  const defaultCenter = center || { lat: 12.9716, lng: 77.5946 }

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log("Google Maps already loaded")
          setIsLoaded(true)
          return
        }

        console.log("Loading Google Maps...")

        // Fetch the script URL from our server-side API route
        const response = await fetch("/api/maps-api-url")
        if (!response.ok) {
          throw new Error("Failed to load Google Maps API URL")
        }

        const { url } = await response.json()
        console.log("Google Maps URL:", url)

        // Create and load the script
        const script = document.createElement("script")
        script.src = url
        script.async = true
        script.defer = true

        // Set up a global callback for when the script loads
        window.initMap = () => {
          console.log("Google Maps script loaded via callback")
          setIsLoaded(true)
        }

        script.onload = () => {
          console.log("Script onload fired")
          // If initMap wasn't called, try direct initialization
          if (window.google && window.google.maps && window.google.maps.Map) {
            console.log("Google Maps available after script load")
            setIsLoaded(true)
          } else {
            console.log("Waiting for Google Maps to initialize...")
            // Wait a bit more for Google Maps to be ready
            setTimeout(() => {
              if (window.google && window.google.maps && window.google.maps.Map) {
                console.log("Google Maps ready after timeout")
                setIsLoaded(true)
              } else {
                console.error("Google Maps failed to initialize")
                setLoadingError("Google Maps failed to initialize")
              }
            }, 2000)
          }
        }

        script.onerror = (error) => {
          console.error("Failed to load Google Maps script:", error)
          setLoadingError("Failed to load Google Maps script")
        }

        document.head.appendChild(script)

        // Cleanup function
        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script)
          }
          delete window.initMap
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
        setLoadingError(`Error loading Google Maps: ${error}`)
      }
    }

    loadGoogleMaps()
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps?.Map) {
      console.log("Map initialization skipped:", {
        isLoaded,
        mapRef: !!mapRef.current,
        googleMaps: !!window.google?.maps?.Map,
      })
      return
    }

    console.log("Initializing map with", listings.length, "listings")

    try {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        mapId: "DEMO_MAP_ID", // Add a valid Map ID for Advanced Markers
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

      console.log("Map created successfully")

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

      // Check if we should use AdvancedMarkerElement or fallback to regular Marker
      const useAdvancedMarkers =
        window.google.maps.marker &&
        window.google.maps.marker.AdvancedMarkerElement &&
        !window.google.maps.marker.AdvancedMarkerElement.toString().includes("not supported")

      console.log("Using advanced markers:", useAdvancedMarkers)

      // Add markers for all listings
      listings.forEach((listing, index) => {
        try {
          let marker

          if (useAdvancedMarkers) {
            try {
              // Use AdvancedMarkerElement
              const markerElement = document.createElement("div")
              markerElement.style.width = "24px"
              markerElement.style.height = "24px"
              markerElement.style.borderRadius = "50%"
              markerElement.style.border = "2px solid #ffffff"
              markerElement.style.backgroundColor = getMarkerColor(listing)
              markerElement.style.cursor = "pointer"
              markerElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
              markerElement.style.transition = "all 0.2s ease"
              markerElement.title = listing.name

              marker = new window.google.maps.marker.AdvancedMarkerElement({
                position: { lat: listing.location.lat, lng: listing.location.lng },
                map: mapInstanceRef.current,
                title: listing.name,
                content: markerElement,
                zIndex: selectedListing?.id === listing.id ? 1000 : 1,
              })
            } catch (advancedMarkerError) {
              console.warn(
                "Failed to create AdvancedMarkerElement, falling back to regular marker:",
                advancedMarkerError,
              )
              // Fallback to regular marker
              marker = new window.google.maps.Marker({
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
            }
          } else {
            // Fallback to regular Marker
            marker = new window.google.maps.Marker({
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
          }

          // Add click listener
          marker.addListener("click", () => {
            handleListingClick(listing, marker)
          })

          markersRef.current.push(marker)
        } catch (markerError) {
          console.error(`Error creating marker for listing ${index}:`, markerError)
        }
      })

      console.log("Created", markersRef.current.length, "markers")

      // Fit bounds to show all markers
      if (listings.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        listings.forEach((listing) => {
          bounds.extend({ lat: listing.location.lat, lng: listing.location.lng })
        })
        mapInstanceRef.current.fitBounds(bounds)
      }
    } catch (error) {
      console.error("Error initializing map:", error)
      setLoadingError(`Error initializing map: ${error}`)
    }
  }, [isLoaded, listings, defaultCenter, zoom])

  // Handle listing click - consolidate all actions
  const handleListingClick = (listing: OOHListing, marker?: any) => {
    console.log("Listing clicked:", listing.name)

    // 1. Update the selected listing state
    onListingClick(listing)

    // 2. Smoothly animate to the listing position
    const listingPosition = {
      lat: listing.location.lat,
      lng: listing.location.lng,
    }

    if (mapInstanceRef.current) {
      // Use smooth pan and zoom animation
      mapInstanceRef.current.panTo(listingPosition)

      // Smooth zoom transition with a slight delay
      setTimeout(() => {
        mapInstanceRef.current.setZoom(18)
        setCurrentZoom(18)
      }, 300)
    }
  }

  // Update selected marker style
  useEffect(() => {
    if (!selectedListing || !markersRef.current.length) return

    markersRef.current.forEach((marker, index) => {
      const listing = listings[index]
      const isSelected = listing?.id === selectedListing.id

      try {
        if (marker.content) {
          // AdvancedMarkerElement
          const element = marker.content as HTMLElement
          element.style.width = isSelected ? "30px" : "24px"
          element.style.height = isSelected ? "30px" : "24px"
          element.style.borderWidth = isSelected ? "3px" : "2px"
          element.style.borderColor = isSelected ? "#1f2937" : "#ffffff"
          element.style.backgroundColor = getMarkerColor(listing)
          element.style.transform = isSelected ? "scale(1.1)" : "scale(1)"
        } else {
          // Regular Marker
          marker.setIcon({
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: isSelected ? 15 : 12,
            fillColor: getMarkerColor(listing),
            fillOpacity: 1,
            strokeColor: isSelected ? "#1f2937" : "#ffffff",
            strokeWeight: isSelected ? 3 : 2,
          })
        }

        marker.setZIndex(isSelected ? 1000 : 1)
      } catch (error) {
        console.error("Error updating marker style:", error)
      }
    })
  }, [selectedListing, listings])

  // Handle external listing selection (from sidebar)
  useEffect(() => {
    if (!selectedListing || !mapInstanceRef.current) return

    // Smoothly animate to listing when selected from sidebar
    const listingPosition = {
      lat: selectedListing.location.lat,
      lng: selectedListing.location.lng,
    }

    // Smooth pan animation
    mapInstanceRef.current.panTo(listingPosition)

    // Smooth zoom with delay
    setTimeout(() => {
      mapInstanceRef.current.setZoom(18)
      setCurrentZoom(18)
    }, 400)
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

  if (loadingError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Failed to load Google Maps</p>
          <p className="text-sm text-gray-500">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
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

      {/* Zoom Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg">
          <div className="text-sm font-medium text-gray-700">Zoom: {calculateZoomPercentage(currentZoom)}%</div>
          <div className="text-xs text-gray-500">Level {currentZoom.toFixed(1)}</div>
        </div>
      </div>
    </div>
  )
}
