/** Guard: prevents re-entrant `auth:expired` dispatch when a logout request itself returns 401. */
let _authExpiredInProgress = false

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    const message =
      typeof data === 'string'
        ? data
        : (data as Record<string, unknown>)?.message as string ?? `Request failed with status ${status}`
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const CSRF_COOKIE = 'af_csrf'

function clearAuth(): void {
  if (_authExpiredInProgress) return
  _authExpiredInProgress = true
  window.dispatchEvent(new CustomEvent('auth:expired'))
}

/** Reset the guard — called by AuthWatcher after it finishes handling expiry. */
export function resetAuthExpiredGuard(): void {
  _authExpiredInProgress = false
}

/** Read a cookie value by name (client-side readable cookies only). */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  let url = `${BASE_URL}${path}`
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        searchParams.append(k, String(v))
      }
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }
  return url
}

function buildHeaders(method: string): Record<string, string> {
  const headers: Record<string, string> = {}
  // No Authorization header needed — the JWT is sent as an httpOnly cookie automatically.
  // CSRF token: send X-CSRF-Token header on state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    const csrfToken = getCookie(CSRF_COOKIE)
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
  }
  return headers
}

function normalizeArrayPayload<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.data)) return record.data as T[]
    if (Array.isArray(record.items)) return record.items as T[]
    if (Array.isArray(record.results)) return record.results as T[]
  }

  return []
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    clearAuth()
    throw new ApiError(401, 'Unauthorized')
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new ApiError(response.status, errorData)
  }
  // All backend success responses are wrapped in { data: T } — auto-unwrap
  const body = await response.json() as { data?: T }
  return (body?.data ?? body) as T
}

export async function get<T>(path: string, params?: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers: buildHeaders('GET'),
    credentials: 'include',
    ...(signal ? { signal } : {}),
  })
  return handleResponse<T>(response)
}

export async function getArray<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T[]> {
  const response = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers: buildHeaders('GET'),
    credentials: 'include',
  })
  const data = await handleResponse<unknown>(response)
  return normalizeArrayPayload<T>(data)
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const headers = buildHeaders('POST')
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers,
    credentials: 'include',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  const headers = buildHeaders('PUT')
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const response = await fetch(buildUrl(path), {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function del<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: buildHeaders('DELETE'),
    credentials: 'include',
  })
  return handleResponse<T>(response)
}

export async function postBlob(path: string, body: unknown): Promise<Blob> {
  const headers = buildHeaders('POST')
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers,
    credentials: 'include',
    body: body instanceof FormData ? body : JSON.stringify(body),
  })
  if (response.status === 401) {
    clearAuth()
    throw new ApiError(401, 'Unauthorized')
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new ApiError(response.status, errorData)
  }
  return response.blob()
}
