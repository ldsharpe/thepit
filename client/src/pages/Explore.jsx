import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Explore() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('new')

  function fetchSpaces() {
    fetch('/api/spaces')
      .then(r => r.json())
      .then(data => { setSpaces(data); setLoading(false) })
  }

  useEffect(() => {
    fetchSpaces()
    window.addEventListener('space-created', fetchSpaces)
    return () => window.removeEventListener('space-created', fetchSpaces)
  }, [])

  const sorted = [...spaces].sort((a, b) => {
    if (sort === 'popular') return (b.member_count ?? 0) - (a.member_count ?? 0)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div>
      <div style={{
        padding: '6px 10px', background: '#1c1c26',
        border: '1px solid #2a2a38', borderBottom: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span className="unbounded" style={{ fontSize: '9px', color: '#a1a1aa', letterSpacing: '1px' }}>
          EXPLORE SPACES
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['new', 'popular'].map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="mono"
              style={{
                padding: '2px 8px', fontSize: '11px', cursor: 'pointer',
                background: sort === s ? '#4B9CD3' : 'transparent',
                color: sort === s ? '#0e0e12' : '#71717a',
                border: sort === s ? '1px solid #4B9CD3' : '1px solid #2a2a38',
                fontWeight: sort === s ? '700' : '400',
              }}
            >
              {s === 'new' ? 'NEW' : 'POPULAR'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid #2a2a38' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#52525b', fontSize: '13px' }}>
            Loading...
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#52525b', fontSize: '13px' }}>
            No spaces yet. Be the first to create one!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {sorted.map(space => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SpaceCard({ space }) {
  return (
    <Link
      to={`/s/${space.id}`}
      className="no-underline"
      style={{ display: 'block', background: '#0e0e12', padding: '16px', borderRight: '1px solid #2a2a38', borderBottom: '1px solid #2a2a38' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '36px', height: '36px', flexShrink: 0,
          background: space.banner_color || '#4B9CD3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Unbounded, sans-serif', fontWeight: '900',
          fontSize: '14px', color: '#0e0e12',
        }}>
          {space.name[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="unbounded" style={{
            fontSize: '11px', fontWeight: '700', color: '#e4e4e7',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {space.name}
          </div>
          <div className="mono" style={{ fontSize: '10px', color: '#52525b', marginTop: '2px' }}>
            {space.member_count ?? 0} member{space.member_count !== 1 ? 's' : ''} · {space.post_count ?? 0} post{space.post_count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: '12px', color: '#71717a', lineHeight: '1.5', margin: 0,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', minHeight: '18px',
      }}>
        {space.description || <span style={{ color: '#3f3f52', fontStyle: 'italic' }}>No description.</span>}
      </p>

      <div style={{ height: '2px', background: space.banner_color || '#4B9CD3', marginTop: '12px', opacity: 0.4 }} />
    </Link>
  )
}
