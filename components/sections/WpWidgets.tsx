"use client";

import { useEffect } from "react";

// Click behavior for interactive widgets inside raw WP HTML (.wp-content), replacing Elementor/ElementsKit JS:
// ElementsKit accordions and Elementor nested tabs. Renders nothing.
export default function WpWidgets() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element;
      const toggler = t.closest<HTMLElement>(".wp-content .ekit-accordion--toggler");
      if (toggler) {
        e.preventDefault();
        const panel = document.getElementById((toggler.dataset.target ?? toggler.getAttribute("href") ?? "").slice(1));
        if (!panel) return;
        const open = !panel.classList.contains("show");
        // One open card per accordion, like Bootstrap's data-parent.
        if (open && panel.dataset.parent) {
          document.querySelectorAll<HTMLElement>(`${panel.dataset.parent} .collapse.show`).forEach((p) => {
            p.classList.remove("show");
            p.parentElement?.querySelector(".ekit-accordion--toggler")?.classList.add("collapsed");
          });
        }
        panel.classList.toggle("show", open);
        toggler.classList.toggle("collapsed", !open);
        toggler.setAttribute("aria-expanded", String(open));
        return;
      }
      const tab = t.closest<HTMLElement>(".wp-content .e-n-tab-title");
      if (tab) {
        const tabs = tab.closest(".e-n-tabs");
        tabs?.querySelectorAll(".e-n-tab-title").forEach((b) => b.setAttribute("aria-selected", String(b === tab)));
        tabs?.querySelectorAll<HTMLElement>(".e-n-tabs-content > .e-con").forEach((c) => c.classList.toggle("e-active", c.dataset.tabIndex === tab.dataset.tabIndex));
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
