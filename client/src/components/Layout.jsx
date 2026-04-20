import { Outlet, useParams, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'

export default function Layout() {
  const { spaceId } = useParams()
  const { pathname } = useLocation()
  const inSpace = Boolean(spaceId)
  const hideSidebar = inSpace || pathname === '/login' || pathname === '/register' || pathname === '/create-space' || pathname.endsWith('/settings')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b0b0f' }}>
      <Header inSpace={inSpace} />
      <div className="layout-body flex flex-1 max-w-5xl mx-auto w-full px-3 gap-6 py-4">
        {!hideSidebar && <div className="layout-sidebar"><Sidebar /></div>}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
