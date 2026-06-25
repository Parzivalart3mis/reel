import type { TitleDTO } from '@/lib/serialize';
import type { Stats } from '@/lib/stats';
import type { TmdbDetails, TmdbSearchResult } from '@/lib/tmdb';

class RequestError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = json?.error?.message ?? 'Request failed';
    const code = json?.error?.code ?? 'INTERNAL';
    throw new RequestError(code, message);
  }
  return json as T;
}

export const api = {
  createTitle: (body: unknown) =>
    request<{ title: TitleDTO }>('/api/titles', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateTitle: (id: string, body: unknown) =>
    request<{ title: TitleDTO }>(`/api/titles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteTitle: (id: string) =>
    request<{ ok: true }>(`/api/titles/${id}`, { method: 'DELETE' }),
  setRating: (id: string, rating: number | null) =>
    request<{ title: TitleDTO }>(`/api/titles/${id}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),
  setStatus: (id: string, status: string) =>
    request<{ title: TitleDTO }>(`/api/titles/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  setProgress: (id: string, season: number, episode: number) =>
    request<{ title: TitleDTO }>(`/api/titles/${id}/progress`, {
      method: 'POST',
      body: JSON.stringify({ season, episode }),
    }),
  listTitles: (qs: string) =>
    request<{ titles: TitleDTO[]; total: number; page: number }>(
      `/api/titles${qs ? `?${qs}` : ''}`,
    ),
  searchTmdb: (q: string, type?: string) =>
    request<{ results: TmdbSearchResult[] }>(
      `/api/tmdb/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`,
    ),
  tmdbDetails: (tmdbId: number, type: string) =>
    request<TmdbDetails>(`/api/tmdb/details?tmdbId=${tmdbId}&type=${type}`),
  stats: () => request<Stats>('/api/stats'),
};

export { RequestError };
