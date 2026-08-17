"use client";

import { useEffect, useState } from "react";
import { BellRing, LoaderCircle } from "lucide-react";
import { ApiError, api } from "@/lib/api/client";
import type { SavedSearch } from "@/lib/api/types";

const COOLDOWN_MS = 10 * 60 * 1000;

export default function TestAlertPanel() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    api.savedSearches()
      .then((response) => {
        if (cancelled) return;
        const alerts = response.saved_searches.filter((item) => item.alert_enabled);
        setItems(alerts);
        if (alerts[0]) setSelectedId(alerts[0].id);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load saved searches.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function testAlert() {
    if (!selectedId || sending) return;
    const remaining = cooldownUntil - Date.now();
    if (remaining > 0) {
      setError(`Please wait ${Math.ceil(remaining / 60000)} minute(s) before testing this alert again.`);
      return;
    }

    setSending(true);
    setError("");
    setMessage("");
    try {
      const response = await api.testSavedSearchAlert(selectedId);
      setMessage(response.message);
      setCooldownUntil(Date.now() + COOLDOWN_MS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to queue the test alert.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 font-semibold"><BellRing size={17} /> Test job alert</div>
          <p className="mt-1 text-xs text-[var(--muted)]">Run one alert immediately. Your Daily/Weekly schedule is not changed.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <select className="input min-w-56" value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setError(""); setMessage(""); }} disabled={loading || sending || items.length === 0}>
            {items.length === 0 ? <option value="">No alerts enabled</option> : items.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.alert_frequency}</option>)}
          </select>
          <button onClick={testAlert} disabled={loading || sending || !selectedId || items.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {sending && <LoaderCircle size={15} className="animate-spin" />}
            {sending ? "Queuing..." : "Test alert now"}
          </button>
        </div>
      </div>
      {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
