import type { JDData } from "./types";

/**
 * Default content = the approved NimbusPost SDR job description.
 * Every field is editable in the form; this is just the starting point so
 * a manager only has to change what's different for their role.
 */
export const DEFAULT_JD: JDData = {
  eyebrow: "CAREERS",
  jobTitle: "Sales Development Representative (SDR)",
  tagline: "Pre-Sales   ·   The frontline hunter building NimbusPost's sales pipeline.",

  snapshot: [
    { id: "s1", label: "LOCATION", value: "Gurugram, Haryana (or as specified)" },
    { id: "s2", label: "DEPARTMENT / FUNCTION", value: "Pre-Sales / Sales Development" },
    { id: "s3", label: "EXPERIENCE", value: "1–3 years" },
    { id: "s4", label: "MINIMUM QUALIFICATION", value: "Graduate in any discipline" },
    { id: "s5", label: "REPORTS TO", value: "Manager – Inside Sales / Enterprise Sales" },
    { id: "s6", label: "ROLE TYPE", value: "Individual Contributor" },
    { id: "s7", label: "EMPLOYMENT TYPE", value: "Full-Time, Permanent" },
  ],

  aboutHeading: "About NimbusPost",
  about:
    "NimbusPost is one of India's leading logistics solutions for growing D2C brands. Having helped over 100,000+ brands and resellers transform logistics into an eCommerce growth engine, NimbusPost offers zero-effort warehousing and fulfillment, easy-to-use shipping technology, a multi-courier delivery network, AI-backed data intelligence, a dedicated operations team, and plug-and-play value-added services – all working together as an extended logistics arm for brands focused on growth.",
  websiteLine: "Company Website: www.nimbuspost.com",

  overviewHeading: "Role Overview",
  overview: [
    "At NimbusPost, we are on a mission to redefine logistics for the next generation of D2C brands and enterprises. As a Sales Development Representative (SDR), you will be the frontline hunter—responsible for prospecting, qualifying, and generating opportunities with some of the fastest-growing brands in India.",
    "You will play a critical role in building the sales pipeline that fuels NimbusPost's growth, working closely with Enterprise and Inside Sales teams to convert outreach into qualified opportunities.",
  ],

  responsibilitiesHeading: "Key Responsibilities",
  responsibilities: [
    "Research, identify, and prospect potential clients within the logistics, eCommerce, and D2C ecosystems.",
    "Run outbound campaigns via calls, emails, LinkedIn, and WhatsApp to create qualified meetings for the sales team.",
    "Qualify inbound leads and move them efficiently through the funnel.",
    "Engage with decision-makers (CXOs, Founders, senior managers) to position NimbusPost as their preferred logistics partner.",
    "Collaborate with Enterprise Sales and Inside Sales teams to ensure smooth handoff and conversion of leads.",
    "Maintain accurate lead data, pipeline stages, and activity reports in the CRM.",
    "Stay updated on industry trends, competitor offerings, and market dynamics to sharpen outreach.",
  ],

  lookingForHeading: "What We're Looking For",
  lookingFor: [
    {
      id: "g1",
      heading: "Must-Haves",
      items: [
        "1–3 years in presales, SDR, or lead generation roles (preferably in logistics, SaaS, or eCommerce).",
        "Strong communication and interpersonal skills with the ability to handle C-level conversations.",
        "Proven ability to build and qualify a sales pipeline through multi-channel outreach.",
      ],
    },
    {
      id: "g2",
      heading: "Qualities & Mindset",
      items: [
        "Highly driven, target-oriented, and resilient in chasing opportunities.",
        "A hunter mindset: resourceful, energetic, and relentless in building pipeline.",
      ],
    },
    {
      id: "g3",
      heading: "Tools & Proficiency",
      items: [
        "LinkedIn Sales Navigator.",
        "CRM platforms (HubSpot, Salesforce, LeadSquared).",
        "Outbound automation tools.",
      ],
    },
  ],

  whyJoinHeading: "Why Join NimbusPost",
  whyJoin: [
    "Be part of the fastest-growing logistics tech company in India.",
    "Work at the heart of revenue generation with direct impact on company growth.",
    "Competitive compensation plus performance incentives.",
    "A startup-like culture with steep learning and accelerated career growth.",
  ],

  howToApplyHeading: "How to Apply",
  howToApply:
    "Interested candidates can apply through www.nimbuspost.com or share their updated CV with our talent acquisition team. Shortlisted candidates will be contacted for the interview process.",

  eeo:
    "NimbusPost is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees, regardless of gender, age, religion, caste, disability, sexual orientation, or background. All hiring decisions are based on merit, qualifications, and business need.",

  footerLeft: "NimbusPost · Careers",
  footerCenter: "www.nimbuspost.com",
};

/** A blank-ish starting point for people who'd rather not edit the SDR copy. */
export const EMPTY_JD: JDData = {
  ...DEFAULT_JD,
  jobTitle: "",
  tagline: "",
  snapshot: DEFAULT_JD.snapshot.map((s) => ({ ...s, value: "" })),
  overview: [""],
  responsibilities: [""],
  lookingFor: DEFAULT_JD.lookingFor.map((g) => ({ ...g, items: [""] })),
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "job-description";
