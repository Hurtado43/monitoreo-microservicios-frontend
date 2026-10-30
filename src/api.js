export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

async function request(path, { method = 'GET', body, timeoutMs = 60000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    const data = await res.json().catch(() => null)
    // Las llamadas a servicios devuelven el log aunque la operacion falle (4xx/5xx).
    if (!res.ok && !data?.requestId) {
      throw new Error(data?.error || `Error HTTP ${res.status}`)
    }
    return data
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Tiempo de espera agotado')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export const getSummary = () => request('/api/metrics/summary')

export function getLogs({ service, status, from, to, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams()
  if (service) params.set('service', service)
  if (status) params.set('status', status)
  if (from) params.set('from', new Date(from).toISOString())
  if (to) params.set('to', new Date(to).toISOString())
  params.set('page', page)
  params.set('size', size)
  return request(`/api/metrics/logs?${params}`)
}

export const simulateLoad = () => request('/api/metrics/simulate-load', { method: 'POST' })

export const callService = (service, operation, params) =>
  request(`/api/services/${service}/${encodeURIComponent(operation)}`, { method: 'POST', body: params })
