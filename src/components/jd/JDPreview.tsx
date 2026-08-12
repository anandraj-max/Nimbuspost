"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { COLORS, PAGE, TYPE } from "@/lib/brand";
import { BrandLogo } from "@/components/BrandLogo";
import { buildBlocks, type Block } from "./blocks";
import type { JDData } from "@/lib/jd/types";
import { WRAP, taglineFontSize, titleFontSize } from "@/lib/jd/fit";

/** Last usable y before the footer hairline at 1073. */
const CONTENT_BOTTOM = 1053;

interface Placed {
  index: number;
  mt: number;
}

function paginate(blocks: Block[], heights: number[]): Placed[][] {
  if (!blocks.length) return [[]];
  const pages: Placed[][] = [];
  let cur: Placed[] = [];
  let y = PAGE.page1ContentTop;
  let i = 0;

  while (i < blocks.length) {
    const first = cur.length === 0;
    const mt = first ? 0 : blocks[i].mt;
    const h = heights[i] ?? 0;

    // A heading must drag its first line(s) of content with it.
    let need = mt + h;
    const keep = blocks[i].keepWithNext ?? 0;
    for (let k = 1; k <= keep && i + k < blocks.length; k++) {
      need += blocks[i + k].mt + (heights[i + k] ?? 0);
    }

    if (!first && y + need > CONTENT_BOTTOM) {
      pages.push(cur);
      cur = [];
      y = PAGE.page2ContentTop;
      continue;
    }

    cur.push({ index: i, mt });
    y += mt + h;
    i++;
  }

  if (cur.length) pages.push(cur);
  return pages;
}

/* ------------------------------------------------------------- chrome --- */

function PageHeader({ jd }: { jd: JDData }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: `0 0 auto 0`,
        height: PAGE.headerHeight,
        background: COLORS.brand,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 664,
          top: -70,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.09)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 584,
          top: 55,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 749,
          top: 105,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.10)",
        }}
      />

      <div style={{ position: "absolute", left: 60, top: 19 }}>
        <BrandLogo height={34} tone="light" />
      </div>

      {jd.eyebrow.trim() && (
        <div
          style={{
            position: "absolute",
            left: 200,
            top: 27,
            fontSize: TYPE.eyebrow,
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: 1.8,
            color: "#fff",
            opacity: 0.82,
            whiteSpace: "nowrap",
            maxWidth: 240,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {jd.eyebrow}
        </div>
      )}

      {/* Title and tagline stack, so a long title pushes the tagline down
          instead of colliding with it. Both shrink to stay in the band. */}
      <div
        style={{
          position: "absolute",
          left: PAGE.margin,
          top: 76,
          width: PAGE.contentWidth,
        }}
      >
        <div
          style={{
            ...WRAP,
            fontSize: titleFontSize(jd.jobTitle),
            lineHeight: 1.16,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {jd.jobTitle}
        </div>
        <div
          style={{
            ...WRAP,
            marginTop: 5,
            width: 620,
            fontSize: taglineFontSize(jd.tagline),
            lineHeight: 1.38,
            fontWeight: 500,
            color: "#fff",
            opacity: 0.92,
            whiteSpace: "pre-wrap",
          }}
        >
          {jd.tagline}
        </div>
      </div>
    </div>
  );
}

function RunningHeader({ jd }: { jd: JDData }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: PAGE.margin,
          right: PAGE.margin,
          top: 26,
          textAlign: "right",
          fontSize: TYPE.runningHeader,
          lineHeight: 1.2,
          fontWeight: 500,
          color: COLORS.muted,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {jd.jobTitle}
      </div>
      <div
        style={{
          position: "absolute",
          left: PAGE.margin,
          top: 52,
          width: PAGE.contentWidth,
          height: 1,
          background: COLORS.border,
        }}
      />
      <div style={{ position: "absolute", left: PAGE.margin, top: 19 }}>
        <BrandLogo height={26} tone="dark" />
      </div>
    </>
  );
}

function PageFooter({
  jd,
  pageNumber,
}: {
  jd: JDData;
  pageNumber: number;
}) {
  /* Three equal columns rather than three absolute x-positions, so a long
     footer string is clipped inside its own third instead of running off
     the page. */
  const cell: React.CSSProperties = {
    flex: "1 1 0",
    minWidth: 0,
    fontSize: TYPE.footer,
    lineHeight: 1,
    fontWeight: 500,
    color: COLORS.muted,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: PAGE.margin,
          top: PAGE.footerDividerY,
          width: PAGE.contentWidth,
          height: 1,
          background: COLORS.border,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PAGE.margin,
          top: PAGE.footerTextY,
          width: PAGE.contentWidth,
          display: "flex",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <div style={cell}>{jd.footerLeft}</div>
        <div style={{ ...cell, textAlign: "center" }}>{jd.footerCenter}</div>
        <div style={{ ...cell, textAlign: "right" }}>Page {pageNumber}</div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------ preview --- */

export function JDPreview({
  jd,
  scale = 1,
  onPageCount,
}: {
  jd: JDData;
  scale?: number;
  onPageCount?: (n: number) => void;
}) {
  const blocks = useMemo(() => buildBlocks(jd), [jd]);
  const measureRef = useRef<HTMLDivElement>(null);
  /* The page split is stored together with the block list it was measured
     from. Editing the form produces a new block list, and a split computed
     from the old one would point at blocks that no longer exist — so it is
     discarded rather than indexed into. */
  const [layout, setLayout] = useState<{ src: Block[]; pages: Placed[][] }>({
    src: [],
    pages: [],
  });
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const done = () => !cancelled && setFontsReady(true);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(done).catch(done);
    } else {
      done();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const heights = Array.from(el.children).map(
      (c) => (c as HTMLElement).getBoundingClientRect().height,
    );
    setLayout({ src: blocks, pages: paginate(blocks, heights) });
  }, [blocks, fontsReady]);

  /* Until the measuring pass catches up with an edit, fall back to a single
     page holding everything. The layout effect corrects it before paint, so
     this is never visible — it just guarantees valid indices. */
  const pages =
    layout.src === blocks
      ? layout.pages
      : [blocks.map((b, index) => ({ index, mt: index === 0 ? 0 : b.mt }))];

  useEffect(() => {
    if (pages.length) onPageCount?.(pages.length);
  }, [pages.length, onPageCount]);

  return (
    <>
      {/* Off-screen measurer — same width and typography as the real page.
          `fixed` keeps it out of the document's scroll extent, so it can't
          create a phantom horizontal scrollbar on narrow screens. */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: PAGE.contentWidth,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        {blocks.map((b) => (
          <div key={b.key}>{b.node}</div>
        ))}
      </div>

      <div
        className="a4-scaler"
        style={{
          transform: `scale(${scale})`,
          width: PAGE.width * scale,
          height: pages.length
            ? (PAGE.height * pages.length + 24 * (pages.length - 1)) * scale
            : PAGE.height * scale,
        }}
      >
        {pages.map((page, pi) => (
          <div
            key={pi}
            className="print-sheet"
            style={{
              position: "relative",
              width: PAGE.width,
              height: PAGE.height,
              background: "#fff",
              overflow: "hidden",
              marginBottom: pi < pages.length - 1 ? 24 : 0,
              boxShadow: "0 1px 3px rgba(15,23,42,.12), 0 12px 32px rgba(15,23,42,.10)",
            }}
          >
            {pi === 0 ? <PageHeader jd={jd} /> : <RunningHeader jd={jd} />}

            <div
              style={{
                position: "absolute",
                left: PAGE.margin,
                top: pi === 0 ? PAGE.page1ContentTop : PAGE.page2ContentTop,
                width: PAGE.contentWidth,
              }}
            >
              {page.map(({ index, mt }) => (
                <div key={blocks[index].key} style={{ marginTop: mt }}>
                  {blocks[index].node}
                </div>
              ))}
            </div>

            <PageFooter jd={jd} pageNumber={pi + 1} />
          </div>
        ))}
      </div>
    </>
  );
}
