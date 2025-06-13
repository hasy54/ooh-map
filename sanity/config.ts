// Hardcode a valid dataset name to avoid configuration issues
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ""
const dataset = "production" // Hardcoded to ensure validity

export const config = {
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
}

export default config
