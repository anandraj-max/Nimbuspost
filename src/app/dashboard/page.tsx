"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";

/**
 * Tools grid. To ship a new internal tool, add an entry here (and a matching
 * route + nav item in AppShell).
 */
const TOOLS = [
  {
    href: "/create-jd",
    title: "Create JD",
    description:
      "Fill a simple form and download a job description in the official NimbusPost careers format — PDF or Word.",
    status: "live" as const,
    accent: "bg-brand",
  },
  {
    href: "#",
    title: "Offer Letters",
    description: "Generate branded offer letters from a template.",
    status: "soon" as const,
    accent: "bg-slate-300",
  },
  {
    href: "#",
    title: "Policy Documents",
    description: "Central place for HR policies and internal circulars.",
    status: "soon" as const,
    accent: "bg-slate-300",
  },
];

export default function DashboardPage() {
  const { session } = useAuth();
  const firstName = session?.name.split(" ")[0] ?? "there";

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-navy">Hi {firstName} 👋</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Pick a tool to get started. More modules will show up here as they go live.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const live = tool.status === "live";
            const card = (
              <div
                className={[
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-5 transition-all",
                  live
                    ? "border-slate-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-slate-200/70"
                    : "border-dashed border-slate-200 opacity-70",
                ].join(" ")}
              >
                <span className={`absolute inset-x-0 top-0 h-1 ${tool.accent}`} />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold text-navy">{tool.title}</h2>
                  {!live && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                  {tool.description}
                </p>
                {live && (
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                    Open
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M6 3l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>
            );

            return live ? (
              <Link key={tool.title} href={tool.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={tool.title}>{card}</div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
