import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header({ inSpace }) {
  const { user, logout } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const allSpaces = useRef([])

  useEffect(() => {
    fetchSpaces()
  }, [])

  function fetchSpaces() {
    fetch('/api/spaces')
      .then(r => r.json())
      .then(spaces => { allSpaces.current = spaces })
      .catch(() => {})
  }

  function handleSearch(e) {
    const val = e.target.value
    setQuery(val)
    if (!val.trim()) { setResults([]); return }
    const q = val.toLowerCase()
    setResults(allSpaces.current.filter(s => s.name.toLowerCase().includes(q)).slice(0, 6))
  }

  function selectSpace(space) {
    setQuery('')
    setResults([])
    navigate(`/s/${space.id}`)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header style={{ background: '#11111a', borderBottom: '2px solid #2a2a38' }}>
      <div
        className="max-w-5xl mx-auto px-3"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '44px' }}
      >
        <Link to="/" className="no-underline" style={{ flexShrink: 0 }}>
          <span className="unbounded" style={{ fontSize: '13px', fontWeight: '900', color: '#4B9CD3', letterSpacing: '0.5px' }}>
            THE PIT
          </span>
        </Link>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            value={query}
            onChange={handleSearch}
            onFocus={() => { setFocused(true); fetchSpaces() }}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="search spaces..."
            className="mono"
            style={{
              width: '100%', padding: '4px 8px',
              background: '#0e0e12', border: '1px solid #2a2a38',
              color: '#d4d4d8', fontSize: '12px', outline: 'none',
            }}
          />
          {focused && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: '#16161e', border: '1px solid #2a2a38', borderTop: 'none',
            }}>
              {results.map(s => (
                <button
                  key={s.id}
                  onMouseDown={() => selectSpace(s)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '7px 10px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: '#d4d4d8',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1c1c26'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{
                    width: '28px', height: '28px', flexShrink: 0,
                    background: s.banner_color || '#4B9CD3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Unbounded, sans-serif', fontWeight: '900',
                    fontSize: '12px', color: '#0e0e12',
                  }}>
                    {s.icon?.trim() || s.name[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="unbounded" style={{ fontSize: '10px', color: '#d4d4d8', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.name}
                    </div>
                    <div className="mono" style={{ fontSize: '10px', color: '#8a8a9a', marginTop: '1px' }}>
                      {s.member_count ?? 0} member{(s.member_count ?? 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {inSpace && (
            <Link
              to="/"
              className="mono no-underline"
              style={{ fontSize: '11px', padding: '3px 8px', border: '1px solid #2a2a38', color: '#9a9aaa' }}
            >
              &laquo; home
            </Link>
          )}

          {user ? (
            <>
              <Link to={`/u/${user.username}`} className="mono no-underline header-username" style={{ fontSize: '11px', color: '#8a8a9a' }}>
                logged in as <span style={{ color: '#4B9CD3' }}>{user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="mono"
                style={{
                  fontSize: '11px', padding: '3px 8px',
                  background: 'none', border: '1px solid #2a2a38',
                  color: '#8a8a9a', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#a1a1aa'}
                onMouseLeave={e => e.currentTarget.style.color = '#8a8a9a'}
              >
                log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mono no-underline"
              style={{
                fontSize: '11px', padding: '3px 10px',
                background: '#4B9CD3', color: '#0e0e12', fontWeight: '700',
              }}
            >
              log in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
