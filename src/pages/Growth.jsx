import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GrowthJourney from '../components/growth/GrowthJourney';
import { 
  getGrowthPlans, 
  getMemberProgress, 
  seedDefaultNewMemberJourney,
  updateMemberProgress,
  getGrowthStats,
  assignPlanToNewMembers 
} from '../services/growth.service';
import toast from 'react-hot-toast';

const Growth = () => {
  const { currentUser } = useAuth();
  const orgId = currentUser?.email || 'church1';
  
  const [plans, setPlans] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberProgress, setMemberProgress] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, statsData] = await Promise.all([
        getGrowthPlans(orgId),
        getGrowthStats(orgId)
      ]);
      setPlans(plansData);
      setStats(statsData);
      
      if (plansData.length === 0) {
        await seedDefaultNewMemberJourney(orgId);
        const newPlans = await getGrowthPlans(orgId);
        setPlans(newPlans);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberProgress = async (memberId) => {
    try {
      if (!selectedPlanId) {
        toast.error('Select a growth plan first');
        return;
      }
      
      const progress = await getMemberProgress(memberId, selectedPlanId, orgId);
      setMemberProgress(progress);
      setSelectedMember(members.find(m => m.id === memberId));
    } catch (error) {
      toast.error('Failed to load progress');
    }
  };

  const handleMilestoneToggle = async (milestoneId, completed) => {
    if (!selectedMember?.id || !selectedPlanId) return;
    
    await updateMemberProgress(
      selectedMember.id, 
      selectedPlanId, 
      milestoneId, 
      completed,
      orgId
    );
    
    // Reload progress
    const updatedProgress = await getMemberProgress(selectedMember.id, selectedPlanId, orgId);
    setMemberProgress(updatedProgress);
  };

  const handleAssignAllNew = async () => {
    if (!selectedPlanId) {
      toast.error('Select a plan first');
      return;
    }
    await assignPlanToNewMembers(selectedPlanId, orgId);
    toast.success('Assigned to new members!');
  };

  if (loading) {
    return <div style={styles.loading}>Loading growth tracking...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📈 Growth Tracking Dashboard</h1>
        <p style={styles.subtitle}>
          Track spiritual growth journeys, auto-detect progress, celebrate milestones
        </p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div>
            <h3 style={styles.statNumber}>{stats.totalPlans || 0}</h3>
            <p style={styles.statLabel}>Growth Plans</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div>
            <h3 style={styles.statNumber}>{stats.membersWithPlans || 0}</h3>
            <p style={styles.statLabel}>Members Tracked</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <h3 style={styles.statNumber}>{stats.avgProgress || 0}%</h3>
            <p style={styles.statLabel}>Avg Progress</p>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Controls */}
        <div style={styles.controls}>
          <select 
            value={selectedPlanId || ''} 
            onChange={(e) => setSelectedPlanId(e.target.value)}
            style={styles.select}
          >
            <option value="">Select Growth Plan</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          
          {selectedPlanId && (
            <button 
              onClick={handleAssignAllNew}
              style={styles.assignBtn}
            >
              Assign to New Members
            </button>
          )}
        </div>

        {selectedPlanId && !selectedMember && (
          <div style={styles.memberSelect}>
            <p style={styles.memberPrompt}>Select a member to view progress:</p>
            <div style={styles.memberList}>
              {/* Simplified - in prod load from members.service */}
              {Array.from({length: 10}, (_, i) => `Member ${i+1}`).map(name => (
                <button 
                  key={name}
                  onClick={() => loadMemberProgress(`member${i+1}`)}
                  style={styles.memberBtn}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {memberProgress && (
          <div style={styles.journeySection}>
            <div style={styles.memberHeader}>
              <h2>{selectedMember?.name || 'Member'}'s Journey</h2>
              <button 
                onClick={() => {
                  setSelectedMember(null);
                  setMemberProgress(null);
                }}
                style={styles.backBtn}
              >
                ← Back to Select
              </button>
            </div>
            
            <GrowthJourney 
              progressData={memberProgress}
              onMilestoneToggle={handleMilestoneToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#64748b',
    marginTop: '0.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statCard: {
    background: 'white',
    padding: '2rem 1.5rem',
    borderRadius: '1rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  statIcon: {
    fontSize: '2.5rem',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
  },
  statLabel: {
    color: '#64748b',
    fontSize: '1rem',
    margin: 0,
  },
  mainContent: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2.5rem',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  select: {
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    background: 'white',
    minWidth: '250px',
  },
  assignBtn: {
    padding: '0.75rem 2rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  memberSelect: {
    textAlign: 'center',
    padding: '3rem',
  },
  memberPrompt: {
    fontSize: '1.25rem',
    color: '#64748b',
    marginBottom: '2rem',
  },
  memberList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  memberBtn: {
    padding: '1rem 2rem',
    background: '#f1f5f9',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  journeySection: {
    marginTop: '2rem',
  },
  memberHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  backBtn: {
    padding: '0.75rem 1.5rem',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    fontSize: '1.25rem',
    color: '#6b7280',
  },
};

export default Growth;

