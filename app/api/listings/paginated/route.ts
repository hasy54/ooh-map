import { type NextRequest, NextResponse } from "next/server"
import { MediaService } from "../../../../lib/media-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page = 0, limit = 100, filters = {} } = body

    // For now, we'll get all listings and filter client-side for search
    // This ensures we get all 1499 listings
    const listings = await MediaService.getPaginatedListings(page, limit)

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error in paginated listings API:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}
