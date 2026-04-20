import { useState } from 'react'

export default function ReactionBar({ likes, dislikes, targetType, targetId, onReaction, userReaction, vertical }) {
  const [localLikes, setLocalLikes] = useState(Number(likes))
  const [localDislikes, setLocalDislikes] = useState(Number(dislikes))
  const [myReaction, setMyReaction] = useState(userReaction ?? null)
  const [loading, setLoading] = useState(false)

  async function react(value) {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, value }),
      })
      const data = await res.json()
      setLocalLikes(data.likes)
      setLocalDislikes(data.dislikes)
      setMyReaction(data.userReaction)
      onReaction?.({ likes: data.likes, dislikes: data.dislikes, userReaction: data.userReaction })
    } finally {
      setLoading(false)
    }
  }

  const netScore = localLikes - localDislikes

  if (vertical) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <button
          onClick={() => react(1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px',
            fontSize: '14px', lineHeight: 1,
            color: myReaction === 1 ? '#4B9CD3' : '#6b6b80',
          }}
          onMouseEnter={e => { if (myReaction !== 1) e.currentTarget.style.color = '#a0a0b8' }}
          onMouseLeave={e => { if (myReaction !== 1) e.currentTarget.style.color = '#6b6b80' }}
        >
          ▲
        </button>
        <span
          className="mono"
          style={{
            fontSize: '12px', fontWeight: '700', lineHeight: 1,
            color: netScore > 0 ? '#4B9CD3' : netScore < 0 ? '#e05252' : '#71717a',
          }}
        >
          {netScore}
        </span>
        <button
          onClick={() => react(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px',
            fontSize: '14px', lineHeight: 1,
            color: myReaction === -1 ? '#e05252' : '#6b6b80',
          }}
          onMouseEnter={e => { if (myReaction !== -1) e.currentTarget.style.color = '#a0a0b8' }}
          onMouseLeave={e => { if (myReaction !== -1) e.currentTarget.style.color = '#6b6b80' }}
        >
          ▼
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={() => react(1)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
          fontSize: '13px', color: myReaction === 1 ? '#4B9CD3' : '#6b6b80', display: 'flex', alignItems: 'center', gap: '4px',
        }}
        onMouseEnter={e => { if (myReaction !== 1) e.currentTarget.style.color = '#a0a0b8' }}
        onMouseLeave={e => { if (myReaction !== 1) e.currentTarget.style.color = '#6b6b80' }}
      >
        ▲ <span className="mono" style={{ fontSize: '12px' }}>{localLikes}</span>
      </button>
      <button
        onClick={() => react(-1)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
          fontSize: '13px', color: myReaction === -1 ? '#e05252' : '#6b6b80', display: 'flex', alignItems: 'center', gap: '4px',
        }}
        onMouseEnter={e => { if (myReaction !== -1) e.currentTarget.style.color = '#a0a0b8' }}
        onMouseLeave={e => { if (myReaction !== -1) e.currentTarget.style.color = '#6b6b80' }}
      >
        ▼ <span className="mono" style={{ fontSize: '12px' }}>{localDislikes}</span>
      </button>
    </div>
  )
}
