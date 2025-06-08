"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Copy, Check } from "lucide-react"
import type { OOHListing } from "../types/ooh"

interface ShareModalProps {
  listing: OOHListing
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ listing, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Generate the shareable link (you can customize this URL structure)
  const shareUrl = `${window.location.origin}?listing=${listing.id}&lat=${listing.location.lat}&lng=${listing.location.lng}`

  const shareText = `Check out this OOH advertising space: ${listing.name} in ${listing.location.city}. ${shareUrl}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleWhatsAppShare = () => {
    const whatsappText = encodeURIComponent(shareText)
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`OOH Space: ${listing.name}`)
    const body = encodeURIComponent(shareText)
    const emailUrl = `mailto:?subject=${subject}&body=${body}`
    window.open(emailUrl)
  }

  const handleTwitterShare = () => {
    const twitterText = encodeURIComponent(
      `Check out this OOH advertising space: ${listing.name} in ${listing.location.city}`,
    )
    const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Share</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Close share modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link">Send a link</TabsTrigger>
              <TabsTrigger value="embed">Embed a map</TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 mt-4">
              {/* Listing Preview */}
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                {listing.images && listing.images.length > 0 && listing.images[0] ? (
                  <img
                    src={listing.images[0] || "/placeholder.svg"}
                    alt={listing.name}
                    className="w-16 h-12 object-cover rounded"
                  />
                ) : null}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{listing.name}</h3>
                  <p className="text-xs text-gray-600 truncate">
                    {listing.location.address}, {listing.location.city}
                  </p>
                </div>
              </div>

              {/* Link to Share */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link to share</label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1 text-sm" />
                  <Button onClick={handleCopyLink} variant="outline" size="sm" className="px-3">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>

                <button
                  onClick={handleTwitterShare}
                  className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">X</span>
                </button>

                <button
                  onClick={handleEmailShare}
                  className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Email</span>
                </button>
              </div>
            </TabsContent>

            <TabsContent value="embed" className="space-y-4 mt-4">
              <div className="text-center py-8 text-gray-500">
                <p>Embed functionality coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
