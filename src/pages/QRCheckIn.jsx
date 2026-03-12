import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMembers } from '../services/members.service';
import { markPresent, getServiceAttendance } from '../services/attendance.service';

export default function QRCheckIn() {
  const { orgId, serviceId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [checking, setChecking] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState([]);

  useEffect(() => {
    loadData();
  }, [orgId, serviceId]);

  async function loadData() {
    try {
      const membersData = await getMembers(orgId);
      setMembers(membersData);
      
      const attendance = await getServiceAttendance(serviceId);
      setAlreadyCheckedIn(attendance.map(a => a.memberId));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load check-in data');
    }
  }

  async function handleCheckIn(member) {
    if (alreadyCheckedIn.includes(member.id)) {
      toast.error(`${member.name} is already checked in!`);
      return;
    }

    setChecking(true);
    try {
      await markPresent(serviceId, member.id, member.name);
      setAlreadyCheckedIn([...alreadyCheckedIn, member.id]);
      
      toast.success(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            Welcome, {member.name}!
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            You're checked in
          </div>
        </div>,
        { duration: 3000 }
      );
      
      // Clear selection after 2 seconds
      setTimeout(() => {
        setSelectedMember(null);
        setSearchTerm('');
      }, 2000);
      
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in');
    } finally {
      setChecking(false);
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>⛪</div>
        <h1 style={styles.title}>Check-In</h1>
        <p style={styles.subtitle}>Welcome! Please find your name below</p>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="🔍 Type your name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          autoFocus
        />
      </div>

      {/* Member List */}
      <div style={styles.memberList}>
        {filteredMembers.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No members found</p>
            <p style={styles.emptyHint}>Try a different name</p>
          </div>
        ) : (
          filteredMembers.map(member => {
            const isCheckedIn = alreadyCheckedIn.includes(member.id);
            
            return (
              <button
                key={member.id}
                onClick={() => !isCheckedIn && handleCheckIn(member)}
                disabled={isCheckedIn || checking}
                style={{
                  ...styles.memberButton,
                  ...(isCheckedIn ? styles.memberButtonCheckedIn : {}),
                  cursor: isCheckedIn ? 'not-allowed' : 'pointer'
                }}
              >
                <div style={styles.memberAvatar}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.memberInfo}>
                  <div style={styles.memberName}>{member.name}</div>
                  {isCheckedIn && (
                    <div style={styles.checkedInBadge}>
                      ✅ Already checked in
                    </div>
                  )}
                </div>
                {!isCheckedIn && (
                  <div style={styles.checkInIcon}>→</div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>{alreadyCheckedIn.length}</div>
          <div style={styles.statLabel}>Checked In</div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <div style={styles.statNumber}>{members.length - alreadyCheckedIn.length}</div>
          <div style={styles.statLabel}>Still Waiting</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'white',
  },
  logo: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '1.125rem',
    opacity: 0.9,
    margin: 0,
  },
  searchContainer: {
    maxWidth: '600px',
    margin: '0 auto 2rem',
  },
  searchInput: {
    width: '100%',
    padding: '1.25rem 1.5rem',
    fontSize: '1.25rem',
    border: 'none',
    borderRadius: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  memberList: {
    maxWidth: '600px',
    margin: '0 auto 2rem',
    maxHeight: '50vh',
    overflowY: 'auto',
  },
  memberButton: {
    width: '100%',
    background: 'white',
    border: 'none',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  memberButtonCheckedIn: {
    opacity: 0.6,
    background: '#f3f4f6',
  },
  memberAvatar: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  memberInfo: {
    flex: 1,
    textAlign: 'left',
  },
  memberName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
  },
  checkedInBadge: {
    fontSize: '0.875rem',
    color: '#10b981',
    marginTop: '0.25rem',
  },
  checkInIcon: {
    fontSize: '1.5rem',
    color: '#667eea',
    fontWeight: 'bold',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '1rem',
    color: '#6b7280',
  },
  emptyHint: {
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  },
  stats: {
    maxWidth: '600px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    textAlign: 'center',
    color: 'white',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
  },
  statDivider: {
    width: '2px',
    height: '3rem',
    background: 'rgba(255,255,255,0.3)',
  },
};