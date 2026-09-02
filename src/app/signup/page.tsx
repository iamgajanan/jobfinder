"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { ApiError, api, saveAuthResponse } from "@/lib/api/client";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Enter your name, a valid email and a password of at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.signup({ email: email.trim(), password, full_name: name.trim() });
      saveAuthResponse(response);
      if (response.email_confirmation_required || !response.session) router.replace(`/confirm-email?email=${encodeURIComponent(email.trim())}`);
      else { router.replace("/"); router.refresh(); }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setError(err.message);
      else setError(err instanceof Error ? err.message : "Unable to create your account. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen w-full bg-white text-slate-950 lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:block">
        <img src="https://i.ibb.co/dJxBbFks/brandasset.png" alt="JobFinder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-blue-950/35 to-slate-950/10" />
        <div className="absolute bottom-10 left-10 right-10 z-10 text-white"><div className="mb-4 flex items-center gap-2 text-sm font-semibold"><BriefcaseBusiness className="h-5 w-5" /> JobFinder</div><h2 className="max-w-xl text-4xl font-bold leading-tight xl:text-5xl">Start finding better opportunities today.</h2><p className="mt-3 max-w-lg text-white/80">Create your account and search real job listings from one simple dashboard.</p></div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8"><div className="mb-5 flex items-center gap-2 lg:hidden"><div className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white"><BriefcaseBusiness className="h-5 w-5" /></div><span className="text-lg font-bold">JobFinder</span></div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create your account</h1><p className="mt-2 text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link></p></div>
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm font-semibold text-slate-800">Full name<input className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" required /></label>
            <label className="block text-sm font-semibold text-slate-800">Email address<input className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
            <label className="block text-sm font-semibold text-slate-800">Password<div className="relative mt-2"><input className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-slate-950 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" required /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-600 hover:bg-slate-100" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><span className="mt-1 block text-xs font-normal text-slate-500">Use at least 8 characters.</span></label>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}{loading ? "Creating account..." : "Create account"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
