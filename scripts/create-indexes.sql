-- Create indexes for the existing media table to optimize queries

-- Create an index on location for spatial queries
CREATE INDEX IF NOT EXISTS idx_media_location ON public.media (lat, long);

-- Create an index on city for filtering
CREATE INDEX IF NOT EXISTS idx_media_city ON public.media (city);

-- Create an index on availability for filtering
CREATE INDEX IF NOT EXISTS idx_media_availability ON public.media (availability);

-- Create an index on type for filtering
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media (type);

-- Create an index on user_id for filtering by owner
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media (user_id);
