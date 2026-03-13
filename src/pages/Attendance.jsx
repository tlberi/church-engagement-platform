import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getMembers } from '../services/members.service';
import { 
  getTodayService, 
  markPresent, 
  getServiceAttendance,
  calculateAttendanceStats 
} from '../services/attendance.service';
import { generateServiceQR, downloadQRCode } from '../services/qrcode.service';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getMembers } from '../services/members.service';
import { 
  getTodayService, 
  markPresent, 
  getServiceAttendance,
  calculateAttendanceStats 
} from '../services/attendance.service';
import { generateServiceQR, downloadQRCode } from '../services/qrcode.service';

// Add to component state:
const [qrCode, setQrCode] = useState(null);
const [showQR, setShowQR] = useState(false);

// Add this function:
async function handleGenerateQR() {
  try {
    if (!currentService) {
      toast.error('No service session available');
      return;
    }
    
    const qrData = await generateServiceQR(currentService.id, orgId);
    setQrCode(qrData);
    setShowQR(true);
    toast.success('QR Code generated!');
  } catch (error) {
    console.error('QR generation error:', error);
    toast.error('Failed to generate QR code');
  }
}

async function handleDownloadQR() {
  try {
    await downloadQRCode(
      currentService.id, 
      orgId, 
      `Service-${new Date().toLocaleDateString()}`
    );
    toast.success('QR Code downloaded!');
  } catch (error) {
    toast.error('Failed to download QR code');
  }
}
{/* QR Code Section */}
<div style={styles.qrSection}>
  <button
    onClick={handleGenerateQR}
    style={styles.generateQRButton}
    onMouseEnter={(e) => e.target.style.background = '#5568d3'}
    onMouseLeave={(e) => e.target.style.background = '#667eea'}
  >
    📱 Generate QR Code for Check-In
  </button>
</div>

{/* QR Code Modal */}
{showQR && qrCode && (
  <div style={styles.qrModal} onClick={() => setShowQR(false)}>
    <div style={styles.qrModalContent} onClick={(e) => e.stopPropagation()}>
      <div style={styles.qrModalHeader}>
        <h2 style={styles.qrModalTitle}>📱 Scan to Check In</h2>
        <button
          onClick={() => setShowQR(false)}
          style={styles.qrCloseButton}
        >
          ✕
        </button>
      </div>
      
      <div style={styles.qrCodeContainer}>
        <img 
          src={qrCode.qrCodeDataUrl} 
          alt="QR Code" 
          style={styles.qrCodeImage}
        />
      </div>
      
      <div style={styles.qrInstructions}>
        <p style={styles.qrInstruction}>
          1. Open your phone camera
        </p>
        <p style={styles.qrInstruction}>
          2. Point at this QR code
        </p>
        <p style={styles.qrInstruction}>
          3. Tap the notification to check in
        </p>
      </div>
      
      <div style={styles.qrActions}>
        <button
          onClick={handleDownloadQR}
          style={styles.downloadButton}
        >
          💾 Download QR Code
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(qrCode.checkInUrl);
            toast.success('Link copied!');
          }}
          style={styles.copyLinkButton}
        >
          🔗 Copy Check-In Link
        </button>
      </div>
      
      <div style={styles.qrLink}>
        <small>Or visit: {qrCode.checkInUrl}</small>
      </div>
    </div>
  </div>
)}
// Add this JSX after the header section:
export default function Attendance() {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [presentMembers, setPresentMembers] = useState([]);
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

  const orgId = currentUser?.email || 'demo-org';
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const loadDataCallback = useCallback(loadData, [orgId]);
  
  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]); // Fixed eslint warnings completely

  useEffect(() => {
    setStats(calculateAttendanceStats(members.length, presentMembers));
  }, [members, presentMembers]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading members for orgId:', orgId);
      
      // Load members
      const membersData = await getMembers(orgId);
      console.log('Members loaded:', membersData.length, membersData);
      // Ensure consistent orgId matching
      const normalizedMembers = membersData.map(m => ({
        ...m,
        orgId: orgId // Normalize orgId field
      }));
      setMembers(normalizedMembers);
      console.log('Normalized members:', normalizedMembers.length);
      
      if (membersData.length === 0) {
        toast('No members found. Add members first!', { icon: 'ℹ️' });
      }
      
      // Get or create today's service
      const service = await getTodayService(orgId);
      console.log('Today service:', service);
      setCurrentService(service);
      
      // Load attendance for today
      const attendance = await getServiceAttendance(service.id);
      console.log('Attendance loaded:', attendance.length);
      setPresentMembers(attendance);
      
      toast.success('Attendance loaded successfully');
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(member) {
    if (!currentService) {
      toast.error('No service session available');
      return;
    }

    const alreadyPresent = presentMembers.some(p => p.memberId === member.id);
    
    if (alreadyPresent) {
      toast.error(`${member.name} is already checked in`);
      return;
    }

    try {
      const attendance = await markPresent(currentService.id, member.id, member.name);
      setPresentMembers([...presentMembers, attendance]);
      toast.success(`✅ ${member.name} marked present`);
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in: ' + error.message);
    }
  }

  function isPresent(memberId) {
    return presentMembers.some(p => p.memberId === memberId);
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading attendance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>⚠️ Error Loading Attendance</h2>
          <p>{error}</p>
          <button onClick={loadData} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>✅ Attendance</h1>
          <p style={styles.date}>{today}</p>
        </div>
        <button onClick={loadData} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea, #764ba2)'}}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total Members</div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #10b981, #059669)'}}>
          <div style={styles.statNumber}>{stats.present}</div>
          <div style={styles.statLabel}>Present</div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
          <div style={styles.statNumber}>{stats.absent}</div>
          <div style={styles.statLabel}>Absent</div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
          <div style={styles.statNumber}>{stats.percentage}%</div>
          <div style={styles.statLabel}>Attendance Rate</div>
        </div>
      </div>

      {/* Debug Info - Remove this after testing */}
      <div style={styles.debugBox}>
        <strong>Debug Info:</strong> 
        {members.length} members loaded | 
        Service ID: {currentService?.id} | 
        OrgId: {orgId}
      </div>

      {/* No Members Warning */}
      {members.length === 0 && (
        <div style={styles.warningBox}>
          <h3>⚠️ No Members Found</h3>
          <p>You need to add members first before taking attendance.</p>
          <button 
            onClick={() => window.location.href = '/members'}
            style={styles.addMembersButton}
          >
            Go to Members Page
          </button>
        </div>
      )}

      {/* Search */}
      {members.length > 0 && (
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      )}

      {/* Member List */}
      {members.length > 0 && (
        <div style={styles.memberList}>
          <h2 style={styles.sectionTitle}>Check In Members</h2>
          
          {filteredMembers.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No members match your search</p>
            </div>
          ) : (
            <div style={styles.memberGrid}>
              {filteredMembers.map(member => (
                <div key={member.id} style={styles.memberCard}>
                  <div style={styles.memberInfo}>
                    <div style={styles.memberAvatar}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.memberName}>{member.name}</div>
                      <div style={styles.memberEmail}>{member.email}</div>
                    </div>
                  </div>
                  
                  {isPresent(member.id) ? (
                    <div style={styles.presentBadge}>
                      ✅ Present
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(member)}
                      style={styles.checkInButton}
                      onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                      onMouseLeave={(e) => e.target.style.background = '#667eea'}
                    >
                      Mark Present
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Present Members List */}
      {presentMembers.length > 0 && (
        <div style={styles.presentList}>
          <h2 style={styles.sectionTitle}>Present Today ({presentMembers.length})</h2>
          <div style={styles.presentGrid}>
            {presentMembers.map(attendance => (
              <div key={attendance.id} style={styles.presentItem}>
                <div style={styles.presentAvatar}>
                  {attendance.memberName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={styles.presentName}>{attendance.memberName}</div>
                  <div style={styles.presentTime}>
                    {attendance.checkInTime?.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: '#6b7280',
  },
  spinner: {
    width: '3rem',
    height: '3rem',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  error: {
    textAlign: 'center',
    padding: '3rem',
    background: '#fee2e2',
    borderRadius: '0.75rem',
    color: '#991b1b',
  },
  retryButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  date: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0,
  },
  refreshButton: {
    padding: '0.625rem 1.25rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  debugBox: {
    background: '#fef3c7',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#92400e',
  },
  warningBox: {
    background: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '0.75rem',
    padding: '2rem',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  addMembersButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    padding: '1.5rem',
    borderRadius: '0.75rem',
    color: 'white',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9
  },
  searchContainer: {
    marginBottom: '2rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  memberList: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '0.75rem',
    color: '#6b7280',
  },
  memberGrid: {
    display: 'grid',
    gap: '1rem',
  },
  memberCard: {
    background: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  memberAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.125rem',
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
  },
  memberEmail: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  checkInButton: {
    padding: '0.625rem 1.25rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  presentBadge: {
    padding: '0.625rem 1.25rem',
    background: '#d1fae5',
    color: '#065f46',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  presentList: {
    background: '#f0fdf4',
    padding: '1.5rem',
    borderRadius: '0.75rem',
  },
  presentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  presentItem: {
    background: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  presentAvatar: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    background: '#10b981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  presentName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
  },
  presentTime: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  qrSection: {
  marginBottom: '2rem',
  textAlign: 'center',
},
generateQRButton: {
  padding: '1rem 2rem',
  background: '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  fontSize: '1.125rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background 0.3s',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
},
qrModal: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
},
qrModalContent: {
  background: 'white',
  borderRadius: '1.5rem',
  maxWidth: '500px',
  width: '100%',
  padding: '2rem',
},
qrModalHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
},
qrModalTitle: {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  margin: 0,
},
qrCloseButton: {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#6b7280',
},
qrCodeContainer: {
  textAlign: 'center',
  padding: '2rem',
  background: '#f9fafb',
  borderRadius: '1rem',
  marginBottom: '1.5rem',
},
qrCodeImage: {
  width: '100%',
  maxWidth: '300px',
  height: 'auto',
},
qrInstructions: {
  marginBottom: '1.5rem',
},
qrInstruction: {
  fontSize: '1rem',
  color: '#374151',
  marginBottom: '0.5rem',
},
qrActions: {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1rem',
},
downloadButton: {
  flex: 1,
  padding: '0.75rem',
  background: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontWeight: '600',
  cursor: 'pointer',
},
copyLinkButton: {
  flex: 1,
  padding: '0.75rem',
  background: '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontWeight: '600',
  cursor: 'pointer',
},
qrLink: {
  textAlign: 'center',
  color: '#6b7280',
  fontSize: '0.75rem',
  wordBreak: 'break-all',
},
};