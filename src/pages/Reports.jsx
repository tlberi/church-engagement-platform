import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAttendanceTrends, 
  getRiskDistribution, 
  getReportsSummary, 
  exportAttendanceCSV
} from '../services/reports.service';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import { getOrgId } from '../utils/org';

export default function Reports() {
  const { currentUser } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [riskData, setRiskData] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  const orgId = getOrgId(currentUser);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [attendance, risk, summaryData] = await Promise.all([
        getAttendanceTrends(orgId),
        getRiskDistribution(orgId),
        getReportsSummary(orgId)
      ]);
      setAttendanceData(attendance);
      setRiskData(risk);
      setSummary(summaryData);
    } catch (error) {
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const COLORS = {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#10b981'
  };

  const riskPieData = Object.entries(riskData)
    .filter(([name]) => ['red', 'orange', 'yellow', 'green'].includes(name))
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: COLORS[name]
    }))
    .filter(item => item.value > 0);

  const handleExport = () => {
    if (activeTab === 'attendance') {
      const success = exportAttendanceCSV(attendanceData);
      if (success) {
        toast.success('📊 Attendance report downloaded!');
      } else {
        toast.error('No attendance data available to export');
      }
    } else if (activeTab === 'risk') {
      // Export risk summary
      toast.info('Risk summary export coming soon');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Reports...</h2>
          <p className="text-gray-600">Generating charts and metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto font-sans min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-emerald-900 bg-clip-text text-transparent mb-3">
              📊
              {' '}Church Analytics Reports
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Comprehensive insights into attendance, engagement, and church health metrics
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              📥 Export CSV
            </button>
            <button 
              className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
              onClick={() => toast.info('PDF export coming soon!')}
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="group p-8 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-3xl mb-4">👥</div>
          <h3 className="font-bold text-xl text-gray-900 mb-2">Total Members</h3>
          <div className="text-4xl font-bold text-blue-600 mb-1">{summary.totalMembers}</div>
          <p className="text-sm text-gray-600">Active church family</p>
        </div>
        
        <div className="group p-8 bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-3xl mb-4">📈</div>
          <h3 className="font-bold text-xl text-gray-900 mb-2">Avg Attendance</h3>
          <div className="text-4xl font-bold text-emerald-600 mb-1">{summary.avgAttendance}%</div>
          <p className="text-sm text-gray-600">Recent services</p>
        </div>

        <div className="group p-8 bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="font-bold text-xl text-gray-900 mb-2">Engagement Score</h3>
          <div className="text-4xl font-bold text-amber-600 mb-1">{summary.engagementScore}%</div>
          <p className="text-sm text-gray-600">Overall health metric</p>
        </div>

        <div className="group p-8 bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="text-3xl mb-4">🚨</div>
          <h3 className="font-bold text-xl text-gray-900 mb-2">Alerts Resolved</h3>
          <div className="text-4xl font-bold text-purple-600 mb-1">{summary.alertsResolved}</div>
          <p className="text-sm text-gray-600">This month</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-1 mb-8">
        <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-1">
          {[
            { id: 'attendance', label: '📊 Attendance Trends', icon: '📈' },
            { id: 'risk', label: 'Risk Distribution', icon: '🎯' },
            { id: 'growth', label: 'Growth Metrics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold text-lg rounded-xl transition-all flex-1 ${
                activeTab === tab.id
                  ? 'bg-white shadow-lg text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {activeTab === 'attendance' && (
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'risk' && (
          <>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 lg:col-span-2">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {riskPieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-white/50 rounded-2xl">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.fill }}></div>
                    <div>
                      <div className="font-bold text-lg">{item.name}</div>
                      <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'growth' && (
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Growth Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-100">
                <div className="text-sm text-emerald-700 font-semibold mb-1">Services This Month</div>
                <div className="text-3xl font-bold text-emerald-800">{summary.servicesThisMonth || 0}</div>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100">
                <div className="text-sm text-blue-700 font-semibold mb-1">New Members</div>
                <div className="text-3xl font-bold text-blue-800">{summary.newMembers || 0}</div>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-100">
                <div className="text-sm text-amber-700 font-semibold mb-1">Engagement Score</div>
                <div className="text-3xl font-bold text-amber-800">{summary.engagementScore || 0}%</div>
              </div>
            </div>
            <p className="text-center text-gray-600">
              Connect growth plans for deeper progress tracking and milestone analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

