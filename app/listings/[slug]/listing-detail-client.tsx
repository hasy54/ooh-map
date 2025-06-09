"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareModal } from "../../components/share-modal"
import type { OOHListing } from "../../../types/ooh"

interface ListingDetailClientProps {
  listing: OOHListing
}

export function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const [showShareModal, setShowShareModal] = useState(false)

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

      {/* Share Modal */}
      <ShareModal listing={listing} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </>
  )
}
