export const ACCESS_TOKEN_KEY = 'accessToken'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export async function ensureAccessToken(): Promise<string | null> {
  const token = getAccessToken()
  if (token) return token

  // Thử refresh từ cookie (httpOnly) để lấy access token mới
  const { default: axiosClient } = await import('./apiClient')
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await axiosClient.post('/auth/refresh', undefined, { _silent: true } as any)
    const newToken = (res.data?.accessToken as string | null | undefined) ?? null
    if (newToken) setAccessToken(newToken)
    return newToken
  } catch {
    return null
  }
}

export function getTokenPermissions(): string[] {
  const token = getAccessToken()
  if (!token) return []
  const parts = token.split('.')
  if (parts.length !== 3) return []
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payloadJson = atob(padded)
    const payload = JSON.parse(payloadJson) as { permissions?: unknown }
    return Array.isArray(payload.permissions)
      ? payload.permissions.filter((p): p is string => typeof p === 'string')
      : []
  } catch {
    return []
  }
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export async function logout(): Promise<void> {
  try {
    const { default: axiosClient } = await import('./apiClient')
    await axiosClient.post('/auth/logout')
  } catch {
    // ignore
  } finally {
    clearAuth()
  }
}

