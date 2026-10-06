import type { Page } from "@/lib/content";
import WpWidgets from "@/components/sections/WpWidgets";

// One-off pages: the WordPress/Elementor HTML, laid out with the page's imported Elementor values
// (page.layoutCss, see scripts/elementor-css.mjs) and our own structural styles (.wp-content in globals.css).
export default function GenericPage({ page }: { page: Page }) {
  return (
    <>
      {page.layoutCss && <style dangerouslySetInnerHTML={{ __html: page.layoutCss }} />}
      <main className="wp-content" dangerouslySetInnerHTML={{ __html: page.html }} />
      <WpWidgets />
    </>
  );
}
