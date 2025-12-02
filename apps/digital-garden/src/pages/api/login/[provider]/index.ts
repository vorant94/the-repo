import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "astro:env/server";
import { GitHub, generateState } from "arctic";
import type { APIContext } from "astro";
import { isProvider, type Provider } from "../../../../lib/oauth";

export const prerender = false;

type Props = Record<string, never>;

type Params = {
  provider: string;
};

export function GET(ctx: APIContext<Props, Params>): Response {
  const { provider } = ctx.params;

  if (!isProvider(provider)) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  return providerToHandler[provider](ctx);
}

function handleGithubRedirect(ctx: APIContext<Props, Params>): Response {
  const internalRedirectUrl = new URL(
    ctx.url.searchParams.get("redirect_uri") ?? "/",
    // biome-ignore lint/style/noNonNullAssertion: we know Astro.site is defined since site is present in config
    ctx.site!.origin,
  );
  const oauthRedirectUrl = new URL(
    "/api/login/github/callback",
    // biome-ignore lint/style/noNonNullAssertion: we know Astro.site is defined since site is present in config
    ctx.site!.origin,
  );
  oauthRedirectUrl.searchParams.set(
    "redirect_uri",
    internalRedirectUrl.toString(),
  );

  const oauthClient = new GitHub(
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    oauthRedirectUrl.toString(),
  );

  const oauthState = generateState();
  const oauthAuthorizationUrl = oauthClient.createAuthorizationURL(oauthState, [
    "user:email",
  ]);

  ctx.cookies.set("state", oauthState, {
    // biome-ignore lint/style/noNonNullAssertion: we know Astro.site is defined since site is present in config
    secure: ctx.site!.hostname !== "localhost",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
  });

  return ctx.redirect(oauthAuthorizationUrl.toString());
}

const providerToHandler = {
  github: handleGithubRedirect,
} as const satisfies Record<
  Provider,
  (ctx: APIContext<Props, Params>) => Response
>;
