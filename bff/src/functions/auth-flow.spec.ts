import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { HttpRequest, InvocationContext } from '@azure/functions';

process.env.KEYCLOAK_URL ??= 'https://keycloak.test/realms/test';
process.env.KEYCLOAK_CLIENT_ID ??= 'student-bff';
process.env.KEYCLOAK_CLIENT_SECRET ??= 'test-secret';
process.env.SESSION_SECRET ??= 'test-session-secret-at-least-32-characters-long';
process.env.ALLOWED_ORIGIN ??= 'http://localhost:4200';
process.env.BACKEND_API_URL ??= 'https://backend.test';

const { authLogin } = await import('./auth-login.js');
const { authCallback } = await import('./auth-callback.js');
const { unsealPkce, PKCE_COOKIE } = await import('../lib/session.js');

function loginRequest(returnUrl: string | null): HttpRequest {
  const query = new URLSearchParams(returnUrl === null ? {} : { returnUrl });
  return { query, headers: new Headers() } as unknown as HttpRequest;
}

function callbackRequest(params: Record<string, string>, cookie?: string): HttpRequest {
  return {
    query: new URLSearchParams(params),
    headers: new Headers(cookie ? { cookie } : {}),
  } as unknown as HttpRequest;
}

const noop = (): void => undefined;
const context = { log: noop, error: noop } as unknown as InvocationContext;

test('login redirects to Keycloak demanding S256 and sets the __pkce cookie', async () => {
  const res = await authLogin(loginRequest('/blog/new'));

  assert.equal(res.status, 302);

  const location = new URL((res.headers as Record<string, string>).Location);
  assert.equal(
    location.origin + location.pathname,
    'https://keycloak.test/realms/test/protocol/openid-connect/auth',
  );
  assert.equal(location.searchParams.get('response_type'), 'code');
  assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(
    location.searchParams.get('redirect_uri'),
    'http://localhost:4200/api/auth/callback',
  );
  assert.ok(location.searchParams.get('code_challenge'));

  const pkce = res.cookies?.find((c) => c.name === PKCE_COOKIE);
  assert.ok(pkce, 'a __pkce cookie must be set');
  assert.equal(pkce.httpOnly, true);
  assert.equal(pkce.secure, false, 'plain http must not carry a Secure cookie');
});

test('the state in the redirect matches the one sealed into the cookie', async () => {
  const res = await authLogin(loginRequest('/blog/new'));
  const location = new URL((res.headers as Record<string, string>).Location);
  const sealed = res.cookies!.find((c) => c.name === PKCE_COOKIE)!.value;

  const pkce = await unsealPkce(sealed);
  assert.equal(pkce?.state, location.searchParams.get('state'));
  assert.equal(pkce?.returnUrl, '/blog/new');
});

test('a hostile returnUrl never reaches the sealed cookie', async () => {
  const res = await authLogin(loginRequest('https://phishing.example/steal'));
  const sealed = res.cookies!.find((c) => c.name === PKCE_COOKIE)!.value;

  assert.equal((await unsealPkce(sealed))?.returnUrl, '/');
});

test('callback errors redirect to the login page instead of returning JSON', async () => {
  const denied = await authCallback(callbackRequest({ error: 'access_denied' }), context);
  assert.equal(denied.status, 302);
  assert.equal((denied.headers as Record<string, string>).Location, '/login?error=access_denied');
  assert.equal(denied.jsonBody, undefined);

  const other = await authCallback(callbackRequest({ error: 'server_error' }), context);
  assert.equal((other.headers as Record<string, string>).Location, '/login?error=failed');
});

test('a callback without the __pkce cookie is treated as expired', async () => {
  const res = await authCallback(callbackRequest({ code: 'abc', state: 'xyz' }), context);
  assert.equal((res.headers as Record<string, string>).Location, '/login?error=expired');
});

test('a forged state is rejected before any token exchange', async () => {
  const login = await authLogin(loginRequest('/blog/new'));
  const sealed = login.cookies!.find((c) => c.name === PKCE_COOKIE)!.value;
  const cookie = `${PKCE_COOKIE}=${encodeURIComponent(sealed)}`;

  const res = await authCallback(
    callbackRequest({ code: 'abc', state: 'not-the-issued-state' }, cookie),
    context,
  );
  assert.equal((res.headers as Record<string, string>).Location, '/login?error=failed');
});
