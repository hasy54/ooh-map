export const BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946 }
export const MUMBAI_CENTER = { lat: 19.076, lng: 72.8777 }
export const DELHI_CENTER = { lat: 28.6139, lng: 77.209 }
export const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 }
export const HYDERABAD_CENTER = { lat: 17.385, lng: 78.4867 }

export const CITY_CENTERS = {
  bangalore: BANGALORE_CENTER,
  mumbai: MUMBAI_CENTER,
  delhi: DELHI_CENTER,
  chennai: CHENNAI_CENTER,
  hyderabad: HYDERABAD_CENTER,
}

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export const getMapBounds = (listings: Array<{ location: { lat: number; lng: number } }>) => {
  if (listings.length === 0) return null

  let minLat = listings[0].location.lat
  let maxLat = listings[0].location.lat
  let minLng = listings[0].location.lng
  let maxLng = listings[0].location.lng

  listings.forEach((listing) => {
    minLat = Math.min(minLat, listing.location.lat)
    maxLat = Math.max(maxLat, listing.location.lat)
    minLng = Math.min(minLng, listing.location.lng)
    maxLng = Math.max(maxLng, listing.location.lng)
  })

  return {
    north: maxLat,
    south: minLat,
    east: maxLng,
    west: minLng,
  }
}

export default MUMBAI_CENTER
