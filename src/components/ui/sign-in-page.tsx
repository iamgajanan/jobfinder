"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, BriefcaseBusiness } from "lucide-react";
import { ApiError, api, saveAuthResponse } from "@/lib/api/client";

export function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login({ email: formData.email.trim(), password: formData.password });
      saveAuthResponse(response);
      router.replace("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Please confirm your email before signing in.");
      } else {
        setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-800 lg:block">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Back to home"
          className="absolute left-6 top-6 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/35"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img
          src="https://i.ibb.co/dJxBbFks/brandasset.png"
          alt="JobFinder"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/20" />
        <div className="absolute bottom-10 left-10 right-10 z-10 text-white">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide">
            <BriefcaseBusiness className="h-5 w-5" /> JobFinder
          </div>
          <h2 className="max-w-xl text-4xl font-bold leading-tight">Find your next opportunity faster.</h2>
          <p className="mt-3 max-w-lg text-white/75">Search jobs across platforms from one simple dashboard.</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white"><BriefcaseBusiness className="h-5 w-5" /></div>
              <span className="text-lg font-bold text-gray-900">JobFinder</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-gray-600">
              Don&apos;t have an account? <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">Sign up</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-100">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot password?</Link>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{error}</p>}

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-500">Secure sign in</span></div>
            </div>
            <p className="text-center text-xs leading-5 text-gray-500">Your login is authenticated by the JobFinder backend. We do not expose your password to the browser after submission.</p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
