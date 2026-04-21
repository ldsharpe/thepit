import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('posts')
  const [editingBio, setEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')
  const [savingBio, setSavingBio] = useState(false)

  const isOwn = user?.username === username

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${username}`)
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setBioText(data.bio || '')
        setLoading(false)
      })
  }, [username])

  async function saveBio() {
    setSavingBio(true)
    try {
      await fetch(`/api/users/${username}/bio`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bio: bioText }),
      })
      setProfile(p => ({ ...p, bio: bioText.trim() || null }))
      setEditingBio(false)
    } finally {
      setSavingBio(false)
    }
  }

  if (loading) return <div style={{ padding: '24px', color: '#8a8a9a', fontSize: '13px' }}>Loading...</div>
  if (!profile || profile.error) return <div style={{ padding: '24px', color: '#e05252', fontSize: '13px' }}>User not found.</div>

  return (
    <div>
      {/* Header */}
      <div style={{ border: '1px solid #2a2a38', background: '#16161e', padding: '16px', marginBottom: '12px' }}>
        <h1 className="unbounded" style={{ fontSize: '16px', fontWeight: '900', color: '#e4e4e7', marginBottom: '4px' }}>
          {profile.username}
        </h1>
        <div className="mono" style={{ fontSize: '11px', color: '#8a8a9a', marginBottom: '12px' }}>
          joined {timeAgo(profile.created_at)} · <span style={{ color: '#4B9CD3' }}>{profile.totalLikes}</span> total likes received
        </div>

        {editingBio ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <textarea
              value={bioText}
              onChange={e => setBioText(e.target.value)}
              rows={3}
              maxLength={300}
              style={{
                padding: '6px 8px', background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', resize: 'vertical',
                width: '100%', fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={saveBio}
                disabled={savingBio}
                className="mono"
                style={{
                  padding: '3px 10px', background: '#4B9CD3', border: 'none',
                  color: '#0e0e12', fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', opacity: savingBio ? 0.6 : 1,
                }}
              >
                {savingBio ? 'saving...' : 'save'}
              </button>
              <button
                onClick={() => { setEditingBio(false); setBioText(profile.bio || '') }}
                className="mono"
                style={{
                  padding: '3px 10px', background: 'none', border: '1px solid #2a2a38',
                  color: '#8a8a9a', fontSize: '11px', cursor: 'pointer',
                }}
              >
                cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <p style={{ fontSize: '13px', color: profile.bio ? '#a1a1aa' : '#52525b', flex: 1, lineHeight: '1.5', margin: 0 }}>
              {profile.bio || (isOwn ? 'No bio yet. Add one!' : 'No bio.')}
            </p>
            {isOwn && (
              <button
                onClick={() => setEditingBio(true)}
                className="mono"
                style={{
                  flexShrink: 0, padding: '2px 8px', background: 'none',
                  border: '1px solid #2a2a38', color: '#8a8a9a', fontSize: '11px', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#a1a1aa'}
                onMouseLeave={e => e.currentTarget.style.color = '#8a8a9a'}
              >
                edit bio
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a38', marginBottom: '12px' }}>
        {['posts', 'comments'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="mono"
            style={{
              padding: '7px 14px', background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid #4B9CD3' : '2px solid transparent',
              color: tab === t ? '#4B9CD3' : '#8a8a9a',
              fontSize: '11px', cursor: 'pointer', marginBottom: '-1px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}
          >
            {t} ({t === 'posts' ? profile.posts.length : profile.comments.length})
          </button>
        ))}
      </div>

      {/* Posts */}
      {tab === 'posts' && (
        <div style={{ border: '1px solid #2a2a38' }}>
          {profile.posts.length === 0 ? (
            <div style={{ padding: '24px', color: '#8a8a9a', fontSize: '13px' }}>No posts yet.</div>
          ) : profile.posts.map(post => (
            <div
              key={post.id}
              style={{ borderBottom: '1px solid #2a2a38', background: '#16161e', padding: '10px 14px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a24'}
              onMouseLeave={e => e.currentTarget.style.background = '#16161e'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                <span style={{ width: '7px', height: '7px', background: post.space_banner_color || '#4B9CD3', flexShrink: 0, display: 'inline-block' }} />
                <Link to={`/s/${post.space_id}`} className="unbounded no-underline" style={{ fontSize: '10px', color: '#4B9CD3', fontWeight: '700' }}>
                  {post.space_name}
                </Link>
                <span style={{ fontSize: '11px', color: '#8a8a9a' }}>· {timeAgo(post.created_at)}</span>
              </div>
              <Link to={`/s/${post.space_id}/post/${post.id}`} className="no-underline">
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#e4e4e7', marginBottom: '4px', lineHeight: '1.3' }}>
                  {post.title}
                </div>
              </Link>
              <div className="mono" style={{ fontSize: '11px', color: '#8a8a9a' }}>
                {post.likes - post.dislikes} pts · {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments */}
      {tab === 'comments' && (
        <div style={{ border: '1px solid #2a2a38' }}>
          {profile.comments.length === 0 ? (
            <div style={{ padding: '24px', color: '#8a8a9a', fontSize: '13px' }}>No comments yet.</div>
          ) : profile.comments.map(comment => (
            <div key={comment.id} style={{ borderBottom: '1px solid #2a2a38', background: '#16161e', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: '11px', color: '#8a8a9a' }}>on</span>
                <Link to={`/s/${comment.space_id}/post/${comment.post_id}`} className="no-underline" style={{ fontSize: '12px', color: '#c4c4cc', fontWeight: '600' }}>
                  {comment.post_title}
                </Link>
                <span className="mono" style={{ fontSize: '11px', color: '#8a8a9a' }}>in</span>
                <Link to={`/s/${comment.space_id}`} className="unbounded no-underline" style={{ fontSize: '10px', color: '#4B9CD3', fontWeight: '700' }}>
                  {comment.space_name}
                </Link>
                <span style={{ fontSize: '11px', color: '#8a8a9a' }}>· {timeAgo(comment.created_at)}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 4px' }}>
                {comment.content}
              </p>
              <div className="mono" style={{ fontSize: '11px', color: '#8a8a9a' }}>
                {comment.likes - comment.dislikes} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
