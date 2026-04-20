import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'

export default function Popular() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/spaces')
      .then(r => r.json())
      .then(async allSpaces => {
        const postArrays = await Promise.all(
          allSpaces.map(s =>
            fetch(`/api/posts/space/${s.id}?sort=top`)
              .then(r => r.json())
              .then(posts => posts.map(p => ({ ...p, spaceName: s.name, spaceColor: s.banner_color })))
          )
        )
        const all = postArrays.flat()
        all.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
        setPosts(all)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div style={{
        padding: '6px 10px', background: '#1c1c26',
        border: '1px solid #2a2a38', borderBottom: 'none',
      }}>
        <span className="unbounded" style={{ fontSize: '9px', color: '#a1a1aa', letterSpacing: '1px' }}>
          POPULAR POSTS
        </span>
      </div>
      <div style={{ border: '1px solid #2a2a38' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#8a8a9a', fontSize: '13px' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#8a8a9a', fontSize: '13px' }}>No posts yet.</div>
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
