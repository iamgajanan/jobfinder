"use client";

import { CheckCircle2, CreditCard, LoaderCircle, XCircle } from "lucide-react";

export default function PricingPaymentGate({status, planName, message, onClose}:{status:"paying"|"success"|"error";planName:string;message?:string;onClose?:()=>void}) {
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Payment status">
    <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-2xl">
      {status === "paying" ? <><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-indigo-500/10 text-indigo-500"><CreditCard/></div><h2 className="mt-4 text-xl font-bold">Complete your payment</h2><p className="mt-2 text-sm text-[var(--muted)]">Finish the Razorpay payment for {planName} before continuing. Your current plan remains unchanged until payment is verified.</p><LoaderCircle className="mx-auto mt-5 animate-spin text-indigo-500"/></> : status === "success" ? <><CheckCircle2 className="mx-auto text-emerald-500" size={42}/><h2 className="mt-4 text-xl font-bold">Payment successful</h2><p className="mt-2 text-sm text-[var(--muted)]">{message}</p><button onClick={onClose} className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Continue</button></> : <><XCircle className="mx-auto text-red-500" size={42}/><h2 className="mt-4 text-xl font-bold">Payment could not be verified</h2><p className="mt-2 text-sm text-[var(--muted)]">{message || "No access was granted. Please try the payment again."}</p><button onClick={onClose} className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Back to pricing</button></>}
    </div>
  </div>;
}
