import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactionBar from '../components/ReactionBar'
import CommentThread from '../components/CommentThread'

export default function PostPage() {
  const { spaceId, postId } = useParams()
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
        body: JSON.stringify({ post_id: postId, content: commentText.trim() }),
      })
      const newComment = await res.json()
      setComments(prev => [...prev, newComment])
      setCommentText('')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '24px', color: '#52525b', fontSize: '13px' }}>Loading...</div>
  if (!post || post.error) return <div style={{ padding: '24px', color: '#e05252', fontSize: '13px' }}>Post not found.</div>

  const topLevelComments = comments.filter(c => !c.parent_comment_id)

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
          <div style={{ fontSize: '11px', color: '#52525b', marginBottom: '6px' }}>
            posted by <span style={{ color: '#71717a' }}>{post.username}</span>
            {' · '}{timeAgo(post.created_at)}
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
        <div className="mono" style={{ fontSize: '11px', color: '#52525b', marginBottom: '8px' }}>
          commenting as <span style={{ color: '#4B9CD3' }}>demo_user</span>
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
      </div>

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
            <div style={{ padding: '16px 0', color: '#52525b', fontSize: '13px' }}>
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
