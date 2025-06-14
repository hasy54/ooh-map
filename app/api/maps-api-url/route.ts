import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the API key from server-side environment variables (no NEXT_PUBLIC_ prefix)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key not found in environment variables")
      return NextResponse.json(
        {
          error: "Google Maps API key not configured",
          fallback: true,
        },
        { status: 500 },
      )
    }

    // Create the Google Maps API URL with callback and required libraries
    // Using callback method for more reliable initialization
    const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&callback=initMap`

    console.log("Google Maps API URL generated successfully")

    // Return the URL in the response
    return NextResponse.json({ url, success: true })
  } catch (error) {
    console.error("Error in maps-api-url route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        fallback: true,
      },
      { status: 500 },
    )
  }
}
