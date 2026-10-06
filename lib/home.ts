// Shape of page.home, written by scripts/extract-home.mjs. HTML strings are WP rich text (already localized).
export type Device = "desktop" | "laptop" | "tablet" | "mobile";
export type Img = { src: string; alt: string; width?: number; height?: number; hidden?: Device[] };
// Headline with an optional Amita accent ("highlight"); tag is the WP heading level.
export type Headline = { tag: string; before: string; highlight: string; after: string; hidden: Device[] };
export type EkitHeading = { tag: string; html: string };
export type IconBox = { icon: string | null; title: string; titleTag: string; html: string; href: string | null };
export type FlowItem =
  | ({ kind: "headline" } & Headline)
  | { kind: "html"; id: string; html: string; hidden: Device[] }
  | { kind: "image"; image: Img; hidden: Device[] }
  | { kind: "button"; text: string; href: string };
type Badge = { emoji: string; label: string };

export type HomeSection = { id: string } & (
  | {
      kind: "hero";
      title: Headline;
      subtitle: string;
      banner: Img & { hidden: Device[] };
      badges: Img[];
      badgesHidden: Device[];
      intro: string;
      placeholder: string;
      button: { text: string; href: string };
      image: Img & { hidden: Device[] };
    }
  | { kind: "stats"; items: { value: string; label: string }[] }
  | { kind: "whatAre"; image: Img; cardA: IconBox; title: Headline; body: string; cardB: IconBox }
  | { kind: "whyChoose"; kicker: Headline; body: string; video: { youtube: string; overlay: string | null } }
  | {
      kind: "team";
      title: Headline;
      intro: string;
      leads: { image: Img; name: string; nameTag: string; role: string; hidden: Device[] }[];
      members: { image: Img; caption: string }[];
    }
  | { kind: "trusted"; left: FlowItem[]; tiles: IconBox[]; cardTitle: string; cardStats: IconBox[]; cardBody: string }
  | { kind: "growth"; image: Img; title: Headline; body: string; boxTitle: Headline; boxBody: string }
  | {
      kind: "projects";
      title: Headline;
      intro: string;
      items: { image: Img; href: string | null; title: string; titleTag: string; tags: string[] }[];
    }
  | {
      kind: "ai";
      title: Headline;
      subtitle: string;
      counters: { title: string; prefix: string; value: number; separator: string; suffix: string }[];
      body: string;
      tabsHidden: Device[];
      tabs: { icon: string | null; iconClass: string | null; items: IconBox[] }[];
    }
  | {
      kind: "process";
      badge: Badge;
      title: EkitHeading;
      body: string;
      items: { icon: string | null; title: string; text: string; href: string | null }[];
    }
  | { kind: "testimonialsIntro"; badge: Badge; title: Headline; body: string }
  | { kind: "testimonials"; items: { html: string; stars: Img | null; name: string; role: string }[] }
  | { kind: "faq"; title: Headline; intro: string; columns: { q: string; a: string; open: boolean }[][] }
  | { kind: "cta"; title: EkitHeading; body: string; button: { text: string; href: string } }
  | { kind: "raw"; html: string }
);
