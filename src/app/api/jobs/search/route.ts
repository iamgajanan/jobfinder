import { NextResponse } from "next/server";

const backendBaseUrl = (process.env.BACKEND_API_URL || "https://jobs.n8npi.live/api/v1").replace(/\/$/, "");

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || getCookie(request, "jobfinder_access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const payload = {
    platform: String(body.platform ?? "linkedin").toLowerCase(),
    job_title: String(body.job_title ?? "").trim(),
    location: String(body.location ?? "").trim(),
    experience: body.experience ? String(body.experience) : null,
    work_mode: body.work_mode ? String(body.work_mode).toLowerCase() : "any",
    posted_within: body.posted_within ? String(body.posted_within) : null,
    easy_apply: Boolean(body.easy_apply ?? false),
  };

  if (!payload.job_title || !payload.location) {
    return NextResponse.json({ error: "job_title and location are required" }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendBaseUrl}/jobs/search`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(300000),
    });

    const data = await response.json().catch(() => ({}));
    const responseHeaders = new Headers({ "content-type": "application/json" });
    const remaining = response.headers.get("x-searches-remaining");
    if (remaining) responseHeaders.set("x-searches-remaining", remaining);

    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ error: typeof data?.detail === "string" ? data.detail : "Job search failed." }),
        { status: response.status, headers: responseHeaders },
      );
    }

    const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
    return new NextResponse(
      JSON.stringify({
        jobs,
        total: jobs.length,
        page: 1,
        pageSize: jobs.length,
        totalPages: 1,
        source: "live-api",
      }),
      { status: 200, headers: responseHeaders },
    );
  } catch (error) {
    console.error("Production job search failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to connect to the production job API." }, { status: 502 });
  }
}

function getCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}
