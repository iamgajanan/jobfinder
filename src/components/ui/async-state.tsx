"use client";

import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

type AsyncStateProps = {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: React.ReactNode;
};

export function AsyncState({ loading = false, error = "", empty = false, loadingLabel = "Loading...", emptyTitle = "Nothing here yet", emptyDescription = "There is no data to display.", onRetry, children }: AsyncStateProps) {
  if (loading) return <div className="card p-12 text-center" role="status"><LoaderCircle className="mx-auto animate-spin text-indigo-500" /><p className="mt-3 text-sm text-[var(--muted)]">{loadingLabel}</p></div>;
  if (error) return <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-500" role="alert"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 shrink-0" size={18} /><div className="flex-1"><p>{error}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold">Try again</button>}</div></div></div>;
  if (empty) return <div className="card p-12 text-center"><Inbox className="mx-auto text-[var(--muted)]" size={28} /><h2 className="mt-4 font-semibold">{emptyTitle}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">{emptyDescription}</p></div>;
  return <>{children}</>;
}
