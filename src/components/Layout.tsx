import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand">
          presentation-md
        </Link>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  )
}
