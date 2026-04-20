import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [sort, setSort] = useState('new')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/spaces')
      .then(r => r.json())
      .then(async allSpaces => {
        const postArrays = await Promise.all(
          allSpaces.map(s =>
            fetch(`/api/posts/space/${s.id}?sort=${sort}`)
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
  }, [sort])

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

      {/* Post list */}
      <div style={{ border: '1px solid #2a2a38' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#52525b', fontSize: '13px' }}>
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#52525b' }}>
            <div style={{ fontSize: '13px', marginBottom: '6px', color: '#71717a' }}>No posts yet.</div>
            <div style={{ fontSize: '12px' }}>Create a space and post something to get started.</div>
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
