"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

export default function Signup(){
 const router=useRouter(); const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
 function submit(e:FormEvent){e.preventDefault(); if(!name||!email||password.length<6){setError("Enter your name, a valid email and a password of at least 6 characters.");return;} localStorage.setItem("jobfinder_user",JSON.stringify({name,email,plan:"Free",searches:50})); router.replace("/");}
 return <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-5 text-[var(--fg)]"><div className="w-full max-w-md"><div className="mb-8 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white"><BriefcaseBusiness/></div><h1 className="text-3xl font-bold">Create your account</h1><p className="mt-2 text-sm text-[var(--muted)]">Start with 50 free searches every month.</p></div><form onSubmit={submit} className="card p-6"><label className="text-sm">Full name<input className="input mt-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Gajanan Shinde"/></label><label className="mt-4 block text-sm">Email<input className="input mt-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="mt-4 block text-sm">Password<input className="input mt-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters"/></label>{error&&<p className="mt-3 text-sm text-red-500">{error}</p>}<button className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">Create account</button><p className="mt-5 text-center text-sm text-[var(--muted)]">Already have an account? <Link href="/login" className="font-semibold text-indigo-500">Sign in</Link></p></form></div></main>
}
