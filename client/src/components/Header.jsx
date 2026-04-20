import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header({ inSpace }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  async function handleSearch(e) {
    const val = e.target.value
    setQuery(val)
    if (!val.trim()) { setResults([]); return }
    const res = await fetch('/api/spaces')
    const spaces = await res.json()
    setResults(spaces.filter(s => s.name.toLowerCase().includes(val.toLowerCase())).slice(0, 6))
  }

  function selectSpace(space) {
    setQuery('')
    setResults([])
    navigate(`/s/${space.id}`)
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

        {/* Search — takes all remaining space */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            value={query}
            onChange={handleSearch}
            onFocus={() => setFocused(true)}
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
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 10px', background: 'none', border: 'none',
                    color: '#d4d4d8', fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1c1c26'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.banner_color || '#4B9CD3', flexShrink: 0, display: 'inline-block' }} />
                  {s.name}
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
              style={{ fontSize: '11px', padding: '3px 8px', border: '1px solid #2a2a38', color: '#71717a' }}
            >
              &laquo; home
            </Link>
          )}
          <span className="mono header-username" style={{ fontSize: '11px', color: '#3f3f52' }}>
            logged in as <span style={{ color: '#4B9CD3' }}>demo_user</span>
          </span>
        </div>
      </div>
    </header>
  )
}
