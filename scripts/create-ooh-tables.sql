-- Create the main OOH listings table
CREATE TABLE IF NOT EXISTS ooh_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Billboard', 'Digital Display', 'Transit', 'Street Furniture', 'Mall Display')),
  
  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  
  -- Specifications
  size VARCHAR(100) NOT NULL,
  illumination VARCHAR(20) NOT NULL CHECK (illumination IN ('Lit', 'Non-lit', 'Digital')),
  visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('High', 'Medium', 'Low')),
  traffic VARCHAR(100) NOT NULL,
  
  -- Pricing
  monthly_price INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Availability
  availability VARCHAR(20) NOT NULL CHECK (availability IN ('Available', 'Booked', 'Maintenance')),
  
  -- Content
  description TEXT,
  images TEXT[], -- Array of image URLs
  features TEXT[], -- Array of features
  
  -- Demographics
  footfall VARCHAR(100),
  target_audience TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on location for spatial queries
CREATE INDEX IF NOT EXISTS idx_ooh_listings_location ON ooh_listings (latitude, longitude);

-- Create an index on city for filtering
CREATE INDEX IF NOT EXISTS idx_ooh_listings_city ON ooh_listings (city);

-- Create an index on availability for filtering
CREATE INDEX IF NOT EXISTS idx_ooh_listings_availability ON ooh_listings (availability);

-- Create an index on type for filtering
CREATE INDEX IF NOT EXISTS idx_ooh_listings_type ON ooh_listings (type);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_ooh_listings_updated_at 
    BEFORE UPDATE ON ooh_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
