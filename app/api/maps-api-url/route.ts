import { NextResponse } from "next/server"

export async function GET() {
  // Get the API key from server-side environment variables (no NEXT_PUBLIC_ prefix)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
  }

  // Create the Google Maps API URL with the key
  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`

  // Return the URL in the response
  return NextResponse.json({ url })
}
