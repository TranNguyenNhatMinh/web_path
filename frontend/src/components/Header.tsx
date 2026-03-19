import { useNavigate } from '@tanstack/react-router'
import { getAccessToken, logout } from '../authStorage'
import '../css/Header.css'

type Props = {
  title?: string
}

export function Header({ title = 'Web In' }: Props) {
  const navigate = useNavigate()
  const token = getAccessToken()

  return (
    <header className="appHeader">
      <div className="appHeader__inner">
        <button
          type="button"
          className="appHeader__brand"
          onClick={() => navigate({ to: token ? '/main' : '/' })}
        >
          <span className="appHeader__logo" aria-hidden="true">
            WI
          </span>
          <span className="appHeader__title">{title}</span>
        </button>

        <nav className="appHeader__actions" aria-label="Header actions">
          {!token ? (
            <>
              <button
                type="button"
                className="appButton appButton--ghost"
                onClick={() => navigate({ to: '/' })}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className="appButton appButton--primary"
                onClick={() => navigate({ to: '/' })}
              >
                Đăng ký
              </button>
            </>
          ) : (
            <button
              type="button"
              className="appButton appButton--danger"
              onClick={async () => {
                await logout()
                navigate({ to: '/', replace: true })
              }}
            >
              Đăng xuất
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

