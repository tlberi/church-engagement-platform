import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  getMembers, 
  addMember, 
  updateMember, 
  deleteMember,
  calculateMemberStats 
} from '../services/members.service';
import MemberCard from '../components/members/MemberCard';
import MemberModal from '../components/members/MemberModal';

export default function Members() {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, atRisk: 0, averageAttendance: 0 });

  const orgId = currentUser?.email?.split('@')[0] || 'demo-org';

  // Load members with callback for memoization
  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMembers(orgId);
      setMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      toast.error('Failed to load members');
      console.error('Load members error:', error);
      // Fallback demo data if Firestore fails
      setMembers([
        {
          id: 'demo1',
          name: 'John Doe',
          email: 'john@church.com',
          phone: '+237 699 123 456',
          attendanceRate: 85,
          joinDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
          role: 'leader'
        },
        {
          id: 'demo2',
          name: 'Jane Smith',
          email: 'jane@church.com',
          phone: '+237 699 789 012',
          attendanceRate: 45,
          joinDate: new Date().toISOString(),
          role: 'member'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Filter members by search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.phone || '').includes(searchTerm)
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  // Update stats when members change
  useEffect(() => {
    setStats(calculateMemberStats(members));
  }, [members]);

  const handleAddMember = useCallback(() => {
    setEditingMember(null);
    setShowAddModal(true);
  }, []);

  const handleEditMember = useCallback((member) => {
    setEditingMember(member);
    setShowAddModal(true);
  }, []);

  const handleDeleteMember = useCallback(async (member) => {
    if (!window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      return;
    }

    try {
      await deleteMember(member.id);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      toast.success(`${member.name} deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete member');
      console.error('Delete error:', error);
    }
  }, []);

  const handleSaveMember = useCallback(async (memberData) => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, memberData);
        setMembers(prev => prev.map(m => 
          m.id === editingMember.id ? { ...m, ...memberData } : m
        ));
        toast.success('Member updated successfully');
      } else {
        const newMember = await addMember({ ...memberData, orgId });
        setMembers(prev => [...prev, newMember]);
        toast.success('Member added successfully');
      }
      setShowAddModal(false);
      setEditingMember(null);
    } catch (error) {
      toast.error('Failed to save member');
      console.error('Save error:', error);
    }
  }, [editingMember, orgId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-slate-600 font-medium">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => window.history.back()}
          className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all text-lg font-medium"
        >
          ← Back
        </button>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent">
            Members
        </h1>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <p className="text-xl text-slate-600 font-medium">Manage your church community</p>
        <button 
          onClick={handleAddMember}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 whitespace-nowrap"
        >
          ➕ Add New Member
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group">
          <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">{stats.total}</div>
          <div className="text-lg font-semibold opacity-90">Total Members</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group">
          <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">{stats.active}</div>
          <div className="text-lg font-semibold opacity-90">Active Members</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group">
          <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">{stats.atRisk}</div>
          <div className="text-lg font-semibold opacity-90">At Risk</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group">
          <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">{stats.averageAttendance}%</div>
          <div className="text-lg font-semibold opacity-90">Avg Attendance</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-12">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="🔍 Search members by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-6 pl-14 text-xl bg-white/80 backdrop-blur-lg border-2 border-slate-200 rounded-3xl shadow-xl hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 text-slate-800 placeholder-slate-500"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-slate-400">🔍</span>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-32 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100">
          <div className="text-8xl mb-8 mx-auto opacity-20">👥</div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            {searchTerm ? 'No matches found' : 'No members yet'}
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Get started by adding your first church member using the button above.'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={handleAddMember}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 active:scale-95 mx-auto"
            >
              ➕ Add Your First Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <MemberModal
          member={editingMember}
          onSave={handleSaveMember}
          onClose={() => {
            setShowAddModal(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}
