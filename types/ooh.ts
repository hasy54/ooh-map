export interface OOHListing {
  id: string
  name: string
  type: "Billboard" | "Digital Display" | "Transit" | "Street Furniture" | "Mall Display"
  location: {
    lat: number
    lng: number
    address: string
    city: string
    state: string
  }
  specifications: {
    size: string
    illumination: "Lit" | "Non-lit" | "Digital"
    visibility: "High" | "Medium" | "Low"
    traffic: string
  }
  pricing: {
    monthly: number
    currency: string
  }
  availability: "Available" | "Booked" | "Maintenance"
  images: string[]
  description: string
  features: string[]
  demographics: {
    footfall: string
    targetAudience: string
  }
  managedBy?: string
}
