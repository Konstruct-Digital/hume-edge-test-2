export async function onRequest(context) {
  const { request, env, next } = context;
  const hostname = new URL(request.url).hostname;

  // Hide every Cloudflare-generated pages.dev URL except the staging alias
  // - the bare project domain and individual per-deployment hash URLs stay
  // unreachable, so only staging.* and the real custom domain (once
  // attached) are ever publicly reachable.
  if (hostname.endsWith(".pages.dev") && !hostname.startsWith("staging.")) {
    return new Response("Not found.", { status: 404 });
  }

  if (hostname.startsWith("staging.")) {
    // Basic Auth gate. Requires two Preview-scoped environment variables
    // set in the Cloudflare Pages dashboard (Settings -> Environment
    // variables -> Preview): STAGING_BASIC_AUTH_USER, STAGING_BASIC_AUTH_PASS.
    // Do not set these for Production - their presence there would gate
    // the live site too.
    const expectedUser = env.STAGING_BASIC_AUTH_USER;
    const expectedPass = env.STAGING_BASIC_AUTH_PASS;

    const authHeader = request.headers.get("Authorization");
    let authorized = false;
    if (authHeader && authHeader.startsWith("Basic ")) {
      const decoded = atob(authHeader.slice("Basic ".length));
      const separatorIndex = decoded.indexOf(":");
      const user = decoded.slice(0, separatorIndex);
      const pass = decoded.slice(separatorIndex + 1);
      authorized = user === expectedUser && pass === expectedPass;
    }

    if (!authorized) {
      return new Response("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Staging", charset="UTF-8"',
        },
      });
    }

    const response = await next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    return newResponse;
  }

  return next();
}
