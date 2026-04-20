import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [sort, setSort] = useState('new')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user === undefined) return
    if (user === null) { setLoading(false); return }

    setLoading(true)
    fetch('/api/spaces', { credentials: 'include' })
      .then(r => r.json())
      .then(async allSpaces => {
        const followed = allSpaces.filter(s => s.is_member)
        if (followed.length === 0) { setPosts(null); setLoading(false); return }

        const postArrays = await Promise.all(
          followed.map(s =>
            fetch(`/api/posts/space/${s.id}?sort=${sort}`, { credentials: 'include' })
              .then(r => r.json())
              .then(posts => posts.map(p => ({ ...p, spaceName: s.name, spaceColor: s.banner_color })))
          )
        )
        const all = postArrays.flat()
        if (sort === 'new') {
          all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        } else {
          all.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
        }
        setPosts(all)
        setLoading(false)
      })
  }, [sort, user])

  if (user === undefined) return null

  if (user === null) {
    return (
      <div style={{
        border: '1px solid #2a2a38', background: '#16161e',
        padding: '48px 24px', textAlign: 'center',
      }}>
        <div className="unbounded" style={{ fontSize: '13px', color: '#d4d4d8', marginBottom: '8px', letterSpacing: '0.5px' }}>
          YOUR FEED
        </div>
        <div className="mono" style={{ fontSize: '12px', color: '#8a8a9a', marginBottom: '20px' }}>
          Log in to see posts from spaces you follow.
        </div>
        <Link
          to="/login"
          className="mono no-underline"
          style={{
            fontSize: '12px', padding: '6px 16px',
            background: '#4B9CD3', color: '#0e0e12', fontWeight: '700',
          }}
        >
          log in
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Sort bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px',
        background: '#1c1c26', border: '1px solid #2a2a38', borderBottom: 'none',
      }}>
        <span className="unbounded" style={{ fontSize: '9px', color: '#a1a1aa', letterSpacing: '1px' }}>
          {sort === 'new' ? 'NEW POSTS' : 'TOP POSTS'}
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
                color: sort === s ? '#0e0e12' : '#9a9aaa',
                border: sort === s ? '1px solid #4B9CD3' : '1px solid #2a2a38',
                fontWeight: sort === s ? '700' : '400',
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      <div style={{ border: '1px solid #2a2a38' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#8a8a9a', fontSize: '13px' }}>
            Loading...
          </div>
        ) : posts === null ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '13px', color: '#9a9aaa', marginBottom: '16px' }}>
              You're not following any spaces yet.
            </div>
            <Link
              to="/explore"
              className="mono no-underline"
              style={{
                fontSize: '12px', padding: '5px 14px',
                border: '1px solid #4B9CD3', color: '#4B9CD3',
              }}
            >
              explore spaces
            </Link>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#8a8a9a' }}>
            <div style={{ fontSize: '13px', color: '#9a9aaa' }}>No posts yet in your spaces.</div>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              spaceId={post.space_id}
              spaceName={post.spaceName}
              spaceColor={post.spaceColor}
              onReaction={data => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...data } : p))}
            />
          ))
        )}
      </div>
    </div>
  )
}
