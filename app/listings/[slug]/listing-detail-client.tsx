"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { OOHListing } from "../../../types/ooh"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { generateListingSlug } from "../../../utils/slug-utils"

interface ListingDetailClientProps {
  listing: OOHListing
}

export function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <>
      {/* Detailed Information */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Outdoor Advertising at {listing.name}</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>
                  Discover premium outdoor advertising and hoarding opportunities at {listing.name}. This {listing.type}{" "}
                  in {listing.location.city} offers exceptional visibility for brands seeking impactful outdoor
                  advertising solutions across India's major metropolitan areas.
                </p>
                <p className="mt-4">
                  Our outdoor advertising network spans Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Pune,
                  Ahmedabad, Jaipur, and Lucknow, making this hoarding space part of India's largest outdoor advertising
                  ecosystem. With {listing.specifications.visibility} visibility and {listing.specifications.size}{" "}
                  display area, this location delivers maximum impact for your outdoor advertising campaigns.
                </p>
                <p className="mt-4">
                  Currently marked as '{listing.availability}', this hoarding presents an immediate opportunity for
                  brands looking to dominate outdoor advertising in {listing.location.city}. The{" "}
                  {listing.specifications.illumination} display ensures 24/7 visibility, making it perfect for
                  comprehensive outdoor advertising strategies across India's competitive markets.
                </p>
                <p className="mt-4">
                  Book this premium hoarding location now and join leading brands who trust our outdoor advertising
                  solutions across Mumbai, Delhi, Bangalore, and other major Indian cities. This {listing.type} is
                  professionally managed by {listing.managedBy || "our expert team"}, ensuring reliable outdoor
                  advertising operations and maximum ROI for your campaigns.
                </p>
                <p className="mt-4">
                  Whether you're launching a new product, building brand awareness, or driving local sales, this outdoor
                  advertising space in {listing.location.city} provides the perfect platform to reach your target
                  audience. The strategic location ensures high visibility among commuters, shoppers, and local
                  residents, making it an ideal choice for both national and regional advertising campaigns.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-8">
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Display Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{listing.specifications.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{listing.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Illumination:</span>
                        <span className="font-medium">{listing.specifications.illumination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visibility:</span>
                        <span className="font-medium">{listing.specifications.visibility}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Traffic & Demographics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Traffic:</span>
                        <span className="font-medium">{listing.specifications.traffic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Footfall:</span>
                        <span className="font-medium">{listing.demographics.footfall || "High"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Audience:</span>
                        <span className="font-medium">{listing.demographics.targetAudience || "General Public"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Managed By:</span>
                        <span className="font-medium">{listing.managedBy || "Professional Team"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-8">
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Location Details</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Address Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-500 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div>
                        <div className="font-medium">{listing.location.address}</div>
                        <div className="text-gray-600">
                          {listing.location.city}, {listing.location.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        {listing.location.lat.toFixed(6)}, {listing.location.lng.toFixed(6)}
                      </div>
                    </div>
                  </div>
                  <a href={`/?listing=${listing.id}`} className="inline-block mt-6">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      View on Interactive Map
                    </button>
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Area Highlights</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>• High-traffic commercial area</p>
                    <p>• Excellent visibility from main road</p>
                    <p>• Strategic location for brand exposure</p>
                    <p>• Easy accessibility for installation</p>
                    <p>• Professional maintenance support</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="mt-8">
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Information</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="bg-green-50 p-6 rounded-lg text-center mb-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">{formatPrice(listing.pricing.monthly)}</div>
                    <div className="text-gray-600">per month</div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• Competitive pricing for premium location</p>
                    <p>• Flexible contract terms available</p>
                    <p>• Volume discounts for multiple bookings</p>
                    <p>• Professional installation included</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>✓ Prime advertising space rental</p>
                    <p>✓ Professional installation support</p>
                    <p>✓ Regular maintenance and cleaning</p>
                    <p>✓ 24/7 monitoring and security</p>
                    <p>✓ Performance reporting</p>
                    <p>✓ Dedicated account management</p>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Prices may vary based on campaign duration and specific requirements.
                      Contact us for custom pricing and package deals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <a href="tel:9893423245" className="block">
          <Button variant="outline" className="w-full flex flex-col items-center p-4 h-auto">
            <Phone className="w-5 h-5 mb-2" />
            <span>Call Now</span>
          </Button>
        </a>
        <a
          href={`https://wa.me/919892320184?text=${encodeURIComponent(`Hi! I'm interested in booking this OOH space: ${listing.name} in ${listing.location.city}. Please share more details.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" className="w-full flex flex-col items-center p-4 h-auto">
            <svg className="w-5 h-5 mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
            <span>WhatsApp</span>
          </Button>
        </a>
      </div>

      {/* Main CTA - Updated to include Book Now */}
      <div className="space-y-3">
        <a href={`/listings/${generateListingSlug(listing)}/booking`} className="block">
          <Button className="w-full" size="lg">
            BOOK NOW - {formatPrice(listing.pricing.monthly)}/month
          </Button>
        </a>
        <a
          href={`https://wa.me/919892320184?text=${encodeURIComponent(`Hi! I'm interested in booking this OOH space:

*${listing.name}*
📍 ${listing.location.address}, ${listing.location.city}
📏 Size: ${listing.specifications.size}
💡 Type: ${listing.type}
💰 Price: ${formatPrice(listing.pricing.monthly)}/month
🚦 Traffic: ${listing.specifications.traffic}
⚡ Illumination: ${listing.specifications.illumination}

Please share more details and availability.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" className="w-full" size="lg">
            Book via WhatsApp
          </Button>
        </a>
      </div>
    </>
  )
}
