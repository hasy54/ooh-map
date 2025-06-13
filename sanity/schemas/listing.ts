export default {
  name: "listing",
  title: "Listing",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    },
    {
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    },
    {
      name: "body",
      title: "Body",
      type: "text",
    },
    {
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Billboard", value: "billboard" },
          { title: "Digital Display", value: "digital" },
          { title: "Transit", value: "transit" },
          { title: "Street Furniture", value: "street" },
        ],
      },
    },
    {
      name: "price",
      title: "Monthly Price (₹)",
      type: "number",
    },
    {
      name: "available",
      title: "Available",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "location",
      title: "Location",
      type: "object",
      fields: [
        {
          name: "address",
          title: "Address",
          type: "string",
        },
        {
          name: "city",
          title: "City",
          type: "string",
        },
        {
          name: "state",
          title: "State",
          type: "string",
        },
        {
          name: "lat",
          title: "Latitude",
          type: "number",
        },
        {
          name: "lng",
          title: "Longitude",
          type: "number",
        },
      ],
    },
    {
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      location: "location.city",
    },
    prepare(selection) {
      const { title, media, location } = selection
      return {
        title,
        media,
        subtitle: location ? `Location: ${location}` : "No location",
      }
    },
  },
}
