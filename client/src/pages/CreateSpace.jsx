import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#4B9CD3', '#e85d4a', '#4caf7d', '#f5a623', '#9b59b6', '#e91e8c', '#00bcd4', '#ff9800']
const CATEGORIES = ['General', 'Gaming', 'Science', 'Tech', 'Sports', 'Entertainment', 'News', 'Creative', 'Other']

export default function CreateSpace() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [color, setColor] = useState('#4B9CD3')
  const [category, setCategory] = useState('General')
  const [icon, setIcon] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const displayIcon = icon.trim() || (name.trim() ? name.trim()[0].toUpperCase() : '?')

  if (!user) {
    navigate('/login')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description,
          banner_color: color,
          category,
          rules,
          icon: icon.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create space')
        return
      }
      const space = await res.json()
      window.dispatchEvent(new Event('space-created'))
      navigate(`/s/${space.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ border: '1px solid #2a2a38', background: '#16161e' }}>
        <div style={{ padding: '8px 12px', background: '#4B9CD3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="unbounded" style={{ fontSize: '9px', fontWeight: '700', color: '#0e0e12', letterSpacing: '1px' }}>
            CREATE A SPACE
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Preview + Name */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{
              width: '52px', height: '52px', flexShrink: 0,
              background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Unbounded, sans-serif', fontWeight: '900',
              fontSize: '20px', color: '#0e0e12',
            }}>
              {displayIcon}
            </div>
            <div style={{ flex: 1 }}>
              <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>
                NAME *
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. gaming, news, random"
                maxLength={50}
                autoFocus
                style={{
                  width: '100%', padding: '7px 10px',
                  background: '#0e0e12', border: '1px solid #2a2a38',
                  color: '#d4d4d8', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Icon + Category */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: '90px' }}>
              <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>
                ICON
              </label>
              <input
                value={icon}
                onChange={e => setIcon(e.target.value.slice(0, 2))}
                placeholder={name.trim() ? name.trim()[0].toUpperCase() : '?'}
                maxLength={2}
                style={{
                  width: '100%', padding: '7px 10px',
                  background: '#0e0e12', border: '1px solid #2a2a38',
                  color: '#d4d4d8', fontSize: '14px', outline: 'none',
                  fontFamily: 'Unbounded, sans-serif', textAlign: 'center',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>
                CATEGORY
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px',
                  background: '#0e0e12', border: '1px solid #2a2a38',
                  color: '#d4d4d8', fontSize: '13px', outline: 'none',
                  fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this space about?"
              rows={3}
              style={{
                width: '100%', padding: '7px 10px',
                background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Rules */}
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>
              RULES <span style={{ color: '#52525b' }}>(optional)</span>
            </label>
            <textarea
              value={rules}
              onChange={e => setRules(e.target.value)}
              placeholder="e.g. Be respectful. No spam. Stay on topic."
              rows={4}
              style={{
                width: '100%', padding: '7px 10px',
                background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Color */}
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '8px' }}>
              ACCENT COLOR
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '26px', height: '26px', background: c,
                    border: color === c ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="mono" style={{ fontSize: '11px', color: '#e05252', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '7px 14px', background: 'none',
                border: '1px solid #2a2a38', color: '#8a8a9a',
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
                padding: '7px 18px', background: '#4B9CD3',
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
