"use client"

import { useState, useEffect } from "react"
import { Calendar, User, Mail, Phone, Building, CheckCircle, AlertCircle, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OOHListing } from "../../types/ooh"
import type { BookingFormData } from "../../types/booking"
import { BookingService } from "../../lib/booking-service"

interface BookingFlowProps {
  listing: OOHListing
}

type BookingStep = "dates" | "contact" | "review" | "confirmation"

export function BookingFlow({ listing }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("dates")
  const [formData, setFormData] = useState<BookingFormData>({
    client_name: "",
    client_email: "",
    client_phone: "",
    company_name: "",
    company_gst: "",
    start_date: "",
    end_date: "",
    duration_months: 1,
    campaign_details: "",
    special_requirements: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [availability, setAvailability] = useState<{
    available: boolean
    conflictingBookings: any[]
    nextAvailableDate?: string
    suggestedEndDate?: string
  }>({
    available: true,
    conflictingBookings: [],
  })
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Calculate end date and pricing when start date or duration changes
  useEffect(() => {
    if (formData.start_date && formData.duration_months) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + formData.duration_months)

      const endDateString = endDate.toISOString().split("T")[0]
      const baseAmount = listing.pricing.monthly * formData.duration_months
      const gstAmount = baseAmount * 0.18
      const totalWithGst = Math.round(baseAmount + gstAmount)

      setFormData((prev) => ({ ...prev, end_date: endDateString }))
      setTotalPrice(totalWithGst)
    }
  }, [formData.start_date, formData.duration_months, listing.pricing.monthly])

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (formData.start_date && formData.end_date) {
        setCheckingAvailability(true)
        const result = await BookingService.checkAvailability(listing.id, formData.start_date, formData.end_date)
        setAvailability(result)
        setCheckingAvailability(false)
      }
    }

    const timeoutId = setTimeout(checkAvailability, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [formData.start_date, formData.end_date, listing.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateStep = (step: BookingStep): boolean => {
    switch (step) {
      case "dates":
        return !!(formData.start_date && formData.duration_months && availability.available)
      case "contact":
        return !!(formData.client_name && formData.client_email && formData.client_phone)
      case "review":
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    const steps: BookingStep[] = ["dates", "contact", "review", "confirmation"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1 && validateStep(currentStep)) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: BookingStep[] = ["dates", "contact", "review", "confirmation"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const submitBooking = async () => {
    if (!validateStep("review")) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { booking, error: bookingError } = await BookingService.createBooking(
        listing.id,
        formData,
        totalPrice,
        formData.duration_months,
        listing, // Pass the listing data for email
      )

      if (bookingError || !booking) {
        setError(bookingError || "Failed to create booking")
        return
      }

      setBookingId(booking.id)
      setCurrentStep("confirmation")
    } catch (err) {
      console.error("Error submitting booking:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = (step: BookingStep): string => {
    switch (step) {
      case "dates":
        return "Select Dates"
      case "contact":
        return "Contact Information"
      case "review":
        return "Review & Confirm"
      case "confirmation":
        return "Booking Confirmed"
      default:
        return ""
    }
  }

  const renderStepIndicator = () => {
    const steps: BookingStep[] = ["dates", "contact", "review"]
    const currentIndex = steps.indexOf(currentStep)

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentIndex ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            <div className={`ml-2 text-sm font-medium ${index <= currentIndex ? "text-blue-600" : "text-gray-400"}`}>
              {getStepTitle(step)}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-px mx-4 ${index < currentIndex ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {currentStep === "dates" && "Select Campaign Dates"}
        {currentStep === "contact" && "Contact Information"}
        {currentStep === "review" && "Review Your Booking"}
        {currentStep === "confirmation" && "Booking Confirmed"}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Step 1: Select Dates */}
      {currentStep === "dates" && (
        <div className="space-y-6">
          <div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                <Select
                  value={formData.duration_months.toString()}
                  onValueChange={(value) => handleInputChange("duration_months", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 36].map((months) => (
                      <SelectItem key={months} value={months.toString()}>
                        {months} month{months !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show calculated end date */}
            {formData.start_date && formData.duration_months && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Campaign will end on:</div>
                <div className="font-medium text-gray-900">
                  {new Date(formData.end_date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            )}

            {/* Availability Check */}
            {formData.start_date && formData.end_date && (
              <div className="mt-4">
                {checkingAvailability ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking availability...</span>
                  </div>
                ) : (
                  <div>
                    <div
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        availability.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {availability.available ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Available for selected dates</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>Not available for selected dates. Please choose different dates.</span>
                        </>
                      )}
                    </div>

                    {/* Show next available date suggestion */}
                    {!availability.available && availability.nextAvailableDate && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-blue-900">Next Available Date:</div>
                            <div className="text-sm text-blue-700">
                              {new Date(availability.nextAvailableDate).toLocaleDateString("en-IN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                              {availability.suggestedEndDate && (
                                <span className="ml-2">
                                  -{" "}
                                  {new Date(availability.suggestedEndDate).toLocaleDateString("en-IN", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-700 border-blue-300 hover:bg-blue-100"
                            onClick={() => {
                              if (availability.nextAvailableDate) {
                                handleInputChange("start_date", availability.nextAvailableDate)
                              }
                            }}
                          >
                            Use This Date
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Show conflicting bookings details */}
                    {!availability.available && availability.conflictingBookings.length > 0 && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="text-sm font-medium text-orange-900 mb-2">Conflicting Bookings:</div>
                        <div className="space-y-1">
                          {availability.conflictingBookings.map((booking, index) => (
                            <div key={index} className="text-xs text-orange-700">
                              {new Date(booking.start_date).toLocaleDateString("en-IN")} -{" "}
                              {new Date(booking.end_date).toLocaleDateString("en-IN")}
                              {booking.status === "pending" && <span className="ml-2 text-orange-600">(Pending)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pricing Summary */}
            {formData.start_date && formData.duration_months && availability.available && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Pricing Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Campaign Duration:</span>
                    <span>
                      {formData.duration_months} month{formData.duration_months !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Rate:</span>
                    <span>{formatPrice(listing.pricing.monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(listing.pricing.monthly * formData.duration_months)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>{formatPrice(listing.pricing.monthly * formData.duration_months * 0.18)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-blue-900 pt-2 border-t border-blue-200">
                    <span>Total Amount:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={nextStep} disabled={!validateStep("dates")} className="px-8">
              Continue to Contact Info
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Contact Information */}
      {currentStep === "contact" && (
        <div className="space-y-6">
          <div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => handleInputChange("client_name", e.target.value)}
                      className="pl-10"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => handleInputChange("client_email", e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="tel"
                      value={formData.client_phone}
                      onChange={(e) => handleInputChange("client_phone", e.target.value)}
                      className="pl-10"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      className="pl-10"
                      placeholder="Your company name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    value={formData.company_gst}
                    onChange={(e) => handleInputChange("company_gst", e.target.value)}
                    className="pl-10"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={!validateStep("contact")} className="px-8">
              Review Booking
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === "review" && (
        <div className="space-y-6">
          <div>
            {/* Booking Summary */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Media Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{listing.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">
                      {listing.location.address}, {listing.location.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">{listing.type}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Campaign Dates</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span className="font-medium">{new Date(formData.start_date).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span className="font-medium">{new Date(formData.end_date).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {formData.duration_months} month{formData.duration_months !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{formData.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{formData.client_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-medium">{formData.client_phone}</span>
                  </div>
                  {formData.company_name && (
                    <div className="flex justify-between">
                      <span>Company:</span>
                      <span className="font-medium">{formData.company_name}</span>
                    </div>
                  )}
                  {formData.company_gst && (
                    <div className="flex justify-between">
                      <span>GST Number:</span>
                      <span className="font-medium font-mono">{formData.company_gst}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">Pricing Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rate:</span>
                    <span>{formatPrice(listing.pricing.monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>
                      {formData.duration_months} month{formData.duration_months !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(listing.pricing.monthly * formData.duration_months)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>{formatPrice(listing.pricing.monthly * formData.duration_months * 0.18)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-900 pt-2 border-t border-green-200">
                    <span>Total Amount (incl. GST):</span>
                    <span className="text-lg">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• This booking is subject to availability confirmation</li>
                <li>• Our team will contact you within 24 hours to confirm details</li>
                <li>• Payment terms and installation details will be discussed separately</li>
                <li>• Booking can be modified or cancelled before confirmation</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={submitBooking} disabled={isSubmitting} className="px-8 bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === "confirmation" && bookingId && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted Successfully!</h2>
            <p className="text-gray-600">Your booking request has been received and is being processed.</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Booking Reference</div>
            <div className="text-lg font-mono font-bold text-gray-900">{bookingId.slice(0, 8).toUpperCase()}</div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Our team will review your booking request</li>
                <li>✓ We'll contact you within 24 hours to confirm availability</li>
                <li>✓ Payment and installation details will be discussed</li>
                <li>✓ You'll receive a confirmation email with all details</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const message = `Hi! I just submitted a booking request for ${listing.name}. My booking reference is ${bookingId.slice(0, 8).toUpperCase()}. Please confirm the details.`
                  const encodedMessage = encodeURIComponent(message)
                  const whatsappUrl = `https://wa.me/919892320184?text=${encodedMessage}`
                  window.open(whatsappUrl, "_blank")
                }}
              >
                Contact via WhatsApp
              </Button>
              <Button className="flex-1" onClick={() => (window.location.href = "/")}>
                Browse More Listings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
