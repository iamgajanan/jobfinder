"use client";

import { useEffect, useState } from "react";
import { ExternalLink, LoaderCircle, MapPin, Eye, ArrowLeft } from "lucide-react";
import { listViewed, type ViewedJob } from "@/lib/api/viewed";
import type { Job } from "@/lib/api/types";

export default function ViewedJobs() {
  const [items, setItems] = useState<ViewedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { listViewed().then((response) => setItems(response.viewed_jobs)).catch((err) => setError(err instanceof Error ? err.message : "Unable to load viewed jobs.")).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="card p-12 text-center"><LoaderCircle className="mx-auto animate-spin text-indigo-500" /><p className="mt-3 text-sm text-[var(--muted)]">Loading viewed jobs...</p></div>;
  if (error) return <section><a href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-500"><ArrowLeft size={16}/> Back to search</a><div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</div></section>;
  return <section>
    <a href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-500"><ArrowLeft size={16}/> Back to search</a>
    <div className="mb-7"><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500"><Eye size={14}/> Activity</div><h1 className="text-3xl font-bold md:text-4xl">Viewed jobs</h1><p className="mt-2 text-[var(--muted)]">Jobs you opened from JobFinder. This does not mean you applied.</p></div>
    {items.length === 0 ? <div className="card p-12 text-center"><Eye className="mx-auto text-[var(--muted)]"/><h2 className="mt-4 font-semibold">No viewed jobs yet</h2><p className="mt-2 text-sm text-[var(--muted)]">Open a job from your search results and it will appear here.</p></div> : <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{items.map((viewed) => { const job:Job=viewed.job_data; return <article key={viewed.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{job.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{job.company}</p></div><span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-[11px] font-semibold uppercase text-indigo-500">{job.platform}</span></div><div className="mt-4 space-y-2 text-sm text-[var(--muted)]"><div className="flex gap-2"><MapPin size={16}/>{job.location || "Location not disclosed"}</div><div>Viewed {new Date(viewed.viewed_at).toLocaleString()}</div></div><div className="mt-5 flex justify-end">{job.job_url&&<a href={job.job_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Open job <ExternalLink size={14}/></a>}</div></article>})}</div>}
  </section>;
}
