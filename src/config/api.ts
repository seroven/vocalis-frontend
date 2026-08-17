import type { ApiResponse } from '../shared/interfaces/api-response.interface'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  const body = (await response.json()) as ApiResponse<T>

  if (!response.ok) {
    throw new ApiError(response.status, body.detail || `Error ${response.status}`)
  }

  return body
}

export function apiGet<T>(path: string) {
  return request<T>(path)
}

export function apiPost<T>(path: string, data?: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export function apiPut<T>(path: string, data?: unknown) {
  return request<T>(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export function apiDelete<T>(path: string) {
  return request<T>(path, {
    method: 'DELETE',
  })
}

export async function apiUpload<T>(path: string, body: FormData): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body,
  })

  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok) {
    throw new ApiError(response.status, payload.detail || `Error ${response.status}`)
  }

  return payload
}

export async function apiBlob(path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new ApiError(response.status, `Error ${response.status}`)
  }

  return response.blob()
}

export { ApiError }
