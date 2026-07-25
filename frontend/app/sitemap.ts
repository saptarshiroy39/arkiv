import type { MetadataRoute } from "next";

const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://arkiv.hirishi.in",
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://arkiv.hirishi.in/chat",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
