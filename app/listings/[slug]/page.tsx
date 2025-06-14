import { notFound } from "next/navigation"
import { MediaService } from "../../../lib/media-service"
import { ListingDetailClient } from "./listing-detail-client"

interface PageProps {
  params: { slug: string }
}

export default async function ListingPage({ params }: PageProps) {
  try {
    console.log("Rendering listing page for slug:", params.slug)

    // Use the optimized single listing fetch
    const listing = await MediaService.getListingById(params.slug)

    if (!listing) {
      console.log("No listing found, calling notFound()")
      notFound()
    }

    console.log("Found listing:", listing.name)

    return <ListingDetailClient listing={listing} />
  } catch (error) {
    console.error("Error rendering listing page:", error)
    notFound()
  }
}
