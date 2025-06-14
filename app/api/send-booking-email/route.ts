import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import type { OOHListing } from "../../../types/ooh"
import type { BookingFormData } from "../../../types/booking"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface BookingEmailRequest {
  listing: OOHListing
  formData: BookingFormData
  bookingId: string
  totalPrice: number
  bookingCode: number
}

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Email API route called")

    if (!resend) {
      console.error("❌ Resend API key not configured")
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 })
    }

    const body: BookingEmailRequest = await request.json()
    const { listing, formData, bookingId, totalPrice, bookingCode } = body

    console.log("📧 Processing email for booking:", bookingId.slice(0, 8))

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(price)
    }

    const baseAmount = listing.pricing.monthly * formData.duration_months
    const gstAmount = baseAmount * 0.18

    // Client confirmation email HTML
    const clientEmailHtml = `
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
              <strong>Email:</strong> <a href="mailto:booking@oohindia.in" style="color: #1976d2;">booking@oohindia.in</a>
            </p>
          </div>

          <div class="footer">
            <p>This is an automated confirmation email. Please save this email for your records.</p>
            <p>© 2024 OOH India. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Internal notification email HTML
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

    console.log("📤 Sending client confirmation email...")

    // Send client confirmation email using your custom domain
    const clientEmailResult = await resend.emails.send({
      from: "OOH India Bookings <booking@oohindia.in>", // Updated to use your custom domain
      to: [formData.client_email], // Send to actual client email
      subject: `Booking Confirmation - ${listing.name} | Ref: ${bookingId.slice(0, 8).toUpperCase()}`,
      html: clientEmailHtml,
    })

    if (clientEmailResult.error) {
      console.error("❌ Error sending client email:", clientEmailResult.error)
      return NextResponse.json(
        { success: false, error: `Client email failed: ${clientEmailResult.error.message}` },
        { status: 500 },
      )
    }

    console.log("✅ Client email sent:", clientEmailResult.data?.id)

    console.log("📤 Sending internal notification email...")

    // Send internal notification email using your custom domain
    const internalEmailResult = await resend.emails.send({
      from: "OOH India Alerts <alerts@oohindia.in>", // Updated to use your custom domain
      to: ["yash.sol22@gmail.com"], // Your admin email
      subject: `🚨 NEW BOOKING: ${listing.name} - ${formatPrice(totalPrice)} | ${bookingId.slice(0, 8).toUpperCase()}`,
      html: internalEmailHtml,
    })

    if (internalEmailResult.error) {
      console.error("❌ Error sending internal email:", internalEmailResult.error)
      // Don't fail the request if internal email fails - just log it
      console.warn("⚠️ Internal email failed but continuing with booking confirmation")
    } else {
      console.log("✅ Internal email sent:", internalEmailResult.data?.id)
    }

    return NextResponse.json({
      success: true,
      clientEmailId: clientEmailResult.data?.id,
      internalEmailId: internalEmailResult.data?.id,
      message: "Emails sent successfully from your custom domain",
    })
  } catch (error) {
    console.error("❌ Error in email API route:", error)
    return NextResponse.json({ success: false, error: "Failed to send emails" }, { status: 500 })
  }
}
