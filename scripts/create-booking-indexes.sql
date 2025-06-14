-- Create indexes for the bookings table to optimize queries

-- Create an index on media_id for filtering bookings by media
CREATE INDEX IF NOT EXISTS idx_bookings_media_id ON public.bookings USING GIN (media_id);

-- Create an index on status for filtering by booking status
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- Create an index on date range for availability checks
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON public.bookings (start_date, end_date);

-- Create an index on client_email for customer lookups
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON public.bookings (client_email);

-- Create an index on created_at for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings (created_at DESC);

-- Create a composite index for availability checks
CREATE INDEX IF NOT EXISTS idx_bookings_availability_check ON public.bookings (media_id, status, start_date, end_date);
