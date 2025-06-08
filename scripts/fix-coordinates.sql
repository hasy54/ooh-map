-- Script to identify and potentially fix coordinate issues in the media table

-- 1. Find records with NULL or empty coordinates
SELECT 
  id, 
  name, 
  city,
  lat, 
  long,
  'NULL or empty coordinates' as issue
FROM public.media 
WHERE lat IS NULL 
   OR long IS NULL 
   OR lat = '' 
   OR long = ''
   OR lat = '0'
   OR long = '0'
ORDER BY city, name;

-- 2. Find records with coordinates outside India bounds
SELECT 
  id, 
  name, 
  city,
  lat, 
  long,
  'Outside India bounds' as issue
FROM public.media 
WHERE lat IS NOT NULL 
  AND long IS NOT NULL 
  AND lat != '' 
  AND long != ''
  AND (
    CAST(lat AS DECIMAL) < 6.4 
    OR CAST(lat AS DECIMAL) > 37.6 
    OR CAST(long AS DECIMAL) < 68.7 
    OR CAST(long AS DECIMAL) > 97.25
  )
ORDER BY city, name;

-- 3. Find records with potentially swapped coordinates
SELECT 
  id, 
  name, 
  city,
  lat, 
  long,
  'Potentially swapped coordinates' as issue
FROM public.media 
WHERE lat IS NOT NULL 
  AND long IS NOT NULL 
  AND lat != '' 
  AND long != ''
  AND CAST(lat AS DECIMAL) BETWEEN 68.7 AND 97.25  -- lat in longitude range
  AND CAST(long AS DECIMAL) BETWEEN 6.4 AND 37.6   -- long in latitude range
ORDER BY city, name;

-- 4. Find records with coordinates that might need decimal point fixes
SELECT 
  id, 
  name, 
  city,
  lat, 
  long,
  'Potential decimal point issue' as issue
FROM public.media 
WHERE lat IS NOT NULL 
  AND long IS NOT NULL 
  AND lat != '' 
  AND long != ''
  AND (
    (LENGTH(lat) >= 4 AND lat NOT LIKE '%.%')  -- No decimal point but should have one
    OR (LENGTH(long) >= 4 AND long NOT LIKE '%.%')
    OR (lat LIKE '%.' OR long LIKE '%.')  -- Ends with decimal point
  )
ORDER BY city, name;

-- 5. Show summary of coordinate issues by city
SELECT 
  city,
  COUNT(*) as total_records,
  COUNT(CASE WHEN lat IS NULL OR long IS NULL OR lat = '' OR long = '' THEN 1 END) as null_coords,
  COUNT(CASE WHEN lat IS NOT NULL AND long IS NOT NULL AND lat != '' AND long != '' 
    AND (CAST(lat AS DECIMAL) < 6.4 OR CAST(lat AS DECIMAL) > 37.6 OR CAST(long AS DECIMAL) < 68.7 OR CAST(long AS DECIMAL) > 97.25) 
    THEN 1 END) as invalid_coords,
  COUNT(CASE WHEN lat IS NOT NULL AND long IS NOT NULL AND lat != '' AND long != '' 
    AND CAST(lat AS DECIMAL) BETWEEN 6.4 AND 37.6 AND CAST(long AS DECIMAL) BETWEEN 68.7 AND 97.25 
    THEN 1 END) as valid_coords
FROM public.media 
GROUP BY city
ORDER BY city;
