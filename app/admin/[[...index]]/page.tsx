"use client"

import { NextStudio } from "next-sanity/studio"
import { deskTool } from "sanity/desk"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "../../../sanity/schemas"
// Import the default export as sanityConfig
import sanityConfig from "../../../sanity.config"

// Add runtime plugins and schema
const config = {
  ...sanityConfig,
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
}

export default function AdminPage() {
  return <NextStudio config={config} />
}
