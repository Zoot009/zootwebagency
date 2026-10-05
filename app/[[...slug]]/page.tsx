import { notFound } from "next/navigation";
import { getAllPages, getPage, toMetadata, type Family, type Page as WpPage } from "@/lib/content";
import Home from "@/components/templates/Home";
import Service from "@/components/templates/Service";
import CityHub from "@/components/templates/CityHub";
import CityService from "@/components/templates/CityService";
import Article from "@/components/templates/Article";
import GenericPage from "@/components/templates/GenericPage";

// Every WordPress URL is rendered by this one route. Fix looks in the family template, not here.
const templates: Record<Family, (props: { page: WpPage }) => React.ReactNode> = {
  home: Home,
  service: Service,
  cityHub: CityHub,
  cityService: CityService,
  article: Article,
  generic: GenericPage,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPages().map((p) => ({ slug: p.path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">) {
  const page = getPage((await params).slug);
  return page ? toMetadata(page) : {};
}

export default async function Page({ params }: PageProps<"/[[...slug]]">) {
  const page = getPage((await params).slug);
  if (!page) notFound();
  const Template = templates[page.family];
  return (
    <>
      {page.jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }}
        />
      ))}
      <Template page={page} />
    </>
  );
}
