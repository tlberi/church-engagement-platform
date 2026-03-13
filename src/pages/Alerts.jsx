import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AlertCard from '../components/alerts/AlertCard';
import { getAlerts, getRiskStats, createAlert, updateAlert, resolveAlert } from '../services/alerts.service';
import { getTemplates, sendNotification } from '../services/notifications.service';
import { getMembers } from '../services/members.service';

export default function Alerts() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ red: 0, yellow: 0, orange: 0, green: 0, total: 0 });
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const orgId = currentUser?.email?.split('@')[0] || 'church1';

  useEffect(() => {
    loadData();
    loadTemplates();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [orgId]);

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
      const alertsData = await getAlerts(orgId);
      const statsData = await getRiskStats(orgId);
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
      const members = await getMembers(orgId);
      const member = members.find(m => m.id === alert.memberId);
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

      toast.success('✅ Contact notifications sent!');
    } catch (error) {
      toast.error('Failed to send contact');
      console.error(error);
    }
  };

  const handleAssign = async (alert) => {
    toast.info('Assign feature coming soon - Contact team member directly');
  };

  const handleGenerate = async () => {
    toast.info('Auto-generate feature coming soon - Risk stats updating live');
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-screen">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚨 Engagement Alerts</h1>
            <p className="text-gray-600">Real-time member risk monitoring</p>
          </div>
        </div>
        <button 
          onClick={loadData} 
          className="px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white text-center shadow-lg">
          <div className="text-3xl font-bold mb-1">{stats.red}</div>
          <div className="text-sm opacity-90">Critical</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white text-center shadow-lg">
          <div className="text-3xl font-bold mb-1">{stats.yellow}</div>
          <div className="text-sm opacity-90">Warning</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-center shadow-lg">
          <div className="text-3xl font-bold mb-1">{stats.orange}</div>
          <div className="text-sm opacity-90">High Risk</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-center shadow-lg">
          <div className="text-3xl font-bold mb-1">{stats.green}</div>
          <div className="text-sm opacity-90">Healthy</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 text-white text-center shadow-lg">
          <div className="text-3xl font-bold mb-1">{stats.total}</div>
          <div className="text-sm opacity-90">Total Members</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <input
            type="text"
            placeholder="🔍 Search members by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
          />
          <button 
            onClick={handleGenerate}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-lg rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap"
          >
            ⚙️ Generate Daily Alerts
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          {['all', 'red', 'yellow', 'orange', 'green'].map(tab => (
            <button
              key={tab}
              className={`px-6 py-3 font-semibold rounded-xl transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No {activeTab} Alerts</h3>
          <p className="text-gray-600 mb-6">All members are engaged and healthy!</p>
          <button 
            onClick={handleGenerate}
            className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Generate Alerts Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onContact={handleContact}
              onAssign={handleAssign}
            />
          ))}
        </div>
      )}
    </div>
  );
}

