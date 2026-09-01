const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function authHeader() {
  try {
    const stored = JSON.parse(localStorage.getItem('auth'))
    return stored?.token ? { Authorization: `Bearer ${stored.token}` } : {}
  } catch {
    return {}
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export async function apiGet(path, params = {}) {
  const url = new URL(`${API_BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url, { headers: authHeader() })
  return handleResponse(response)
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  })
  return handleResponse(response)
}

export async function apiPatch(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  })
  return handleResponse(response)
}
