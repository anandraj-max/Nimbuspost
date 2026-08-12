export interface SnapshotItem {
  id: string;
  label: string;
  value: string;
}

export interface BulletGroup {
  id: string;
  heading: string;
  items: string[];
}

export interface JDData {
  /** Header */
  eyebrow: string;
  jobTitle: string;
  tagline: string;

  /** Role Snapshot cards */
  snapshot: SnapshotItem[];

  /** About */
  aboutHeading: string;
  about: string;
  websiteLine: string;

  /** Role Overview — one entry per paragraph */
  overviewHeading: string;
  overview: string[];

  /** Key Responsibilities */
  responsibilitiesHeading: string;
  responsibilities: string[];

  /** What We're Looking For — grouped sub-sections */
  lookingForHeading: string;
  lookingFor: BulletGroup[];

  /** Why Join (tinted card) */
  whyJoinHeading: string;
  whyJoin: string[];

  /** How to Apply (tinted card) */
  howToApplyHeading: string;
  howToApply: string;

  /** Equal-opportunity footnote */
  eeo: string;

  /** Footer */
  footerLeft: string;
  footerCenter: string;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
