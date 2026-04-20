import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/',              label: 'Home',    icon: '⌂' },
  { to: '/popular',       label: 'Popular', icon: '↑' },
  { to: '/explore',       label: 'Explore', icon: '◈' },
  { to: '/create-space',  label: 'New Space', icon: '+' },
]

export default function MobileNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="mobile-nav"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: '#11111a', borderTop: '1px solid #2a2a38',
        alignItems: 'center', justifyContent: 'space-around',
        height: '52px', padding: '0 8px',
      }}
    >
      {NAV.map(({ to, label, icon }) => {
        const active = pathname === to
        const isNew = to === '/create-space'
        return (
          <Link
            key={to}
            to={to}
            className="no-underline"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1 }}
          >
            <span style={{ fontSize: isNew ? '22px' : '18px', lineHeight: 1, color: active || isNew ? '#4B9CD3' : '#8a8a9a' }}>{icon}</span>
            <span className="mono" style={{ fontSize: '9px', color: active || isNew ? '#4B9CD3' : '#8a8a9a' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
