import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return getAllPages()
    .filter((p) => p.seo.canonical && !/noindex/.test(p.seo.meta.find(([k]) => k === "robots")?.[1] ?? ""))
    .map((p) => ({ url: p.seo.canonical!, lastModified: p.modified + "Z" }));
}
