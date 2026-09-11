/**
 * Fadded Socials Reseller API Client
 * Official Spec: https://fadded.net/user/reseller/docs
 * Base URL: https://fadded.net/api/v1/reseller
 * Authentication: X-Api-Key: <key> or Authorization: Bearer <key>
 */

const FADDED_BASE_URL = process.env.FADDED_API_BASE_URL || 'https://fadded.net/api/v1/reseller';
const FADDED_API_KEY = process.env.FADDED_API_KEY || '';

export async function faddedFetch(endpoint: string, options: RequestInit = {}) {
  const isMock = !FADDED_API_KEY || FADDED_API_KEY.includes('mock') || FADDED_API_KEY.includes('your-');
  if (isMock) {
    return { isMock: true };
  }

  const url = `${FADDED_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const headers = {
    'X-Api-Key': FADDED_API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();
  return { isMock: false, status: res.status, ok: res.ok, data };
}
