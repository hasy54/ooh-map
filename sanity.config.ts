import { defineConfig } from "sanity"
import { deskTool } from "sanity/desk"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./sanity/schemas"

// Hardcode a valid dataset name to avoid configuration issues
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ""
const dataset = "production" // Hardcoded to ensure validity

export default defineConfig({
  name: "default",
  title: "OOH Listings CMS",
  projectId,
  dataset,
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
  basePath: "/admin",
})
