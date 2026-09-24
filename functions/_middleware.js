export async function onRequest(context) {
  const hostname = new URL(context.request.url).hostname;

  if (hostname.endsWith(".pages.dev") && !hostname.startsWith("staging.")) {
    return new Response("Not found.", { status: 404 });
  }

  const response = await context.next();

  if (hostname.startsWith("staging.")) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    return newResponse;
  }

  return response;
}
