import { defineField, defineType } from "sanity"

export default defineType({
  name: "listing",
  title: "OOH Listing",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
        },
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
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
          name: "coordinates",
          title: "Coordinates",
          type: "object",
          fields: [
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
      ],
    }),
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Billboard", value: "billboard" },
          { title: "Bus Shelter", value: "bus-shelter" },
          { title: "Digital Display", value: "digital" },
          { title: "Transit", value: "transit" },
        ],
      },
    }),
    defineField({
      name: "price",
      title: "Monthly Price",
      type: "number",
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Booked", value: "booked" },
        ],
      },
      initialValue: "available",
    }),
    defineField({
      name: "mapListingId",
      title: "Map Listing ID",
      type: "string",
      description: "ID of the corresponding listing in the map database",
    }),
    defineField({
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
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "featuredImage",
      subtitle: "location.city",
    },
  },
})
