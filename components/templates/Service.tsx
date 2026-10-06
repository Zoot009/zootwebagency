import type { Page } from "@/lib/content";
import Elementor from "@/components/sections/Elementor";

// The hub and its children share one template. WP has two designs, picked by the page's WP template:
// "elementor_header_footer" pages (hub, seo-services, ...) use the landing design, the rest the classic one.
export default function Service({ page }: { page: Page }) {
  return <Elementor page={page} variant={page.wpTemplate === "elementor_header_footer" ? "landing" : "classic"} />;
}
