"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BriefcaseBusiness, MailCheck } from "lucide-react";

function ConfirmEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") || "your email address";

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-5 text-[var(--fg)]">
      <div className="w-full max-w-md text-center">
        <div className="card p-8 shadow-sm">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <MailCheck size={28} />
          </div>
          <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-500">
            <BriefcaseBusiness size={17} /> JobFinder
          </div>
          <h1 className="text-2xl font-bold">Confirm your email address</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            We&apos;ve sent a confirmation email to <strong className="text-[var(--fg)]">{email}</strong>.
            Please open that email and click the confirmation link to finish signing up.
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">
            After confirming your email, come back here and sign in to continue.
          </p>
          <Link
            href={`/login?email=${encodeURIComponent(email)}`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
