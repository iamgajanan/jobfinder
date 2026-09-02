"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { ApiError, api } from "@/lib/api/client";
import { clearStoredSession } from "@/lib/auth/storage";

function readRecoveryToken() {
  if (typeof window === "undefined") return "";
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  return hash.get("access_token") || query.get("access_token") || "";
}

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const recoveryToken = readRecoveryToken();
    setToken(recoveryToken);
    if (recoveryToken) window.history.replaceState(null, "", "/reset-password");
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!token) { setError("This password reset link is missing or has expired. Please request a new one."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.passwordUpdate({ password }, token);
      clearStoredSession();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update your password. Please request a new reset link.");
    } finally { setLoading(false); }
  }

  if (success) return <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10"><div className="w-full max-w-md text-center"><div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2/></div><h1 className="text-3xl font-bold text-slate-950">Password updated</h1><p className="mt-3 text-slate-600">Your password has been changed successfully. Sign in with your new password.</p><Link href="/login" className="mt-7 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Go to sign in</Link></div></main>;

  return <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10 text-slate-950"><div className="w-full max-w-md"><div className="mb-8"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-black text-white"><LockKeyhole/></div><h1 className="text-3xl font-bold tracking-tight">Create a new password</h1><p className="mt-2 text-slate-600">Choose a new password for your JobFinder account.</p></div><form onSubmit={submit} className="rounded-2xl border border-slate-200 p-6 shadow-sm"><label className="block text-sm font-semibold text-slate-800">New password<div className="relative mt-2"><input className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-slate-950 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" type={show?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" required/><button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-600" aria-label={show?"Hide password":"Show password"}>{show?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label><label className="mt-5 block text-sm font-semibold text-slate-800">Confirm password<input className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" required/></label>{error&&<p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}<button disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{loading&&<LoaderCircle size={18} className="animate-spin"/>}{loading?"Updating password...":"Update password"}</button><p className="mt-5 text-center text-sm text-slate-600"><Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Back to sign in</Link></p></form></div></main>;
}
