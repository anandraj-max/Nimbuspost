"use client";

import React, { useLayoutEffect, useRef } from "react";
import type { JDData, SnapshotItem } from "@/lib/jd/types";
import { uid } from "@/lib/jd/types";
import { LIMITS } from "@/lib/jd/fit";

/* ------------------------------------------------------------ primitives -- */

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

/**
 * A single-line input with a hard character cap. The counter only appears
 * once you are close to the limit, so it stays out of the way normally.
 */
function CountedInput({
  value,
  onChange,
  maxLength,
  className = "",
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "maxLength">) {
  const used = value.length;
  const show = used >= maxLength * 0.75;
  const full = used >= maxLength;

  return (
    <div className="relative">
      <input
        {...rest}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`${input} ${show ? "pr-16" : ""} ${className}`}
      />
      {show && (
        <span
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] tabular-nums ${
            full ? "font-medium text-amber-600" : "text-slate-400"
          }`}
        >
          {used}/{maxLength}
        </span>
      )}
    </div>
  );
}

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

/**
 * A textarea that grows to fit its content — on first render as well as on
 * typing, so a long pre-filled bullet is fully readable straight away.
 */
function AutoTextarea({
  value,
  onChange,
  minRows = 1,
  className = "",
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  minRows?: number;
  className?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "rows">) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, minRows]);

  return (
    <textarea
      {...rest}
      ref={ref}
      value={value}
      rows={minRows}
      onChange={(e) => onChange(e.target.value)}
      className={`${input} resize-none overflow-hidden leading-relaxed ${className}`}
    />
  );
}

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
          <AutoTextarea
            value={item}
            onChange={(v) => set(i, v)}
            placeholder={placeholder}
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
          <CountedInput
            value={jd.jobTitle}
            onChange={(jobTitle) => patch({ jobTitle })}
            maxLength={LIMITS.jobTitle}
            placeholder="Sales Development Representative (SDR)"
          />
        </Field>
        <Field label="Tagline" hint="one line under the title">
          <CountedInput
            value={jd.tagline}
            onChange={(tagline) => patch({ tagline })}
            maxLength={LIMITS.tagline}
            placeholder="Pre-Sales   ·   The frontline hunter building NimbusPost's sales pipeline."
          />
        </Field>
        <Field label="Eyebrow label">
          <CountedInput
            value={jd.eyebrow}
            onChange={(eyebrow) => patch({ eyebrow })}
            maxLength={LIMITS.eyebrow}
            placeholder="CAREERS"
          />
        </Field>
      </Card>

      <Card title="Role Snapshot" subtitle="The blue info cards">
        <div className="space-y-3">
          {jd.snapshot.map((item, i) => (
            <div key={item.id} className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <CountedInput
                  value={item.label}
                  onChange={(label) => setSnapshot(i, { label: label.toUpperCase() })}
                  maxLength={LIMITS.snapshotLabel}
                  placeholder="LOCATION"
                  className="font-medium uppercase tracking-wide text-brand"
                />
                <CountedInput
                  value={item.value}
                  onChange={(value) => setSnapshot(i, { value })}
                  maxLength={LIMITS.snapshotValue}
                  placeholder="Gurugram, Haryana"
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
          <CountedInput
            value={jd.aboutHeading}
            onChange={(aboutHeading) => patch({ aboutHeading })}
            maxLength={LIMITS.sectionHeading}
          />
        </Field>
        <Field label="About text">
          <AutoTextarea
            value={jd.about}
            onChange={(about) => patch({ about })}
            minRows={5}
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
          <CountedInput
            value={jd.overviewHeading}
            onChange={(overviewHeading) => patch({ overviewHeading })}
            maxLength={LIMITS.sectionHeading}
          />
        </Field>
        <Field label="Paragraphs">
          <div className="space-y-2">
            {jd.overview.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <AutoTextarea
                  value={p}
                  onChange={(v) =>
                    patch({
                      overview: jd.overview.map((x, idx) => (idx === i ? v : x)),
                    })
                  }
                  minRows={3}
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
          <CountedInput
            value={jd.responsibilitiesHeading}
            onChange={(responsibilitiesHeading) => patch({ responsibilitiesHeading })}
            maxLength={LIMITS.sectionHeading}
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
          <CountedInput
            value={jd.lookingForHeading}
            onChange={(lookingForHeading) => patch({ lookingForHeading })}
            maxLength={LIMITS.sectionHeading}
          />
        </Field>

        <div className="space-y-5">
          {jd.lookingFor.map((group, gi) => (
            <div key={group.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <CountedInput
                  value={group.heading}
                  onChange={(heading) =>
                    patch({
                      lookingFor: jd.lookingFor.map((g, idx) =>
                        idx === gi ? { ...g, heading } : g,
                      ),
                    })
                  }
                  maxLength={LIMITS.subHeading}
                  placeholder="Must-Haves"
                  className="font-semibold text-brand"
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
          <CountedInput
            value={jd.whyJoinHeading}
            onChange={(whyJoinHeading) => patch({ whyJoinHeading })}
            maxLength={LIMITS.sectionHeading}
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
          <CountedInput
            value={jd.howToApplyHeading}
            onChange={(howToApplyHeading) => patch({ howToApplyHeading })}
            maxLength={LIMITS.sectionHeading}
          />
        </Field>
        <Field label="Instructions">
          <AutoTextarea
            value={jd.howToApply}
            onChange={(howToApply) => patch({ howToApply })}
            minRows={3}
          />
        </Field>
        <Field label="Equal opportunity statement">
          <AutoTextarea
            value={jd.eeo}
            onChange={(eeo) => patch({ eeo })}
            minRows={4}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Footer left">
            <CountedInput
              value={jd.footerLeft}
              onChange={(footerLeft) => patch({ footerLeft })}
              maxLength={48}
            />
          </Field>
          <Field label="Footer centre">
            <CountedInput
              value={jd.footerCenter}
              onChange={(footerCenter) => patch({ footerCenter })}
              maxLength={48}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
