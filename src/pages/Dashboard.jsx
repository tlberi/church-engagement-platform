export default function Dashboard() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎉 Welcome to Your Church Platform!</h1>
      <p style={styles.subtitle}>
        Your professional church management system is ready to build!
      </p>

      <div style={styles.grid}>
        <div style={{ ...styles.card, background: '#eff6ff' }}>
          <div style={styles.cardIcon}>👥</div>
          <h3 style={styles.cardTitle}>Members</h3>
          <p style={styles.cardText}>Manage your church members</p>
          <button
            onClick={() => window.location.href = '/members'}
            style={styles.cardButton}
          >
            View Members →
          </button>
        </div>

        <div style={{ ...styles.card, background: '#f0fdf4' }}>
          <div style={styles.cardIcon}>✅</div>
          <h3 style={styles.cardTitle}>Attendance</h3>
          <p style={styles.cardText}>Track who's present</p>
          <button
            onClick={() => window.location.href = '/attendance'}
            style={styles.cardButton}
          >
            Take Attendance →
          </button>
        </div>

        <div style={{ ...styles.card, background: riskStats?.red > 0 ? '#fef3c7' : '#f0fdf4' }}>
          <div style={styles.cardIcon}>{riskStats?.red > 0 ? '🚨' : '✅'}</div>
<h3 style={styles.cardTitle}>Alerts ({riskStats ? riskStats.red : 0})</h3>
          <p style={styles.cardText}>{riskStats ? `${riskStats.red} critical, ${riskStats.yellow} warnings` : 'Monitor engagement'}</p>
          <button
            onClick={() => window.location.href = '/alerts'}
            style={styles.cardButton}
          >
            View Alerts →
          </button>
        </div>
      </div>

      <div style={styles.statusBox}>
        <p style={styles.statusText}>
          ✅ <strong>System Status:</strong> All systems operational
        </p>
        <p style={styles.statusText}>
          🔥 <strong>Next Step:</strong> Add members and start tracking attendance
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    padding: '2rem',
    borderRadius: '0.75rem',
    textAlign: 'center',
  },
  cardIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0',
  },
  cardText: {
    color: '#6b7280',
    marginBottom: '1rem',
  },
  cardButton: {
    padding: '0.625rem 1.25rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statusBox: {
    background: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  },
  statusText: {
    color: '#166534',
    margin: '0.5rem 0',
    fontSize: '0.95rem',
  },
};