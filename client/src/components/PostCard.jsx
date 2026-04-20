import { Link, useNavigate } from 'react-router-dom'
import ReactionBar from './ReactionBar'

export default function PostCard({ post, spaceId, spaceName, spaceColor, onReaction }) {
  const navigate = useNavigate()
  const postUrl = `/s/${spaceId}/post/${post.id}`

  return (
    <div
      onClick={() => navigate(postUrl)}
      style={{ borderBottom: '1px solid #2a2a38', background: '#16161e', display: 'flex', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.background = '#1a1a24'}
      onMouseLeave={e => e.currentTarget.style.background = '#16161e'}
    >
      {/* Score column — clicks here shouldn't navigate */}
      <div
        onClick={e => e.stopPropagation()}
        className="score-col"
        style={{
          width: '48px', flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '8px 0',
          borderRight: '1px solid #2a2a38',
          background: '#13131b',
          gap: '2px',
        }}
      >
        <ReactionBar
          likes={post.likes}
          dislikes={post.dislikes}
          targetType="post"
          targetId={post.id}
          onReaction={onReaction}
          userReaction={post.userReaction}
          vertical
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '8px 12px', minWidth: 0 }}>
        {spaceName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: spaceColor || '#4B9CD3', flexShrink: 0, display: 'inline-block' }} />
            <Link
              to={`/s/${spaceId}`}
              onClick={e => e.stopPropagation()}
              className="unbounded no-underline"
              style={{ fontSize: '10px', color: '#4B9CD3', fontWeight: '700' }}
            >
              {spaceName}
            </Link>
            <span style={{ color: '#52525b', fontSize: '11px' }}>·</span>
            <span style={{ fontSize: '11px', color: '#8a8a9a' }}>
              {post.username} · {timeAgo(post.created_at)}
            </span>
          </div>
        )}
        {!spaceName && (
          <div style={{ fontSize: '11px', color: '#8a8a9a', marginBottom: '3px' }}>
            {post.username} · {timeAgo(post.created_at)}
          </div>
        )}

        <div style={{ fontSize: '14px', fontWeight: '700', color: '#e4e4e7', lineHeight: '1.3', marginBottom: '4px' }}>
          {post.title}
        </div>

        {post.content && (
          <div style={{ fontSize: '13px', color: '#9a9aaa', marginBottom: '5px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {post.content}
          </div>
        )}

        <span className="mono" style={{ fontSize: '11px', color: '#8a8a9a' }}>
          {post.comment_count ?? 0} comment{post.comment_count !== 1 ? 's' : ''}
        </span>
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
