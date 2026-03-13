import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AlertCard from '../components/alerts/AlertCard';
import { getAlerts, getRiskStats, generateDailyAlerts, assignAlert } from '../services/alerts.service';
import { getTemplates, sendNotification } from '../services/notifications.service';

export default function Alerts() {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ red: 0, yellow: 0, orange: 0, green: 0, total: 0 });
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('red');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
    loadTemplates();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []); 

  const loadTemplates = async () => {
    try {
      const t = await getTemplates('alert');
      setTemplates(t);
    } catch (error) {
      console.error('Templates load error:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertsData, statsData] = await Promise.all([
        getAlerts(),
        getRiskStats()
      ]);
      setAlerts(alertsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts
    .filter(alert => 
      (alert.memberName || alert.name || '').toLowerCase().includes(search.toLowerCase()) &&
      (activeTab === 'all' || (alert.severity === activeTab || alert.risk?.status === activeTab))
    );

  const handleContact = async (alert) => {
    try {
      const member = await getMembers('church1').then(m => m.find(mm => mm.id === alert.memberId));
      if (!member) {
        toast.error('Member not found');
        return;
      }

      const emailTemplate = templates.find(t => t.channel === 'email');
      const smsTemplate = templates.find(t => t.channel === 'sms');

      if (emailTemplate && member.email) {
        await sendNotification(emailTemplate.id, member.id, member.email, null, 'email', {
          memberName: alert.memberName,
          riskScore: alert.riskScore,
          org_name: 'Grace Church'
        });
      }

      if (smsTemplate && member.phone) {
        await sendNotification(smsTemplate.id, member.id, null, member.phone, 'sms', {
          memberName: alert.memberName,
          org_name: 'Grace Church'
        });
      }

      toast.success('Contact notifications sent!');
    } catch (error) {
      toast.error('Failed to send contact');
      console.error(error);
    }
  };

  const handleAssign = async (alert) => {
    try {
      await assignAlert(alert.id, 'pastor-david');
      toast.success(`Alert assigned to Pastor David`);
      loadData();
    } catch (error) {
      toast.error('Failed to assign');
    }
  };

  const handleGenerate = async () => {
    try {
      const result = await generateDailyAlerts();
      toast.success(`Generated ${result.newAlerts} new, updated ${result.updated} alerts. Processed ${result.processed}`);
      loadData();
    } catch (error) {
      toast.error('Generate failed');
      console.error(error);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading alerts...</div>;
  }

  return (
<div style={styles.container}>
      <div style={{...styles.header, display: 'flex', alignItems: 'center', gap: '1rem'}}>
        <button onClick={() => window.history.back()} style={{padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500'}}>← Back</button>
        <h1 style={styles.title}>🚨 Engagement Alerts</h1></div>
        <div style={styles.statsGrid}>
          <StatCard label="Critical (Red)" value={stats.red} color="#ef4444" />
          <StatCard label="Warning (Yellow)" value={stats.yellow} color="#f59e0b" />
          <StatCard label="High Risk (Orange)" value={stats.orange} color="#fb923c" />
          <StatCard label="Healthy (Green)" value={stats.green} color="#10b981" />
          <StatCard label="Total Members" value={stats.total} color="#6b7280" />
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.controlRow}>
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
          <button style={styles.generateBtn} onClick={handleGenerate}>
            Generate Alerts
          </button>
        </div>
        <div style={styles.tabs}>
          {['all', 'open', 'red', 'yellow', 'orange'].map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'open' ? 'Open' : tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.alertsList}>
        {filteredAlerts.length === 0 ? (
          <div style={styles.empty}>No {activeTab} alerts found 🎉</div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onContact={handleContact}
              onAssign={handleAssign}
            />

          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderLeftColor: color }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{label}</div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '1.5rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem'
  },
  statCard: {
    padding: '1.5rem',
    borderRadius: '0.5rem',
    background: 'white',
    borderLeft: '4px solid',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem'
  },
  search: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem'
  },
  tab: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #d1d5db',
    background: 'white',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  tabActive: {
    background: '#eff6ff',
    borderColor: '#667eea',
    color: '#667eea'
  },
  controlRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'end'
  },
  generateBtn: {
    padding: '0.75rem 1.5rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column'
  },

  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '1.125rem',
    color: '#6b7280'
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
    fontSize: '1.125rem'
  }
};
