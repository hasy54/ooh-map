# OOH Map India - Supabase Integration

## Setup Instructions

### 1. Supabase Setup

1. **Use Existing Supabase Project**:
   - This application connects to your existing Supabase project with the `public.media` table
   - Make sure your Supabase URL and anon key are properly configured

2. **Environment Variables**:
   Create a `.env.local` file in your project root:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   \`\`\`

   **Note**: The Google Maps API key uses `GOOGLE_MAPS_API_KEY` (without `NEXT_PUBLIC_` prefix) to keep it secure on the server side.

3. **Database Optimization**:
   - Run the `create-indexes.sql` script in your Supabase SQL editor to create indexes for better performance
   - Optionally run `seed-sample-data.sql` if you need sample data

### 2. Database Schema

The application uses your existing `public.media` table with the following structure:
- **id**: UUID primary key
- **name**: Text (media name)
- **type**: Text (media type like Billboard, Digital Display)
- **price**: Numeric (monthly price)
- **availability**: Boolean (true = available, false = booked)
- **geolocation**: JSONB (contains address information)
- **width/height**: Numeric (dimensions)
- **city**: Text (city name)
- **traffic**: Text (traffic information)
- **image_urls**: JSONB (array of image URLs)
- **lat/long**: Text (latitude and longitude)
- **subtype**: Text (used for illumination type)

### 3. Data Mapping

The application maps your database schema to the OOH listing format:
- `lat`/`long` → location coordinates
- `geolocation->>address` → location address
- `city` → location city
- `width`/`height` → specifications.size
- `subtype` → specifications.illumination
- `traffic` → specifications.traffic
- `price` → pricing.monthly
- `availability` → availability status
- `image_urls` → images

### 4. Security

- **Google Maps API Key**: The application uses a server-side API route to securely load Google Maps without exposing the API key to client-side code
- **Environment Variables**: Only Supabase credentials use the `NEXT_PUBLIC_` prefix as they are safe to expose on the client side

### 5. Features

- **Real-time Data**: Listings are fetched from your Supabase database in real-time
- **Advanced Filtering**: Server-side filtering for better performance
- **Search**: Full-text search across name and address fields
- **Geographic Queries**: Support for location-based queries
- **CRUD Operations**: Full create, read, update, delete support
- **Type Safety**: Full TypeScript support with generated types

### 6. API Methods

The `MediaService` class provides:
- `getListings(filters?)` - Get all listings with optional filters
- `getListing(id)` - Get a single listing by ID
- `getListingsByCity(city)` - Get listings for a specific city
- `getListingsInBounds(bounds)` - Get listings within geographic bounds
- `createListing(listing)` - Create a new listing
- `updateListing(id, updates)` - Update an existing listing
- `deleteListing(id)` - Delete a listing
- `getCities()` - Get list of unique cities

### 7. Extending the Application

To add new fields:
1. Update the TypeScript types in `lib/supabase.ts`
2. Update the conversion functions in `lib/media-service.ts`
3. Update the UI components as needed
