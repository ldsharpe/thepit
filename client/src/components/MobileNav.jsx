import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CreateSpaceModal from './CreateSpaceModal'

export default function MobileNav() {
  const { pathname } = useLocation()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <nav
        className="mobile-nav"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: '#11111a', borderTop: '1px solid #2a2a38',
          alignItems: 'center', justifyContent: 'space-around',
          height: '52px', padding: '0 8px',
        }}
      >
        <Link
          to="/"
          className="no-underline"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1 }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1, color: pathname === '/' ? '#4B9CD3' : '#52525b' }}>⌂</span>
          <span className="mono" style={{ fontSize: '9px', color: pathname === '/' ? '#4B9CD3' : '#52525b' }}>Home</span>
        </Link>

        <Link
          to="/popular"
          className="no-underline"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1 }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1, color: pathname === '/popular' ? '#4B9CD3' : '#52525b' }}>↑</span>
          <span className="mono" style={{ fontSize: '9px', color: pathname === '/popular' ? '#4B9CD3' : '#52525b' }}>Popular</span>
        </Link>

        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1, color: '#4B9CD3' }}>+</span>
          <span className="mono" style={{ fontSize: '9px', color: '#4B9CD3' }}>New Space</span>
        </button>
      </nav>

      {showCreate && <CreateSpaceModal onClose={() => setShowCreate(false)} />}
    </>
  )
}
