/**
 * NimbusPost brand tokens — extracted 1:1 from the Figma JD template.
 * Everything visual in the JD document reads from here, so a rebrand
 * is a single-file change.
 */

export const COLORS = {
  brand: "#1d4ed8", // header blue / labels / links
  accent: "#3b82f6", // 42x3 underline bar
  navy: "#0f2a63", // section headings + snapshot values
  body: "#22303f", // body copy
  muted: "#64748b", // footer + EEO text
  cardBg: "#eaf1fc", // snapshot cards
  softBg: "#f5f9fe", // "Why Join" / "How to Apply" cards
  border: "#d7e3f7", // hairlines + soft card borders
  white: "#ffffff",
};

/** A4 at 96dpi, the coordinate space the Figma file was designed in. */
export const PAGE: Record<
  | "width"
  | "height"
  | "margin"
  | "contentWidth"
  | "headerHeight"
  | "footerDividerY"
  | "footerTextY"
  | "page2ContentTop"
  | "page1ContentTop",
  number
> = {
  width: 794,
  height: 1123,
  margin: 58,
  contentWidth: 678,
  headerHeight: 158,
  footerDividerY: 1073,
  footerTextY: 1085,
  page2ContentTop: 86,
  page1ContentTop: 186,
};

/** px sizes straight from Figma. */
export const TYPE = {
  title: 26,
  tagline: 12,
  eyebrow: 10,
  sectionHeading: 16,
  subHeading: 12.5,
  snapshotLabel: 9,
  snapshotValue: 12.5,
  body: 11,
  eeo: 10,
  footer: 9,
  runningHeader: 9.5,
};

/**
 * The official NimbusPost lockup, in the two tones the app needs: white for
 * the blue masthead, brand-blue for anything sitting on white. Both files
 * live in `public/` — replace them (keeping the filenames) and the logo
 * updates everywhere: app chrome, live preview and the exported PDF.
 *
 * Set either to null to fall back to the built-in vector mark.
 */
export const LOGO_LIGHT_SRC: string | null = "/nimbuspost-logo-white.png";
export const LOGO_DARK_SRC: string | null = "/nimbuspost-logo-blue.png";

/** width ÷ height of the logo artwork above. */
export const LOGO_ASPECT = 3.1111;

export const COMPANY = {
  name: "NimbusPost",
  website: "www.nimbuspost.com",
  emailDomain: "nimbuspost.com",
};
