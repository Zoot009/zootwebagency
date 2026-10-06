import type { Page } from "@/lib/content";
import Elementor from "@/components/sections/Elementor";

// "What is / what are" pages and blog posts: the Elementor layout rebuilt in Tailwind (see Elementor.tsx).
export default function Article({ page }: { page: Page }) {
  return (
    <main className="flex flex-1 flex-col">
      <Elementor page={page} />
    </main>
  );
}
