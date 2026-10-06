import { Fragment } from "react";

type Crumb = { name: string; href: string };
type Node = { "@type"?: string | string[]; "@graph"?: Node[]; itemListElement?: { item: { "@id": string; name: string } }[] };

// The visible breadcrumb is Rank Math's, which the REST API renders as just "Home".
// The page's BreadcrumbList JSON-LD has the same trail, so we render from that.
export function crumbsFrom(jsonLd: object[]): Crumb[] {
  const list = (jsonLd as Node[]).flatMap((n) => n["@graph"] ?? [n]).find((n) => n["@type"] === "BreadcrumbList");
  return list?.itemListElement?.map(({ item }) => ({ name: item.name, href: new URL(item["@id"]).pathname })) ?? [];
}

export default function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="breadcrumbs" className={className}>
      <p className="my-[1em]">
        {items.map((c, i) =>
          i < items.length - 1 ? (
            <Fragment key={c.href}>
              <a href={c.href} className="text-link in-[.wp-default]:underline">{c.name}</a>
              <span> - </span>
            </Fragment>
          ) : (
            <span key={c.href}>{c.name}</span>
          ),
        )}
      </p>
    </nav>
  );
}
