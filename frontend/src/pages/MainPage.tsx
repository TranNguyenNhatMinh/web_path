import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export function MainPage() {
  return (
    <div className="page">
      <Header title="Trang chính" />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '18px' }}>
        <h1 style={{ marginTop: 12 }}>Trang chính</h1>
        <p>Đăng nhập thành công (user thường).</p>
      </main>

      <Footer />
    </div>
  )
}

