# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Uber clone built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. The application replicates the Uber ride booking interface with a split-screen layout: ride booking form on the left and map view on the right.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **React**: Version 19 (latest)
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 (using new PostCSS plugin)
- **Animations**: Framer Motion
- **Icons**: Remix Icon (loaded via CDN)
- **Fonts**: Google Sans (loaded via CDN)

## Architecture

### App Router Structure

The application uses Next.js App Router with client-side rendering for interactive components:

- `app/page.tsx` - Home page with split-screen layout (RideBooking | MapView)
- `app/layout.tsx` - Root layout with Navigation component and font/icon CDN links
- `app/providers.tsx` - Client-side providers wrapper (currently minimal)
- `app/globals.css` - Tailwind v4 imports and custom theme configuration

### Component Organization

All UI components are located in `app/components/`:

- **Navigation.tsx** - Top navigation bar with tabs (Ride, Rent, Eat) and auth buttons
- **Tabs.tsx** - Reusable animated tabs component using Framer Motion with smooth transitions
- **RideBooking.tsx** - Left panel ride booking form with pickup/dropoff inputs
- **MapView.tsx** - Right panel map placeholder with zoom controls
- **Component Pattern**: All interactive components use `'use client'` directive

### Key Component Details

#### Tabs Component (Tabs.tsx)
Custom tab component with Framer Motion animations:
- Active indicator slides smoothly between tabs using `layoutId`
- Hover states with subtle background transitions
- Supports keyboard navigation via `activateOnFocus` prop
- Children must be `<Tab>` elements with `title` and `children` props

#### Navigation (Navigation.tsx)
Uses the custom Tabs component for main navigation. Manages active tab state and renders Remix icons for each tab option.

#### RideBooking (RideBooking.tsx)
Form-style component with custom-styled inputs:
- Custom SVG icons for pickup (radio button) and dropoff (square) locations
- Placeholder text implemented via absolute positioning
- Time picker and person selector buttons (non-functional placeholders)

## Styling Approach

### Tailwind v4 Configuration
- Uses `@import "tailwindcss"` in globals.css
- Custom theme defined in `@theme` block with Google Sans as default font
- No traditional tailwind.config.js file - configuration is CSS-based

### Design System
- Primary color: Black (#000000) for CTAs and active states
- Gray scale: Gray-50, Gray-100, Gray-200, Gray-300, Gray-500, Gray-600, Gray-700
- Rounded corners: Consistent use of `rounded-lg` (8px)
- Spacing: Primarily uses px-4, py-3, gap-2/3/6 patterns

## Path Aliases

TypeScript configured with `@/*` alias pointing to project root:
```json
"paths": {
  "@/*": ["./*"]
}
```

## Important Notes

- **All interactive components must use `'use client'`** - This is a Next.js App Router requirement
- **Framer Motion**: Used for smooth animations. Key patterns: `layoutId` for shared element transitions, `AnimatePresence` for enter/exit animations
- **No backend/API**: This is a frontend-only clone with no real ride booking functionality
- **Responsive design**: Uses Tailwind's responsive utilities (e.g., `max-md:grid-cols-1`)
- **Google Fonts loaded via CDN** in layout.tsx head - no local font files
- **Remix icons via CDN** - icons referenced as `<i className="ri-{name}">` classes
