import React from 'react';
import toast from 'react-hot-toast';

const MemberCard = ({ member, onEdit, onDelete }) => {
  const attendanceRate = member.attendanceRate || 0;

  const getAttendanceColor = (rate) => {
    if (rate >= 80) return 'bg-emerald-500';
    if (rate >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (rate) => {
    if (rate >= 80) return { text: 'Active', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (rate >= 60) return { text: 'Regular', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { text: 'At Risk', className: 'bg-red-100 text-red-800 border-red-200' };
  };

  const status = getStatusBadge(attendanceRate);

  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
      <div className="flex items-start mb-6 gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-1">
            {member.name}
          </h3>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${status.className}`}>
            {status.text}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-400">📧</span>
          <span className="text-sm text-gray-700 font-medium truncate">{member.email}</span>
        </div>
        {member.phone && (
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-400">📱</span>
            <span className="text-sm text-gray-700 font-medium">{member.phone}</span>
          </div>
        )}
        {member.joinDate && (
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-400">📅</span>
            <span className="text-sm text-gray-700">Joined {new Date(member.joinDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mb-6 shadow-inner">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">Attendance Rate</div>
        <div className="bg-gray-200 h-3 rounded-full overflow-hidden mb-3 shadow-inner">
          <div 
            className={`h-full ${getAttendanceColor(attendanceRate)} shadow-lg transition-all duration-500`} 
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
        <div className="text-2xl font-black text-gray-900 text-center">
          {attendanceRate}%
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={() => onEdit(member)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
          title="Edit member details"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(member)}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
          title="Delete member"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default MemberCard;

