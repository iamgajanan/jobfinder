"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, CalendarClock, Edit3, LoaderCircle, Play, Plus, Search, Trash2, X } from "lucide-react";
import { ApiError, api } from "@/lib/api/client";
import type { CreateSavedSearchRequest, SavedSearch } from "@/lib/api/types";

type Props = {
  onRun?: (savedSearch: SavedSearch) => Promise<void> | void;
};

const emptyForm: CreateSavedSearchRequest = {
  name: "",
  platform: "naukri",
  job_title: "",
  location: "",
  experience: "Any experience",
  work_mode: "any",
  posted_within: "day",
  easy_apply: false,
  alert_enabled: false,
  alert_frequency: "daily",
};

export default function SavedSearches({ onRun }: Props) {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SavedSearch | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateSavedSearchRequest>(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.savedSearches();
      setItems(response.saved_searches);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load saved searches.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEdit(item: SavedSearch) {
    setEditing(item);
    setForm({
      name: item.name,
      platform: item.platform,
      job_title: item.job_title,
      location: item.location,
      experience: item.experience,
      work_mode: item.work_mode,
      posted_within: item.posted_within,
      easy_apply: item.easy_apply,
      alert_enabled: item.alert_enabled,
      alert_frequency: item.alert_frequency,
    });
    setMessage("");
    setError("");
    setShowForm(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!form.name.trim()) throw new Error("Give this search a name.");
      if (!form.job_title.trim()) throw new Error("Job title / keyword is required.");
      if (!form.location.trim()) throw new Error("Location is required.");

      const payload = {
        ...form,
        name: form.name.trim(),
        job_title: form.job_title.trim(),
        location: form.location.trim(),
      };

      if (editing) {
        const updated = await api.updateSavedSearch(editing.id, payload);
        setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setMessage("Saved search updated.");
      } else {
        const created = await api.createSavedSearch(payload);
        setItems((current) => [created, ...current]);
        setMessage("Search saved.");
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Unable to save search.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: SavedSearch) {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    setDeletingId(item.id);
    setError("");
    try {
      await api.deleteSavedSearch(item.id);
      setItems((current) => current.filter((saved) => saved.id !== item.id));
      setMessage("Saved search deleted.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete saved search.");
    } finally {
      setDeletingId(null);
    }
  }

  async function run(item: SavedSearch) {
    setError("");
    setMessage("");
    try {
      await onRun?.(item);
      setMessage(`Running “${item.name}”.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Unable to run saved search.");
    }
  }

  function update<K extends keyof CreateSavedSearchRequest>(key: K, value: CreateSavedSearchRequest[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <section>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
            <Search size={14} /> Reusable searches
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">Saved searches</h1>
          <p className="mt-2 text-[var(--muted)]">Save your favourite job filters and run them again without rebuilding the form.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={17} /> Save a search
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}
      {message && <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600">{message}</div>}

      {loading ? (
        <div className="card p-12 text-center"><LoaderCircle className="mx-auto animate-spin text-indigo-500" /><p className="mt-3 text-sm text-[var(--muted)]">Loading saved searches...</p></div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500"><Search size={21} /></div>
          <h2 className="mt-4 font-semibold">No saved searches yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">Save a search such as “React jobs Pune” and reuse the exact filters later.</p>
          <button onClick={openCreate} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Create your first saved search</button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.platform} · {item.job_title} · {item.location}</p>
                </div>
                {item.alert_enabled ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600"><Bell size={13} /> Alert {item.alert_frequency}</span> : <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-xs text-[var(--muted)] dark:bg-white/5"><BellOff size={13} /> Alerts off</span>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                <span className="rounded-lg border border-[var(--border)] px-2.5 py-1">{item.experience || "Any experience"}</span>
                <span className="rounded-lg border border-[var(--border)] px-2.5 py-1">{item.work_mode || "Any mode"}</span>
                <span className="rounded-lg border border-[var(--border)] px-2.5 py-1">{item.posted_within || "Any date"}</span>
                {item.easy_apply && <span className="rounded-lg border border-[var(--border)] px-2.5 py-1">Easy Apply</span>}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => run(item)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"><Play size={14} /> Run search</button>
                <button onClick={() => openEdit(item)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold"><Edit3 size={14} /> Edit</button>
                <button onClick={() => remove(item)} disabled={deletingId === item.id} className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-500 disabled:opacity-50">{deletingId === item.id ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit saved search" : "Save search"}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-semibold">{editing ? "Edit saved search" : "Save search"}</h2><p className="mt-1 text-sm text-[var(--muted)]">Keep these filters for quick reuse.</p></div>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5" aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Search name"><input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="React jobs Pune" /></Field>
              <Field label="Platform"><select className="input" value={form.platform} onChange={(e) => update("platform", e.target.value as CreateSavedSearchRequest["platform"])}><option value="naukri">Naukri</option><option value="linkedin">LinkedIn</option></select></Field>
              <Field label="Job title / keyword"><input className="input" value={form.job_title} onChange={(e) => update("job_title", e.target.value)} placeholder="React" /></Field>
              <Field label="Location"><input className="input" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Pune" /></Field>
              <Field label="Experience"><select className="input" value={form.experience || "Any experience"} onChange={(e) => update("experience", e.target.value)}><option>Any experience</option><option>0-2 years</option><option>2-5 years</option><option>5 years</option><option>5-8 years</option><option>8+ years</option></select></Field>
              <Field label="Work mode"><select className="input" value={form.work_mode || "any"} onChange={(e) => update("work_mode", e.target.value as CreateSavedSearchRequest["work_mode"])}><option value="any">Any</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">Onsite</option></select></Field>
              <Field label="Posted within"><select className="input" value={form.posted_within || "day"} onChange={(e) => update("posted_within", e.target.value)}><option value="day">Last 24 hours</option><option value="3 days">Last 3 days</option><option value="week">Last 7 days</option><option value="15 days">Last 15 days</option><option value="month">Last 30 days</option></select></Field>
              <Field label="Easy Apply"><button type="button" onClick={() => update("easy_apply", !form.easy_apply)} className="flex h-[42px] w-full items-center justify-between rounded-xl border border-[var(--border)] px-3 text-sm"><span>{form.easy_apply ? "Only Easy Apply" : "Include all jobs"}</span><span className={`h-6 w-11 rounded-full p-1 ${form.easy_apply ? "bg-indigo-600 text-right" : "bg-black/10 dark:bg-white/10"}`}><span className="inline-block h-4 w-4 rounded-full bg-white shadow" /></span></button></Field>
              <div className="md:col-span-2 rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium">Job alerts</p><p className="mt-1 text-xs text-[var(--muted)]">Keep the alert preference ready for the notification backend.</p></div><button type="button" onClick={() => update("alert_enabled", !form.alert_enabled)} className={`h-6 w-11 rounded-full p-1 ${form.alert_enabled ? "bg-indigo-600 text-right" : "bg-black/10 dark:bg-white/10"}`}><span className="inline-block h-4 w-4 rounded-full bg-white shadow" /></button></div>
                {form.alert_enabled && <div className="mt-4 max-w-xs"><Field label="Frequency"><select className="input" value={form.alert_frequency || "daily"} onChange={(e) => update("alert_frequency", e.target.value as CreateSavedSearchRequest["alert_frequency"])}><option value="daily">Daily</option><option value="weekly">Weekly</option></select></Field></div>}
              </div>
              <div className="flex justify-end gap-2 md:col-span-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving && <LoaderCircle size={16} className="animate-spin" />}{editing ? "Save changes" : "Save search"}</button></div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="mb-2 block">{label}</span>{children}</label>;
}
