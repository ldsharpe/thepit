import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import RoleBadge from '../components/RoleBadge'

const COLORS = ['#4B9CD3', '#e85d4a', '#4caf7d', '#f5a623', '#9b59b6', '#e91e8c', '#00bcd4', '#ff9800']
const CATEGORIES = ['General', 'Gaming', 'Science', 'Tech', 'Sports', 'Entertainment', 'News', 'Creative', 'Other']

export default function SpaceSettings() {
  const { spaceId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [space, setSpace] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#4B9CD3')
  const [category, setCategory] = useState('General')
  const [rules, setRules] = useState('')
  const [icon, setIcon] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/spaces/${spaceId}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/spaces/${spaceId}/members`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([s, m]) => {
      if (s.error || s.user_role !== 'coordinator') {
        navigate(`/s/${spaceId}`)
        return
      }
      setSpace(s)
      setDescription(s.description || '')
      setColor(s.banner_color || '#4B9CD3')
      setCategory(s.category || 'General')
      setRules(s.rules || '')
      setIcon(s.icon || '')
      setMembers(m)
      setLoading(false)
    })
  }, [spaceId])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/spaces/${spaceId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description, banner_color: color, category, rules, icon }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function setMemberRole(memberId, role) {
    const res = await fetch(`/api/spaces/${spaceId}/members/${memberId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    })
    if (!res.ok) return
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
  }

  if (loading) return <div style={{ padding: '24px', color: '#8a8a9a', fontSize: '13px' }}>Loading...</div>

  const displayIcon = icon.trim() || (space?.name?.[0]?.toUpperCase() || '?')

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ border: '1px solid #2a2a38', background: '#16161e' }}>
        <div style={{ padding: '8px 12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="unbounded" style={{ fontSize: '9px', fontWeight: '700', color: '#0e0e12', letterSpacing: '1px' }}>
            SETTINGS — {space.name}
          </span>
          <button
            onClick={() => navigate(`/s/${spaceId}`)}
            className="mono"
            style={{ background: 'none', border: 'none', color: '#0e0e12', cursor: 'pointer', fontSize: '11px' }}
          >
            back to space
          </button>
        </div>

        {/* Settings form */}
        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Preview + icon */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
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
              <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>ICON</label>
              <input
                value={icon}
                onChange={e => setIcon(e.target.value.slice(0, 2))}
                placeholder={space.name[0].toUpperCase()}
                maxLength={2}
                style={{
                  width: '80px', padding: '7px 10px',
                  background: '#0e0e12', border: '1px solid #2a2a38',
                  color: '#d4d4d8', fontSize: '14px', outline: 'none',
                  fontFamily: 'Unbounded, sans-serif', textAlign: 'center',
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>CATEGORY</label>
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

          {/* Description */}
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
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
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>RULES</label>
            <textarea
              value={rules}
              onChange={e => setRules(e.target.value)}
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
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '8px' }}>ACCENT COLOR</label>
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

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
            {saved && <span className="mono" style={{ fontSize: '11px', color: '#4caf7d' }}>saved</span>}
            <button
              type="submit"
              disabled={saving}
              className="mono"
              style={{
                padding: '7px 18px', background: '#4B9CD3',
                border: 'none', color: '#0e0e12',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'saving...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>

      {/* Members */}
      <div style={{ border: '1px solid #2a2a38', background: '#16161e' }}>
        <div style={{ padding: '8px 12px', background: '#1c1c26', borderBottom: '1px solid #2a2a38' }}>
          <span className="unbounded" style={{ fontSize: '9px', color: '#a1a1aa', letterSpacing: '1px' }}>
            MEMBERS — {members.length}
          </span>
        </div>

        <div>
          {members.map(member => (
            <div
              key={member.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderBottom: '1px solid #2a2a38',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#e4e4e7', fontWeight: '600' }}>{member.username}</span>
                  <RoleBadge role={member.role} />
                </div>
                <div className="mono" style={{ fontSize: '10px', color: '#8a8a9a', marginTop: '2px' }}>
                  {member.post_count} post{member.post_count !== 1 ? 's' : ''} · joined {formatDate(member.joined_at)}
                </div>
              </div>

              {/* Role controls — only for non-coordinators */}
              {member.role !== 'coordinator' && member.id !== user?.id && (
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {member.role === 'member' ? (
                    <button
                      onClick={() => setMemberRole(member.id, 'helper')}
                      className="mono"
                      style={{
                        padding: '3px 8px', fontSize: '10px', cursor: 'pointer',
                        background: 'transparent', border: '1px solid #4caf7d',
                        color: '#4caf7d',
                      }}
                    >
                      make helper
                    </button>
                  ) : (
                    <button
                      onClick={() => setMemberRole(member.id, 'member')}
                      className="mono"
                      style={{
                        padding: '3px 8px', fontSize: '10px', cursor: 'pointer',
                        background: 'transparent', border: '1px solid #2a2a38',
                        color: '#8a8a9a',
                      }}
                    >
                      remove helper
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr + (dateStr.includes('Z') ? '' : 'Z'))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
