import type { NextRequest } from "next/server";

function getApiBase(): string {
  return (process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8003").replace(
    /\/$/,
    "",
  );
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  const path = pathSegments.join("/");
  const target = new URL(`${getApiBase()}/${path}`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  return fetch(target, init);
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
