"use client"

import { useState } from "react"
import type { OOHListing } from "../types/ooh"

interface MapViewProps {
  listings: OOHListing[]
  selectedListing: OOHListing | null
  onListingClick: (listing: OOHListing) => void
}

export function MapView({ listings, selectedListing, onListingClick }: MapViewProps) {
  const [mapCenter] = useState({ lat: 12.9716, lng: 77.5946 })

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Map Container */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
        {/* Simulated map background */}
        <div className="w-full h-full relative overflow-hidden">
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-20 grid-rows-20 w-full h-full">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="border border-gray-300"></div>
              ))}
            </div>
          </div>

          {/* Map markers */}
          {listings.map((listing, index) => {
            const x = 20 + ((index * 150) % 800)
            const y = 100 + ((index * 120) % 400)

            return (
              <button
                key={listing.id}
                onClick={() => onListingClick(listing)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                  selectedListing?.id === listing.id ? "z-20 scale-110" : "z-10 hover:scale-105"
                } transition-all duration-200`}
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ${
                    listing.availability === "Available"
                      ? "bg-green-500"
                      : listing.availability === "Booked"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                >
                  {listing.type === "Billboard"
                    ? "B"
                    : listing.type === "Digital Display"
                      ? "D"
                      : listing.type === "Transit"
                        ? "T"
                        : listing.type === "Mall Display"
                          ? "M"
                          : "S"}
                </div>
                {selectedListing?.id === listing.id && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap">
                    {listing.name}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="bg-white p-2 rounded shadow-lg hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="bg-white p-2 rounded shadow-lg hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg">
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
    </div>
  )
}
