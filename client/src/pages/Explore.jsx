import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const CATEGORIES = ['All', 'General', 'Gaming', 'Science', 'Tech', 'Sports', 'Entertainment', 'News', 'Creative', 'Other']

export default function Explore() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('new')
  const [category, setCategory] = useState('All')

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

  const filtered = spaces.filter(s => category === 'All' || (s.category || 'General') === category)
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'popular') return (b.member_count ?? 0) - (a.member_count ?? 0)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  function onJoinChange(id, update) {
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, ...update } : s))
  }

  return (
    <div>
      {/* Header bar */}
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

      {/* Category filter */}
      <div style={{
        display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '6px 10px',
        background: '#16161e', border: '1px solid #2a2a38', borderBottom: 'none',
      }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="mono"
            style={{
              padding: '2px 8px', fontSize: '10px', cursor: 'pointer',
              background: category === c ? '#2a2a38' : 'transparent',
              color: category === c ? '#e4e4e7' : '#52525b',
              border: category === c ? '1px solid #4B9CD3' : '1px solid #2a2a38',
            }}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ border: '1px solid #2a2a38' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#52525b', fontSize: '13px' }}>
            Loading...
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#52525b', fontSize: '13px' }}>
            {category !== 'All' ? `No ${category} spaces yet.` : 'No spaces yet. Be the first to create one!'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {sorted.map(space => (
              <SpaceCard key={space.id} space={space} onJoinChange={onJoinChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SpaceCard({ space, onJoinChange }) {
  const [joining, setJoining] = useState(false)
  const displayIcon = space.icon?.trim() || space.name[0].toUpperCase()

  async function handleJoin(e) {
    e.preventDefault()
    e.stopPropagation()
    setJoining(true)
    try {
      const action = space.is_member ? 'leave' : 'join'
      const res = await fetch(`/api/spaces/${space.id}/${action}`, { method: 'POST' })
      if (!res.ok) return
      const data = await res.json()
      onJoinChange(space.id, { is_member: data.is_member, member_count: data.member_count })
    } finally {
      setJoining(false)
    }
  }

  return (
    <Link
      to={`/s/${space.id}`}
      className="no-underline"
      style={{ display: 'block', background: '#0e0e12', padding: '14px', borderRight: '1px solid #2a2a38', borderBottom: '1px solid #2a2a38' }}
    >
      {/* Icon + name + join */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '36px', height: '36px', flexShrink: 0,
          background: space.banner_color || '#4B9CD3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Unbounded, sans-serif', fontWeight: '900',
          fontSize: '14px', color: '#0e0e12',
        }}>
          {displayIcon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
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
        <button
          onClick={handleJoin}
          disabled={joining}
          className="mono"
          style={{
            flexShrink: 0,
            padding: '3px 8px', fontSize: '10px', fontWeight: '700', cursor: 'pointer',
            background: space.is_member ? 'transparent' : '#4B9CD3',
            color: space.is_member ? '#52525b' : '#0e0e12',
            border: space.is_member ? '1px solid #2a2a38' : 'none',
            opacity: joining ? 0.5 : 1,
          }}
        >
          {joining ? '...' : space.is_member ? 'joined' : 'join'}
        </button>
      </div>

      {/* Category tag */}
      {space.category && space.category !== 'General' && (
        <div className="mono" style={{
          display: 'inline-block', fontSize: '9px', color: '#52525b',
          border: '1px solid #2a2a38', padding: '1px 5px', marginBottom: '8px',
          letterSpacing: '0.5px',
        }}>
          {space.category.toUpperCase()}
        </div>
      )}

      {/* Description */}
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
