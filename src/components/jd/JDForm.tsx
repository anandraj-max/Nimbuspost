"use client";

import React from "react";
import type { JDData, SnapshotItem } from "@/lib/jd/types";
import { uid } from "@/lib/jd/types";

/* ------------------------------------------------------------ primitives -- */

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Card({
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-slate-200 bg-white [&[open]]:shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-sm font-semibold text-navy">{title}</span>
          {subtitle && (
            <span className="mt-0.5 block text-xs text-slate-400">{subtitle}</span>
          )}
        </span>
        <svg
          className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <div className="space-y-4 border-t border-slate-100 px-5 py-5">{children}</div>
    </details>
  );
}

function IconButton({
  onClick,
  label,
  children,
  disabled,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="grid size-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M3 4.5h10M6.5 4.5V3.2c0-.3.2-.5.5-.5h2c.3 0 .5.2.5.5v1.3M4.5 4.5l.5 8c0 .4.3.7.7.7h4.6c.4 0 .7-.3.7-.7l.5-8"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M8 12.5V4m0 0L4.5 7.5M8 4l3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A reorderable list of one-line bullet inputs. */
function BulletEditor({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const set = (i: number, value: string) =>
    onChange(items.map((item, idx) => (idx === i ? value : item)));
  const remove = (i: number) =>
    onChange(items.length > 1 ? items.filter((_, idx) => idx !== i) : [""]);
  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...items];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-3.5 size-1.5 shrink-0 rounded-full bg-accent" />
          <textarea
            value={item}
            onChange={(e) => set(i, e.target.value)}
            placeholder={placeholder}
            rows={1}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
            className={`${input} resize-none leading-relaxed`}
          />
          <div className="flex gap-1">
            <IconButton onClick={() => moveUp(i)} label="Move up" disabled={i === 0}>
              <UpIcon />
            </IconButton>
            <IconButton onClick={() => remove(i)} label="Remove">
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="text-sm font-medium text-brand transition-opacity hover:opacity-70"
      >
        + {addLabel ?? "Add point"}
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- form -- */

export function JDForm({
  jd,
  onChange,
}: {
  jd: JDData;
  onChange: (next: JDData) => void;
}) {
  const patch = (part: Partial<JDData>) => onChange({ ...jd, ...part });

  const setSnapshot = (i: number, part: Partial<SnapshotItem>) =>
    patch({
      snapshot: jd.snapshot.map((item, idx) => (idx === i ? { ...item, ...part } : item)),
    });

  return (
    <div className="space-y-4">
      <Card title="Job header" subtitle="Shown in the blue banner on page 1">
        <Field label="Job title">
          <input
            value={jd.jobTitle}
            onChange={(e) => patch({ jobTitle: e.target.value })}
            placeholder="Sales Development Representative (SDR)"
            className={input}
          />
        </Field>
        <Field label="Tagline" hint="one line under the title">
          <input
            value={jd.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
            placeholder="Pre-Sales   ·   The frontline hunter building NimbusPost's sales pipeline."
            className={input}
          />
        </Field>
        <Field label="Eyebrow label">
          <input
            value={jd.eyebrow}
            onChange={(e) => patch({ eyebrow: e.target.value })}
            placeholder="CAREERS"
            className={input}
          />
        </Field>
      </Card>

      <Card title="Role Snapshot" subtitle="The blue info cards">
        <div className="space-y-3">
          {jd.snapshot.map((item, i) => (
            <div key={item.id} className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <input
                  value={item.label}
                  onChange={(e) => setSnapshot(i, { label: e.target.value.toUpperCase() })}
                  placeholder="LOCATION"
                  className={`${input} font-medium uppercase tracking-wide text-brand`}
                />
                <input
                  value={item.value}
                  onChange={(e) => setSnapshot(i, { value: e.target.value })}
                  placeholder="Gurugram, Haryana"
                  className={input}
                />
              </div>
              <IconButton
                onClick={() =>
                  patch({ snapshot: jd.snapshot.filter((_, idx) => idx !== i) })
                }
                label="Remove"
              >
                <TrashIcon />
              </IconButton>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            patch({ snapshot: [...jd.snapshot, { id: uid(), label: "", value: "" }] })
          }
          className="text-sm font-medium text-brand transition-opacity hover:opacity-70"
        >
          + Add snapshot field
        </button>
        <p className="text-xs text-slate-400">
          Cards fill two per row, in this order. Empty rows are skipped in the document.
        </p>
      </Card>

      <Card title="About the company" defaultOpen={false}>
        <Field label="Section heading">
          <input
            value={jd.aboutHeading}
            onChange={(e) => patch({ aboutHeading: e.target.value })}
            className={input}
          />
        </Field>
        <Field label="About text">
          <textarea
            value={jd.about}
            onChange={(e) => patch({ about: e.target.value })}
            rows={7}
            className={`${input} resize-y leading-relaxed`}
          />
        </Field>
        <Field label="Website line">
          <input
            value={jd.websiteLine}
            onChange={(e) => patch({ websiteLine: e.target.value })}
            className={input}
          />
        </Field>
      </Card>

      <Card title="Role Overview">
        <Field label="Section heading">
          <input
            value={jd.overviewHeading}
            onChange={(e) => patch({ overviewHeading: e.target.value })}
            className={input}
          />
        </Field>
        <Field label="Paragraphs">
          <div className="space-y-2">
            {jd.overview.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <textarea
                  value={p}
                  onChange={(e) =>
                    patch({
                      overview: jd.overview.map((x, idx) => (idx === i ? e.target.value : x)),
                    })
                  }
                  rows={4}
                  className={`${input} resize-y leading-relaxed`}
                />
                <IconButton
                  onClick={() =>
                    patch({
                      overview:
                        jd.overview.length > 1
                          ? jd.overview.filter((_, idx) => idx !== i)
                          : [""],
                    })
                  }
                  label="Remove paragraph"
                >
                  <TrashIcon />
                </IconButton>
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch({ overview: [...jd.overview, ""] })}
              className="text-sm font-medium text-brand transition-opacity hover:opacity-70"
            >
              + Add paragraph
            </button>
          </div>
        </Field>
      </Card>

      <Card title="Key Responsibilities">
        <Field label="Section heading">
          <input
            value={jd.responsibilitiesHeading}
            onChange={(e) => patch({ responsibilitiesHeading: e.target.value })}
            className={input}
          />
        </Field>
        <BulletEditor
          items={jd.responsibilities}
          onChange={(responsibilities) => patch({ responsibilities })}
          placeholder="Research, identify, and prospect potential clients…"
          addLabel="Add responsibility"
        />
      </Card>

      <Card title="What We're Looking For">
        <Field label="Section heading">
          <input
            value={jd.lookingForHeading}
            onChange={(e) => patch({ lookingForHeading: e.target.value })}
            className={input}
          />
        </Field>

        <div className="space-y-5">
          {jd.lookingFor.map((group, gi) => (
            <div key={group.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  value={group.heading}
                  onChange={(e) =>
                    patch({
                      lookingFor: jd.lookingFor.map((g, idx) =>
                        idx === gi ? { ...g, heading: e.target.value } : g,
                      ),
                    })
                  }
                  placeholder="Must-Haves"
                  className={`${input} font-semibold text-brand`}
                />
                <IconButton
                  onClick={() =>
                    patch({ lookingFor: jd.lookingFor.filter((_, idx) => idx !== gi) })
                  }
                  label="Remove group"
                >
                  <TrashIcon />
                </IconButton>
              </div>
              <BulletEditor
                items={group.items}
                onChange={(items) =>
                  patch({
                    lookingFor: jd.lookingFor.map((g, idx) =>
                      idx === gi ? { ...g, items } : g,
                    ),
                  })
                }
                placeholder="1–3 years in presales, SDR, or lead generation roles…"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            patch({
              lookingFor: [...jd.lookingFor, { id: uid(), heading: "", items: [""] }],
            })
          }
          className="text-sm font-medium text-brand transition-opacity hover:opacity-70"
        >
          + Add sub-section
        </button>
      </Card>

      <Card title="Why Join" defaultOpen={false}>
        <Field label="Section heading">
          <input
            value={jd.whyJoinHeading}
            onChange={(e) => patch({ whyJoinHeading: e.target.value })}
            className={input}
          />
        </Field>
        <BulletEditor
          items={jd.whyJoin}
          onChange={(whyJoin) => patch({ whyJoin })}
          placeholder="Be part of the fastest-growing logistics tech company in India."
          addLabel="Add reason"
        />
      </Card>

      <Card title="How to Apply & footer" defaultOpen={false}>
        <Field label="Section heading">
          <input
            value={jd.howToApplyHeading}
            onChange={(e) => patch({ howToApplyHeading: e.target.value })}
            className={input}
          />
        </Field>
        <Field label="Instructions">
          <textarea
            value={jd.howToApply}
            onChange={(e) => patch({ howToApply: e.target.value })}
            rows={4}
            className={`${input} resize-y leading-relaxed`}
          />
        </Field>
        <Field label="Equal opportunity statement">
          <textarea
            value={jd.eeo}
            onChange={(e) => patch({ eeo: e.target.value })}
            rows={5}
            className={`${input} resize-y leading-relaxed`}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Footer left">
            <input
              value={jd.footerLeft}
              onChange={(e) => patch({ footerLeft: e.target.value })}
              className={input}
            />
          </Field>
          <Field label="Footer centre">
            <input
              value={jd.footerCenter}
              onChange={(e) => patch({ footerCenter: e.target.value })}
              className={input}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
