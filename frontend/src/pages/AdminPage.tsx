import { useNavigate } from '@tanstack/react-router'
import { logout } from '../authStorage'

export function AdminPage() {
  const navigate = useNavigate()
  return (
    <div className="page">
      <h1>Trang admin</h1>
      <p>Dành cho tài khoản có quyền ADMIN_ACCESS.</p>
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

