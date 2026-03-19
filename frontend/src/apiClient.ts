import axios from 'axios'
import { clearAuth, getAccessToken, setAccessToken } from './authStorage'

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = axiosClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .post('/auth/refresh', undefined, { _silent: true } as any)
      .then((res) => {
        const token = (res.data?.accessToken as string | null | undefined) ?? null
        if (token) setAccessToken(token)
        return token
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status: number | undefined = err?.response?.status
    const original = err?.config as (typeof err.config & { _retry?: boolean; _silent?: boolean }) | undefined

    const url: string = original?.url ?? ''
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(original)
      }
    }

    if (status === 401) {
      if (original?._silent) {
        return Promise.reject(err)
      }
      clearAuth()
      window.location.href = '/'
    }
    return Promise.reject(err)
  },
)

export default axiosClient

