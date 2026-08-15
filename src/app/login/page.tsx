"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { ApiError, api, saveAuthResponse } from "@/lib/api/client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.login({ email, password });
      saveAuthResponse(response);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError(err.message || "Email confirmation is required before you can sign in.");
      } else {
        setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-5 text-[var(--fg)]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white">
            <BriefcaseBusiness />
          </div>
          <h1 className="text-3xl font-bold">Welcome to JobFinder</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Search jobs faster with one dashboard.</p>
        </div>

        <form onSubmit={submit} className="card p-6">
          <label className="text-sm">
            Email
            <input className="input mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>

          <label className="mt-4 block text-sm">
            Password
            <div className="relative mt-2">
              <input className="input pr-10" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-[var(--muted)]" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>}

          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <LoaderCircle size={17} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account? <Link href="/signup" className="font-semibold text-indigo-500">Create one</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
