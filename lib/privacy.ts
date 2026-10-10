const PUBLIC_HEADERS = ["accept", "content-type", "content-length", "origin", "rsc", "next-router-state-tree", "next-router-prefetch", "next-url"];

/** Discard connection metadata before dispatching to application code.
 * The hosting platform necessarily handles the original connection.
 */
export function sanitizeRequest(request: Request): Request {
  const path = new URL(request.url).pathname;
  const recipientRoute = path === "/inbox" || path.startsWith("/api/inbox");
  const headers = new Headers();
  for (const name of PUBLIC_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  if (recipientRoute) {
    for (const name of ["oai-authenticated-user-id", "oai-authenticated-user-email"]) {
      const value = request.headers.get(name);
      if (value !== null) headers.set(name, value);
    }
  }
  // Do not copy request.cf, cookies, original identity, or geolocation metadata.
  return new Request(request.url, {
    method: request.method, headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual", ...(request.body ? { duplex: "half" } : {}),
  } as RequestInit);
}

export function secureResponse(response: Response, development = false): Response {
  const result = new Response(response.body, response);
  result.headers.set("Cache-Control", "private, no-store, max-age=0");
  result.headers.set("Referrer-Policy", "no-referrer");
  result.headers.set("X-Content-Type-Options", "nosniff");
  result.headers.set("X-Frame-Options", "DENY");
  result.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  // Vinext uses inline hydration scripts; no third-party scripts or connections.
  result.headers.set("Content-Security-Policy", [
    "default-src 'self'", "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:", "font-src 'self'", `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:", "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'",
  ].join("; "));
  return result;
}
