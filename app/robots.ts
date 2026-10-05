import type { MetadataRoute } from "next";
import { getPage } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  const origin = new URL(getPage()!.seo.canonical!).origin;
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${origin}/sitemap.xml` };
}
