import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';

const MemberModal = ({ member, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    attendanceRate: 100,
    role: 'member'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        attendanceRate: member.attendanceRate || 100,
        role: member.role || 'member'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        joinDate: new Date().toISOString().split('T')[0],
        attendanceRate: 100,
        role: 'member'
      });
    }
  }, [member]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
        <div 
          className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all sm:my-8 sm:w-full sm:p-8 sm:max-w-lg" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 
              id="modal-title" 
              className="text-3xl font-bold leading-6 text-gray-900 tracking-tight"
            >
              {member ? 'Edit Member' : 'Add New Member'}
            </h2>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-12 w-12 rounded-2xl inline-flex items-center justify-center text-2xl transition-all duration-200"
              onClick={onClose}
            >
              <span className="sr-only">Close modal</span>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-5 py-4 text-lg border-2 rounded-2xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-5 py-4 text-lg border-2 rounded-2xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                placeholder="+237 699 123 456"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Join Date */}
              <div>
                <label htmlFor="joinDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Join Date
                </label>
                <input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleChange('joinDate', e.target.value)}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-sm hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  <option value="member">Member</option>
                  <option value="leader">Small Group Leader</option>
                  <option value="pastor">Pastor / Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {/* Attendance Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Attendance Rate: <span className="text-2xl font-black text-blue-600">{formData.attendanceRate}%</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.attendanceRate}
                  onChange={(e) => handleChange('attendanceRate', parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-gray-200 via-blue-200 to-blue-400 rounded-full cursor-pointer appearance-none accent-blue-500 shadow-md hover:shadow-lg transition-shadow"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl text-lg hover:border-gray-300 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>{member ? '💾 Update Member' : '➕ Add Member'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;

