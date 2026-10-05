import type { Page } from "@/lib/content";
import GenericPage from "./GenericPage";

// TODO(owner): rebuild to match the live design. See CLAUDE.md.
export default function Service({ page }: { page: Page }) {
  return <GenericPage page={page} />;
}
