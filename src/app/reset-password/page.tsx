"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { ApiError, api } from "@/lib/api/client";
import { clearStoredSession } from "@/lib/auth/storage";

function readRecoveryToken() {
  if (typeof window === "undefined") return "";
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  return hash.get("access_token") || query.get("access_token") || "";
}

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearStoredSession();
    const recoveryToken = readRecoveryToken();
    setToken(recoveryToken);
    if (recoveryToken) window.history.replaceState(null, "", "/reset-password");
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("This password reset link is missing or has expired. Please request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.passwordUpdate({ password }, token);
      clearStoredSession();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update your password. Please request a new reset link.");
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create a new password</h1>
            <p className="mt-2 text-gray-600">Choose a new password for your JobFinder account.</p>
          </div>

          {success ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></div>
              <h2 className="text-lg font-semibold text-gray-900">Password updated</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">Your password has been changed successfully. Sign in with your new password.</p>
              <Link href="/login" className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">Go to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-gray-800">New Password</label>
                <div className="relative">
                  <input id="new-password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-950 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" required />
                  <button type="button" onClick={() => setShow((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-600 hover:bg-gray-100" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-gray-800">Confirm Password</label>
                <input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" required />
              </div>
              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle className="h-5 w-5 animate-spin" />}{loading ? "Updating password..." : "Update Password"}</button>
              <p className="text-center text-sm text-gray-600"><Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Back to sign in</Link></p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
