"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Filter, X } from "lucide-react"

interface FiltersProps {
  onFiltersChange: (filters: any) => void
}

export function Filters({ onFiltersChange }: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 300000])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [availability, setAvailability] = useState("all")
  const [illumination, setIllumination] = useState("all")

  const oohTypes = ["Billboard", "Digital Display", "Transit", "Street Furniture", "Mall Display"]

  const toggleType = (type: string) => {
    const newTypes = selectedTypes.includes(type) ? selectedTypes.filter((t) => t !== type) : [...selectedTypes, type]
    setSelectedTypes(newTypes)
    updateFilters({ types: newTypes })
  }

  const updateFilters = (newFilters: any) => {
    onFiltersChange({
      priceRange,
      types: selectedTypes,
      availability,
      illumination,
      ...newFilters,
    })
  }

  return (
    <div className="border-b bg-white">
      <div className="flex items-center gap-4 p-4">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />
          All filters
        </Button>

        <Select
          value={availability}
          onValueChange={(value) => {
            setAvailability(value)
            updateFilters({ availability: value })
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Booked">Booked</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={illumination}
          onValueChange={(value) => {
            setIllumination(value)
            updateFilters({ illumination: value })
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Illumination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Lit">Lit</SelectItem>
            <SelectItem value="Digital">Digital</SelectItem>
            <SelectItem value="Non-lit">Non-lit</SelectItem>
          </SelectContent>
        </Select>

        {selectedTypes.length > 0 && (
          <div className="flex gap-2">
            {selectedTypes.map((type) => (
              <Badge key={type} variant="secondary" className="cursor-pointer" onClick={() => toggleType(type)}>
                {type} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <div className="border-t p-4 space-y-4">
          <div>
            <h4 className="font-medium mb-2">OOH Type</h4>
            <div className="flex flex-wrap gap-2">
              {oohTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleType(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Price Range (Monthly)</h4>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={(value) => {
                  setPriceRange(value)
                  updateFilters({ priceRange: value })
                }}
                max={300000}
                min={0}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>₹{priceRange[0].toLocaleString()}</span>
                <span>₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
