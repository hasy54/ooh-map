-- Insert sample media data if needed
INSERT INTO public.media (
  name, type, price, availability, user_id, code, subtype,
  geolocation, width, height, city, traffic, image_urls, 
  available_date, long, lat
) VALUES 
(
  'MG Road Premium Billboard',
  'Billboard',
  150000,
  true,
  NULL, -- user_id
  'BLR-MG-001',
  'Static',
  '{"address": "MG Road, Near Brigade Road Junction"}',
  40, -- width in feet
  20, -- height in feet
  'Bangalore',
  '2.5L+ daily',
  '["https://placeholder.com/400x300"]',
  NULL, -- available_date
  '77.5946', -- longitude
  '12.9716' -- latitude
),
(
  'Koramangala Digital Display',
  'Digital Display',
  200000,
  true,
  NULL, -- user_id
  'BLR-KOR-001',
  'Digital',
  '{"address": "5th Block, Koramangala"}',
  20, -- width in feet
  15, -- height in feet
  'Bangalore',
  '1.8L+ daily',
  '["https://placeholder.com/400x300"]',
  NULL, -- available_date
  '77.6245', -- longitude
  '12.9352' -- latitude
),
(
  'Indiranagar Metro Station',
  'Transit',
  120000,
  false, -- not available
  NULL, -- user_id
  'BLR-IND-001',
  'Backlit',
  '{"address": "Indiranagar Metro Station"}',
  12, -- width in feet
  8, -- height in feet
  'Bangalore',
  '3L+ daily',
  '["https://placeholder.com/400x300"]',
  NULL, -- available_date
  '77.6412', -- longitude
  '12.9719' -- latitude
),
(
  'Forum Mall Digital Screen',
  'Mall Display',
  180000,
  true,
  NULL, -- user_id
  'BLR-FRM-001',
  'Digital',
  '{"address": "Forum Mall, Koramangala"}',
  15, -- width in feet
  10, -- height in feet
  'Bangalore',
  '50K+ daily',
  '["https://placeholder.com/400x300"]',
  NULL, -- available_date
  '77.6245', -- longitude
  '12.9352' -- latitude
),
(
  'Whitefield Tech Park Billboard',
  'Billboard',
  100000,
  true,
  NULL, -- user_id
  'BLR-WTF-001',
  'Static',
  '{"address": "ITPL Main Road, Whitefield"}',
  30, -- width in feet
  15, -- height in feet
  'Bangalore',
  '1.2L+ daily',
  '["https://placeholder.com/400x300"]',
  NULL, -- available_date
  '77.75', -- longitude
  '12.9698' -- latitude
);
