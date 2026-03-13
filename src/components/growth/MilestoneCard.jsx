import { useState } from 'react';

const MilestoneCard = ({ milestone, index, isCompleted, onToggle, progressData }) => {
  const [isCardHover, setIsCardHover] = useState(false);
  const [isIconHover, setIsIconHover] = useState(false);
  const { type, requirement } = milestone;
  
  let icon = '⭕';
  let statusColor = styles.pending.color;
  let statusBg = styles.pending.background;
  
  if (isCompleted) {
    icon = '✅';
    statusColor = styles.completed.color;
    statusBg = styles.completed.background;
  } else if (progressData?.autoProgress?.completedMilestones?.includes(milestone.id)) {
    icon = '🤖';
    statusColor = styles.auto.color;
    statusBg = styles.auto.background;
  }

  const handleToggle = (e) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle(milestone.id, !isCompleted);
    }
  };

  return (
    <div
      style={{ ...styles.card, ...(isCardHover ? styles.cardHover : {}) }}
      onMouseEnter={() => setIsCardHover(true)}
      onMouseLeave={() => setIsCardHover(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.index}>{index}</div>
        <div
          style={{ ...styles.icon, ...(isIconHover ? styles.iconHover : {}) }}
          onMouseEnter={() => setIsIconHover(true)}
          onMouseLeave={() => setIsIconHover(false)}
          onClick={handleToggle}
        >
          {icon}
        </div>
      </div>
      
      <div style={styles.content}>
        <h3 style={styles.name}>{milestone.name}</h3>
        <p style={styles.type}>Type: {type.toUpperCase()}</p>
        {requirement && (
          <p style={styles.requirement}>
            Requirement: {JSON.stringify(requirement).replace(/["{}]/g, '')}
          </p>
        )}
      </div>
      
      <div style={{ ...styles.status, color: statusColor, background: statusBg }}>
        <span>{icon} {isCompleted ? 'Completed' : progressData?.autoProgress?.completedMilestones?.includes(milestone.id) ? 'Auto-detected' : 'Pending'}</span>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '0.75rem',
    border: '2px solid #e2e8f0',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
  },
  cardHover: {
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    borderColor: '#cbd5e1',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '4rem',
  },
  index: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#64748b',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '2rem',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '0.25rem',
    borderRadius: '50%',
    transition: 'all 0.2s',
  },
  iconHover: {
    background: '#f1f5f9',
    transform: 'scale(1.1)',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.25rem 0',
  },
  type: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
    fontWeight: '500',
    letterSpacing: '0.05em',
  },
  requirement: {
    fontSize: '0.875rem',
    color: '#475569',
    background: '#f8fafc',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    margin: 0,
    fontFamily: 'monospace',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  pending: {
    color: '#64748b',
    background: '#f1f5f9',
  },
  completed: {
    color: '#059669',
    background: '#ecfdf5',
  },
  auto: {
    color: '#7c3aed',
    background: '#f3e8ff',
  },
};

export default MilestoneCard;

