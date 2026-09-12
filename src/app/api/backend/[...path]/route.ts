import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = (process.env.BACKEND_API_URL || "https://jobs.n8npi.live/api/v1").replace(/\/$/, "");
const BACKEND_TIMEOUT_MS = 15_000;

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;

  if (!path.length || path.some((segment) => !segment || segment === "." || segment === "..")) {
    return NextResponse.json({ detail: "Invalid backend API path." }, { status: 400 });
  }

  const target = `${backendBaseUrl}/${path.join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const requestId = request.headers.get("x-request-id");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  if (requestId) headers.set("x-request-id", requestId);
  headers.set("accept", "application/json");

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");
    const searchesRemaining = response.headers.get("x-searches-remaining");
    const responseRequestId = response.headers.get("x-request-id");
    if (responseContentType) responseHeaders.set("content-type", responseContentType);
    if (searchesRemaining) responseHeaders.set("x-searches-remaining", searchesRemaining);
    if (responseRequestId) responseHeaders.set("x-request-id", responseRequestId);

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    console.error("Backend API proxy failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { detail: timedOut ? "The backend API request timed out." : "Unable to connect to the backend API." },
      { status: timedOut ? 504 : 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
