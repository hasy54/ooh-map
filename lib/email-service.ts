import { Resend } from "resend"
import type { OOHListing } from "../types/ooh"
import type { BookingFormData } from "../types/booking"

// Debug the API key
console.log("🔑 Resend API Key status:", process.env.RESEND_API_KEY ? "✅ Present" : "❌ Missing")
console.log(
  "🔑 API Key preview:",
  process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 8)}...` : "Not found",
)

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface BookingEmailData {
  listing: OOHListing
  formData: BookingFormData
  bookingId: string
  totalPrice: number
  bookingCode: number
}

export class EmailService {
  static async sendBookingConfirmation(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("📧 Starting sendBookingConfirmation...")

      if (!resend) {
        console.error("❌ Resend client not initialized - API key missing")
        return { success: false, error: "Email service not configured - missing API key" }
      }

      console.log("✅ Resend client initialized successfully")

      const { listing, formData, bookingId, totalPrice, bookingCode } = data

      console.log("📧 Email data:", {
        listingName: listing.name,
        clientEmail: formData.client_email,
        bookingId: bookingId.slice(0, 8),
        totalPrice,
      })

      const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(price)
      }

      const baseAmount = listing.pricing.monthly * formData.duration_months
      const gstAmount = baseAmount * 0.18

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .booking-id { background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .detail-item { padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #666; }
            .detail-value { color: #333; }
            .pricing-summary { background: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .total-amount { font-size: 18px; font-weight: bold; color: #2e7d32; border-top: 2px solid #4caf50; padding-top: 10px; margin-top: 10px; }
            .next-steps { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .next-steps ul { margin: 10px 0; padding-left: 20px; }
            .next-steps li { margin: 5px 0; }
            .contact-info { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Booking Confirmation</h1>
            <p>Your OOH advertising space has been successfully booked!</p>
          </div>
          
          <div class="content">
            <div class="booking-id">
              <h3>Booking Reference</h3>
              <div style="font-size: 24px; font-weight: bold; font-family: monospace; color: #1976d2;">
                ${bookingId.slice(0, 8).toUpperCase()}
              </div>
              <div style="font-size: 16px; color: #666; margin-top: 5px;">
                Booking Code: #${bookingCode}
              </div>
            </div>

            <div class="booking-card">
              <h3>📍 Media Details</h3>
              <div class="detail-item">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${listing.name}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Location:</div>
                <div class="detail-value">${listing.location.address}, ${listing.location.city}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Type:</div>
                <div class="detail-value">${listing.type}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Size:</div>
                <div class="detail-value">${listing.specifications.size}</div>
              </div>
            </div>

            <div class="booking-card">
              <h3>📅 Campaign Details</h3>
              <div class="detail-item">
                <div class="detail-label">Start Date:</div>
                <div class="detail-value">${new Date(formData.start_date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">End Date:</div>
                <div class="detail-value">${new Date(formData.end_date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Duration:</div>
                <div class="detail-value">${formData.duration_months} month${formData.duration_months !== 1 ? "s" : ""}</div>
              </div>
            </div>

            <div class="booking-card">
              <h3>👤 Contact Information</h3>
              <div class="detail-item">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${formData.client_name}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${formData.client_email}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${formData.client_phone}</div>
              </div>
              ${
                formData.company_name
                  ? `
                <div class="detail-item">
                  <div class="detail-label">Company:</div>
                  <div class="detail-value">${formData.company_name}</div>
                </div>
              `
                  : ""
              }
              ${
                formData.company_gst
                  ? `
                <div class="detail-item">
                  <div class="detail-label">GST Number:</div>
                  <div class="detail-value" style="font-family: monospace;">${formData.company_gst}</div>
                </div>
              `
                  : ""
              }
            </div>

            <div class="pricing-summary">
              <h3>💰 Pricing Summary</h3>
              <div class="detail-item">
                <div class="detail-label">Monthly Rate:</div>
                <div class="detail-value">${formatPrice(listing.pricing.monthly)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Duration:</div>
                <div class="detail-value">${formData.duration_months} month${formData.duration_months !== 1 ? "s" : ""}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Subtotal:</div>
                <div class="detail-value">${formatPrice(baseAmount)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">GST (18%):</div>
                <div class="detail-value">${formatPrice(gstAmount)}</div>
              </div>
              <div class="total-amount">
                Total Amount (incl. GST): ${formatPrice(totalPrice)}
              </div>
            </div>

            <div class="next-steps">
              <h3>🚀 What happens next?</h3>
              <ul>
                <li><strong>Review:</strong> Our team will review your booking request within 24 hours</li>
                <li><strong>Confirmation:</strong> We'll contact you to confirm availability and discuss details</li>
                <li><strong>Payment:</strong> Payment terms and methods will be shared separately</li>
                <li><strong>Installation:</strong> Installation timeline and requirements will be coordinated</li>
                <li><strong>Campaign Launch:</strong> Your advertisement will go live as per the scheduled dates</li>
              </ul>
            </div>

            <div class="contact-info">
              <h3>📞 Need Help?</h3>
              <p>Our team is here to assist you!</p>
              <p>
                <strong>WhatsApp:</strong> <a href="https://wa.me/919892320184" style="color: #25d366;">+91 98923 20184</a><br>
                <strong>Email:</strong> <a href="mailto:support@oohmap.com" style="color: #1976d2;">support@oohmap.com</a>
              </p>
            </div>

            <div class="footer">
              <p>This is an automated confirmation email. Please save this email for your records.</p>
              <p>© 2024 OOH Map India. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `

      console.log("📤 Attempting to send email via Resend...")

      const emailPayload = {
        from: "OOH Map <bookings@oohmap.com>",
        to: [formData.client_email],
        subject: `Booking Confirmation - ${listing.name} | Ref: ${bookingId.slice(0, 8).toUpperCase()}`,
        html: emailHtml,
      }

      console.log("📧 Email payload:", {
        from: emailPayload.from,
        to: emailPayload.to,
        subject: emailPayload.subject,
        htmlLength: emailHtml.length,
      })

      const { data: emailData, error } = await resend.emails.send(emailPayload)

      if (error) {
        console.error("❌ Resend API error:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ Email sent successfully via Resend:", emailData?.id)
      return { success: true }
    } catch (error) {
      console.error("❌ Error in sendBookingConfirmation:", error)
      return { success: false, error: "Failed to send confirmation email" }
    }
  }

  static async sendInternalNotification(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("📧 Starting sendInternalNotification...")

      if (!resend) {
        console.error("❌ Resend client not initialized for internal notification")
        return { success: false, error: "Email service not configured" }
      }

      const { listing, formData, bookingId, totalPrice, bookingCode } = data

      const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(price)
      }

      const internalEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert-header { background: #ff5722; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .urgent { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
          </style>
        </head>
        <body>
          <div class="alert-header">
            <h2>🚨 NEW BOOKING ALERT</h2>
            <p>A new booking has been submitted and requires attention</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>⏰ Action Required:</strong> Please review and confirm this booking within 24 hours.
            </div>

            <div class="booking-details">
              <h3>Booking Information</h3>
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span class="value">${bookingId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Booking Code:</span>
                <span class="value">#${bookingCode}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Value:</span>
                <span class="value" style="font-weight: bold; color: #2e7d32;">${formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div class="booking-details">
              <h3>Media Details</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${listing.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Location:</span>
                <span class="value">${listing.location.address}, ${listing.location.city}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <span class="value">${listing.type}</span>
              </div>
            </div>

            <div class="booking-details">
              <h3>Client Information</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${formData.client_name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${formData.client_email}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${formData.client_phone}</span>
              </div>
              ${
                formData.company_name
                  ? `
                <div class="detail-row">
                  <span class="label">Company:</span>
                  <span class="value">${formData.company_name}</span>
                </div>
              `
                  : ""
              }
            </div>

            <div class="booking-details">
              <h3>Campaign Details</h3>
              <div class="detail-row">
                <span class="label">Start Date:</span>
                <span class="value">${new Date(formData.start_date).toLocaleDateString("en-IN")}</span>
              </div>
              <div class="detail-row">
                <span class="label">End Date:</span>
                <span class="value">${new Date(formData.end_date).toLocaleDateString("en-IN")}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${formData.duration_months} month${formData.duration_months !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="https://wa.me/${formData.client_phone.replace(/[^0-9]/g, "")}" 
                 style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                📱 Contact Client via WhatsApp
              </a>
            </div>
          </div>
        </body>
        </html>
      `

      console.log("📤 Sending internal notification email...")

      const { data: emailData, error } = await resend.emails.send({
        from: "OOH Map Bookings <bookings@oohmap.com>",
        to: ["admin@oohmap.com"], // Replace with your admin email
        subject: `🚨 NEW BOOKING: ${listing.name} - ${formatPrice(totalPrice)} | ${bookingId.slice(0, 8).toUpperCase()}`,
        html: internalEmailHtml,
      })

      if (error) {
        console.error("❌ Error sending internal notification:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ Internal notification sent successfully:", emailData?.id)
      return { success: true }
    } catch (error) {
      console.error("❌ Error in sendInternalNotification:", error)
      return { success: false, error: "Failed to send internal notification" }
    }
  }
}
