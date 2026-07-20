import { Link, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand">
          presentation-md
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>
            문서
          </Link>
          <Link to="/fonts" className={pathname === '/fonts' ? 'active' : ''}>
            글꼴
          </Link>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  )
}
