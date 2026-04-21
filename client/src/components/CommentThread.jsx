import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactionBar from './ReactionBar'
import RoleBadge from './RoleBadge'
import { useAuth } from '../context/AuthContext'

function netScore(c) { return Number(c.likes ?? 0) - Number(c.dislikes ?? 0) }
function sortByScore(arr) { return [...arr].sort((a, b) => netScore(b) - netScore(a)) }

const MAX_INDENT = 5

export default function CommentThread({ comments, allComments, postId, depth = 0, onNewComment }) {
  const all = allComments ?? comments
  return (
    <div className={depth > 0 && depth <= MAX_INDENT ? 'comment-indent' : ''}>
      {sortByScore(comments).map(c => (
        <Comment key={c.id} comment={c} allComments={all} postId={postId} depth={depth} onNewComment={onNewComment} />
      ))}
    </div>
  )
}

function Comment({ comment, allComments, postId, depth, onNewComment }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { spaceId } = useParams()
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [lineHover, setLineHover] = useState(false)
  const [reactions, setReactions] = useState({ likes: comment.likes, dislikes: comment.dislikes, userReaction: comment.userReaction ?? null })
  const headerRef = useRef(null)

  function toggleCollapsed() {
    if (!collapsed && headerRef.current) {
      const y = headerRef.current.getBoundingClientRect().top
      setCollapsed(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (headerRef.current) {
            window.scrollBy(0, headerRef.current.getBoundingClientRect().top - y)
          }
        })
      })
    } else {
      setCollapsed(c => !c)
    }
  }

  const children = sortByScore(allComments.filter(c => c.parent_comment_id === comment.id))

  async function submitReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId, content: replyText.trim(), parent_comment_id: comment.id }),
      })
      const newComment = await res.json()
      onNewComment(newComment)
      setReplyText('')
      setReplying(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ paddingTop: '10px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>

        {/* Left gutter: reaction bar + clickable collapse line */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '24px' }}>
          {!collapsed && (
            <ReactionBar
              likes={reactions.likes}
              dislikes={reactions.dislikes}
              targetType="comment"
              targetId={comment.id}
              userReaction={reactions.userReaction}
              vertical
              onReaction={data => setReactions(data)}
            />
          )}
          {children.length > 0 && (
            <div
              onClick={toggleCollapsed}
              onMouseEnter={() => setLineHover(true)}
              onMouseLeave={() => setLineHover(false)}
              title={collapsed ? 'Expand' : 'Collapse'}
              style={{
                flex: 1,
                width: '2px',
                minHeight: '16px',
                marginTop: '6px',
                background: lineHover ? '#4B9CD3' : '#2a2a38',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
            />
          )}
        </div>

        {/* Right: content + children */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            ref={headerRef}
            onClick={toggleCollapsed}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: '600' }}>{comment.username}</span>
            <RoleBadge role={comment.author_role} />
            <span style={{ fontSize: '11px', color: '#8a8a9a' }}>{timeAgo(comment.created_at)}</span>
            {collapsed && children.length > 0 && (
              <span style={{ fontSize: '11px', color: '#8a8a9a' }}>
                · {children.length} repl{children.length === 1 ? 'y' : 'ies'} hidden
              </span>
            )}
          </div>

          {!collapsed && (
            <>
              <p style={{ fontSize: '13px', color: '#a1a1aa', whiteSpace: 'pre-wrap', lineHeight: '1.5', marginBottom: '6px' }}>
                {comment.content}
              </p>
              {user && (
                <button
                  onClick={() => setReplying(r => !r)}
                  className="mono"
                  style={{
                    fontSize: '11px', color: replying ? '#4B9CD3' : '#8a8a9a',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                  onMouseEnter={e => { if (!replying) e.currentTarget.style.color = '#a1a1aa' }}
                  onMouseLeave={e => { if (!replying) e.currentTarget.style.color = replying ? '#4B9CD3' : '#8a8a9a' }}
                >
                  {replying ? 'cancel' : 'reply'}
                </button>
              )}
              {replying && (
                <form onSubmit={submitReply} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows={2}
                    style={{
                      padding: '5px 8px', background: '#0e0e12', border: '1px solid #2a2a38',
                      color: '#d4d4d8', fontSize: '12px', outline: 'none', resize: 'vertical',
                      width: '100%', fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mono"
                    style={{
                      alignSelf: 'flex-end', padding: '3px 10px',
                      background: '#4B9CD3', border: 'none', color: '#0e0e12',
                      fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    {submitting ? 'posting...' : 'reply'}
                  </button>
                </form>
              )}
            </>
          )}

          {children.length > 0 && (
            depth >= MAX_INDENT ? (
              !collapsed && (
                <button
                  onClick={() => navigate(`/s/${spaceId}/post/${postId}?root=${comment.id}`)}
                  className="mono"
                  style={{
                    marginTop: '6px', padding: '3px 8px', fontSize: '11px',
                    background: 'transparent', border: '1px solid #2a2a38',
                    color: '#4B9CD3', cursor: 'pointer',
                  }}
                >
                  show {children.length} repl{children.length === 1 ? 'y' : 'ies'} →
                </button>
              )
            ) : (
              <div style={{ display: collapsed ? 'none' : 'block' }}>
                <CommentThread
                  comments={children}
                  allComments={allComments}
                  postId={postId}
                  depth={depth + 1}
                  onNewComment={onNewComment}
                />
              </div>
            )
          )}
        </div>
      </div>
      <div style={{ borderBottom: '1px solid #1e1e28', marginTop: '10px' }} />
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
