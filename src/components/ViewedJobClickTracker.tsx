"use client";

import { useEffect } from "react";
import { markViewed } from "@/lib/api/viewed";
import type { Job } from "@/lib/api/types";

function inferPlatform(url:string):"linkedin"|"naukri"|null{const value=url.toLowerCase();if(value.includes("linkedin.com/jobs"))return "linkedin";if(value.includes("naukri.com"))return "naukri";return null}
function inferJobId(url:string){try{const parsed=new URL(url);const numbers=parsed.pathname.match(/\d{5,}/g);return numbers?.at(-1) || parsed.pathname.replace(/^\/+|\/+$/g,"") || parsed.href}catch{return url}}
function textFrom(card:Element, selector:string){return card.querySelector(selector)?.textContent?.trim() || ""}

export default function ViewedJobClickTracker(){
  useEffect(()=>{
    const onClick=(event:MouseEvent)=>{
      const target=event.target as HTMLElement|null;
      const link=target?.closest("a[href]") as HTMLAnchorElement|null;
      if(!link || link.target!=="_blank") return;
      const platform=inferPlatform(link.href); if(!platform) return;
      const card=link.closest("article"); if(!card) return;
      const title=textFrom(card,"h3") || textFrom(card,"h2") || "Job listing";
      const company=textFrom(card,"h3 + p") || textFrom(card,"h2 + p") || "Unknown company";
      const location=textFrom(card,".mt-4 .flex") || "Location not disclosed";
      const job:Job={id:null,platform,job_id:inferJobId(link.href),title,company,location,salary:null,experience:null,work_mode:null,easy_apply:false,job_url:link.href,apply_url:link.href,description:null,company_logo:null,status:"active"};
      void markViewed(job).catch(()=>{});
    };
    document.addEventListener("click",onClick,true);
    return()=>document.removeEventListener("click",onClick,true);
  },[]);
  return null;
}
