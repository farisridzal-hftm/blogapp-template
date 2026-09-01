import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { buildAuthorizeUrl, createPkcePair, randomState, safeReturnUrl } from '../lib/keycloak.js';
import { sealPkce, pkceCookie } from '../lib/session.js';

export async function authLogin(request: HttpRequest): Promise<HttpResponseInit> {
  const { verifier, challenge } = createPkcePair();
  const state = randomState();
  const returnUrl = safeReturnUrl(request.query.get('returnUrl'));

  const sealed = await sealPkce({ verifier, state, returnUrl });

  return {
    status: 302,
    headers: { Location: buildAuthorizeUrl(state, challenge) },
    cookies: [pkceCookie(sealed)],
  };
}

app.http('auth-login', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: authLogin,
});
