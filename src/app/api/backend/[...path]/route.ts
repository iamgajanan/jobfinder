import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = (process.env.BACKEND_API_URL || "https://jobs.n8npi.live/api/v1").replace(/\/$/, "");

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `${backendBaseUrl}/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");
    const searchesRemaining = response.headers.get("x-searches-remaining");
    if (responseContentType) responseHeaders.set("content-type", responseContentType);
    if (searchesRemaining) responseHeaders.set("x-searches-remaining", searchesRemaining);

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Backend API proxy failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ detail: "Unable to connect to the backend API." }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
