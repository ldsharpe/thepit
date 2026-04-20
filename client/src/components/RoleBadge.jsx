export default function RoleBadge({ role }) {
  if (!role || role === 'member') return null
  return (
    <span className="mono" style={{
      fontSize: '9px', fontWeight: '700',
      color: '#4caf7d',
      border: '1px solid #4caf7d',
      padding: '1px 4px',
      letterSpacing: '0.5px',
      lineHeight: 1,
      flexShrink: 0,
    }}>
      {role.toUpperCase()}
    </span>
  )
}
