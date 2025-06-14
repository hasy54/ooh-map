import { supabase } from "./supabase"
import type { Database } from "./supabase"
import type { BookingFormData, Booking } from "../types/booking"
import type { OOHListing } from "../types/ooh"

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"]
type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"]

export class BookingService {
  // Create a new booking
  static async createBooking(
    mediaId: string,
    formData: BookingFormData,
    totalPrice: number,
    periodInMonths: number,
    listing?: OOHListing,
  ): Promise<{ booking: Booking | null; error: string | null }> {
    try {
      console.log("🔄 Creating booking for media ID:", mediaId)

      // Generate a unique booking code
      const bookingCode = Math.floor(100000 + Math.random() * 900000)

      const bookingData: BookingInsert = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        client_name: formData.client_name,
        client_email: formData.client_email,
        booking_price: totalPrice,
        status: "pending",
        media_id: { id: mediaId }, // Store as JSONB
        period: periodInMonths,
        booker: formData.client_name,
        code: bookingCode,
      }

      console.log("💾 Inserting booking data...")

      const { data, error } = await supabase.from("bookings").insert(bookingData).select().single()

      if (error) {
        console.error("❌ Error creating booking:", error)
        return { booking: null, error: error.message }
      }

      const booking = data as Booking
      console.log("✅ Booking created successfully:", booking.id)

      // Send confirmation emails if listing data is provided
      if (listing) {
        console.log("📧 Sending emails via API route...")
        try {
          const emailPayload = {
            listing,
            formData,
            bookingId: booking.id,
            totalPrice,
            bookingCode,
          }

          const response = await fetch("/api/send-booking-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
          })

          const emailResult = await response.json()

          if (emailResult.success) {
            console.log("✅ Emails sent successfully")
          } else {
            console.error("❌ Failed to send emails:", emailResult.error)
          }
        } catch (emailError) {
          console.error("❌ Error calling email API:", emailError)
          // Don't fail the booking if email fails
        }
      } else {
        console.warn("⚠️ No listing data provided, skipping email sending")
      }

      return { booking, error: null }
    } catch (error) {
      console.error("❌ Error in createBooking:", error)
      return { booking: null, error: "Failed to create booking" }
    }
  }

  // Get booking by ID
  static async getBooking(id: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching booking:", error)
        return null
      }

      return data as Booking
    } catch (error) {
      console.error("Error in getBooking:", error)
      return null
    }
  }

  // Get bookings for a media item
  static async getBookingsForMedia(mediaId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .contains("media_id", { id: mediaId })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching bookings for media:", error)
        return []
      }

      return (data as Booking[]) || []
    } catch (error) {
      console.error("Error in getBookingsForMedia:", error)
      return []
    }
  }

  // Update booking status
  static async updateBookingStatus(
    id: string,
    status: "pending" | "confirmed" | "cancelled",
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Error updating booking status:", error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error("Error in updateBookingStatus:", error)
      return { success: false, error: "Failed to update booking status" }
    }
  }

  // Check if dates are available for a media item
  static async checkAvailability(
    mediaId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    available: boolean
    conflictingBookings: Booking[]
    nextAvailableDate?: string
    suggestedEndDate?: string
  }> {
    try {
      // Get all confirmed and pending bookings for this media
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .contains("media_id", { id: mediaId })
        .in("status", ["pending", "confirmed"])
        .order("start_date", { ascending: true })

      if (error) {
        console.error("Error checking availability:", error)
        return { available: true, conflictingBookings: [] }
      }

      const allBookings = (data as Booking[]) || []

      // Check for conflicts with requested dates
      const conflictingBookings = allBookings.filter((booking) => {
        const bookingStart = new Date(booking.start_date)
        const bookingEnd = new Date(booking.end_date)
        const requestStart = new Date(startDate)
        const requestEnd = new Date(endDate)

        return requestStart <= bookingEnd && requestEnd >= bookingStart
      })

      const available = conflictingBookings.length === 0

      // If not available, find the next available date
      let nextAvailableDate: string | undefined
      let suggestedEndDate: string | undefined

      if (!available && allBookings.length > 0) {
        const requestStart = new Date(startDate)
        const requestEnd = new Date(endDate)
        const requestDuration = Math.ceil((requestEnd.getTime() - requestStart.getTime()) / (1000 * 60 * 60 * 24))

        // Sort bookings by start date
        const sortedBookings = allBookings.sort(
          (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
        )

        // Find the earliest end date that conflicts with our request
        const conflictingEndDates = conflictingBookings
          .map((booking) => new Date(booking.end_date))
          .sort((a, b) => a.getTime() - b.getTime())

        if (conflictingEndDates.length > 0) {
          // Start checking from the day after the earliest conflicting booking ends
          const checkDate = new Date(conflictingEndDates[0])
          checkDate.setDate(checkDate.getDate() + 1)

          // Look for a gap that can accommodate our request duration
          let foundSlot = false
          const maxSearchDays = 365 // Limit search to 1 year

          for (let i = 0; i < maxSearchDays && !foundSlot; i++) {
            const potentialStart = new Date(checkDate)
            const potentialEnd = new Date(checkDate)
            potentialEnd.setDate(potentialEnd.getDate() + requestDuration)

            // Check if this slot conflicts with any existing booking
            const hasConflict = sortedBookings.some((booking) => {
              const bookingStart = new Date(booking.start_date)
              const bookingEnd = new Date(booking.end_date)

              return potentialStart <= bookingEnd && potentialEnd >= bookingStart
            })

            if (!hasConflict) {
              nextAvailableDate = potentialStart.toISOString().split("T")[0]
              suggestedEndDate = potentialEnd.toISOString().split("T")[0]
              foundSlot = true
            } else {
              // Move to the next day
              checkDate.setDate(checkDate.getDate() + 1)
            }
          }
        }
      }

      return {
        available,
        conflictingBookings,
        nextAvailableDate,
        suggestedEndDate,
      }
    } catch (error) {
      console.error("Error in checkAvailability:", error)
      return { available: true, conflictingBookings: [] }
    }
  }

  // Calculate booking period in months
  static calculatePeriodInMonths(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const yearDiff = end.getFullYear() - start.getFullYear()
    const monthDiff = end.getMonth() - start.getMonth()
    const dayDiff = end.getDate() - start.getDate()

    let totalMonths = yearDiff * 12 + monthDiff

    // If end day is less than start day, subtract a month and add the remaining days
    if (dayDiff < 0) {
      totalMonths -= 1
      const daysInMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate()
      const remainingDays = daysInMonth + dayDiff
      totalMonths += remainingDays / daysInMonth
    } else if (dayDiff > 0) {
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
      totalMonths += dayDiff / daysInMonth
    }

    return Math.max(1, Math.round(totalMonths * 100) / 100) // Round to 2 decimal places, minimum 1 month
  }
}
