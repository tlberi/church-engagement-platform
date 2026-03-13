import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getMembers } from '../services/members.service';
import { 
  getTodayService, 
  markPresent, 
  getServiceAttendance,
  calculateAttendanceStats 
} from '../services/attendance.service';
import { getRiskStats } from '../services/alerts.service';
import { generateServiceQR, downloadQRCode } from '../services/qrcode.service';
import { getOrgId } from '../utils/org';

export default function Attendance() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [presentMembers, setPresentMembers] = useState([]);
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [riskStats, setRiskStats] = useState({ red: 0, yellow: 0, orange: 0, green: 0, total: 0 });
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const orgId = getOrgId(currentUser);
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const loadRiskStats = useCallback(async () => {
    try {
      const riskData = await getRiskStats(orgId);
      setRiskStats(riskData);
    } catch (err) {
      console.error('Risk stats error:', err);
    }
  }, [orgId]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const membersData = await getMembers(orgId);
      const normalizedMembers = membersData.map(m => ({
        ...m,
        orgId: orgId
      }));
      setMembers(normalizedMembers);
      
      if (membersData.length === 0) {
        toast('No members found. Add members first!', { icon: 'ℹ️' });
      }
      
      const service = await getTodayService(orgId);
      setCurrentService(service);
      
      const attendance = await getServiceAttendance(service.id);
      setPresentMembers(attendance);
      
      toast.success('Attendance loaded successfully');
      
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadData();
    loadRiskStats();
  }, [loadData, loadRiskStats]);

  useEffect(() => {
    setStats(calculateAttendanceStats(members.length, presentMembers));
  }, [members, presentMembers]);

  async function handleCheckIn(member) {
    if (!currentService || loading) {
      toast.error('Loading or no service session available');
      return;
    }

    const alreadyPresent = presentMembers.some(p => p.memberId === member.id);
    if (alreadyPresent) {
      toast.error(`${member.name} is already checked in`);
      return;
    }

    try {
      const attendance = await markPresent(currentService.id, member.id, member.name, orgId);
      const newPresent = [...presentMembers, attendance];
      setPresentMembers(newPresent);
      // Force immediate stats update
      setStats(calculateAttendanceStats(members.length, newPresent));
      toast.success(`✅ ${member.name} marked present`);
      // Reload risk stats after check-in
      loadRiskStats();
    } catch (err) {
      toast.error('Failed to check in: ' + err.message);
    }
  }

  // ... rest of functions remain the same: handleGenerateQR, handleDownloadQR, isPresent, handleCopyLink

  async function handleGenerateQR() {
    if (!currentService) {
      toast.error('No service session available');
      return;
    }
    
    try {
      const qrData = await generateServiceQR(currentService.id, orgId);
      setQrCode(qrData);
      setShowQR(true);
      toast.success('QR Code generated!');
    } catch (err) {
      toast.error('Failed to generate QR code');
    }
  }

  async function handleDownloadQR() {
    try {
      await downloadQRCode(currentService.id, orgId, `Service-${new Date().toLocaleDateString()}`);
      toast.success('QR Code downloaded!');
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  }

  function isPresent(memberId) {
    return presentMembers.some(p => p.memberId === memberId);
  }

  async function handleCopyLink() {
    if (!qrCode?.checkInUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(qrCode.checkInUrl);
      } else {
        const input = document.createElement('input');
        input.value = qrCode.checkInUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      toast.success('Link copied!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  }

  const filteredMembers = members.filter(member =>
    (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p>Loading attendance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-red-50">
        <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error Loading Attendance</h2>
        <p className="text-red-700 mb-6">{error}</p>
        <button 
          onClick={loadData} 
          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">✅ Attendance</h1>
            <p className="text-gray-600">{today}</p>
          </div>
        </div>
        <button 
          onClick={loadData} 
          className="px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-center">
          <div className="text-3xl font-bold mb-1">{stats.total}</div>
          <div className="text-sm opacity-90">Total Members</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-center">
          <div className="text-3xl font-bold mb-1">{stats.present}</div>
          <div className="text-sm opacity-90">Present</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white text-center">
          <div className="text-3xl font-bold mb-1">{stats.absent}</div>
          <div className="text-sm opacity-90">Absent</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white text-center">
          <div className="text-3xl font-bold mb-1">{stats.percentage}%</div>
          <div className="text-sm opacity-90">Attendance Rate</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white text-center">
          <div className="text-3xl font-bold mb-1">{riskStats.red}</div>
          <div className="text-sm opacity-90">High Risk</div>
        </div>
      </div>

      {/* QR Section */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
        <button
          onClick={handleGenerateQR}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          📱 Generate QR Code for Check-In
        </button>
      </div>

      {/* No Members Warning */}
      {members.length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center mb-8">
          <h3 className="text-2xl font-bold text-amber-800 mb-4">⚠️ No Members Found</h3>
          <p className="text-amber-700 mb-6">You need to add members first before taking attendance.</p>
          <button 
            onClick={() => navigate('/members')}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Members Page
          </button>
        </div>
      )}

      {/* Search */}
      {members.length > 0 && (
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Search members by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
          />
        </div>
      )}

      {/* Members List */}
      {members.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Check In Members</h2>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">No members match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(member => (
                <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                    </div>
                  </div>
                  {isPresent(member.id) ? (
                    <div className="px-6 py-3 bg-emerald-100 text-emerald-800 rounded-xl font-semibold text-center">
                      ✅ Present
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(member)}
                      disabled={!currentService || loading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Present Today */}
      {presentMembers.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-emerald-800 mb-6">
            Present Today ({presentMembers.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {presentMembers.map(attendance => (
              <div key={attendance.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-semibold text-sm">
                  {attendance.memberName?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm truncate">{attendance.memberName}</div>
                  <div className="text-xs text-gray-500">
                    {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    }) : 'Just now'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Modal - same as original */}
      {showQR && qrCode && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📱 Scan to Check In</h2>
              <button
                onClick={() => setShowQR(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl mb-6 text-center">
              {qrCode.qrCodeDataUrl ? (
                <img 
                  src={qrCode.qrCodeDataUrl} 
                  alt="QR Code" 
                  className="mx-auto max-w-xs h-auto shadow-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 mx-auto">
                  QR Preview
                </div>
              )}
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-lg text-gray-700">1. Open your phone camera</p>
              <p className="text-lg text-gray-700">2. Point at this QR code</p>
              <p className="text-lg text-gray-700">3. Tap notification to check in</p>
            </div>
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleDownloadQR}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all"
              >
                💾 Download QR Code
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all"
              >
                🔗 Copy Link
              </button>
            </div>
            
            {qrCode.checkInUrl && (
              <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 text-center truncate">
                Or visit: {qrCode.checkInUrl}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

