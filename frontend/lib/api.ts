const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('snyderhealth_token')
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || 'API error')
  return data
}

export const api = {
  get:    (path: string)                       => apiFetch(path),
  post:   (path: string, body: unknown)        => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path: string, body: unknown)        => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path: string)                       => apiFetch(path, { method: 'DELETE' }),
}
