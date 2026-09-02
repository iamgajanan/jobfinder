"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, LoaderCircle, MailCheck } from "lucide-react";
import { ApiError, api } from "@/lib/api/client";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.passwordReset({
        email: email.trim(),
        redirect_to: `${window.location.origin}/reset-password`,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-5 py-10 text-[var(--fg)]">
      <div className="w-full max-w-md">
        <button type="button" onClick={() => router.push("/login")} className="mb-8 flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--fg)]">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-black text-white"><BriefcaseBusiness /></div>
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Enter your email and we&apos;ll send you instructions to create a new password.</p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-green-50 text-green-600"><MailCheck /></div>
              <h2 className="text-lg font-semibold">Check your email</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">If an account exists for <strong>{email}</strong>, password reset instructions have been sent.</p>
              <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">Return to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="reset-email" className="text-sm font-medium">
                Email Address
                <input id="reset-email" className="input mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
              </label>
              {error && <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>}
              <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {loading ? "Sending..." : "Send reset instructions"}
              </button>
              <p className="mt-5 text-center text-sm text-[var(--muted)]"><Link href="/login" className="font-semibold text-blue-600">Back to sign in</Link></p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
