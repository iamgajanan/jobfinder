"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3, BriefcaseBusiness, Check, ChevronLeft, ChevronRight, CircleUserRound,
  CreditCard, ExternalLink, LayoutDashboard, LoaderCircle, LogOut, MapPin, Menu,
  Moon, Search, Settings, Sparkles, Sun, UserRound, X, Zap,
} from "lucide-react";

type Job = {
  id: string; platform: string; job_id: string; title: string; company: string;
  location: string; salary: string; experience: string; work_mode: string;
  easy_apply: boolean; posted: string; job_url: string; apply_url: string;
  description: string; company_logo: string; status: string; skills: string[]; source: string;
};

type SearchForm = {
  platform: string; job_title: string; location: string; experience: string;
  work_mode: string; posted_within: string; easy_apply: boolean;
};

const plans = [
  { name: "Free", price: 0, searches: 50, description: "Try JobFinder with no commitment" },
  { name: "Starter", price: 299, searches: 100, description: "For focused job searching" },
  { name: "Growth", price: 699, searches: 500, description: "For active job seekers" },
  { name: "Pro", price: 999, searches: 1000, description: "For serious daily searching" },
  { name: "Business", price: 1499, searches: 2000, description: "Maximum monthly search allowance" },
];

const dummyChart = [18, 31, 22, 44, 37, 52, 41, 60, 49, 67, 54, 72];

function formatWorkMode(value: string) {
  if (!value || value.toLowerCase() === "any") return "Any";
  return value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState("home");
  const [logged, setLogged] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState<SearchForm>({
    platform: "naukri", job_title: "React", location: "Pune", experience: "5 years",
    work_mode: "any", posted_within: "day", easy_apply: false,
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultSource, setResultSource] = useState<"live-api" | "dummy" | "">("");
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Connecting to the live job service...");

  useEffect(() => {
    if (localStorage.getItem("jobfinder_user")) setLogged(true);
    else router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (!loading) return;
    const messages = [
      "Connecting to the live job service...",
      "Searching fresh listings — this can take a few minutes...",
      "The scraper is still working. Please keep this tab open...",
      "Collecting and normalizing job details...",
      "Almost there — waiting for the complete response...",
    ];
    let index = 0;
    setLoadingMessage(messages[0]);
    const timer = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 3500);
    return () => clearInterval(timer);
  }, [loading]);

  async function searchJobs(nextPage = 1) {
    setLoading(true);
    setError("");
    setJobs([]);
    setTotal(0);
    setTotalPages(1);
    setResultSource("");
    setSearched(false);
    setPage(nextPage);

    try {
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, page: nextPage, pageSize: 9 }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Live API search failed (${response.status})`);
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setTotal(Number(data.total) || 0);
      setTotalPages(Math.max(1, Number(data.totalPages) || 1));
      setResultSource("live-api");
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to search the live job API.");
      setJobs([]);
      setTotal(0);
      setTotalPages(1);
      setResultSource("live-api");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  async function dummySearch(nextPage = 1) {
    setLoading(true);
    setError("");
    setJobs([]);
    setTotal(0);
    setTotalPages(1);
    setResultSource("");
    setSearched(false);
    setPage(nextPage);

    try {
      const response = await fetch("/api/jobs/search?mode=dummy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, page: nextPage, pageSize: 9 }),
      });
      if (!response.ok) throw new Error(`Dummy search failed (${response.status})`);
      const data = await response.json();
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setTotal(Number(data.total) || 0);
      setTotalPages(Math.max(1, Number(data.totalPages) || 1));
      setResultSource("dummy");
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dummy jobs.");
      setJobs([]);
      setTotal(0);
      setTotalPages(1);
      setResultSource("dummy");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof SearchForm>(key: K, value: SearchForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function signOut() {
    localStorage.removeItem("jobfinder_user");
    router.replace("/login");
  }

  if (!logged) return null;

  const nav = [
    { id: "home", label: "Home", icon: Search },
    { id: "pricing", label: "Pricing", icon: CreditCard },
    { id: "dashboard", label: "Analytics", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: CircleUserRound },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--border)] bg-[var(--card)] p-5 transition-transform ${mobileNav ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><BriefcaseBusiness size={21} /></div>
          <div><div className="font-bold">JobFinder</div><div className="text-xs text-[var(--muted)]">Job search SaaS</div></div>
          <button className="ml-auto md:hidden" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setView(item.id); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${view === item.id ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-black/5 dark:hover:bg-white/5"}`}><Icon size={18} />{item.label}</button>; })}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 space-y-2">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm transition hover:bg-black/5 dark:hover:bg-white/5">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}{theme === "dark" ? "Light mode" : "Dark mode"}</button>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-500/10"><LogOut size={18} />Sign out</button>
        </div>
      </aside>

      <main className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 backdrop-blur md:px-8">
          <button className="md:hidden" onClick={() => setMobileNav(true)}><Menu /></button>
          <div className="hidden md:block"><div className="text-sm text-[var(--muted)]">Welcome back</div><div className="font-semibold">Find your next opportunity</div></div>
          <button onClick={() => setView("profile")} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)]"><UserRound size={17} /></button>
        </header>
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {view === "home" && <SearchView form={form} update={update} jobs={jobs} total={total} totalPages={totalPages} page={page} loading={loading} searched={searched} resultSource={resultSource} error={error} loadingMessage={loadingMessage} searchJobs={searchJobs} dummySearch={dummySearch} />}
          {view === "pricing" && <Pricing />}
          {view === "dashboard" && <Analytics />}
          {view === "profile" && <Profile />}
          {view === "settings" && <SettingsView theme={theme} setTheme={setTheme} />}
        </div>
      </main>
    </div>
  );
}

function SearchView({ form, update, jobs, total, totalPages, page, loading, searched, resultSource, error, loadingMessage, searchJobs, dummySearch }: {
  form: SearchForm; update: <K extends keyof SearchForm>(key: K, value: SearchForm[K]) => void;
  jobs: Job[]; total: number; totalPages: number; page: number; loading: boolean; searched: boolean;
  resultSource: "live-api" | "dummy" | ""; error: string; loadingMessage: string;
  searchJobs: (page?: number) => void; dummySearch: (page?: number) => void;
}) {
  const searchSummary = useMemo(() => `${form.job_title || "All jobs"} · ${form.location || "Any location"}`, [form.job_title, form.location]);
  return <section>
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500"><Sparkles size={14} /> Live job search</div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Find your next opportunity</h1><p className="mt-2 text-[var(--muted)]">Search the live job API when you need real results, or use Dummy Search for instant UI testing.</p></div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm"><div className="text-[var(--muted)]">Search allowance</div><div className="mt-1 font-semibold">50 searches <span className="font-normal text-[var(--muted)]">/ month</span></div></div>
    </div>

    <div className="card overflow-hidden p-4 shadow-sm md:p-6">
      <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Search jobs</h2><p className="text-xs text-[var(--muted)]">Every search field is sent dynamically to the selected platform API.</p></div><div className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> API ready</div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Platform"><select className="input" value={form.platform} onChange={(e) => update("platform", e.target.value)}><option value="naukri">Naukri</option><option value="linkedin">LinkedIn</option></select></Field>
        <Field label="Job title / keyword"><input className="input" value={form.job_title} onChange={(e) => update("job_title", e.target.value)} placeholder="React Developer" /></Field>
        <Field label="Location"><div className="relative"><MapPin className="absolute left-3 top-3 text-[var(--muted)]" size={17} /><input className="input pl-9" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Pune" /></div></Field>
        <Field label="Experience"><select className="input" value={form.experience} onChange={(e) => update("experience", e.target.value)}><option>Any experience</option><option>0-2 years</option><option>2-5 years</option><option>5 years</option><option>5-8 years</option><option>8+ years</option></select></Field>
        <Field label="Work mode"><select className="input" value={form.work_mode} onChange={(e) => update("work_mode", e.target.value)}><option value="any">Any</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="work from office">Work from office</option></select></Field>
        <Field label="Posted within"><select className="input" value={form.posted_within} onChange={(e) => update("posted_within", e.target.value)}><option value="day">Last 24 hours</option><option value="3 days">Last 3 days</option><option value="week">Last 7 days</option><option value="15 days">Last 15 days</option><option value="month">Last 30 days</option></select></Field>
        <Field label="Easy Apply"><label className="flex h-[42px] cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm"><span>{form.easy_apply ? "Only Easy Apply" : "Include all jobs"}</span><button type="button" onClick={() => update("easy_apply", !form.easy_apply)} className={`relative h-6 w-11 rounded-full transition ${form.easy_apply ? "bg-indigo-600" : "bg-black/10 dark:bg-white/10"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${form.easy_apply ? "left-6" : "left-1"}`} /></button></label></Field>
        <div className="flex items-end gap-2">
          <button onClick={() => searchJobs(1)} disabled={loading} className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"><Search size={17} />{loading ? "Searching..." : "Search API"}</button>
          <button onClick={() => dummySearch(1)} disabled={loading} className="flex h-[42px] items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold transition hover:bg-black/5 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"><Zap size={17} />Dummy</button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]"><span>Live request:</span><code className="rounded-lg bg-[var(--bg)] px-2 py-1">POST /api/v1/jobs/search</code><span>·</span><span>{searchSummary}</span><span>·</span><span>Live API waits up to 5 minutes</span></div>
    </div>

    {loading && <LoadingResults message={loadingMessage} />}

    {!loading && searched && <div className="mt-7">
      {error ? <div className="card border-red-500/30 p-6"><div className="flex items-center gap-2 font-semibold text-red-500"><X size={18} /> Live search failed</div><p className="mt-1 text-sm text-[var(--muted)]">{error}</p><p className="mt-3 text-xs text-[var(--muted)]">No dummy data was substituted. Use <strong>Dummy</strong> when you want instant demo results.</p></div> : <>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><h2 className="text-lg font-semibold">{total} jobs found</h2>{resultSource === "dummy" ? <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">Demo data</span> : <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">Live API</span>}</div><p className="mt-1 text-sm text-[var(--muted)]">{searchSummary} · Page {page} of {totalPages}</p></div><span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold capitalize text-indigo-500">{form.platform}</span></div>
        {jobs.length === 0 ? <div className="card flex min-h-64 flex-col items-center justify-center p-8 text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500"><Search /></div><h3 className="mt-4 font-semibold">No jobs found</h3><p className="mt-1 text-sm text-[var(--muted)]">Try a broader keyword, location, or experience range.</p></div> : <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
          {totalPages > 1 && <div className="mt-7 flex items-center justify-center gap-2"><button disabled={page === 1 || loading} onClick={() => resultSource === "dummy" ? dummySearch(page - 1) : searchJobs(page - 1)} className="rounded-xl border border-[var(--border)] p-2 disabled:opacity-30"><ChevronLeft size={18} /></button>{Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map((n) => <button key={n} onClick={() => resultSource === "dummy" ? dummySearch(n) : searchJobs(n)} className={`h-9 min-w-9 rounded-xl px-2 text-sm ${n === page ? "bg-indigo-600 text-white" : "border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5"}`}>{n}</button>)}<button disabled={page === totalPages || loading} onClick={() => resultSource === "dummy" ? dummySearch(page + 1) : searchJobs(page + 1)} className="rounded-xl border border-[var(--border)] p-2 disabled:opacity-30"><ChevronRight size={18} /></button></div>}
        </>}
      </>}
    </div>}

    {!searched && !loading && <div className="card mt-7 flex min-h-80 flex-col items-center justify-center p-8 text-center"><div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500"><Zap size={28} /></div><h2 className="text-xl font-semibold">Ready when you are</h2><p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">Search API waits for the complete live response, even if your LinkedIn or Naukri scraper takes several minutes. Dummy gives you instant local demo data without calling the live API.</p></div>}
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm"><span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">{label}</span>{children}</label>; }

function LoadingResults({ message }: { message: string }) { return <div className="mt-7"><div className="mb-4 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500"><LoaderCircle className="animate-spin" size={18} /></div><div><div className="font-semibold">Waiting for complete live results</div><div className="text-xs text-[var(--muted)]">{message}</div></div><span className="ml-auto hidden rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 sm:inline-flex">Up to 5 min</span></div><div className="card mb-4 overflow-hidden p-4"><div className="flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/5"><div className="h-full w-1/3 animate-pulse rounded-full bg-indigo-500" /></div><span className="text-xs text-[var(--muted)]">Live scraper running</span></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} delay={i} />)}</div></div>; }

function SkeletonCard({ delay }: { delay: number }) { return <div className="card overflow-hidden p-5" style={{ animationDelay: `${delay * 100}ms` }}><div className="flex items-start justify-between gap-3"><div className="flex flex-1 gap-3"><div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-black/10 dark:bg-white/10" /><div className="flex-1"><div className="h-4 w-4/5 animate-pulse rounded bg-black/10 dark:bg-white/10" /><div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-black/10 dark:bg-white/10" /></div></div><div className="h-6 w-14 animate-pulse rounded-full bg-black/10 dark:bg-white/10" /></div><div className="mt-6 space-y-3"><div className="h-3 w-4/5 animate-pulse rounded bg-black/10 dark:bg-white/10" /><div className="h-3 w-3/5 animate-pulse rounded bg-black/10 dark:bg-white/10" /><div className="h-3 w-2/3 animate-pulse rounded bg-black/10 dark:bg-white/10" /></div><div className="mt-5 flex gap-2"><div className="h-6 w-16 animate-pulse rounded-full bg-black/10 dark:bg-white/10" /><div className="h-6 w-20 animate-pulse rounded-full bg-black/10 dark:bg-white/10" /><div className="h-6 w-14 animate-pulse rounded-full bg-black/10 dark:bg-white/10" /></div><div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-black/10 dark:bg-white/10" /></div>; }

function JobCard({ job }: { job: Job }) { const isLinkedIn = job.platform.toLowerCase() === "linkedin"; return <article className="card group flex flex-col p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-indigo-500/10 text-sm font-bold text-indigo-500">{job.company_logo && !job.company_logo.startsWith("data:image/gif") ? <img src={job.company_logo} alt="" className="h-full w-full object-cover" /> : job.company.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><h3 className="line-clamp-2 font-semibold leading-5">{job.title}</h3><p className="mt-1 truncate text-sm text-[var(--muted)]">{job.company}</p></div></div><span className="shrink-0 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-indigo-500">{job.platform}</span></div><div className="mt-5 space-y-2 text-sm text-[var(--muted)]"><div className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" />{job.location}</div><div className="flex gap-2"><BriefcaseBusiness size={16} className="mt-0.5 shrink-0" />{job.experience} · {formatWorkMode(job.work_mode)}</div><div className="flex gap-2"><CreditCard size={16} className="mt-0.5 shrink-0" />{job.salary}</div><div className="flex gap-2"><Zap size={16} className="mt-0.5 shrink-0" />{job.posted}{job.easy_apply ? " · Easy Apply" : ""}</div></div>{job.description && <p className="mt-4 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{job.description}</p>}<div className="mt-4 flex min-h-6 flex-wrap gap-1.5">{job.skills.map((skill) => <span key={skill} className="rounded-full border border-[var(--border)] px-2 py-1 text-[11px]">{skill}</span>)}</div><a href={job.job_url || job.apply_url || (isLinkedIn ? "https://www.linkedin.com/jobs/" : "https://www.naukri.com/")} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--card)] transition hover:opacity-90">View on {isLinkedIn ? "LinkedIn" : "Naukri"} <ExternalLink size={15} /></a></article>; }

function Pricing() { return <section><div className="mb-8"><h1 className="text-3xl font-bold">Pricing</h1><p className="mt-1 text-[var(--muted)]">Simple monthly plans based on search usage.</p></div><div className="grid gap-5 lg:grid-cols-5">{plans.map((plan, i) => <div key={plan.name} className={`card relative flex flex-col p-5 ${i === 2 ? "ring-2 ring-indigo-500" : ""}`}>{i === 2 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Popular</span>}<h2 className="font-semibold">{plan.name}</h2><p className="mt-2 min-h-10 text-sm text-[var(--muted)]">{plan.description}</p><div className="mt-5"><span className="text-3xl font-bold">₹{plan.price}</span><span className="text-sm text-[var(--muted)]"> / month</span></div><div className="mt-4 flex items-center gap-2 text-sm"><Check size={16} className="text-emerald-500" />{plan.searches.toLocaleString()} searches</div><button className="mt-6 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold">{plan.price === 0 ? "Current free plan" : "Choose plan"}</button></div>)}</div></section>; }

function Analytics() { return <section><div className="mb-8"><h1 className="text-3xl font-bold">Analytics</h1><p className="mt-1 text-[var(--muted)]">Track search usage across day, week, month and year.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Today", "24"], ["This week", "146"], ["This month", "482"], ["This year", "4,218"]].map(([label, value]) => <div className="card p-5" key={label}><div className="text-sm text-[var(--muted)]">{label}</div><div className="mt-2 text-3xl font-bold">{value}</div><div className="mt-1 text-xs text-[var(--muted)]">searches</div></div>)}</div><div className="card mt-6 p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Search activity</h2><p className="text-sm text-[var(--muted)]">Last 12 periods</p></div><BarChart3 className="text-indigo-500" /></div><div className="mt-8 flex h-64 items-end gap-2">{dummyChart.map((value, i) => <div key={i} className="group flex h-full flex-1 flex-col justify-end"><div className="mx-auto w-full max-w-10 rounded-t-md bg-indigo-500 transition group-hover:bg-indigo-400" style={{ height: `${value}%` }} /><div className="mt-2 text-center text-[10px] text-[var(--muted)]">{i + 1}</div></div>)}</div></div></section>; }

function Profile() { return <section className="max-w-3xl"><div className="mb-8"><h1 className="text-3xl font-bold">Profile</h1><p className="mt-1 text-[var(--muted)]">Manage your JobFinder account.</p></div><div className="card p-6"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-600 text-xl font-bold text-white">GS</div><div><h2 className="text-lg font-semibold">Gajanan Shinde</h2><p className="text-sm text-[var(--muted)]">Free account · 50 searches/month</p></div></div><div className="mt-8 grid gap-4 md:grid-cols-2"><label className="text-sm">Full name<input className="input mt-2" defaultValue="Gajanan Shinde" /></label><label className="text-sm">Email<input className="input mt-2" defaultValue="gajanan@example.com" /></label></div><button className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">Save changes</button></div></section>; }

function SettingsView({ theme, setTheme }: { theme?: string; setTheme: (theme: string) => void }) { return <section className="max-w-3xl"><div className="mb-8"><h1 className="text-3xl font-bold">Settings</h1><p className="mt-1 text-[var(--muted)]">Customize your JobFinder experience.</p></div><div className="card divide-y divide-[var(--border)]"><div className="p-5"><h2 className="font-semibold">Appearance</h2><p className="mt-1 text-sm text-[var(--muted)]">Choose how JobFinder looks on your device.</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{["light", "dark", "system"].map((mode) => <button key={mode} onClick={() => setTheme(mode)} className={`rounded-xl border px-4 py-3 text-sm capitalize ${theme === mode ? "border-indigo-500 bg-indigo-500/10 text-indigo-500" : "border-[var(--border)]"}`}>{mode}</button>)}</div></div><div className="p-5"><h2 className="font-semibold">Notifications</h2><p className="mt-1 text-sm text-[var(--muted)]">Job alerts and saved-search notifications will be available when the backend is connected.</p></div></div></section>; }