import React from 'react';
import MilestoneCard from './MilestoneCard';

const GrowthJourney = ({ progressData, onMilestoneToggle, memberName = 'Member', readOnly = false }) => {
  const { plan, overallProgress = 0, autoProgress = {}, completedMilestones = [] } = progressData || {};
  
  if (!plan) {
    return (
      <div style={styles.noData}>
        <p>No growth plan assigned yet</p>
      </div>
    );
  }

  const progressWidth = `${Math.min(overallProgress, 100)}%`;
  const isAuto = autoProgress.autoDetected;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>YOUR GROWTH JOURNEY</h2>
        <div style={styles.progressHeader}>
          <span style={styles.progressPercent}>{overallProgress}% Complete</span>
          {isAuto && <span style={styles.autoDetected}>🤖 Auto-detected</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: progressWidth }} />
        </div>
        <div style={styles.progressText}>
          {completedMilestones.length}/{plan.milestones.length} milestones
        </div>
      </div>

      {/* Milestones Checklist */}
      <div style={styles.milestones}>
        {plan.milestones.map((milestone, index) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={index + 1}
            isCompleted={completedMilestones.includes(milestone.id)}
            onToggle={!readOnly ? onMilestoneToggle : null}
            progressData={progressData}
          />
        ))}
      </div>

      {!readOnly && (
        <div style={styles.actions}>
          <button style={styles.resetBtn} onClick={() => onMilestoneToggle(null, false)}>
            Reset All Progress
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#f8fafc',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 4px 6px -1px rgba(0, 0,0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 1rem 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  progressPercent: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#059669',
    background: '#ecfdf5',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    border: '2px solid #86efac',
  },
  autoDetected: {
    fontSize: '0.875rem',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    border: '1px solid #e2e8f0',
  },
  progressContainer: {
    marginBottom: '2rem',
  },
  progressBar: {
    height: '1.25rem',
    background: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    transition: 'width 0.5s ease-in-out',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)',
  },
  progressText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  milestones: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  actions: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  resetBtn: {
    padding: '0.75rem 2rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  noData: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#64748b',
  },
};

export default GrowthJourney;

