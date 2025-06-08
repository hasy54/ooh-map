"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CITY_CENTERS } from "../utils/map-utils"

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (city: string, center: { lat: number; lng: number }) => void
}

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const cities = [
    { value: "all", label: "All Cities", state: "India" },
    { value: "mumbai", label: "Mumbai", state: "Maharashtra" },
    { value: "bangalore", label: "Bangalore", state: "Karnataka", disabled: true, comingSoon: true },
    { value: "delhi", label: "Delhi", state: "Delhi", disabled: true, comingSoon: true },
    { value: "chennai", label: "Chennai", state: "Tamil Nadu", disabled: true, comingSoon: true },
    { value: "hyderabad", label: "Hyderabad", state: "Telangana", disabled: true, comingSoon: true },
  ]

  return (
    <Select
      value={selectedCity}
      onValueChange={(city) => {
        const selectedCityData = cities.find((c) => c.value === city)
        if (selectedCityData && !selectedCityData.disabled) {
          if (city === "all") {
            // For "all", use Mumbai center as default but don't filter by city
            const center = CITY_CENTERS["mumbai" as keyof typeof CITY_CENTERS]
            onCityChange(city, center)
          } else {
            const center = CITY_CENTERS[city as keyof typeof CITY_CENTERS]
            onCityChange(city, center)
          }
        }
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select city" />
      </SelectTrigger>
      <SelectContent>
        {cities.map((city) => (
          <SelectItem key={city.value} value={city.value} disabled={city.disabled}>
            <div>
              <div className="font-medium flex items-center gap-2">
                {city.label}
                {city.comingSoon && <span className="text-xs text-gray-400">(Coming Soon)</span>}
              </div>
              <div className="text-xs text-gray-500">{city.state}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
