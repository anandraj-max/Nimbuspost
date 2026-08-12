"use client";

import React from "react";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Svg,
  Circle,
  Rect,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import {
  COLORS,
  LOGO_ASPECT,
  LOGO_DARK_SRC,
  LOGO_LIGHT_SRC,
  PAGE,
  TYPE,
} from "@/lib/brand";
import type { JDData } from "./types";
import { taglineFontSize, titleFontSize } from "./fit";

/* -------------------------------------------------------------- units --- */
/** Figma is drawn at 96dpi; PDF points are 72dpi. 794px === 595.5pt === A4. */
const s = (px: number) => px * 0.75;

/**
 * Verified against a rendered PDF: react-pdf places absolutely-positioned
 * children relative to the page's border box, so page chrome can use raw
 * Figma coordinates. These constants exist only so a future react-pdf
 * change can be absorbed in one place.
 */
const ORIGIN_X = 0;
const ORIGIN_Y = 0;

/* -------------------------------------------------------------- fonts --- */

let registered = false;
let fontBase = "/fonts";

/** Test/SSR hook: point font loading at a filesystem directory instead of a URL. */
export function setPdfFontBase(base: string) {
  fontBase = base;
  registered = false;
}

export function registerPdfFonts() {
  if (registered) return;
  registered = true;
  Font.register({
    family: "Inter",
    fonts: [
      { src: `${fontBase}/Inter_400Regular.ttf`, fontWeight: 400 },
      { src: `${fontBase}/Inter_500Medium.ttf`, fontWeight: 500 },
      { src: `${fontBase}/Inter_600SemiBold.ttf`, fontWeight: 600 },
      { src: `${fontBase}/Inter_700Bold.ttf`, fontWeight: 700 },
    ],
  });
  /**
   * The design has no hyphenation, so ordinary words are left intact.
   * Unbroken runs longer than any column is wide (pasted IDs, long URLs)
   * would otherwise spill outside their card, so those are chunked — which
   * is the only mechanism react-pdf offers for breaking inside a word.
   */
  Font.registerHyphenationCallback((word) => {
    if (word.length <= 28) return [word];
    const parts: string[] = [];
    for (let i = 0; i < word.length; i += 18) parts.push(word.slice(i, i + 18));
    return parts;
  });
}

/* -------------------------------------------------------------- styles --- */

const st = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    backgroundColor: "#ffffff",
    paddingTop: s(PAGE.page2ContentTop),
    paddingBottom: s(70),
    paddingHorizontal: s(PAGE.margin),
  },
  page1Spacer: {
    height: s(PAGE.page1ContentTop - PAGE.page2ContentTop),
  },

  /* page 1 masthead */
  header: {
    position: "absolute",
    left: ORIGIN_X,
    top: ORIGIN_Y,
    width: s(PAGE.width),
    height: s(PAGE.headerHeight),
    backgroundColor: COLORS.brand,
  },
  blobA: {
    position: "absolute",
    left: s(664),
    top: s(-70),
    width: s(220),
    height: s(220),
    borderRadius: s(110),
    backgroundColor: "#ffffff",
    opacity: 0.09,
  },
  blobB: {
    position: "absolute",
    left: s(584),
    top: s(55),
    width: s(120),
    height: s(120),
    borderRadius: s(60),
    backgroundColor: "#ffffff",
    opacity: 0.07,
  },
  blobC: {
    position: "absolute",
    left: s(749),
    top: s(105),
    width: s(80),
    height: s(80),
    borderRadius: s(40),
    backgroundColor: "#ffffff",
    opacity: 0.1,
  },
  eyebrow: {
    position: "absolute",
    left: s(185),
    top: s(26),
    fontSize: s(TYPE.eyebrow),
    fontWeight: 600,
    letterSpacing: s(1.8),
    color: "#ffffff",
    opacity: 0.82,
    maxWidth: s(240),
    maxLines: 1,
    textOverflow: "ellipsis",
  },
  titleBlock: {
    position: "absolute",
    left: s(PAGE.margin),
    top: s(74),
    width: s(PAGE.contentWidth),
  },
  title: {
    lineHeight: 1.16,
    fontWeight: 700,
    color: "#ffffff",
  },
  tagline: {
    marginTop: s(5),
    width: s(620),
    lineHeight: 1.38,
    fontWeight: 500,
    color: "#ffffff",
    opacity: 0.92,
  },

  /* pages 2+ running header */
  runHeadWrap: {
    position: "absolute",
    left: ORIGIN_X,
    top: ORIGIN_Y,
    width: s(PAGE.width),
    height: s(60),
  },
  runHeadText: {
    position: "absolute",
    left: s(PAGE.margin),
    top: s(26),
    width: s(PAGE.contentWidth),
    textAlign: "right",
    fontSize: s(TYPE.runningHeader),
    fontWeight: 500,
    color: COLORS.muted,
  },
  runHeadRule: {
    position: "absolute",
    left: s(PAGE.margin),
    top: s(52),
    width: s(PAGE.contentWidth),
    height: s(1),
    backgroundColor: COLORS.border,
  },

  /* footer */
  footerWrap: {
    position: "absolute",
    left: ORIGIN_X,
    top: ORIGIN_Y + s(PAGE.footerDividerY),
    width: s(PAGE.width),
    height: s(50),
  },
  footerRule: {
    position: "absolute",
    left: s(PAGE.margin),
    top: 0,
    width: s(PAGE.contentWidth),
    height: s(1),
    backgroundColor: COLORS.border,
  },
  footerRow: {
    position: "absolute",
    left: s(PAGE.margin),
    top: s(12),
    width: s(PAGE.contentWidth),
    flexDirection: "row",
  },
  footerCell: {
    flex: 1,
    fontSize: s(TYPE.footer),
    fontWeight: 500,
    color: COLORS.muted,
    paddingRight: s(12),
    maxLines: 1,
    textOverflow: "ellipsis",
  },

  /* content atoms */
  sectionTitle: {
    fontSize: s(TYPE.sectionHeading),
    lineHeight: 1.22,
    fontWeight: 700,
    color: COLORS.navy,
  },
  rule: {
    width: s(42),
    height: s(3),
    borderRadius: s(2),
    backgroundColor: COLORS.accent,
    marginTop: s(8),
  },
  subHeading: {
    fontSize: s(TYPE.subHeading),
    lineHeight: 1.3,
    fontWeight: 600,
    color: COLORS.brand,
  },
  body: {
    fontSize: s(TYPE.body),
    lineHeight: 1.56,
    color: COLORS.body,
  },
  bulletRow: { flexDirection: "row", alignItems: "flex-start" },
  bulletDotBox: { width: s(6), height: s(13), marginRight: s(11) },
  bulletDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    backgroundColor: COLORS.accent,
    marginTop: s(7),
  },
  bulletText: {
    flex: 1,
    fontSize: s(TYPE.body),
    lineHeight: 1.52,
    color: COLORS.body,
  },
  snapRow: { flexDirection: "row" },
  snapCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: s(12),
    paddingTop: s(13),
    paddingBottom: s(14),
    paddingHorizontal: s(16),
  },
  snapLabel: {
    fontSize: s(TYPE.snapshotLabel),
    lineHeight: 1.2,
    fontWeight: 600,
    letterSpacing: s(0.45),
    color: COLORS.brand,
  },
  snapValue: {
    fontSize: s(TYPE.snapshotValue),
    lineHeight: 1.38,
    fontWeight: 500,
    color: COLORS.navy,
    marginTop: s(5),
  },
  softCard: {
    backgroundColor: COLORS.softBg,
    borderWidth: s(1),
    borderColor: COLORS.border,
    borderStyle: "solid",
    borderRadius: s(14),
    paddingTop: s(18),
    paddingBottom: s(20),
    paddingHorizontal: s(22),
  },
});

/* --------------------------------------------------------------- logo --- */

function PdfLogo({ height = 34, tone = "light" }: { height?: number; tone?: "light" | "dark" }) {
  const color = tone === "light" ? "#ffffff" : "#1d4ed8";
  const wordColor = tone === "light" ? "#ffffff" : "#0f2a63";
  const h = s(height);
  const k = h / 34;

  const src = tone === "light" ? LOGO_LIGHT_SRC : LOGO_DARK_SRC;
  if (src) {
    return <Image src={src} style={{ height: h, width: h * LOGO_ASPECT }} />;
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: h }}>
      <Svg width={36 * k} height={24 * k} viewBox="0 0 36 24">
        <Circle cx={17} cy={11} r={7} fill={color} />
        <Circle cx={25.5} cy={13.5} r={5.5} fill={color} />
        <Circle cx={12.5} cy={15} r={5} fill={color} />
        <Rect x={12} y={14} width={19} height={5} rx={2.5} fill={color} />
        <Rect x={0} y={7.5} width={8} height={2} rx={1} fill={color} opacity={0.75} />
        <Rect x={2.5} y={12.5} width={6} height={2} rx={1} fill={color} opacity={0.55} />
        <Rect x={0.5} y={17.5} width={9} height={2} rx={1} fill={color} opacity={0.4} />
      </Svg>
      <View style={{ marginLeft: 8 * k, justifyContent: "center" }}>
        <Text style={{ color: wordColor, fontWeight: 700, fontSize: 16 * k, lineHeight: 1.05 }}>
          Nimbus
        </Text>
        <Text style={{ color: wordColor, fontWeight: 700, fontSize: 16 * k, lineHeight: 1.05 }}>
          Post
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------- pieces --- */

const clean = (arr: string[]) => arr.map((t) => t.trim()).filter(Boolean);

function Section({ children, mt }: { children: string; mt: number }) {
  return (
    <View style={{ marginTop: s(mt) }} wrap={false} minPresenceAhead={s(40)}>
      <Text style={st.sectionTitle}>{children}</Text>
      <View style={st.rule} />
    </View>
  );
}

function Bullet({ children, mt }: { children: string; mt: number }) {
  return (
    <View style={[st.bulletRow, { marginTop: s(mt) }]} wrap={false}>
      <View style={st.bulletDotBox}>
        <View style={st.bulletDot} />
      </View>
      <Text style={st.bulletText}>{children}</Text>
    </View>
  );
}

/* ----------------------------------------------------------- document --- */

export function JDPdfDocument({ jd }: { jd: JDData }) {
  registerPdfFonts();

  const snapshot = jd.snapshot.filter((x) => x.label.trim() || x.value.trim());
  const snapshotRows: (typeof snapshot)[] = [];
  for (let i = 0; i < snapshot.length; i += 2) snapshotRows.push(snapshot.slice(i, i + 2));

  const overview = clean(jd.overview);
  const responsibilities = clean(jd.responsibilities);
  const groups = jd.lookingFor
    .map((g) => ({ ...g, items: clean(g.items) }))
    .filter((g) => g.heading.trim() || g.items.length);
  const whyJoin = clean(jd.whyJoin);

  return (
    <Document
      title={jd.jobTitle || "Job Description"}
      author={`${jd.footerLeft}`}
      subject="Job Description"
      creator="NimbusPost Internal Tools"
      producer="NimbusPost Internal Tools"
    >
      <Page size="A4" style={st.page}>
        {/* Running header, drawn on every page. On page 1 the opaque masthead
            below is painted over it, which is exactly the Figma behaviour. */}
        <View fixed style={st.runHeadWrap}>
          <View style={{ position: "absolute", left: s(PAGE.margin), top: s(17) }}>
            <PdfLogo height={26} tone="dark" />
          </View>
          <Text style={st.runHeadText}>{jd.jobTitle}</Text>
          <View style={st.runHeadRule} />
        </View>

        {/* page 1 masthead */}
        <View style={st.header}>
          <View style={st.blobA} />
          <View style={st.blobB} />
          <View style={st.blobC} />
          <View style={{ position: "absolute", left: s(60), top: s(19) }}>
            <PdfLogo height={34} tone="light" />
          </View>
          {!!jd.eyebrow.trim() && (
            <Text style={st.eyebrow}>{jd.eyebrow}</Text>
          )}
          <View style={st.titleBlock}>
            <Text style={[st.title, { fontSize: s(titleFontSize(jd.jobTitle)) }]}>
              {jd.jobTitle}
            </Text>
            <Text style={[st.tagline, { fontSize: s(taglineFontSize(jd.tagline)) }]}>
              {jd.tagline}
            </Text>
          </View>
        </View>

        {/* footer, every page */}
        <View fixed style={st.footerWrap}>
          <View style={st.footerRule} />
          <View style={st.footerRow}>
            <Text style={st.footerCell}>{jd.footerLeft}</Text>
            <Text style={[st.footerCell, { textAlign: "center" }]}>
              {jd.footerCenter}
            </Text>
            <Text
              style={[st.footerCell, { textAlign: "right", paddingRight: 0 }]}
              render={({ pageNumber }) => `Page ${pageNumber}`}
            />
          </View>
        </View>

        {/* page 1 pushes content down past the masthead */}
        <View style={st.page1Spacer} />

        {/* ---------------------------------------------------- content -- */}

        {snapshot.length > 0 && (
          <>
            <Section mt={0}>Role Snapshot</Section>
            {snapshotRows.map((row, i) => (
              <View key={i} style={[st.snapRow, { marginTop: s(i === 0 ? 16 : 13) }]} wrap={false}>
                {row.map((item, j) => (
                  <View
                    key={item.id}
                    style={[st.snapCard, j === 0 ? { marginRight: s(13) } : {}]}
                  >
                    <Text style={st.snapLabel}>{item.label}</Text>
                    <Text style={st.snapValue}>{item.value}</Text>
                  </View>
                ))}
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </>
        )}

        {(!!jd.about.trim() || !!jd.websiteLine.trim()) && (
          <>
            <Section mt={26}>{jd.aboutHeading}</Section>
            {!!jd.about.trim() && (
              <Text style={[st.body, { marginTop: s(12) }]}>{jd.about}</Text>
            )}
            {!!jd.websiteLine.trim() && (
              <Text
                style={[
                  st.body,
                  {
                    marginTop: s(jd.about.trim() ? 9 : 12),
                    color: COLORS.brand,
                    fontWeight: 600,
                    lineHeight: 1.5,
                  },
                ]}
              >
                {jd.websiteLine}
              </Text>
            )}
          </>
        )}

        {overview.length > 0 && (
          <>
            <Section mt={26}>{jd.overviewHeading}</Section>
            {overview.map((p, i) => (
              <Text key={i} style={[st.body, { marginTop: s(i === 0 ? 12 : 9) }]}>
                {p}
              </Text>
            ))}
          </>
        )}

        {responsibilities.length > 0 && (
          <>
            <Section mt={26}>{jd.responsibilitiesHeading}</Section>
            {responsibilities.map((item, i) => (
              <Bullet key={i} mt={i === 0 ? 11 : 7}>
                {item}
              </Bullet>
            ))}
          </>
        )}

        {groups.length > 0 && (
          <>
            <Section mt={26}>{jd.lookingForHeading}</Section>
            {groups.map((g) => (
              <React.Fragment key={g.id}>
                {!!g.heading.trim() && (
                  <View style={{ marginTop: s(14) }} wrap={false} minPresenceAhead={s(30)}>
                    <Text style={st.subHeading}>{g.heading}</Text>
                  </View>
                )}
                {g.items.map((item, i) => (
                  <Bullet key={i} mt={i === 0 ? (g.heading.trim() ? 7 : 14) : 7}>
                    {item}
                  </Bullet>
                ))}
              </React.Fragment>
            ))}
          </>
        )}

        {whyJoin.length > 0 && (
          <>
            <Section mt={26}>{jd.whyJoinHeading}</Section>
            <View style={[st.softCard, { marginTop: s(14) }]} wrap={false}>
              {whyJoin.map((item, i) => (
                <Bullet key={i} mt={i === 0 ? 0 : 9}>
                  {item}
                </Bullet>
              ))}
            </View>
          </>
        )}

        {!!jd.howToApply.trim() && (
          <>
            <Section mt={26}>{jd.howToApplyHeading}</Section>
            <View style={[st.softCard, { marginTop: s(14) }]} wrap={false}>
              <Text style={[st.body, { lineHeight: 1.55 }]}>{jd.howToApply}</Text>
            </View>
          </>
        )}

        {!!jd.eeo.trim() && (
          <Text
            style={[
              st.body,
              {
                marginTop: s(12),
                fontSize: s(TYPE.eeo),
                lineHeight: 1.52,
                color: COLORS.muted,
              },
            ]}
          >
            {jd.eeo}
          </Text>
        )}
      </Page>
    </Document>
  );
}
