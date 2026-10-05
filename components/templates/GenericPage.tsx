import type { Page } from "@/lib/content";

// Fallback: renders the WordPress/Elementor HTML as-is. Family templates replace this over time.
export default function GenericPage({ page }: { page: Page }) {
  return <main className="wp-content" dangerouslySetInnerHTML={{ __html: page.html }} />;
}
