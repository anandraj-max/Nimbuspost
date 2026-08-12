"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { COMPANY } from "@/lib/brand";
import { useAuth } from "@/lib/auth";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function LoginPage() {
  const { session, ready, signIn } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) router.replace("/dashboard");
  }, [ready, session, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = signIn({ name, email, employeeId });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    router.replace("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-brand p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute rounded-full bg-white/10"
          style={{ width: 420, height: 420, right: -140, top: -160 }}
        />
        <div
          className="pointer-events-none absolute rounded-full bg-white/[0.07]"
          style={{ width: 240, height: 240, right: 60, top: 220 }}
        />
        <div
          className="pointer-events-none absolute rounded-full bg-white/[0.09]"
          style={{ width: 160, height: 160, right: -40, bottom: 80 }}
        />

        <div className="relative">
          <BrandLogo height={40} tone="light" />
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white">Internal Tools</h1>
          <p className="mt-4 text-base leading-relaxed text-white/85">
            Build on-brand job descriptions in a couple of minutes and download them
            as a print-ready PDF or an editable Word file — in the exact NimbusPost
            careers format.
          </p>
        </div>

        <p className="relative text-sm text-white/70">
          {COMPANY.website} · For internal use only
        </p>
      </div>

      {/* Sign-in panel */}
      <div className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <BrandLogo height={36} tone="dark" />
          </div>

          <h2 className="mt-8 text-2xl font-bold text-navy lg:mt-0">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use your company email and employee ID. No password needed.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name <span className="font-normal text-slate-400">(optional)</span>
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anand Raj"
                autoComplete="name"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Work email
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`you@${COMPANY.emailDomain}`}
                type="email"
                autoComplete="email"
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Employee ID
              </span>
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="NP-1024"
                required
                className={inputClass}
              />
            </label>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
            >
              Continue
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            Access is limited to @{COMPANY.emailDomain} addresses. Your session stays
            on this device.
          </p>
        </div>
      </div>
    </div>
  );
}
