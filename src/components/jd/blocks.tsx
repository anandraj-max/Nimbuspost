import React from "react";
import { COLORS, PAGE, TYPE } from "@/lib/brand";
import type { JDData } from "@/lib/jd/types";
import { WRAP } from "@/lib/jd/fit";

/**
 * The JD is expressed as a flat list of atomic blocks. Both the on-screen
 * preview and the paginator consume this list, so page breaks in the preview
 * land exactly where the exported PDF puts them.
 *
 * `mt` is the gap above the block, taken 1:1 from the Figma y-coordinates.
 * It is dropped when the block happens to start a page.
 */
export interface Block {
  key: string;
  node: React.ReactNode;
  /** Gap above this block, in px. Ignored at the top of a page. */
  mt: number;
  /** Keep at least N following blocks on the same page (stops orphan headings). */
  keepWithNext?: number;
}

const W = PAGE.contentWidth;

/* ---------------------------------------------------------------- atoms -- */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: W }}>
      <div
        style={{
          ...WRAP,
          fontSize: TYPE.sectionHeading,
          lineHeight: 1.22,
          fontWeight: 700,
          color: COLORS.navy,
        }}
      >
        {children}
      </div>
      <div
        style={{
          width: 42,
          height: 3,
          borderRadius: 2,
          background: COLORS.accent,
          marginTop: 8,
        }}
      />
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        ...WRAP,
        width: W,
        fontSize: TYPE.subHeading,
        lineHeight: 1.3,
        fontWeight: 600,
        color: COLORS.brand,
      }}
    >
      {children}
    </div>
  );
}

function Body({
  children,
  color = COLORS.body,
  size = TYPE.body,
  lineHeight = 1.56,
  weight = 400,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  lineHeight?: number;
  weight?: number;
}) {
  return (
    <div
      style={{
        ...WRAP,
        width: W,
        fontSize: size,
        lineHeight,
        color,
        fontWeight: weight,
      }}
    >
      {children}
    </div>
  );
}

export function Bullet({
  children,
  width = W,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div style={{ width, display: "flex", alignItems: "flex-start", gap: 11 }}>
      <div style={{ width: 6, height: 13, flexShrink: 0 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            background: COLORS.accent,
            marginTop: 7,
          }}
        />
      </div>
      <div
        style={{
          ...WRAP,
          flex: "1 1 0",
          minWidth: 0,
          fontSize: TYPE.body,
          lineHeight: 1.52,
          color: COLORS.body,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        background: COLORS.cardBg,
        borderRadius: 12,
        padding: "13px 16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        alignSelf: "stretch",
      }}
    >
      <div
        style={{
          ...WRAP,
          fontSize: TYPE.snapshotLabel,
          lineHeight: 1.2,
          fontWeight: 600,
          letterSpacing: 0.45,
          color: COLORS.brand,
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...WRAP,
          fontSize: TYPE.snapshotValue,
          lineHeight: 1.38,
          fontWeight: 500,
          color: COLORS.navy,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SoftCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: W,
        background: COLORS.softBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "18px 22px 20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 9,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- assembly -- */

const clean = (arr: string[]) => arr.map((s) => s.trim()).filter(Boolean);

export function buildBlocks(jd: JDData): Block[] {
  const blocks: Block[] = [];
  const push = (b: Block) => blocks.push(b);

  /* Role Snapshot ------------------------------------------------------- */
  const snapshot = jd.snapshot.filter((s) => s.label.trim() || s.value.trim());
  if (snapshot.length) {
    push({
      key: "snapshot-h",
      mt: 0,
      keepWithNext: 1,
      node: <SectionHeading>Role Snapshot</SectionHeading>,
    });

    // Two cards per row; a lone trailing card keeps its half-width.
    for (let i = 0; i < snapshot.length; i += 2) {
      const row = snapshot.slice(i, i + 2);
      push({
        key: `snapshot-row-${i}`,
        mt: i === 0 ? 16 : 13,
        node: (
          <div style={{ width: W, display: "flex", gap: 13, alignItems: "stretch" }}>
            {row.map((item) => (
              <SnapshotCard key={item.id} label={item.label} value={item.value} />
            ))}
            {row.length === 1 && <div style={{ flex: "1 1 0", minWidth: 0 }} />}
          </div>
        ),
      });
    }
  }

  /* About --------------------------------------------------------------- */
  if (jd.about.trim() || jd.websiteLine.trim()) {
    push({
      key: "about-h",
      mt: 26,
      keepWithNext: 1,
      node: <SectionHeading>{jd.aboutHeading}</SectionHeading>,
    });
    if (jd.about.trim()) {
      push({ key: "about-p", mt: 12, node: <Body>{jd.about}</Body> });
    }
    if (jd.websiteLine.trim()) {
      push({
        key: "about-web",
        mt: jd.about.trim() ? 9 : 12,
        node: (
          <Body color={COLORS.brand} weight={600} lineHeight={1.5}>
            {jd.websiteLine}
          </Body>
        ),
      });
    }
  }

  /* Role Overview -------------------------------------------------------- */
  const overview = clean(jd.overview);
  if (overview.length) {
    push({
      key: "overview-h",
      mt: 26,
      keepWithNext: 1,
      node: <SectionHeading>{jd.overviewHeading}</SectionHeading>,
    });
    overview.forEach((p, i) =>
      push({ key: `overview-${i}`, mt: i === 0 ? 12 : 9, node: <Body>{p}</Body> }),
    );
  }

  /* Key Responsibilities -------------------------------------------------- */
  const responsibilities = clean(jd.responsibilities);
  if (responsibilities.length) {
    push({
      key: "resp-h",
      mt: 26,
      keepWithNext: 2,
      node: <SectionHeading>{jd.responsibilitiesHeading}</SectionHeading>,
    });
    responsibilities.forEach((item, i) =>
      push({ key: `resp-${i}`, mt: i === 0 ? 11 : 7, node: <Bullet>{item}</Bullet> }),
    );
  }

  /* What We're Looking For ------------------------------------------------ */
  const groups = jd.lookingFor
    .map((g) => ({ ...g, items: clean(g.items) }))
    .filter((g) => g.heading.trim() || g.items.length);
  if (groups.length) {
    push({
      key: "look-h",
      mt: 26,
      keepWithNext: 2,
      node: <SectionHeading>{jd.lookingForHeading}</SectionHeading>,
    });
    groups.forEach((g, gi) => {
      if (g.heading.trim()) {
        push({
          key: `look-${g.id}-h`,
          mt: gi === 0 ? 14 : 14,
          keepWithNext: 1,
          node: <SubHeading>{g.heading}</SubHeading>,
        });
      }
      g.items.forEach((item, i) =>
        push({
          key: `look-${g.id}-${i}`,
          mt: i === 0 ? (g.heading.trim() ? 7 : 14) : 7,
          node: <Bullet>{item}</Bullet>,
        }),
      );
    });
  }

  /* Why Join -------------------------------------------------------------- */
  const whyJoin = clean(jd.whyJoin);
  if (whyJoin.length) {
    push({
      key: "why-h",
      mt: 26,
      keepWithNext: 1,
      node: <SectionHeading>{jd.whyJoinHeading}</SectionHeading>,
    });
    push({
      key: "why-card",
      mt: 14,
      node: (
        <SoftCard>
          {whyJoin.map((item, i) => (
            <Bullet key={i} width={W - 44 - 2}>
              {item}
            </Bullet>
          ))}
        </SoftCard>
      ),
    });
  }

  /* How to Apply ----------------------------------------------------------- */
  if (jd.howToApply.trim()) {
    push({
      key: "apply-h",
      mt: 26,
      keepWithNext: 1,
      node: <SectionHeading>{jd.howToApplyHeading}</SectionHeading>,
    });
    push({
      key: "apply-card",
      mt: 14,
      node: (
        <SoftCard>
          <div
            style={{
              ...WRAP,
              width: W - 44 - 2,
              fontSize: TYPE.body,
              lineHeight: 1.55,
              color: COLORS.body,
            }}
          >
            {jd.howToApply}
          </div>
        </SoftCard>
      ),
    });
  }

  /* EEO --------------------------------------------------------------------- */
  if (jd.eeo.trim()) {
    push({
      key: "eeo",
      mt: 12,
      node: (
        <Body color={COLORS.muted} size={TYPE.eeo} lineHeight={1.52}>
          {jd.eeo}
        </Body>
      ),
    });
  }

  return blocks;
}
