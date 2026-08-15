"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness, LoaderCircle } from "lucide-react";
import { ApiError, api, saveAuthResponse } from "@/lib/api/client";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || password.length < 8) {
      setError("Enter your name, a valid email and a password of at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.signup({ email, password, full_name: name });
      saveAuthResponse(response);

      if (response.email_confirmation_required || !response.session) {
        router.replace(`/login?registered=1&email=${encodeURIComponent(email)}`);
      } else {
        router.replace("/");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Unable to create your account. Please try again.");
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
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Start with the free plan provided by the backend.</p>
        </div>

        <form onSubmit={submit} className="card p-6">
          <label className="text-sm">
            Full name
            <input className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
          </label>

          <label className="mt-4 block text-sm">
            Email
            <input className="input mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>

          <label className="mt-4 block text-sm">
            Password
            <input className="input mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" />
          </label>

          {error && <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>}

          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <LoaderCircle size={17} className="animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Already have an account? <Link href="/login" className="font-semibold text-indigo-500">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
