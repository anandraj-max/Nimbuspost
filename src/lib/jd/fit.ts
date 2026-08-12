import { TYPE } from "@/lib/brand";

/**
 * Field limits. These are generous — they exist to stop a pasted paragraph
 * from wrecking the layout, not to police wording. The form shows a counter
 * as you approach one.
 */
export const LIMITS = {
  jobTitle: 90,
  tagline: 130,
  eyebrow: 24,
  snapshotLabel: 34,
  snapshotValue: 100,
  sectionHeading: 60,
  subHeading: 60,
} as const;

/**
 * The masthead is a fixed 158px band, so a long job title has to shrink
 * rather than run into the tagline below it. Preview and PDF both call this,
 * so they always agree.
 */
export function titleFontSize(title: string): number {
  const n = title.trim().length;
  if (n <= 46) return TYPE.title; // 26 — one line
  if (n <= 62) return 22;
  if (n <= 82) return 19;
  return 16;
}

/** Same idea for the tagline, which sits directly under the title. */
export function taglineFontSize(tagline: string): number {
  return tagline.trim().length <= 92 ? TYPE.tagline : 10.5;
}

/**
 * CSS that keeps any string — including a 200-character run with no spaces —
 * inside its box. Applied to every text node in the document preview.
 */
export const WRAP = {
  overflowWrap: "anywhere",
  wordBreak: "break-word",
} as const;
