import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CreateSpaceModal from './CreateSpaceModal'

const NAV = [
  { label: 'Home',           to: '/' },
  { label: 'Popular',        to: '/popular' },
  { label: 'Explore Spaces', to: '/explore' },
]

export default function Sidebar() {
  const [showCreate, setShowCreate] = useState(false)
  const { pathname } = useLocation()

  return (
    <>
      <aside style={{ width: '180px', flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: '16px' }}>
          {/* Nav panel */}
          <div style={{ border: '1px solid #2a2a38', background: '#16161e' }}>
            <div className="unbounded" style={{
              padding: '6px 10px',
              fontSize: '8px',
              fontWeight: '700',
              letterSpacing: '1px',
              color: '#a1a1aa',
              borderBottom: '1px solid #2a2a38',
              textTransform: 'uppercase',
              background: '#1c1c26',
            }}>
              Navigate
            </div>
            {NAV.map(({ label, to }) => {
              const active = pathname === to
              return (
                <Link
                  key={label}
                  to={to}
                  className="no-underline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '7px 10px',
                    fontSize: '13px',
                    borderBottom: '1px solid #2a2a38',
                    background: active ? '#1c1c26' : 'transparent',
                    color: active ? '#4B9CD3' : '#a1a1aa',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#1c1c26' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  {active && <span style={{ color: '#4B9CD3', marginRight: '6px' }}>»</span>}
                  {label}
                </Link>
              )
            })}

            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: 'block', width: '100%', padding: '7px 10px',
                background: 'transparent', border: 'none',
                color: 'white', fontSize: '13px', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1c1c26'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              + Create a Space
            </button>
          </div>
        </div>
      </aside>

      {showCreate && <CreateSpaceModal onClose={() => setShowCreate(false)} />}
    </>
  )
}
