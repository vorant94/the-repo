import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "astro:env/server";
import { Octokit } from "@octokit/rest";
import { GitHub } from "arctic";
import type { APIContext } from "astro";
import { isProvider, type Provider } from "../../../../lib/oauth";
import { createSession, setSessionCookie } from "../../../../lib/sessions";
import { createUser, findUserByGithubId } from "../../../../lib/users";

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

async function handleGithubCallback(
  ctx: APIContext<Props, Params>,
): Promise<Response> {
  const storedOauthState = ctx.cookies.get("state")?.value ?? "";
  const receivedOauthState = ctx.url.searchParams.get("state");
  const oauthCode = ctx.url.searchParams.get("code") ?? "";

  if (
    !oauthCode ||
    !storedOauthState ||
    !receivedOauthState ||
    receivedOauthState !== storedOauthState
  ) {
    return new Response(null, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const oauthClient = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, null);
  const tokens = await oauthClient.validateAuthorizationCode(oauthCode);

  const githubClient = new Octokit({ auth: tokens.accessToken() });
  const { data } = await githubClient.rest.users.getAuthenticated();

  const user =
    (await findUserByGithubId(ctx, data.id)) ??
    (await createUser(ctx, data.id, data.login));

  const session = await createSession(ctx, user.id);
  setSessionCookie(ctx, session.token);

  const internalRedirectUri = ctx.url.searchParams.get("redirect_uri") ?? "/";

  return ctx.redirect(internalRedirectUri);
}

const providerToHandler = {
  github: handleGithubCallback,
} as const satisfies Record<
  Provider,
  (ctx: APIContext<Props, Params>) => Promise<Response>
>;
