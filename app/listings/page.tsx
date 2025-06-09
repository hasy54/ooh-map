import { MediaService } from "../../lib/media-service"
import { ListingsPageClient } from "./listings-page-client"

export default async function ListingsPage() {
  try {
    // Only fetch filters data and total count - no listings yet!
    const [filtersData, totalCount] = await Promise.all([
      MediaService.getFiltersData(),
      MediaService.getListingsCount(),
    ])

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">OOH Listings</h1>
            <p className="text-gray-600">
              Discover outdoor advertising opportunities across India. Total listings: {totalCount}
            </p>
          </div>

          <ListingsPageClient filtersData={filtersData} totalCount={totalCount} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading listings page:", error)

    // Fallback with empty data
    const fallbackFiltersData = {
      cities: [],
      types: [],
      subtypes: [],
      priceRange: { min: 0, max: 300000 },
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">OOH Listings</h1>
            <p className="text-gray-600">Discover outdoor advertising opportunities across India.</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Page</h3>
            <p className="text-red-700">There was an error loading the listings page. Please refresh to try again.</p>
          </div>

          <ListingsPageClient filtersData={fallbackFiltersData} totalCount={0} />
        </div>
      </div>
    )
  }
}
