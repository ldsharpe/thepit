import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import ReactionBar from '../components/ReactionBar'
import CommentThread from '../components/CommentThread'
import RoleBadge from '../components/RoleBadge'
import { useAuth } from '../context/AuthContext'

export default function PostPage() {
  const { spaceId, postId } = useParams()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const rootCommentId = searchParams.get('root') ? parseInt(searchParams.get('root')) : null
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then(r => r.json())
      .then(data => {
        const { comments: c, ...p } = data
        setPost(p)
        setComments(c || [])
        setLoading(false)
      })
  }, [postId])

  async function submitComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId, content: commentText.trim() }),
      })
      const newComment = await res.json()
      setComments(prev => [...prev, newComment])
      setCommentText('')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '24px', color: '#8a8a9a', fontSize: '13px' }}>Loading...</div>
  if (!post || post.error) return <div style={{ padding: '24px', color: '#e05252', fontSize: '13px' }}>Post not found.</div>

  const topLevelComments = rootCommentId
    ? comments.filter(c => c.id === rootCommentId)
    : comments.filter(c => !c.parent_comment_id)

  return (
    <div>
      {/* Post */}
      <div style={{ border: '1px solid #2a2a38', background: '#16161e', display: 'flex', marginBottom: '12px' }}>
        {/* Score */}
        <div style={{
          width: '48px', flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start', padding: '12px 0',
          borderRight: '1px solid #2a2a38', background: '#13131b',
        }}>
          <ReactionBar
            likes={post.likes}
            dislikes={post.dislikes}
            targetType="post"
            targetId={post.id}
            userReaction={post.userReaction}
            vertical
            onReaction={data => setPost(p => ({ ...p, ...data }))}
          />
        </div>

        <div style={{ flex: 1, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span style={{ width: '7px', height: '7px', background: post.space_banner_color || '#4B9CD3', flexShrink: 0, display: 'inline-block' }} />
            <Link
              to={`/s/${spaceId}`}
              className="unbounded no-underline"
              style={{ fontSize: '10px', color: '#4B9CD3', fontWeight: '700' }}
            >
              {post.space_name}
            </Link>
            <span style={{ fontSize: '11px', color: '#8a8a9a' }}>·</span>
            <span style={{ fontSize: '11px', color: '#8a8a9a' }}>posted by</span>
            <span style={{ fontSize: '11px', color: '#9a9aaa' }}>{post.username}</span>
            <RoleBadge role={post.author_role} />
            <span style={{ fontSize: '11px', color: '#8a8a9a' }}>· {timeAgo(post.created_at)}</span>
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#e4e4e7', lineHeight: '1.3', marginBottom: '10px' }}>
            {post.title}
          </h1>
          {post.content && (
            <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {post.content}
            </p>
          )}
        </div>
      </div>

      {/* Comment box */}
      <div style={{ border: '1px solid #2a2a38', background: '#16161e', padding: '12px', marginBottom: '12px' }}>
        {user ? (
          <>
            <div className="mono" style={{ fontSize: '11px', color: '#8a8a9a', marginBottom: '8px' }}>
              commenting as <span style={{ color: '#4B9CD3' }}>{user.username}</span>
            </div>
            <form onSubmit={submitComment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="What are your thoughts?"
                rows={3}
                style={{
                  padding: '6px 8px', background: '#0e0e12', border: '1px solid #2a2a38',
                  color: '#d4d4d8', fontSize: '13px', outline: 'none', resize: 'vertical',
                  width: '100%', fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  alignSelf: 'flex-end', padding: '5px 12px',
                  background: '#4B9CD3', border: 'none', color: '#0e0e12',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  fontFamily: 'IBM Plex Mono, monospace', opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'posting...' : 'submit'}
              </button>
            </form>
          </>
        ) : (
          <div className="mono" style={{ fontSize: '12px', color: '#8a8a9a', textAlign: 'center', padding: '8px 0' }}>
            <Link to="/login" style={{ color: '#4B9CD3' }}>Log in</Link> to leave a comment
          </div>
        )}
      </div>

      {/* Focused thread banner */}
      {rootCommentId && (
        <div style={{
          border: '1px solid #2a2a38', borderBottom: 'none', background: '#1c1c26',
          padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span className="mono" style={{ fontSize: '11px', color: '#8a8a9a' }}>viewing a single thread</span>
          <Link
            to={`/s/${spaceId}/post/${postId}`}
            className="mono"
            style={{ fontSize: '11px', color: '#4B9CD3' }}
          >
            ← back to full thread
          </Link>
        </div>
      )}

      {/* Comments */}
      <div style={{ border: '1px solid #2a2a38', background: '#16161e' }}>
        <div className="unbounded" style={{
          padding: '6px 12px', fontSize: '9px', color: '#a1a1aa',
          borderBottom: '1px solid #2a2a38', background: '#1c1c26',
          letterSpacing: '1px',
        }}>
          {comments.length} COMMENT{comments.length !== 1 ? 'S' : ''}
        </div>
        <div style={{ padding: '8px 12px' }}>
          {topLevelComments.length === 0 ? (
            <div style={{ padding: '16px 0', color: '#8a8a9a', fontSize: '13px' }}>
              No comments yet. Be the first!
            </div>
          ) : (
            <CommentThread
              comments={topLevelComments}
              allComments={comments}
              postId={postId}
              onNewComment={c => setComments(prev => [...prev, c])}
            />
          )}
        </div>
      </div>
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
