export default function AlertCard({ member, risk, onAction }) {
  const statusColors = {
    red: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    yellow: { bg: '#fefce8', border: '#fde68a', text: '#d97706' },
    green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#059669' }
  };
  const color = statusColors[risk.status] || statusColors.green;

  return (
    <div style={{
      ...styles.card,
      backgroundColor: color.bg,
      border: `2px solid ${color.border}`
    }}>
      <div style={styles.header}>
        <div style={styles.avatar}>👤</div>
        <div style={styles.info}>
          <h3 style={styles.name}>{member.name}</h3>
          <span style={{...styles.status, color: color.text }}>
            {risk.status.toUpperCase()} ALERT
          </span>
        </div>
      </div>
      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>Attendance Rate</div>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${risk.score}%`,
            backgroundColor: color.text
          }} />
        </div>
        <span style={styles.progressText}>{risk.score}%</span>
      </div>
      <div style={styles.reason}>{risk.reason}</div>
      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={() => onAction('sms', member)}>
          📱 SMS
        </button>
        <button style={styles.actionBtn} onClick={() => onAction('email', member)}>
          ✉️ Email
        </button>
        <button style={styles.actionBtn} onClick={() => onAction('call', member)}>
          📞 Call
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: '1.5rem',
    borderRadius: '0.75rem',
    marginBottom: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    alignItems: 'center'
  },
  avatar: {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    background: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem'
  },
  info: {
    flex: 1
  },
  name: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.125rem',
    fontWeight: '600'
  },
  status: {
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    background: 'rgba(255,255,255,0.7)'
  },
  progressSection: {
    marginBottom: '1rem'
  },
  progressLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
    display: 'block'
  },
  progressBar: {
    height: '0.5rem',
    background: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginBottom: '0.5rem'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827'
  },
  reason: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    fontStyle: 'italic'
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  actionBtn: {
    flex: 1,
    minWidth: '4rem',
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    background: 'white',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s'
  }
};
