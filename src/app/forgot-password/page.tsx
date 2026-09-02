"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, LoaderCircle, MailCheck } from "lucide-react";
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
    <main className="min-h-screen w-full bg-white text-slate-950 lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-800 lg:block">
        <img src="https://i.ibb.co/dJxBbFks/brandasset.png" alt="JobFinder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="absolute bottom-10 left-10 right-10 z-10 text-white">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide"><BriefcaseBusiness className="h-5 w-5" /> JobFinder</div>
          <h2 className="max-w-xl text-4xl font-bold leading-tight">Find your next opportunity faster.</h2>
          <p className="mt-3 max-w-lg text-white/80">Search jobs across platforms from one simple dashboard.</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2 lg:hidden"><div className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white"><BriefcaseBusiness className="h-5 w-5" /></div><span className="text-lg font-bold text-gray-900">JobFinder</span></div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Forgot your password?</h1>
            <p className="mt-2 text-gray-600">Enter your email and we&apos;ll send you a secure link to choose a new password.</p>
          </div>

          {sent ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><MailCheck className="h-6 w-6" /></div>
              <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">Password reset instructions have been sent to <strong>{email}</strong>.</p>
              <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">Return to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-gray-800">Email Address</label>
                <input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" required />
              </div>
              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle className="h-5 w-5 animate-spin" />}{loading ? "Sending..." : "Send Reset Link"}</button>
              <p className="text-center text-sm text-gray-600"><button type="button" onClick={() => router.replace("/login")} className="font-semibold text-blue-600 hover:text-blue-700">Back to sign in</button></p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
