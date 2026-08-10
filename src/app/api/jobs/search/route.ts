import { NextResponse } from "next/server";

const companies = ["TechNova Systems","BluePeak Digital","OrbitSoft","Crestline Labs","Vertex Solutions","CloudAxis","Nexa Technologies","BrightStack"];
const locations = ["Pune","Bangalore","Mumbai","Hyderabad","Remote"];
const skills = ["React","TypeScript","Next.js","JavaScript","Redux","REST API"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const page = Math.max(1, Number(body.page) || 1);
  const pageSize = Math.min(20, Math.max(1, Number(body.pageSize) || 9));
  const keyword = String(body.keyword || "React Developer").trim();
  const location = String(body.location || "Pune").trim();
  const workMode = String(body.workMode || "Any");
  const total = 57;
  const jobs = Array.from({ length: total }, (_, i) => ({
    id: `dummy-${i + 1}`,
    title: `${keyword || "Frontend Developer"} ${i % 3 === 0 ? "Senior" : ""}`.trim(),
    company: companies[i % companies.length],
    location: location || locations[i % locations.length],
    experience: i % 3 === 0 ? "5-8 years" : i % 2 === 0 ? "3-6 years" : "2-5 years",
    salary: `₹${12 + (i % 8)}-${18 + (i % 10)} LPA`,
    workMode: workMode !== "Any" ? workMode : i % 4 === 0 ? "Remote" : i % 3 === 0 ? "Hybrid" : "Work from office",
    posted: `${(i % 7) + 1} day${i % 7 === 0 ? "" : "s"} ago`,
    skills: [skills[i % skills.length], skills[(i + 1) % skills.length], skills[(i + 2) % skills.length]],
    url: `https://www.naukri.com/`,
    source: "Naukri" as const
  }));
  const start = (page - 1) * pageSize;
  return NextResponse.json({ jobs: jobs.slice(start, start + pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize), source: "dummy" });
}
