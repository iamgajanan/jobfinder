"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { BarChart3, BriefcaseBusiness, Check, ChevronLeft, ChevronRight, CircleUserRound, CreditCard, LayoutDashboard, LogOut, Moon, Search, Settings, Sun, UserRound } from "lucide-react";

type Job = { id:string; title:string; company:string; location:string; experience:string; salary:string; workMode:string; posted:string; skills:string[]; url:string; source:string };
const plans = [
  {name:"Free", price:0, searches:50, description:"Try JobFinder with no commitment"},
  {name:"Starter", price:299, searches:100, description:"For focused job searching"},
  {name:"Growth", price:699, searches:500, description:"For active job seekers"},
  {name:"Pro", price:999, searches:1000, description:"For serious daily searching"},
  {name:"Business", price:1499, searches:2000, description:"Maximum monthly search allowance"}
];
const chart = [18,31,22,44,37,52,41,60,49,67,54,72];

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [view,setView] = useState("home");
  const [logged,setLogged] = useState(false);
  const [keyword,setKeyword] = useState("React Developer");
  const [location,setLocation] = useState("Pune");
  const [experience,setExperience] = useState("Any experience");
  const [workMode,setWorkMode] = useState("Any");
  const [jobs,setJobs] = useState<Job[]>([]);
  const [page,setPage] = useState(1);
  const [totalPages,setTotalPages] = useState(1);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(false);
  const [searched,setSearched] = useState(false);
  const [mobileNav,setMobileNav] = useState(false);

  useEffect(()=>{ if(localStorage.getItem("jobfinder_user")){ setLogged(true); } else router.replace("/login"); },[router]);

  async function searchJobs(nextPage=1) {
    setLoading(true); setPage(nextPage);
    try {
      const res = await fetch("/api/jobs/search", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({keyword,location,experience,workMode,page:nextPage,pageSize:9})});
      const data = await res.json(); setJobs(data.jobs); setTotal(data.total); setTotalPages(data.totalPages); setSearched(true);
    } finally { setLoading(false); }
  }
  function signOut(){ localStorage.removeItem("jobfinder_user"); router.replace("/login"); }
  if(!logged) return null;

  const nav = [
    {id:"home",label:"Home",icon:Search}, {id:"pricing",label:"Pricing",icon:CreditCard}, {id:"dashboard",label:"Analytics",icon:LayoutDashboard}, {id:"profile",label:"Profile",icon:CircleUserRound}, {id:"settings",label:"Settings",icon:Settings}
  ];
  return <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-[var(--border)] bg-[var(--card)] p-5 transition-transform ${mobileNav?"translate-x-0":"-translate-x-full md:translate-x-0"}`}>
      <div className="mb-8 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><BriefcaseBusiness size={21}/></div><div><div className="font-bold">JobFinder</div><div className="text-xs text-[var(--muted)]">Job search SaaS</div></div></div>
      <nav className="space-y-1">{nav.map(n=>{const I=n.icon; return <button key={n.id} onClick={()=>{setView(n.id);setMobileNav(false)}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${view===n.id?"bg-indigo-600 text-white":"hover:bg-black/5 dark:hover:bg-white/5"}`}><I size={18}/>{n.label}</button>})}</nav>
      <div className="absolute bottom-5 left-5 right-5 space-y-2"><button onClick={()=>setTheme(theme==="dark"?"light":"dark")} className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm">{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>} {theme==="dark"?"Light mode":"Dark mode"}</button><button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10"><LogOut size={18}/>Sign out</button></div>
    </aside>
    <main className="md:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 backdrop-blur md:px-8"><button className="md:hidden" onClick={()=>setMobileNav(true)}><Search/></button><div><div className="text-sm text-[var(--muted)]">Welcome back</div><div className="font-semibold">Find your next opportunity</div></div><button onClick={()=>setView("profile")} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)]"><UserRound size={17}/></button></header>
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {view==="home" && <SearchView {...{keyword,setKeyword,location,setLocation,experience,setExperience,workMode,setWorkMode,jobs,total,totalPages,page,loading,searched,searchJobs}}/>}
        {view==="pricing" && <Pricing/>}
        {view==="dashboard" && <Analytics/>}
        {view==="profile" && <Profile/>}
        {view==="settings" && <SettingsView theme={theme} setTheme={setTheme}/>} 
      </div>
    </main>
  </div>
}

function SearchView(p:any){ return <section><div className="mb-7"><h1 className="text-3xl font-bold tracking-tight">Search jobs</h1><p className="mt-1 text-[var(--muted)]">Search Naukri jobs now. LinkedIn and more sources can be added later.</p></div><div className="card p-4 md:p-5"><div className="grid gap-3 md:grid-cols-5"><input className="input md:col-span-2" value={p.keyword} onChange={e=>p.setKeyword(e.target.value)} placeholder="Job title or keyword"/><input className="input" value={p.location} onChange={e=>p.setLocation(e.target.value)} placeholder="Location"/><select className="input" value={p.experience} onChange={e=>p.setExperience(e.target.value)}><option>Any experience</option><option>0-2 years</option><option>2-5 years</option><option>5-8 years</option><option>8+ years</option></select><select className="input" value={p.workMode} onChange={e=>p.setWorkMode(e.target.value)}><option>Any</option><option>Remote</option><option>Hybrid</option><option>Work from office</option></select></div><div className="mt-4 flex justify-end"><button onClick={()=>p.searchJobs(1)} disabled={p.loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Search size={17}/>{p.loading?"Searching...":"Search jobs"}</button></div></div>{p.searched && <div className="mt-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">{p.total} jobs found</h2><p className="text-sm text-[var(--muted)]">Page {p.page} of {p.totalPages}</p></div><span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">Naukri</span></div>{p.loading?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="card h-56 animate-pulse"/>)}</div>:<><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{p.jobs.map((j:Job)=><article key={j.id} className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="font-semibold leading-6">{j.title}</h3><p className="text-sm text-[var(--muted)]">{j.company}</p></div><span className="rounded-md bg-[var(--bg)] px-2 py-1 text-xs">Naukri</span></div><div className="space-y-2 text-sm text-[var(--muted)]"><div>📍 {j.location}</div><div>💼 {j.experience} · {j.workMode}</div><div>💰 {j.salary}</div><div>🕐 {j.posted}</div></div><div className="mt-4 flex flex-wrap gap-1.5">{j.skills.map(s=><span key={s} className="rounded-full border border-[var(--border)] px-2 py-1 text-xs">{s}</span>)}</div><a href={j.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--card)]">View on Naukri ↗</a></article>)}</div><div className="mt-6 flex items-center justify-center gap-2"><button disabled={p.page===1} onClick={()=>p.searchJobs(p.page-1)} className="rounded-lg border border-[var(--border)] p-2 disabled:opacity-30"><ChevronLeft size={18}/></button>{Array.from({length:p.totalPages},(_,i)=>i+1).slice(Math.max(0,p.page-3),Math.min(p.totalPages,p.page+2)).map(n=><button key={n} onClick={()=>p.searchJobs(n)} className={`h-9 min-w-9 rounded-lg px-2 text-sm ${n===p.page?"bg-indigo-600 text-white":"border border-[var(--border)]"}`}>{n}</button>)}<button disabled={p.page===p.totalPages} onClick={()=>p.searchJobs(p.page+1)} className="rounded-lg border border-[var(--border)] p-2 disabled:opacity-30"><ChevronRight size={18}/></button></div></>}</div>}{!p.searched && <div className="card mt-6 flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500"><Search/></div><h2 className="text-xl font-semibold">Start your job search</h2><p className="mt-2 max-w-md text-sm text-[var(--muted)]">Enter a keyword and location, then search. The MVP currently uses a local dummy API so the real Naukri/n8n API can be plugged in later.</p></div>}</section> }

function Pricing(){return <section><div className="mb-8"><h1 className="text-3xl font-bold">Pricing</h1><p className="mt-1 text-[var(--muted)]">Simple monthly plans based on search usage.</p></div><div className="grid gap-5 lg:grid-cols-5">{plans.map((p,i)=><div key={p.name} className={`card relative flex flex-col p-5 ${i===2?"ring-2 ring-indigo-500":""}`}>{i===2&&<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Popular</span>}<h2 className="font-semibold">{p.name}</h2><p className="mt-2 min-h-10 text-sm text-[var(--muted)]">{p.description}</p><div className="mt-5"><span className="text-3xl font-bold">₹{p.price}</span><span className="text-sm text-[var(--muted)]"> / month</span></div><div className="mt-4 flex items-center gap-2 text-sm"><Check size={16} className="text-emerald-500"/>{p.searches.toLocaleString()} searches</div><button className="mt-6 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5">{p.price===0?"Current free plan":"Choose plan"}</button></div>)}</div></section>}

function Analytics(){return <section><div className="mb-8"><h1 className="text-3xl font-bold">Analytics</h1><p className="mt-1 text-[var(--muted)]">Track search usage across day, week, month and year.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Today","24","searches"],["This week","146","searches"],["This month","482","searches"],["This year","4,218","searches"]].map(([a,b,c])=><div className="card p-5" key={a}><div className="text-sm text-[var(--muted)]">{a}</div><div className="mt-2 text-3xl font-bold">{b}</div><div className="mt-1 text-xs text-[var(--muted)]">{c}</div></div>)}</div><div className="card mt-6 p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Search activity</h2><p className="text-sm text-[var(--muted)]">Last 12 periods</p></div><BarChart3 className="text-indigo-500"/></div><div className="mt-8 flex h-64 items-end gap-2">{chart.map((v,i)=><div key={i} className="group flex h-full flex-1 flex-col justify-end"><div className="mx-auto w-full max-w-10 rounded-t-md bg-indigo-500 transition group-hover:bg-indigo-400" style={{height:`${v}%`}}/><div className="mt-2 text-center text-[10px] text-[var(--muted)]">{i+1}</div></div>)}</div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="card p-5"><div className="text-sm text-[var(--muted)]">Jobs found</div><div className="mt-2 text-2xl font-bold">12,840</div></div><div className="card p-5"><div className="text-sm text-[var(--muted)]">Searches remaining</div><div className="mt-2 text-2xl font-bold">518</div></div><div className="card p-5"><div className="text-sm text-[var(--muted)]">Current plan</div><div className="mt-2 text-2xl font-bold">Growth</div></div></div></section>}

function Profile(){return <section className="max-w-3xl"><div className="mb-8"><h1 className="text-3xl font-bold">Profile</h1><p className="mt-1 text-[var(--muted)]">Manage your JobFinder account.</p></div><div className="card p-6"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-600 text-xl font-bold text-white">GS</div><div><h2 className="text-lg font-semibold">Gajanan Shinde</h2><p className="text-sm text-[var(--muted)]">Free account · 50 searches/month</p></div></div><div className="mt-8 grid gap-4 md:grid-cols-2"><label className="text-sm">Full name<input className="input mt-2" defaultValue="Gajanan Shinde"/></label><label className="text-sm">Email<input className="input mt-2" defaultValue="gajanan@example.com"/></label></div><button className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">Save changes</button></div></section>}

function SettingsView({theme,setTheme}:{theme?:string;setTheme:(t:string)=>void}){return <section className="max-w-3xl"><div className="mb-8"><h1 className="text-3xl font-bold">Settings</h1><p className="mt-1 text-[var(--muted)]">Customize your JobFinder experience.</p></div><div className="card divide-y divide-[var(--border)]"><div className="p-6"><h2 className="font-semibold">Appearance</h2><p className="mt-1 text-sm text-[var(--muted)]">Choose light, dark, or follow your system.</p><div className="mt-4 flex flex-wrap gap-2">{["light","dark","system"].map(t=><button key={t} onClick={()=>setTheme(t)} className={`rounded-xl border px-4 py-2 text-sm capitalize ${theme===t?"border-indigo-500 bg-indigo-500/10 text-indigo-500":"border-[var(--border)]"}`}>{t}</button>)}</div></div><div className="p-6"><h2 className="font-semibold">Notifications</h2><p className="mt-1 text-sm text-[var(--muted)]">Job alerts and search reminders will be configurable here.</p><div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--border)] p-4"><span className="text-sm">Email job alerts</span><span className="rounded-full bg-black/5 px-3 py-1 text-xs dark:bg-white/10">Coming soon</span></div></div></div></section>}
