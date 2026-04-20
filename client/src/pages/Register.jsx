import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Registration failed')
      setUser(data)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '360px', margin: '40px auto' }}>
      <div style={{ border: '1px solid #2a2a38', background: '#16161e' }}>
        <div style={{ padding: '8px 12px', background: '#4B9CD3' }}>
          <span className="unbounded" style={{ fontSize: '9px', fontWeight: '700', color: '#0e0e12', letterSpacing: '1px' }}>
            CREATE ACCOUNT
          </span>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>
              USERNAME <span style={{ color: '#52525b' }}>(min 3 chars)</span>
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              maxLength={30}
              style={{
                width: '100%', padding: '6px 8px',
                background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>
              PASSWORD <span style={{ color: '#52525b' }}>(min 6 chars)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '6px 8px',
                background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '11px', color: '#9a9aaa', marginBottom: '4px' }}>
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                width: '100%', padding: '6px 8px',
                background: '#0e0e12', border: '1px solid #2a2a38',
                color: '#d4d4d8', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          {error && <p className="mono" style={{ fontSize: '11px', color: '#e05252', margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mono"
            style={{
              padding: '7px', background: '#4B9CD3', border: 'none',
              color: '#0e0e12', fontSize: '12px', fontWeight: '700',
              cursor: 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'creating account...' : 'CREATE ACCOUNT'}
          </button>

          <p style={{ fontSize: '12px', color: '#8a8a9a', margin: 0, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" className="mono" style={{ color: '#4B9CD3' }}>Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
