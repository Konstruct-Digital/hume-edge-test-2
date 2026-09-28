// Known bot/crawler/scraper User-Agent signatures to block on staging.
// Broad terms ("bot", "crawl", "spider") catch most well-known crawlers
// (Googlebot, Bingbot, GPTBot, CCBot, ClaudeBot, DuckDuckBot, Baiduspider,
// YandexBot, Applebot, SemrushBot, AhrefsBot, etc.) without listing each
// one by name. The rest are default User-Agents of common HTTP client
// libraries scripts use instead of a real browser.
const BLOCKED_USER_AGENT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /slurp/i,
  /facebookexternalhit/i,
  /python-requests/i,
  /curl/i,
  /wget/i,
  /go-http-client/i,
  /okhttp/i,
  /node-fetch/i,
  /axios/i,
  /scrapy/i,
];

export async function onRequest(context) {
  const hostname = new URL(context.request.url).hostname;

  if (hostname.endsWith(".pages.dev") && !hostname.startsWith("staging.")) {
    return new Response("Not found.", { status: 404 });
  }

  if (hostname.startsWith("staging.")) {
    const userAgent = context.request.headers.get("User-Agent") || "";
    if (BLOCKED_USER_AGENT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
      return new Response("Forbidden.", { status: 403 });
    }
  }

  const response = await context.next();

  if (hostname.startsWith("staging.")) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    return newResponse;
  }

  return response;
}
