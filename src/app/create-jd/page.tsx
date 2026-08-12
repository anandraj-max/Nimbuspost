"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { JDForm } from "@/components/jd/JDForm";
import { JDPreview } from "@/components/jd/JDPreview";
import { DEFAULT_JD, slugify } from "@/lib/jd/defaults";
import type { JDData } from "@/lib/jd/types";
import { PAGE } from "@/lib/brand";

const DRAFT_KEY = "nimbuspost.jd.draft.v1";

type Busy = null | "pdf" | "docx";

export default function CreateJDPage() {
  const [jd, setJd] = useState<JDData>(DEFAULT_JD);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [scale, setScale] = useState(1);

  const previewWrap = useRef<HTMLDivElement>(null);

  /* Draft persistence — keeps a half-written JD safe across reloads. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) setJd({ ...DEFAULT_JD, ...(JSON.parse(raw) as JDData) });
    } catch {
      /* ignore a corrupt draft */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(jd));
      } catch {
        /* storage full or blocked — not worth interrupting the user */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [jd, loaded]);

  /* Fit the true-size A4 preview into whatever space the column has. */
  useLayoutEffect(() => {
    const el = previewWrap.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / PAGE.width));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fileName = slugify(jd.jobTitle || "job-description");

  const downloadPdf = useCallback(async () => {
    setBusy("pdf");
    setError(null);
    try {
      const [{ pdf }, { JDPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/jd/pdfDocument"),
      ]);
      const blob = await pdf(<JDPdfDocument jd={jd} />).toBlob();
      saveBlob(blob, `${fileName}.pdf`);
    } catch (e) {
      console.error(e);
      setError("Could not build the PDF. Please try again.");
    } finally {
      setBusy(null);
    }
  }, [jd, fileName]);

  const downloadDocx = useCallback(async () => {
    setBusy("docx");
    setError(null);
    try {
      const { buildDocxBlob } = await import("@/lib/jd/docxBuilder");
      const blob = await buildDocxBlob(jd);
      saveBlob(blob, `${fileName}.docx`);
    } catch (e) {
      console.error(e);
      setError("Could not build the Word file. Please try again.");
    } finally {
      setBusy(null);
    }
  }, [jd, fileName]);

  const resetToTemplate = () => {
    if (!window.confirm("Reset every field back to the NimbusPost template?")) return;
    setJd(DEFAULT_JD);
  };

  return (
    <AppShell>
      <div className="page-shell mx-auto flex max-w-[1600px] flex-col px-4 py-6 sm:px-6">
        <div className="no-print mb-6 flex shrink-0 flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-navy">Create JD</h1>
            <p className="mt-1 text-sm text-slate-500">
              Fill the form — the preview on the right is exactly what downloads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={resetToTemplate}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Print
            </button>
            <button
              onClick={downloadDocx}
              disabled={busy !== null}
              className="rounded-xl border border-brand/25 bg-brand/5 px-3.5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 disabled:opacity-60"
            >
              {busy === "docx" ? "Building…" : "Download Word"}
            </button>
            <button
              onClick={downloadPdf}
              disabled={busy !== null}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-60"
            >
              {busy === "pdf" ? "Building…" : "Download PDF"}
            </button>
          </div>
        </div>

        {error && (
          <p className="no-print mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Two panes, each with its own scrollbar. `overscroll-contain` stops
            a pane that has hit its end from handing the scroll to the other. */}
        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
          <div className="no-print slim-scroll pane min-w-0 overscroll-contain lg:overflow-y-auto lg:pr-2">
            <JDForm jd={jd} onChange={setJd} />
          </div>

          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="no-print mb-3 flex shrink-0 items-center justify-between text-xs text-slate-500">
              <span>
                Live preview · A4 · {pageCount} page{pageCount === 1 ? "" : "s"}
              </span>
              <span>Auto-saved on this device</span>
            </div>
            <div
              ref={previewWrap}
              className="slim-scroll pane min-h-0 flex-1 overscroll-contain lg:overflow-y-auto"
            >
              <JDPreview jd={jd} scale={scale} onPageCount={setPageCount} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
