import { HttpRequest, HttpResponseInit } from '@azure/functions';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN!.replace(/\/+$/, '');

function reject(reason: string): HttpResponseInit {
  return { status: 403, jsonBody: { error: reason } };
}

export function checkCsrf(request: HttpRequest): HttpResponseInit | null {
  if (request.headers.get('x-requested-with') !== 'XMLHttpRequest') {
    return reject('Missing or invalid X-Requested-With header');
  }

  const origin = request.headers.get('origin');
  if (origin !== null && origin !== ALLOWED_ORIGIN) {
    return reject('Origin not allowed');
  }

  return null;
}
