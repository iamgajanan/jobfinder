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
  const experience = job.experience as ApiJob | undefined;
  const salary = job.salary as ApiJob | undefined;
  return {
    id: String(job.id ?? job.job_id ?? `job-${index}`),
    platform: String(job.source ?? "naukri"),
    job_id: String(job.id ?? job.job_id ?? ""),
    title: String(job.title ?? "Untitled job"),
    company: String(job.company ?? "Company not disclosed"),
    location: String(job.location ?? "Location not disclosed"),
    salary: String(salary?.text ?? "Not disclosed"),
    experience: String(experience?.text ?? "Not disclosed"),
    work_mode: String(job.work_mode ?? "Unknown"),
    easy_apply: false,
    posted: String(job.posted_at ?? "Recently posted"),
    job_url: String(job.job_url ?? ""),
    apply_url: "",
    description: String(job.description ?? ""),
    company_logo: "",
    status: "NEW",
    skills: Array.isArray(job.skills) ? job.skills.map(String) : [],
    source: String(job.source ?? "naukri"),
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const page = Math.max(1, Number(body.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(body.pageSize) || 9));
  const url = new URL(request.url);

  if (url.searchParams.get("mode") === "dummy") {
    return NextResponse.json(dummyJobs(body, page, pageSize));
  }

  // The browser calls this same-origin route. This route then calls the
  // actual Naukri FastAPI service on port 8004 using its real GET contract:
  // GET /v1/jobs/search?keyword=...&location=...&experience=...&freshness=...&work_mode=...&page=...&limit=...
  const upstreamBase = process.env.JOBS_API_URL || "http://127.0.0.1:8004/v1/jobs/search";
  const upstreamUrl = new URL(upstreamBase);

  const keyword = String(body.job_title ?? body.keyword ?? "").trim();
  if (!keyword) {
    return NextResponse.json({ error: "job_title is required" }, { status: 400 });
  }

  upstreamUrl.searchParams.set("keyword", keyword);
  const location = String(body.location ?? "").trim();
  if (location) upstreamUrl.searchParams.set("location", location);

  const experienceText = String(body.experience ?? "").trim();
  const experienceMatch = experienceText.match(/\d+/);
  if (experienceMatch) upstreamUrl.searchParams.set("experience", experienceMatch[0]);

  const freshnessMap: Record<string, string> = {
    day: "1",
    "3 days": "3",
    week: "7",
    "15 days": "15",
    month: "30",
  };
  const freshness = freshnessMap[String(body.posted_within ?? "day")] ?? String(body.freshness ?? "");
  if (freshness) upstreamUrl.searchParams.set("freshness", freshness);

  const workMode = String(body.work_mode ?? body.workMode ?? "").toLowerCase();
  if (workMode === "remote" || workMode === "hybrid" || workMode === "onsite") {
    upstreamUrl.searchParams.set("work_mode", workMode);
  }

  upstreamUrl.searchParams.set("page", String(page));
  upstreamUrl.searchParams.set("limit", String(pageSize));

  try {
    const response = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(300000),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.detail?.message ?? payload?.detail ?? `Naukri API returned ${response.status}` },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    const rawJobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
    const jobs = rawJobs.map(normalizeJob);
    const total = Number(payload?.total_results ?? jobs.length);

    return NextResponse.json({
      jobs,
      total,
      page: Number(payload?.page ?? page),
      pageSize: Number(payload?.limit ?? pageSize),
      totalPages: Math.max(1, Math.ceil(total / Number(payload?.limit ?? pageSize))),
      source: "live-api",
    });
  } catch (error) {
    console.error("Live Naukri API failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Unable to connect to the Naukri API on port 8004." },
      { status: 502 },
    );
  }
}
