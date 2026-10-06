import type { Page } from "@/lib/content";
import Footer from "./Footer";
import Header from "./Header";

// Site header and footer around a page, as WP renders them for it: Elementor Canvas pages
// (template "elementor_canvas") have neither, and page.footer is null when WP shows no footer.
export default function Chrome({ page, children }: { page: Pick<Page, "wpTemplate" | "footer">; children: React.ReactNode }) {
  const header = page.wpTemplate !== "elementor_canvas";
  return (
    <>
      {header && (
        <>
          <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2 focus:text-navy">
            Skip to content
          </a>
          <Header />
        </>
      )}
      <div id="content" className="flex-1">
        {children}
        {page.footer && <Footer sections={page.footer.sections} />}
      </div>
    </>
  );
}
