import { useState } from 'react';

export default function AlertCard({ alert, onContact, onAssign, onResolve }) {
  const [showEvidence, setShowEvidence] = useState(false);

  const statusColors = {
    red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: 'bg-red-500/20 text-red-500', progress: 'bg-red-500' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', icon: 'bg-yellow-500/20 text-yellow-500', progress: 'bg-yellow-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', icon: 'bg-orange-500/20 text-orange-500', progress: 'bg-orange-500' },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', icon: 'bg-emerald-500/20 text-emerald-500', progress: 'bg-emerald-500' }
  };

  const severity = alert.severity || alert.risk?.riskLevel || alert.risk?.status || 'green';
  const color = statusColors[severity] || statusColors.green;
  const score = alert.riskScore || alert.risk?.score || alert.score || 0;
  const reason = alert.reason || alert.risk?.evidenceReport || alert.evidenceReport || alert.triggerCondition || 'No reason provided';
  const evidence = alert.evidenceReport || alert.risk?.evidenceReport || '';
  const recommendations = alert.recommendations || alert.risk?.recommendations || [];
  const memberName = alert.memberName || alert.name || 'Unknown';

  return (
    <>
      <div className={`p-6 rounded-2xl shadow-sm border-2 ${color.border} ${color.bg} hover:shadow-md transition-all mb-4`}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 ${color.icon} rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0`}>
            {memberName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-900 truncate mb-1">{memberName}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${color.text} bg-white/60 backdrop-blur-sm`}>
              {severity.toUpperCase()} ALERT
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Attendance Rate</div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${color.progress}`} 
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
          <div className="font-bold text-lg text-gray-900">{score}%</div>
        </div>

        {/* Reason */}
        <p className="text-sm text-gray-700 mb-4 italic leading-relaxed">{reason}</p>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-l-4 border-blue-400 mb-4">
            <div className="font-semibold text-blue-900 mb-2">📋 Recommended Actions</div>
            <ul className="text-sm space-y-1">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <button 
            onClick={() => setShowEvidence(true)}
            className="flex-1 min-w-[120px] px-4 py-3 bg-emerald-500/90 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm backdrop-blur-sm border border-emerald-400/50"
          >
            📋 View Evidence
          </button>
          <button 
            onClick={() => onContact(alert)}
            className="flex-1 min-w-[120px] px-4 py-3 bg-blue-500/90 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm backdrop-blur-sm border border-blue-400/50"
          >
            📞 Contact Now
          </button>
          <button 
            onClick={() => onAssign(alert)}
            className="flex-1 min-w-[100px] px-3 py-3 bg-amber-500/90 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-xs backdrop-blur-sm border border-amber-400/50"
          >
            👤 Assign
          </button>
          <button 
            onClick={() => onResolve(alert)}
            className="flex-1 min-w-[100px] px-3 py-3 bg-green-500/90 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-xs backdrop-blur-sm border border-green-400/50"
          >
            ✅ Resolve
          </button>
        </div>
      </div>

      {/* Evidence Modal */}
      {showEvidence && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowEvidence(false)}>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 max-md:rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-2xl font-bold text-gray-900">📊 Evidence Report</h4>
                <button
                  onClick={() => setShowEvidence(false)}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-2xl border border-gray-200 mb-6 prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-mono bg-white/50 p-4 rounded-xl border border-gray-200 overflow-auto max-h-96">
                  {evidence || 'No detailed evidence available.'}
                </pre>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={() => setShowEvidence(false)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

