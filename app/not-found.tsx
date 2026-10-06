import Chrome from "@/components/sections/Chrome";
import GenericPage from "@/components/templates/GenericPage";
import { getNotFound } from "@/lib/content";

// Unmatched URLs: WP's 404 page, with the site header and footer as on WP.
export default function NotFound() {
  const page = getNotFound();
  return (
    <Chrome page={page}>
      <GenericPage page={page} />
    </Chrome>
  );
}
