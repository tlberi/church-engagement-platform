import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRiskStats } from '../services/alerts.service';
import { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [riskStats, setRiskStats] = useState({ red: 0, yellow: 0, orange: 0, green: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const stats = await getRiskStats(currentUser?.email || 'church1');
      setRiskStats(stats);
    } catch (error) {
      // Stats error handled silently
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          🎉 Church Engagement Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Monitor attendance, engagement risks, and church health in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Members</h3>
            <p className="text-4xl font-bold text-blue-600 mb-4">{riskStats.total}</p>
            <p className="text-gray-600 mb-6">total members</p>
            <button
              onClick={() => window.location.href = '/members'}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              Manage Members →
            </button>
          </div>

          <div className="group bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl border border-emerald-100 hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Attendance</h3>
            <p className="text-3xl font-bold text-emerald-600 mb-6">Today's service tracking</p>
            <button
              onClick={() => window.location.href = '/attendance'}
              className="w-full px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              Take Attendance →
            </button>
          </div>

          <div className={`group p-8 rounded-3xl border hover:shadow-xl transition-all hover:-translate-y-2 ${riskStats.red > 0 ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' : riskStats.orange > 0 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200' : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'}`}>
            <div className="text-4xl mb-4">{riskStats.red > 0 ? '🚨' : riskStats.orange > 0 ? '⚠️' : '✅'}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Engagement Alerts</h3>
            <p className="text-xl font-bold mb-2">{riskStats.red} critical</p>
            <p className="text-lg text-gray-600 mb-6">{riskStats.yellow + riskStats.orange} warnings</p>
            <button
              onClick={() => window.location.href = '/alerts'}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
            >
              View Alerts ({riskStats.red + riskStats.yellow + riskStats.orange})
            </button>
          </div>

          <div className="group bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-3xl border border-amber-200 hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth Tracking</h3>
            <p className="text-3xl font-bold text-amber-600 mb-6">Spiritual growth journeys & milestones</p>
            <button
              onClick={() => window.location.href = '/growth'}
              className="w-full px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl"
            >
              Track Growth →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-3"></span>
            <strong className="text-lg text-emerald-800 font-semibold">Risk Monitoring:</strong> 
            <span className="text-emerald-700 font-semibold ml-1">{riskStats.avgScore?.toFixed(1) || 0}%</span> avg engagement score
          </div>
          <div className="flex items-center justify-end md:justify-start">
            <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-3"></span>
            <span className="text-emerald-800 font-semibold">Daily Scan:</span> 
            <button 
              onClick={loadStats} 
              className="ml-2 px-4 py-1.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors ml-1"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
