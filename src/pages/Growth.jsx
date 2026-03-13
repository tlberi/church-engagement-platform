import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import GrowthJourney from '../components/growth/GrowthJourney';
import { 
  getGrowthPlans, 
  getMemberProgress, 
  seedDefaultNewMemberJourney,
  updateMemberProgress,
  getGrowthStats,
  assignPlanToNewMembers 
} from '../services/growth.service';
import { toast } from 'react-hot-toast';
import { getOrgId } from '../utils/org';

const Growth = () => {
  const { currentUser } = useAuth();
  const orgId = getOrgId(currentUser);
  
  const [plans, setPlans] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberProgress, setMemberProgress] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [plansData, statsData] = await Promise.all([
        getGrowthPlans(orgId),
        getGrowthStats(orgId)
      ]);
      setPlans(plansData);
      setStats(statsData);
      
      if (plansData.length === 0) {
        await seedDefaultNewMemberJourney(orgId);
        const newPlans = await getGrowthPlans(orgId);
        setPlans(newPlans);
      }
    } catch (error) {
      toast.error('Failed to load growth data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMemberProgress = async (index) => {
    try {
      if (!selectedPlanId) {
        toast.error('Select a growth plan first');
        return;
      }
      
      const progress = await getMemberProgress(`member${index}`, selectedPlanId, orgId);
      setMemberProgress(progress);
      setSelectedMember({ id: `member${index}`, name: `Member ${index}` });
    } catch (error) {
      toast.error('Failed to load progress');
    }
  };

  const handleMilestoneToggle = async (milestoneId, completed) => {
    if (!selectedMember?.id || !selectedPlanId) return;
    
    try {
      await updateMemberProgress(
        selectedMember.id, 
        selectedPlanId, 
        milestoneId, 
        completed,
        orgId
      );
      
      // Reload progress
      const updatedProgress = await getMemberProgress(selectedMember.id, selectedPlanId, orgId);
      setMemberProgress(updatedProgress);
      toast.success(completed ? 'Milestone completed! ✅' : 'Milestone reset');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleAssignAllNew = async () => {
    if (!selectedPlanId) {
      toast.error('Select a plan first');
      return;
    }
    try {
      await assignPlanToNewMembers(selectedPlanId, orgId);
      toast.success('Assigned to new members!');
    } catch (error) {
      toast.error('Failed to assign plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading growth tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-12 justify-center">
        <button
          onClick={() => window.history.back()}
          className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all text-lg font-medium"
        >
          ← Back
        </button>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Growth Tracking Dashboard
        </h1>
      </div>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Track spiritual growth journeys, auto-detect progress, celebrate milestones
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="group p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth Plans</h3>
          <p className="text-4xl font-bold text-blue-600 mb-2">{stats.totalPlans || 0}</p>
        </div>
        <div className="group p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Members Tracked</h3>
          <p className="text-4xl font-bold text-emerald-600 mb-2">{stats.membersWithPlans || 0}</p>
        </div>
        <div className="group p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Avg Progress</h3>
          <p className="text-4xl font-bold text-purple-600 mb-2">{stats.avgProgress || 0}%</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center">
          <select 
            value={selectedPlanId || ''} 
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="flex-1 max-w-md p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all shadow-sm"
          >
            <option value="">Select Growth Plan</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          
          {selectedPlanId && (
            <button 
              onClick={handleAssignAllNew}
              className="px-8 py-4 bg-emerald-500 text-white font-semibold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Assign to New Members
            </button>
          )}
        </div>

        {selectedPlanId && !selectedMember && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl">
            <p className="text-2xl text-gray-600 mb-8">Select a member to view progress:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {Array.from({length: 10}, (_, index) => `Member ${index+1}`).map((name, index) => (
                <button 
                  key={name}
                  onClick={() => loadMemberProgress(index+1)}
                  className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all hover:bg-blue-50 font-medium"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {memberProgress && (
          <div>
            <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded-2xl">
              <h2 className="text-3xl font-bold text-gray-900">{selectedMember?.name || 'Member'}'s Journey</h2>
              <button 
                onClick={() => {
                  setSelectedMember(null);
                  setMemberProgress(null);
                }}
                className="px-6 py-3 bg-gray-100 border border-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium flex items-center gap-2"
              >
                Back to Select
              </button>
            </div>
            
            <GrowthJourney 
              progressData={memberProgress}
              onMilestoneToggle={handleMilestoneToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Growth;
