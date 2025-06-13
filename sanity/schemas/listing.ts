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
      name: "description",
      title: "Description",
      type: "text",
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
    {
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Billboard", value: "billboard" },
          { title: "Digital", value: "digital" },
          { title: "Transit", value: "transit" },
          { title: "Street Furniture", value: "street-furniture" },
        ],
      },
    },
    {
      name: "price",
      title: "Price",
      type: "number",
    },
    {
      name: "available",
      title: "Available",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    },
    {
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        {
          name: "title",
          title: "SEO Title",
          type: "string",
        },
        {
          name: "description",
          title: "SEO Description",
          type: "text",
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      subtitle: "address",
    },
  },
}
