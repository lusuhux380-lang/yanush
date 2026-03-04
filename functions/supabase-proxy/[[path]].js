const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, Prefer",
};

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL) {
    return new Response(
      JSON.stringify({ error: "SUPABASE_URL is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  try {
    const url = new URL(request.url);
    // Strip the /supabase-proxy prefix to get the actual Supabase path
    const supabasePath = url.pathname.replace(/^\/supabase-proxy/, "") || "/";
    const targetUrl = `${SUPABASE_URL}${supabasePath}${url.search}`;

    const upstreamHeaders = new Headers(request.headers);
    // Inject Supabase anon key if not already provided
    if (SUPABASE_ANON_KEY && !upstreamHeaders.has("apikey")) {
      upstreamHeaders.set("apikey", SUPABASE_ANON_KEY);
    }
    // Remove host header to avoid conflicts
    upstreamHeaders.delete("host");

    const NO_BODY_METHODS = new Set(["GET", "HEAD", "TRACE", "CONNECT"]);

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body: !NO_BODY_METHODS.has(request.method) ? request.body : undefined,
    });

    const responseHeaders = new Headers(CORS_HEADERS);
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "access-control-allow-origin") {
        responseHeaders.set(key, value);
      }
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e?.message || String(e) }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
}
