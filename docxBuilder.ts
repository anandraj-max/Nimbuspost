import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertInchesToTwip,
} from "docx";
import { COLORS, LOGO_ASPECT, LOGO_LIGHT_SRC, PAGE } from "@/lib/brand";
import type { JDData } from "./types";

/** Fetches the logo so it can be embedded in the masthead. */
async function loadLogo(): Promise<ArrayBuffer | null> {
  if (!LOGO_LIGHT_SRC) return null;
  try {
    const res = await fetch(LOGO_LIGHT_SRC);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null; // fall back to the text wordmark
  }
}

/* Unit helpers -------------------------------------------------------------
   Word measures length in twips (1/20 pt) and spacing in twentieths of a
   point. The Figma file is in 96dpi px, so: 1px = 15 twips = 0.75pt.        */
const tw = (px: number) => Math.round(px * 15);
/** Font size in half-points, from a px size. */
const fs = (px: number) => Math.round(px * 1.5);
/** Line spacing value where 240 = single. */
const line = (multiplier: number) => Math.round(240 * multiplier);

const hex = (c: string) => c.replace("#", "").toUpperCase();

const CONTENT_TWIPS = tw(PAGE.contentWidth);
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "auto" } as const;
const NO_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
  insideHorizontal: NO_BORDER,
  insideVertical: NO_BORDER,
};

const clean = (arr: string[]) => arr.map((s) => s.trim()).filter(Boolean);

/* Building blocks ---------------------------------------------------------- */

function masthead(jd: JDData, logo: ArrayBuffer | null): Table {
  const rows: Paragraph[] = [];

  const LOGO_H = 28;
  rows.push(
    new Paragraph({
      // "atLeast" lets the line box grow to the image height instead of
      // clipping it to the inherited 1.42 body line spacing.
      spacing: { after: tw(8), line: 240, lineRule: "atLeast" },
      children: logo
        ? [
            new ImageRun({
              type: "png",
              data: logo,
              transformation: {
                width: Math.round(LOGO_H * LOGO_ASPECT),
                height: LOGO_H,
              },
            }),
          ]
        : [
            new TextRun({
              text: "NimbusPost",
              bold: true,
              size: fs(13),
              color: "FFFFFF",
              font: "Inter",
            }),
          ],
    }),
  );

  if (jd.eyebrow.trim()) {
    rows.push(
      new Paragraph({
        spacing: { after: tw(10) },
        children: [
          new TextRun({
            text: jd.eyebrow.toUpperCase(),
            bold: true,
            size: fs(10),
            color: "FFFFFF",
            characterSpacing: tw(1.8),
            font: "Inter",
          }),
        ],
      }),
    );
  }

  rows.push(
    new Paragraph({
      spacing: { after: tw(6), line: line(1.16) },
      children: [
        new TextRun({
          text: jd.jobTitle,
          bold: true,
          size: fs(24),
          color: "FFFFFF",
          font: "Inter",
        }),
      ],
    }),
  );

  if (jd.tagline.trim()) {
    rows.push(
      new Paragraph({
        spacing: { line: line(1.38) },
        children: [
          new TextRun({
            text: jd.tagline,
            size: fs(11),
            color: "FFFFFF",
            font: "Inter",
          }),
        ],
      }),
    );
  }

  return new Table({
    width: { size: CONTENT_TWIPS, type: WidthType.DXA },
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_TWIPS, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: hex(COLORS.brand), color: "auto" },
            margins: { top: tw(22), bottom: tw(24), left: tw(22), right: tw(22) },
            children: rows,
          }),
        ],
      }),
    ],
  });
}

function sectionHeading(text: string, first = false): (Paragraph | Table)[] {
  return [
    new Paragraph({
      spacing: { before: first ? tw(18) : tw(21), after: tw(4), line: line(1.22) },
      keepNext: true,
      children: [
        new TextRun({
          text,
          bold: true,
          size: fs(15),
          color: hex(COLORS.navy),
          font: "Inter",
        }),
      ],
    }),
    // 42x3 accent bar
    new Table({
      width: { size: tw(42), type: WidthType.DXA },
      borders: NO_BORDERS,
      rows: [
        new TableRow({
          height: { value: tw(3), rule: "exact" },
          children: [
            new TableCell({
              width: { size: tw(42), type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: hex(COLORS.accent), color: "auto" },
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })],
            }),
          ],
        }),
      ],
    }),
  ];
}

function subHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: tw(14), after: tw(2), line: line(1.3) },
    keepNext: true,
    children: [
      new TextRun({
        text,
        bold: true,
        size: fs(12),
        color: hex(COLORS.brand),
        font: "Inter",
      }),
    ],
  });
}

function body(
  text: string,
  opts: { before?: number; size?: number; color?: string; bold?: boolean } = {},
): Paragraph {
  return new Paragraph({
    spacing: { before: tw(opts.before ?? 9), line: line(1.42) },
    children: [
      new TextRun({
        text,
        size: fs(opts.size ?? 11),
        color: hex(opts.color ?? COLORS.body),
        bold: opts.bold,
        font: "Inter",
      }),
    ],
  });
}

function bullet(text: string, before = 5, indentLevel = 0): Paragraph {
  return new Paragraph({
    bullet: { level: indentLevel },
    spacing: { before: tw(before), line: line(1.42) },
    children: [
      new TextRun({ text, size: fs(11), color: hex(COLORS.body), font: "Inter" }),
    ],
  });
}

function snapshotTable(jd: JDData): Table | null {
  const items = jd.snapshot.filter((s) => s.label.trim() || s.value.trim());
  if (!items.length) return null;

  const half = Math.floor((CONTENT_TWIPS - tw(13)) / 2);
  const rows: TableRow[] = [];

  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2);
    rows.push(
      new TableRow({
        children: [0, 1].map((col) => {
          const item = pair[col];
          if (!item) {
            return new TableCell({
              width: { size: half, type: WidthType.DXA },
              borders: NO_BORDERS,
              children: [new Paragraph({ children: [] })],
            });
          }
          return new TableCell({
            width: { size: half, type: WidthType.DXA },
            borders: NO_BORDERS,
            shading: { type: ShadingType.CLEAR, fill: hex(COLORS.cardBg), color: "auto" },
            margins: { top: tw(11), bottom: tw(12), left: tw(14), right: tw(14) },
            children: [
              new Paragraph({
                spacing: { after: tw(3), line: line(1.2) },
                children: [
                  new TextRun({
                    text: item.label.toUpperCase(),
                    bold: true,
                    size: fs(8.5),
                    color: hex(COLORS.brand),
                    characterSpacing: tw(0.45),
                    font: "Inter",
                  }),
                ],
              }),
              new Paragraph({
                spacing: { line: line(1.38) },
                children: [
                  new TextRun({
                    text: item.value,
                    size: fs(11.5),
                    color: hex(COLORS.navy),
                    font: "Inter",
                  }),
                ],
              }),
            ],
          });
        }),
      }),
    );
  }

  return new Table({
    width: { size: CONTENT_TWIPS, type: WidthType.DXA },
    borders: NO_BORDERS,
    columnWidths: [half, half],
    rows,
  });
}

function softCard(children: Paragraph[]): Table {
  const border = { style: BorderStyle.SINGLE, size: 4, color: hex(COLORS.border) };
  return new Table({
    width: { size: CONTENT_TWIPS, type: WidthType.DXA },
    borders: {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_TWIPS, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: hex(COLORS.softBg), color: "auto" },
            margins: { top: tw(14), bottom: tw(16), left: tw(20), right: tw(20) },
            children,
          }),
        ],
      }),
    ],
  });
}

/** Word tables sit flush against each other; this keeps them breathing. */
const gap = (px: number) =>
  new Paragraph({ spacing: { before: 0, after: 0, line: line(1) }, children: [
    new TextRun({ text: "", size: fs(px / 3), font: "Inter" }),
  ] });

/* Document ------------------------------------------------------------------ */

export async function buildDocxBlob(jd: JDData): Promise<Blob> {
  const content: (Paragraph | Table)[] = [];
  const logo = await loadLogo();

  content.push(masthead(jd, logo));

  const snap = snapshotTable(jd);
  if (snap) {
    content.push(...sectionHeading("Role Snapshot", true));
    content.push(gap(10));
    content.push(snap);
  }

  if (jd.about.trim() || jd.websiteLine.trim()) {
    content.push(...sectionHeading(jd.aboutHeading));
    if (jd.about.trim()) content.push(body(jd.about, { before: 12 }));
    if (jd.websiteLine.trim())
      content.push(body(jd.websiteLine, { before: 9, color: COLORS.brand, bold: true }));
  }

  const overview = clean(jd.overview);
  if (overview.length) {
    content.push(...sectionHeading(jd.overviewHeading));
    overview.forEach((p, i) => content.push(body(p, { before: i === 0 ? 12 : 9 })));
  }

  const responsibilities = clean(jd.responsibilities);
  if (responsibilities.length) {
    content.push(...sectionHeading(jd.responsibilitiesHeading));
    responsibilities.forEach((t, i) => content.push(bullet(t, i === 0 ? 10 : 5)));
  }

  const groups = jd.lookingFor
    .map((g) => ({ ...g, items: clean(g.items) }))
    .filter((g) => g.heading.trim() || g.items.length);
  if (groups.length) {
    content.push(...sectionHeading(jd.lookingForHeading));
    groups.forEach((g) => {
      if (g.heading.trim()) content.push(subHeading(g.heading));
      g.items.forEach((t, i) => content.push(bullet(t, i === 0 ? 6 : 5)));
    });
  }

  const whyJoin = clean(jd.whyJoin);
  if (whyJoin.length) {
    content.push(...sectionHeading(jd.whyJoinHeading));
    content.push(gap(10));
    content.push(softCard(whyJoin.map((t, i) => bullet(t, i === 0 ? 0 : 6))));
  }

  if (jd.howToApply.trim()) {
    content.push(...sectionHeading(jd.howToApplyHeading));
    content.push(gap(10));
    content.push(
      softCard([
        new Paragraph({
          spacing: { line: line(1.55) },
          children: [
            new TextRun({
              text: jd.howToApply,
              size: fs(11),
              color: hex(COLORS.body),
              font: "Inter",
            }),
          ],
        }),
      ]),
    );
  }

  if (jd.eeo.trim()) {
    content.push(body(jd.eeo, { before: 12, size: 9.5, color: COLORS.muted }));
  }

  /* Running header for pages 2+ (Word's "different first page"). */
  const runningHeader = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: tw(6) },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: hex(COLORS.border), space: 6 },
        },
        children: [
          new TextRun({
            text: jd.jobTitle,
            size: fs(9.5),
            color: hex(COLORS.muted),
            font: "Inter",
          }),
        ],
      }),
    ],
  });

  const footerCell = (
    text: (Paragraph | TextRun)[] | TextRun[],
    alignment: (typeof AlignmentType)[keyof typeof AlignmentType],
    width: number,
  ) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders: NO_BORDERS,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [
        new Paragraph({
          alignment,
          spacing: { before: 0, after: 0 },
          children: text as TextRun[],
        }),
      ],
    });

  const footerRun = (text: string) =>
    new TextRun({ text, size: fs(9), color: hex(COLORS.muted), font: "Inter" });

  const third = Math.floor(CONTENT_TWIPS / 3);
  const footer = new Footer({
    children: [
      new Table({
        width: { size: CONTENT_TWIPS, type: WidthType.DXA },
        borders: {
          ...NO_BORDERS,
          top: { style: BorderStyle.SINGLE, size: 4, color: hex(COLORS.border) },
        },
        columnWidths: [third, third, CONTENT_TWIPS - 2 * third],
        rows: [
          new TableRow({
            children: [
              footerCell([footerRun(jd.footerLeft)], AlignmentType.LEFT, third),
              footerCell([footerRun(jd.footerCenter)], AlignmentType.CENTER, third),
              footerCell(
                [
                  new TextRun({
                    children: ["Page ", PageNumber.CURRENT],
                    size: fs(9),
                    color: hex(COLORS.muted),
                    font: "Inter",
                  }),
                ],
                AlignmentType.RIGHT,
                CONTENT_TWIPS - 2 * third,
              ),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: "NimbusPost Internal Tools",
    title: jd.jobTitle || "Job Description",
    description: "Job Description",
    styles: {
      default: {
        document: {
          run: { font: "Inter", size: fs(11), color: hex(COLORS.body) },
          paragraph: { spacing: { line: line(1.42) } },
        },
      },
    },
    sections: [
      {
        properties: {
          titlePage: true,
          page: {
            size: {
              width: convertInchesToTwip(8.27),
              height: convertInchesToTwip(11.69),
            },
            margin: {
              top: tw(50),
              bottom: tw(60),
              left: tw(PAGE.margin),
              right: tw(PAGE.margin),
              header: tw(24),
              footer: tw(28),
            },
          },
        },
        headers: { first: new Header({ children: [] }), default: runningHeader },
        footers: { first: footer, default: footer },
        children: content,
      },
    ],
  });

  return Packer.toBlob(doc);
}
