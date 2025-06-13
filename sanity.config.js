// Import and re-export the configuration
const sanityConfig = {
  name: "default",
  title: "OOH Listings CMS",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: "production",
  plugins: [
    // These will be imported at runtime
  ],
  schema: {
    types: [], // These will be imported at runtime
  },
  basePath: "/admin",
}

// Export sanityConfig as default
module.exports = sanityConfig
