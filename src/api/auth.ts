import { API_BASE_URL } from '@/src/constants/api';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? 'Request failed');
  return json as T;
}

export async function apiRegister(email: string, password: string): Promise<TokenPair> {
  return handleResponse(
    await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function apiLogin(email: string, password: string): Promise<TokenPair> {
  return handleResponse(
    await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function apiRefresh(refreshToken: string): Promise<TokenPair> {
  return handleResponse(
    await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }),
  );
}

export async function apiLogout(refreshToken: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => undefined);
}
