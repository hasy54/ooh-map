"use client"

import { useState } from "react"
import { X, Copy, Share2, MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OOHListing } from "../types/ooh"

interface ShareModalProps {
  listing: OOHListing
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ listing, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const shareUrl = `${window.location.origin}/listings/${listing.id}`
  const shareTitle = `${listing.name} - ${listing.type} in ${listing.location.city}`
  const shareText = `Check out this premium ${listing.type} at ${listing.name} in ${listing.location.city}. ${listing.specifications.size} display with ${listing.specifications.illumination} illumination. Starting at ${formatPrice(listing.pricing.monthly)}/month.`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Native share cancelled or failed")
      }
    }
  }

  const handleWhatsAppShare = () => {
    const whatsappText = `${shareText}\n\n🔗 View details: ${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareTitle)
    const body = encodeURIComponent(`${shareText}\n\nView full details: ${shareUrl}`)
    const emailUrl = `mailto:?subject=${subject}&body=${body}`
    window.open(emailUrl)
  }

  const handleTwitterShare = () => {
    const twitterText = `${shareText} ${shareUrl}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`
    window.open(twitterUrl, "_blank")
  }

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(linkedinUrl, "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Share Listing</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing Preview */}
        <div className="p-6 border-b">
          <div className="flex gap-3">
            {listing.images && listing.images.length > 0 && listing.images[0] ? (
              <img
                src={listing.images[0] || "/placeholder.svg"}
                alt={listing.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Share2 className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{listing.name}</h3>
              <p className="text-sm text-gray-600 truncate">
                {listing.location.city} • {listing.type}
              </p>
              <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(listing.pricing.monthly)}/month</p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-6 space-y-4">
          {/* Copy Link */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Copy Link</h3>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 truncate">{shareUrl}</div>
              <Button
                onClick={handleCopyLink}
                variant={copied ? "default" : "outline"}
                className={`flex-shrink-0 ${copied ? "bg-green-600 hover:bg-green-700" : ""}`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Quick Share</h3>
              <Button onClick={handleNativeShare} variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share via Device
              </Button>
            </div>
          )}

          {/* Social Share Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Share via</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleWhatsAppShare} variant="outline" className="flex items-center justify-center p-3">
                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                WhatsApp
              </Button>

              <Button onClick={handleEmailShare} variant="outline" className="flex items-center justify-center p-3">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Email
              </Button>

              <Button onClick={handleTwitterShare} variant="outline" className="flex items-center justify-center p-3">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Twitter
              </Button>

              <Button onClick={handleLinkedInShare} variant="outline" className="flex items-center justify-center p-3">
                <svg className="w-4 h-4 mr-2 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </Button>
            </div>
          </div>

          {/* Book Now CTA */}
          <div className="pt-4 border-t">
            <Button
              onClick={() => {
                const message = `Hi! I'm interested in booking this OOH space:

*${listing.name}*
📍 ${listing.location.address}, ${listing.location.city}
📏 Size: ${listing.specifications.size}
💡 Type: ${listing.type}
💰 Price: ${formatPrice(listing.pricing.monthly)}/month
🚦 Traffic: ${listing.specifications.traffic}
⚡ Illumination: ${listing.specifications.illumination}

Please share more details and availability.`

                const encodedMessage = encodeURIComponent(message)
                const whatsappUrl = `https://wa.me/919892320184?text=${encodedMessage}`
                window.open(whatsappUrl, "_blank")
                onClose()
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Book via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
