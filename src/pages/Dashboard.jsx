import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRiskStats } from '../services/alerts.service';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [riskStats, setRiskStats] = useState({ red: 0, yellow: 0, orange: 0, green: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const stats = await getRiskStats(currentUser?.email || 'church1');
      setRiskStats(stats);
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎉 Church Engagement Dashboard</h1>
      <p style={styles.subtitle}>
        Monitor attendance, engagement risks, and church health in real-time
      </p>

      <div style={styles.grid}>
        <div style={{ ...styles.card, background: '#eff6ff' }}>
          <div style={styles.cardIcon}>👥</div>
          <h3 style={styles.cardTitle}>Members</h3>
          <p style={styles.cardText}>{riskStats.total} total members</p>
          <button
            onClick={() => window.location.href = '/members'}
            style={styles.cardButton}
          >
            Manage Members →
          </button>
        </div>

        <div style={{ ...styles.card, background: '#f0fdf4' }}>
          <div style={styles.cardIcon}>✅</div>
          <h3 style={styles.cardTitle}>Attendance</h3>
          <p style={styles.cardText}>Today's service tracking</p>
          <button
            onClick={() => window.location.href = '/attendance'}
            style={styles.cardButton}
          >
            Take Attendance →
          </button>
        </div>

        <div style={{ ...styles.card, background: riskStats.red > 0 ? '#fef2f2' : riskStats.orange > 0 ? '#fff7ed' : '#f0fdf4' }}>
          <div style={styles.cardIcon}>{riskStats.red > 0 ? '🚨' : riskStats.orange > 0 ? '⚠️' : '✅'}</div>
          <h3 style={styles.cardTitle}>Engagement Alerts</h3>
          <p style={styles.cardText}>{riskStats.red} critical, {riskStats.yellow + riskStats.orange} warnings</p>
          <button
            onClick={() => window.location.href = '/alerts'}
            style={styles.cardButton}
          >
            View Alerts ({riskStats.red + riskStats.yellow + riskStats.orange})
          </button>
        </div>

        <div style={{ ...styles.card, background: '#fef3c7' }}>
          <div style={styles.cardIcon}>📈</div>
          <h3 style={styles.cardTitle}>Growth Tracking</h3>
          <p style={styles.cardText}>Spiritual growth journeys & milestones</p>
          <button
            onClick={() => window.location.href = '/growth'}
            style={styles.cardButton}
          >
            Track Growth →
          </button>
        </div>
      </div>

      <div style={styles.statusBox}>
        <p style={styles.statusText}>
          ✅ <strong>Risk Monitoring:</strong> {riskStats.avgScore.toFixed(1)}% avg engagement score
        </p>
        <p style={styles.statusText}>
          🔄 <strong>Daily Scan:</strong> Last run today - <button onClick={loadStats} style={styles.refreshBtn}>Refresh</button>
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
  refreshBtn: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    fontSize: '1.25rem',
    color: '#6b7280'
  }
};
