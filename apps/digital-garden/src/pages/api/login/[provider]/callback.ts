import { GITHUB_CLIENT_ID } from "astro:env/client";
import { GITHUB_CLIENT_SECRET } from "astro:env/server";
import { OAuthApp } from "@octokit/oauth-app";
import { Octokit } from "@octokit/rest";
import type { APIContext } from "astro";

export const prerender = false;

type Props = Record<string, never>;

type Params = {
  provider: string;
};

export async function GET(ctx: APIContext<Props, Params>): Promise<Response> {
  const { provider } = ctx.params;

  if (!isProvider(provider)) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  return await providerToHandler[provider](ctx);
}

const providers = ["github"] as const;

type Provider = (typeof providers)[number];

function isProvider(maybeProvider: string): maybeProvider is Provider {
  return providers.includes(maybeProvider);
}

async function handleGithubCallback(
  ctx: APIContext<Props, Params>,
): Promise<Response> {
  const app = new OAuthApp({
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
  });

  const redirectUri = ctx.url.searchParams.get("redirect_uri") ?? "/";
  const code = ctx.url.searchParams.get("code") ?? "";

  const { authentication } = await app.createToken({ code });
  const octokit = new Octokit({ auth: authentication.token });

  const { data } = await octokit.rest.users.getAuthenticated();
  console.info(data);

  // get or create user
  // create session
  // set user data and session id cookies (http only)

  return ctx.redirect(redirectUri);
}

const providerToHandler = {
  github: handleGithubCallback,
} as const satisfies Record<
  Provider,
  (ctx: APIContext<Props, Params>) => Promise<Response>
>;
