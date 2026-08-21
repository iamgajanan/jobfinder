"use client";

import { useEffect, useState } from "react";
import { BellRing, LoaderCircle } from "lucide-react";
import { ApiError, api } from "@/lib/api/client";
import type { AlertRun, SavedSearch, SavedSearchAlertJob } from "@/lib/api/types";

const COOLDOWN_MS = 10 * 60 * 1000;
function formatDate(value: string | null) { return value ? new Date(value).toLocaleString() : "—"; }

export default function TestAlertPanel() {
  const [items,setItems]=useState<SavedSearch[]>([]);
  const [selectedId,setSelectedId]=useState("");
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [historyError,setHistoryError]=useState("");
  const [cooldownUntil,setCooldownUntil]=useState(0);
  const [nextRunAt,setNextRunAt]=useState<string|null>(null);
  const [lastRunAt,setLastRunAt]=useState<string|null>(null);
  const [runs,setRuns]=useState<AlertRun[]>([]);
  const [jobs,setJobs]=useState<SavedSearchAlertJob[]>([]);

  async function loadHistory(id:string){
    if(!id)return null;
    setHistoryLoading(true); setHistoryError("");
    try{
      // One request now returns status, recent runs and recent jobs together.
      const overview=await api.alertOverview(id,10);
      setNextRunAt(overview.next_run_at);
      setLastRunAt(overview.last_run_at);
      setRuns(overview.recent_runs);
      setJobs(overview.jobs);
      return overview;
    }catch(err){
      setHistoryError(err instanceof ApiError?err.message:"Unable to load alert history.");
      return null;
    }finally{setHistoryLoading(false)}
  }

  useEffect(()=>{
    let cancelled=false;
    api.savedSearches().then(response=>{
      if(cancelled)return;
      const alerts=response.saved_searches.filter(item=>item.alert_enabled);
      setItems(alerts);
      if(alerts[0])setSelectedId(alerts[0].id);
    }).catch(err=>{if(!cancelled)setError(err instanceof ApiError?err.message:"Unable to load saved searches.")}).finally(()=>{if(!cancelled)setLoading(false)});
    return()=>{cancelled=true};
  },[]);

  useEffect(()=>{if(selectedId)void loadHistory(selectedId)},[selectedId]);

  async function testAlert(){
    if(!selectedId||sending)return;
    if(cooldownUntil>Date.now()){
      setError(`Please wait ${Math.ceil((cooldownUntil-Date.now())/60000)} minute(s) before testing this alert again.`);
      return;
    }
    setSending(true); setError(""); setMessage("");
    try{
      // Backend completes the search and email send before resolving.
      const response=await api.testSavedSearchAlert(selectedId);
      setCooldownUntil(Date.now()+COOLDOWN_MS);
      setMessage(response.message);
      // Exactly one follow-up request after completion.
      await loadHistory(selectedId);
    }catch(err){
      setError(err instanceof ApiError?err.message:"Unable to run the test alert.");
    }finally{setSending(false)}
  }

  return <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div><div className="flex items-center gap-2 font-semibold"><BellRing size={17}/> Job alert test & history</div><p className="mt-1 text-xs text-[var(--muted)]">Run one alert immediately. Your Daily/Weekly schedule is not changed.</p></div>
      <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
        <select className="input min-w-56" value={selectedId} onChange={e=>{setSelectedId(e.target.value);setError("");setMessage("")}} disabled={loading||sending||items.length===0}>{items.length===0?<option value="">No alerts enabled</option>:items.map(item=><option key={item.id} value={item.id}>{item.name} · {item.alert_frequency}</option>)}</select>
        <button onClick={testAlert} disabled={loading||sending||!selectedId||items.length===0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{sending&&<LoaderCircle size={15} className="animate-spin"/>}{sending?"Running alert & sending email...":"Test alert now"}</button>
      </div>
    </div>
    {message&&<p className="mt-3 text-sm text-emerald-600">{message}</p>}
    {error&&<p className="mt-3 text-sm text-red-500">{error}</p>}
    <div className="mt-5 border-t border-[var(--border)] pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">Alert status</h3><p className="text-xs text-[var(--muted)]">Next run: {formatDate(nextRunAt)} · Last run: {formatDate(lastRunAt)}</p></div>{historyLoading&&<LoaderCircle size={16} className="animate-spin text-indigo-500"/>}</div>
      {historyError&&<p className="mt-3 text-sm text-red-500">{historyError}</p>}
      {!historyLoading&&!historyError&&<>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="text-[var(--muted)]"><tr><th className="px-3 py-2 font-medium">Saved search</th><th className="px-3 py-2 font-medium">Scheduled</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">New jobs</th><th className="px-3 py-2 font-medium">Email</th><th className="px-3 py-2 font-medium">Completed</th><th className="px-3 py-2 font-medium">Error</th></tr></thead><tbody>{runs.length===0?<tr><td colSpan={7} className="px-3 py-4 text-center text-[var(--muted)]">No alert runs yet.</td></tr>:runs.slice(0,10).map(run=><tr key={run.id} className="border-t border-[var(--border)]"><td className="px-3 py-2 font-medium">{run.saved_search_name||"—"}</td><td className="px-3 py-2">{formatDate(run.scheduled_for)}</td><td className="px-3 py-2 font-medium capitalize">{run.status}</td><td className="px-3 py-2 font-semibold">{run.status==="queued"||run.status==="running"?"—":run.new_jobs_count}</td><td className="px-3 py-2 font-medium capitalize">{run.email_status.replace("_"," ")}</td><td className="px-3 py-2">{formatDate(run.completed_at)}</td><td className="max-w-xs truncate px-3 py-2 text-red-500">{run.error_message||run.email_error||"—"}</td></tr>)}</tbody></table></div>
        <div className="mt-4"><h4 className="text-sm font-semibold">Recently seen alert jobs</h4>{jobs.length===0?<p className="mt-2 text-xs text-[var(--muted)]">No jobs recorded for this alert yet.</p>:<div className="mt-2 grid gap-2 md:grid-cols-2">{jobs.slice(0,6).map(item=><a key={item.id} href={item.job_data.apply_url||item.job_data.job_url} target="_blank" rel="noreferrer" className="rounded-xl border border-[var(--border)] p-3 hover:border-indigo-500/40"><p className="text-sm font-medium">{item.job_data.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.job_data.company} · {item.job_data.location}</p><p className="mt-1 text-[11px] text-[var(--muted)]">First seen {formatDate(item.first_seen_at)}</p></a>)}</div>}</div>
      </>}
    </div>
  </div>;
}
