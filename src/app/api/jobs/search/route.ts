import { NextResponse } from "next/server";

type ApiJob = Record<string, unknown>;

const companies = ["TechNova Systems", "BluePeak Digital", "OrbitSoft", "Crestline Labs", "Vertex Solutions", "CloudAxis", "Nexa Technologies", "BrightStack"];
const locations = ["Pune", "Bangalore", "Mumbai", "Hyderabad", "Remote"];
const skills = ["React", "TypeScript", "Next.js", "JavaScript", "Redux", "REST API"];

function dummyJobs(body: Record<string, unknown>, page: number, pageSize: number) {
  const keyword = String(body.job_title ?? body.keyword ?? "React Developer").trim() || "Frontend Developer";
  const location = String(body.location ?? "Pune").trim() || "Pune";
  const platform = String(body.platform ?? "naukri").trim() || "naukri";
  const workMode = String(body.work_mode ?? body.workMode ?? "any");
  const total = 57;
  const jobs = Array.from({ length: total }, (_, i) => ({
    id: `dummy-${i + 1}`,
    platform,
    job_id: `dummy-${100000 + i}`,
    title: `${keyword} ${i % 3 === 0 ? "Senior" : ""}`.trim(),
    company: companies[i % companies.length],
    location,
    salary: `₹${12 + (i % 8)}-${18 + (i % 10)} LPA`,
    experience: String(body.experience || (i % 3 === 0 ? "5-8 years" : "2-5 years")),
    work_mode: workMode !== "any" ? workMode : i % 4 === 0 ? "Remote" : i % 3 === 0 ? "Hybrid" : "Work from office",
    easy_apply: Boolean(body.easy_apply ?? false),
    posted: `${(i % 7) + 1} day${i % 7 === 0 ? "" : "s"} ago`,
    job_url: platform === "linkedin" ? "https://www.linkedin.com/jobs/" : "https://www.naukri.com/",
    apply_url: "",
    description: "Demo job result generated locally for UI testing. This result does not call the live job API.",
    company_logo: "",
    skills: [skills[i % skills.length], skills[(i + 1) % skills.length], skills[(i + 2) % skills.length]],
    status: "NEW",
    source: "dummy",
  }));
  const start = (page - 1) * pageSize;
  return { jobs: jobs.slice(start, start + pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize), source: "dummy" };
}

function normalizeJob(job: ApiJob, index: number) {
  return {
    id: String(job.id ?? job.job_id ?? `job-${index}`),
    platform: String(job.platform ?? job.source ?? "naukri"),
    job_id: String(job.job_id ?? job.id ?? ""),
    title: String(job.title ?? job.job_title ?? "Untitled job"),
    company: String(job.company ?? job.company_name ?? "Company not disclosed"),
    location: String(job.location ?? "Location not disclosed"),
    salary: String(job.salary ?? "Not disclosed"),
    experience: String(job.experience ?? "Not disclosed"),
    work_mode: String(job.work_mode ?? job.workMode ?? "Unknown"),
    easy_apply: Boolean(job.easy_apply ?? false),
    posted: String(job.posted ?? job.posted_within ?? job.posted_date ?? "Recently posted"),
    job_url: String(job.job_url ?? job.url ?? ""),
    apply_url: String(job.apply_url ?? ""),
    description: String(job.description ?? ""),
    company_logo: String(job.company_logo ?? ""),
    status: String(job.status ?? "NEW"),
    skills: Array.isArray(job.skills) ? job.skills.map(String) : [],
    source: String(job.platform ?? job.source ?? "naukri"),
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const page = Math.max(1, Number(body.page) || 1);
  const pageSize = Math.min(20, Math.max(1, Number(body.pageSize) || 9));
  const url = new URL(request.url);

  if (url.searchParams.get("mode") === "dummy") {
    return NextResponse.json(dummyJobs(body, page, pageSize));
  }

  // The browser always calls this Next.js route on the same origin. Next.js
  // proxies server-to-server to the backend, so the browser does not need
  // CORS access to port 8004.
  const upstream = process.env.JOBS_API_URL || "http://127.0.0.1:8004/api/v1/jobs/search";

  try {
    const response = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        platform: body.platform ?? "naukri",
        job_title: body.job_title ?? body.keyword ?? "react",
        location: body.location ?? "pune",
        experience: body.experience ?? "5 years",
        work_mode: body.work_mode ?? body.workMode ?? "any",
        posted_within: body.posted_within ?? body.postedWithin ?? "day",
        easy_apply: Boolean(body.easy_apply ?? false),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(300000),
    });

    if (!response.ok) throw new Error(`Upstream API returned ${response.status}`);
    const payload = (await response.json()) as { jobs?: ApiJob[] } | ApiJob[];
    const rawJobs = Array.isArray(payload) ? payload : Array.isArray(payload.jobs) ? payload.jobs : [];
    const allJobs = rawJobs.map(normalizeJob);
    const start = (page - 1) * pageSize;

    return NextResponse.json({
      jobs: allJobs.slice(start, start + pageSize),
      total: allJobs.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(allJobs.length / pageSize)),
      source: "live-api",
    });
  } catch (error) {
    console.error("Live jobs API failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { jobs: [], total: 0, page, pageSize, totalPages: 1, source: "live-api", error: "The live job API did not complete successfully." },
      { status: 502 },
    );
  }
}
