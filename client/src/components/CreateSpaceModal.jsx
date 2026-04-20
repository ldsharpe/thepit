import { useState } from 'react'

const COLORS = ['#4B9CD3', '#e85d4a', '#4caf7d', '#f5a623', '#9b59b6', '#e91e8c']

export default function CreateSpaceModal({ onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#4B9CD3')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description, banner_color: color }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create space')
        return
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        background: 'rgba(0,0,0,0.75)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: '100%', maxWidth: '400px', background: '#16161e', border: '1px solid #2a2a38' }}>
        {/* Title bar */}
        <div style={{
          padding: '8px 12px', background: '#4B9CD3', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span className="unbounded" style={{ fontSize: '9px', fontWeight: '700', color: '#0e0e12', letterSpacing: '1px' }}>
            CREATE A SPACE
          </span>
          <button
            onClick={onClose}
            className="mono"
            style={{ background: 'none', border: 'none', color: '#0e0e12', cursor: 'pointer', fontSize: '14px', fontWeight: '700', padding: '0 4px' }}
          >
            x
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>
              NAME *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. gaming, news, random"
              maxLength={50}
              style={{
                width: '100%', padding: '6px 8px',
                background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this space about?"
              rows={3}
              style={{
                width: '100%', padding: '6px 8px',
                background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#71717a', marginBottom: '6px' }}>
              ACCENT COLOR
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '22px', height: '22px', background: c,
                    border: color === c ? `2px solid #fff` : '2px solid transparent',
                    cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="mono" style={{ fontSize: '11px', color: '#e05252' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '5px 12px', background: 'none',
                border: '1px solid #2a2a38', color: '#71717a',
                cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit',
              }}
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="mono"
              style={{
                padding: '5px 14px', background: '#4B9CD3',
                border: 'none', color: '#0e0e12',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'creating...' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
