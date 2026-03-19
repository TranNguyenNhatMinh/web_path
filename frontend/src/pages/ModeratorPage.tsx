import { useNavigate } from '@tanstack/react-router'
import { logout } from '../authStorage'

export function ModeratorPage() {
  const navigate = useNavigate()
  return (
    <div className="page">
      <h1>Trang moderator</h1>
      <p>Dành cho tài khoản có quyền MODERATOR_ACCESS.</p>
      <button
        type="button"
        onClick={async () => {
          await logout()
          navigate({ to: '/', replace: true })
        }}
      >
        Đăng xuất
      </button>
    </div>
  )
}

