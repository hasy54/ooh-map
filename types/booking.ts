export interface BookingFormData {
  client_name: string
  client_email: string
  client_phone: string
  company_name?: string
  start_date: string
  end_date: string
  duration_months: number
  campaign_details?: string
  special_requirements?: string
}

export interface Booking {
  id: string
  start_date: string
  end_date: string
  client_name: string
  client_email: string
  booking_price: number
  status: "pending" | "confirmed" | "cancelled"
  created_at: string | null
  updated_at: string | null
  media_id: any | null
  period: number | null
  booker: string | null
  proposal_id: string | null
  code: number | null
}
