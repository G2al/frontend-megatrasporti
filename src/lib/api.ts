import { clearSession, getToken } from "@/lib/auth";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  firstMessage(): string {
    const first = Object.values(this.errors).find((list) => list.length > 0);
    return first?.[0] ?? this.message;
  }
}

type Query = Record<string, string | number | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST";
  body?: FormData | Record<string, unknown>;
  query?: Query;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface ErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

function buildUrl(path: string, query?: Query): string {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "Impossibile contattare il server. Controlla la connessione e riprova.");
  }

  if (response.ok) return response;

  let payload: ErrorPayload = {};
  try {
    payload = (await response.json()) as ErrorPayload;
  } catch {
    payload = {};
  }

  if (response.status === 401 && token) clearSession();

  const fallback =
    response.status === 401
      ? "Sessione scaduta. Accedi di nuovo."
      : response.status === 403
        ? "Non hai i permessi per questa operazione."
        : response.status >= 500
          ? "Errore del server. Riprova tra poco."
          : "Si è verificato un errore.";

  throw new ApiError(response.status, payload.message || fallback, payload.errors ?? {});
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await request(path, options);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function apiBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  const response = await request(path, options);
  return response.blob();
}

export function unwrapList<T>(payload: T[] | { data: T[] }): T[] {
  return Array.isArray(payload) ? payload : payload.data;
}
