-- Create media_images table to store multiple images per media listing
CREATE TABLE IF NOT EXISTS public.media_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_media_images_media_id ON public.media_images(media_id);
CREATE INDEX IF NOT EXISTS idx_media_images_display_order ON public.media_images(media_id, display_order);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_images_updated_at
BEFORE UPDATE ON media_images
FOR EACH ROW
EXECUTE FUNCTION update_media_images_updated_at();
