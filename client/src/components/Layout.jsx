import { Outlet, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const { spaceId } = useParams()
  const inSpace = Boolean(spaceId)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b0b0f' }}>
      <Header inSpace={inSpace} />
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 gap-6 py-6">
        {!inSpace && <Sidebar />}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
