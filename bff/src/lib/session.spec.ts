import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clearSessionCookies, parseSessionCookie, sessionCookies } from './session.js';

function asHeader(cookies: { name: string; value: string }[]): string {
  return cookies.map((c) => `${c.name}=${encodeURIComponent(c.value)}`).join('; ');
}

test('a session larger than one cookie survives the round trip', () => {
  const sealed = 'Fe26.2**' + 'x'.repeat(4849);
  const cookies = sessionCookies(sealed);

  assert.ok(cookies.length > 1);
  for (const c of cookies) {
    assert.ok(c.value.length <= 3500, `${c.name} must stay under the 4 KB browser cap`);
  }
  assert.equal(parseSessionCookie(asHeader(cookies)), sealed);
});

test('a shorter session expires the previous session leftover chunks', () => {
  const previous = asHeader(sessionCookies('o'.repeat(8000)));
  const cookies = sessionCookies('n'.repeat(100), previous);

  assert.deepEqual(
    cookies.map((c) => [c.name, c.maxAge]),
    [
      ['__session.0', 86400],
      ['__session.1', 0],
      ['__session.2', 0],
    ],
  );

  const kept = cookies.filter((c) => c.maxAge !== 0);
  assert.equal(parseSessionCookie(asHeader(kept)), 'n'.repeat(100));
});

test('clearing expires every chunk the browser sent', () => {
  const cleared = clearSessionCookies(asHeader(sessionCookies('y'.repeat(8000))));
  assert.equal(cleared.length, 3);
  for (const c of cleared) {
    assert.equal(c.maxAge, 0);
  }
});
