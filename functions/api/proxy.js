const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method === "GET") {
    return new Response(
      JSON.stringify({ ok: true, route: "/api/proxy", ts: Date.now() }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }

  const API_KEY = env.API_KEY;

  try {
    const { searchParams } = new URL(request.url);
    const action = (searchParams.get("url") || "").trim();

    // Validate action to prevent proxying arbitrary paths
    if (!action || !/^gemini[-\w]*(\.\d+)*:(generateContent|streamGenerateContent)$/.test(action)) {
      return new Response(
        JSON.stringify({
          error:
            "Bad url parameter. Expected like 'gemini-2.0-flash-lite:generateContent' " +
            "or 'gemini-2.0-flash-lite:streamGenerateContent'.",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const targetUrl = `https://api.proxyapi.ru/google/v1beta/models/${encodeURIComponent(action)}`;

    const body = await request.text();

    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body,
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e?.message || String(e) }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
}
