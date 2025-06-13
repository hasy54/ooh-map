"use client"

import { NextStudio } from "next-sanity/studio"
// Import the default export as sanityConfig
import sanityConfig from "../../../sanity.config"

export default function AdminPage() {
  return <NextStudio config={sanityConfig} />
}
