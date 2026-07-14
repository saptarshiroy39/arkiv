import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://arkiv.hirishi.in",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://arkiv.hirishi.in/chat",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.8,
    },
  ];
}
