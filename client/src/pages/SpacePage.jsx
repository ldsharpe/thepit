import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'

export default function SpacePage() {
  const { spaceId } = useParams()
  const [space, setSpace] = useState(null)
  const [posts, setPosts] = useState([])
  const [sort, setSort] = useState('new')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/spaces/${spaceId}`).then(r => r.json()),
      fetch(`/api/posts/space/${spaceId}?sort=${sort}`).then(r => r.json()),
    ]).then(([s, p]) => {
      setSpace(s)
      setPosts(p)
      setLoading(false)
    })
  }, [spaceId, sort])

  async function submitPost(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ space_id: spaceId, title: title.trim(), content: content.trim() }),
      })
      const newPost = await res.json()
      setPosts(prev => [{ ...newPost, likes: 0, dislikes: 0, comment_count: 0, username: 'demo_user' }, ...prev])
      setTitle('')
      setContent('')
      setShowCreate(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '24px', color: '#52525b', fontSize: '13px' }}>Loading...</div>
  if (!space || space.error) return <div style={{ padding: '24px', color: '#e05252', fontSize: '13px' }}>Space not found.</div>

  return (
    <div>
      {/* Space banner */}
      <div style={{
        background: '#16161e',
        borderTop: `3px solid ${space.banner_color || '#4B9CD3'}`,
        border: '1px solid #2a2a38',
        borderTop: `3px solid ${space.banner_color || '#4B9CD3'}`,
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '0',
      }}>
        <div style={{
          width: '36px', height: '36px', flexShrink: 0,
          background: space.banner_color || '#4B9CD3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '900', fontSize: '14px', color: '#0e0e12',
          fontFamily: 'Unbounded, sans-serif',
        }}>
          {space.name[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#e4e4e7', fontFamily: 'Unbounded, sans-serif' }}>{space.name}</div>
          {space.description && (
            <div style={{ fontSize: '12px', color: '#71717a' }}>{space.description}</div>
          )}
        </div>
        <button
          onClick={() => setShowCreate(s => !s)}
          style={{
            marginLeft: 'auto', padding: '5px 12px', fontSize: '12px', fontWeight: '700',
            background: '#4B9CD3', color: '#0e0e12', border: 'none', cursor: 'pointer',
            fontFamily: 'IBM Plex Mono, monospace',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#3a8bc2'}
          onMouseLeave={e => e.currentTarget.style.background = '#4B9CD3'}
        >
          + new post
        </button>
      </div>

      {/* Create post form */}
      {showCreate && (
        <div style={{ border: '1px solid #2a2a38', borderTop: 'none', background: '#1c1c26', padding: '12px' }}>
          <form onSubmit={submitPost} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Post title *"
              style={{
                padding: '6px 8px', background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', width: '100%',
                fontFamily: 'inherit',
              }}
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Body (optional)"
              rows={4}
              style={{
                padding: '6px 8px', background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', resize: 'vertical',
                width: '100%', fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{ padding: '5px 10px', background: 'none', border: '1px solid #2a2a38', color: '#71717a', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '5px 12px', background: '#4B9CD3', border: 'none', color: '#0e0e12',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                  fontFamily: 'IBM Plex Mono, monospace', opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'posting...' : 'submit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sort bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 10px',
        background: '#1c1c26', border: '1px solid #2a2a38',
        borderTop: showCreate ? '1px solid #2a2a38' : 'none',
      }}>
        <span className="unbounded" style={{ fontSize: '9px', color: '#a1a1aa', letterSpacing: '1px' }}>
          SORT BY
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['new', 'top'].map(s => (
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
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div style={{ border: '1px solid #2a2a38', borderTop: 'none' }}>
        {posts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#52525b', fontSize: '13px' }}>
            No posts yet. Be the first to post!
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              spaceId={spaceId}
              onReaction={data => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...data } : p))}
            />
          ))
        )}
      </div>
    </div>
  )
}
