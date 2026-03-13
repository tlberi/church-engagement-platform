import { useState } from 'react';

export default function AlertCard({ alert, onContact, onAssign }) {


  const statusColors = {
    red: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    yellow: { bg: '#fefce8', border: '#fde68a', text: '#d97706' },
    orange: { bg: '#fff7ed', border: '#fdba74', text: '#c05621' },
    green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#059669' }
  };
  const severity = alert.severity || alert.risk?.status || 'green';
  const color = statusColors[severity] || statusColors.green;
  const [showEvidence, setShowEvidence] = useState(false);
  const score = alert.riskScore || alert.score || 0;
  const reason = alert.reason || alert.evidenceReport || alert.triggerCondition || 'No reason provided';
  const evidence = alert.evidenceReport || '';
  const recommendations = alert.recommendations || [];
  const memberName = alert.memberName || 'Unknown';

  return (
    <div style={{
      ...styles.card,
      backgroundColor: color.bg,
      border: `2px solid ${color.border}`
    }}>
      <div style={styles.header}>
        <div style={styles.avatar}>👤</div>
        <div style={styles.info}>
          <h3 style={styles.name}>{memberName}</h3>
          <span style={{...styles.status, color: color.text }}>
            {severity.toUpperCase()} ALERT
          </span>
        </div>
      </div>
      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>Attendance Rate</div>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${score}%`,
            backgroundColor: color.text
          }} />
        </div>
        <span style={styles.progressText}>{score}%</span>
      </div>
      <div style={styles.reason}>{reason}</div>
      {recommendations.length > 0 && (
        <div style={styles.recommendations}>
          <strong>Recommended Actions:</strong>
          <ul>
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}


      <div style={styles.actions}>
        <button style={{...styles.actionBtn, backgroundColor: '#10b981', color: 'white', border: 'none'}} onClick={() => setShowEvidence(true)}>
          [View Evidence]
        </button>
        <button style={{...styles.actionBtn, backgroundColor: '#3b82f6', color: 'white', border: 'none'}} onClick={() => onContact(alert)}>
          [Contact Now]
        </button>
        <button style={{...styles.actionBtn, backgroundColor: '#f59e0b', color: 'white', border: 'none'}} onClick={() => onAssign(alert)}>
          [Assign Task]
        </button>
      </div>
      {showEvidence && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h4 style={styles.modalTitle}>Evidence Report</h4>
            <pre style={styles.evidenceText}>{evidence}</pre>
            <button style={styles.closeBtn} onClick={() => setShowEvidence(false)}>
              Close
            </button>
          </div>
        </div>
      )}
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
  },
  modalTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.25rem',
    color: '#111827'
  },
  evidenceText: {
    whiteSpace: 'pre-wrap',
    fontSize: '0.875rem',
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: '1rem',
    background: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.25rem',
    maxHeight: '400px',
    overflow: 'auto',
    border: '1px solid #e5e7eb'
  },
  closeBtn: {
    padding: '0.75rem 1.5rem',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  recommendations: {
    background: '#eff6ff',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    borderLeft: '4px solid #3b82f6'
  }
};
