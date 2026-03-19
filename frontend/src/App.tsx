import './css/App.css'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import axiosClient from './apiClient'
import { setAccessToken } from './authStorage'

function App() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const endpoint =
        mode === 'register' ? '/auth/register' : '/auth/login'

      const body =
        mode === 'register'
          ? { name, email, password }
          : { email, password }

      const { data } = await axiosClient.post(endpoint, body)

      const accessToken: string | undefined = data.accessToken
      const user = data.user

      if (accessToken) {
        setAccessToken(accessToken)
      }

      const permissions: string[] = user?.permissions ?? []
      if (permissions.includes('ADMIN_ACCESS')) {
        navigate({ to: '/admin' })
      } else if (permissions.includes('MODERATOR_ACCESS')) {
        navigate({ to: '/moderator' })
      } else {
        navigate({ to: '/main' })
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h1>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Họ tên</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="submit-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Đang xử lý...'
              : mode === 'login'
              ? 'Đăng nhập'
              : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
