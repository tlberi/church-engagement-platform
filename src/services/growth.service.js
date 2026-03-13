import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getMembers } from './members.service';
import { getRecentServices, getServiceAttendance } from './attendance.service';
import toast from 'react-hot-toast';

const GROWTH_PLANS_COLLECTION = 'growthPlans';
const MEMBER_PROGRESS_COLLECTION = 'memberProgress';
const ORG_ID = 'church1'; // Demo - use currentUser.email in prod

/**
 * Get all growth plans for organization
 */
export async function getGrowthPlans(orgId = ORG_ID) {
  try {
    const q = query(
      collection(db, GROWTH_PLANS_COLLECTION),
      where('orgId', '==', orgId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting growth plans:', error);
    toast.error('Failed to load growth plans');
    return [];
  }
}

/**
 * Add new growth plan
 */
export async function addGrowthPlan(planData) {
  try {
    const docRef = await addDoc(collection(db, GROWTH_PLANS_COLLECTION), {
      ...planData,
      orgId: ORG_ID,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    toast.success('Growth plan created!');
    return { id: docRef.id, ...planData };
  } catch (error) {
    console.error('Error adding growth plan:', error);
    toast.error('Failed to create growth plan');
    throw error;
  }
}

/**
 * Update growth plan
 */
export async function updateGrowthPlan(planId, updates) {
  try {
    await updateDoc(doc(db, GROWTH_PLANS_COLLECTION, planId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    toast.success('Growth plan updated!');
    return true;
  } catch (error) {
    console.error('Error updating growth plan:', error);
    toast.error('Failed to update growth plan');
    throw error;
  }
}

/**
 * Get member's progress for a specific plan
 */
export async function getMemberProgress(memberId, planId, orgId = ORG_ID) {
  try {
    // Get progress record
    let q = query(
      collection(db, MEMBER_PROGRESS_COLLECTION),
      where('memberId', '==', memberId),
      where('planId', '==', planId),
      where('orgId', '==', orgId)
    );
    const snapshot = await getDocs(q);
    
    let progress = null;
    if (!snapshot.empty) {
      progress = snapshot.docs[0].data();
      progress.id = snapshot.docs[0].id;
    }

    // Get plan
    const plans = await getGrowthPlans(orgId);
    const plan = plans.find(p => p.id === planId);
    if (!plan) return null;

    // Auto-detect progress
    const autoProgress = await calculateAutoProgress(memberId, plan.milestones, orgId);
    
    // Merge with saved progress
    const fullProgress = {
      ...progress,
      plan,
      autoProgress,
      overallProgress: Math.max((progress?.progress || 0), autoProgress.progress)
    };

    return fullProgress;
  } catch (error) {
    console.error('Error getting member progress:', error);
    toast.error('Failed to load progress');
    return null;
  }
}

/**
 * Auto-calculate progress based on attendance data and rules
 */
async function calculateAutoProgress(memberId, milestones, orgId = ORG_ID) {
  try {
    const services = await getRecentServices(orgId, 20); // Last 20 services
    let completedCount = 0;
    const completedMilestones = [];

    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      let completed = false;

      switch (milestone.type) {
        case 'attendance':
          if (milestone.requirement.consecutiveWeeks) {
            completed = await checkConsecutiveAttendance(memberId, milestone.requirement.consecutiveWeeks, services);
          }
          break;
        case 'event':
        case 'task':
          // Manual only for now
          completed = false;
          break;
      }

      if (completed) {
        completedCount++;
        completedMilestones.push(milestone.id);
      }
    }

    const progress = Math.round((completedCount / milestones.length) * 100);
    return {
      progress,
      completedMilestones,
      currentMilestoneIndex: completedCount,
      autoDetected: true
    };
  } catch (error) {
    console.error('Auto-progress error:', error);
    return { progress: 0, completedMilestones: [], currentMilestoneIndex: 0 };
  }
}

/**
 * Check if member has N consecutive weeks attendance
 */
async function checkConsecutiveAttendance(memberId, requiredWeeks, services) {
  if (services.length < requiredWeeks) return false;

  // Check last N services
  for (let i = 0; i < requiredWeeks; i++) {
    const service = services[i];
    const attendance = await getServiceAttendance(service.id);
    const present = attendance.some(a => a.memberId === memberId);
    if (!present) return false;
  }
  return true;
}

/**
 * Update progress (manual or auto)
 */
export async function updateMemberProgress(memberId, planId, milestoneId, completed = true, orgId = ORG_ID) {
  try {
    // Get existing or create new
    let progressData = {
      memberId,
      planId,
      orgId,
      completedMilestones: [],
      currentMilestoneIndex: 0,
      progress: 0,
      updatedAt: Timestamp.now()
    };

    const existingQuery = query(
      collection(db, MEMBER_PROGRESS_COLLECTION),
      where('memberId', '==', memberId),
      where('planId', '==', planId)
    );
    const snapshot = await getDocs(existingQuery);
    
    if (!snapshot.empty) {
      const existing = snapshot.docs[0].data();
      progressData = { ...existing };
      if (completed && !progressData.completedMilestones.includes(milestoneId)) {
        progressData.completedMilestones.push(milestoneId);
        progressData.currentMilestoneIndex++;
      } else if (!completed) {
        progressData.completedMilestones = progressData.completedMilestones.filter(id => id !== milestoneId);
        progressData.currentMilestoneIndex--;
      }
    }

    // Recalculate progress
    const plans = await getGrowthPlans(orgId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const total = plan.milestones.length;
      progressData.progress = Math.round((progressData.completedMilestones.length / total) * 100);
    }

    const progressRef = snapshot.empty 
      ? await addDoc(collection(db, MEMBER_PROGRESS_COLLECTION), progressData)
      : doc(db, MEMBER_PROGRESS_COLLECTION, snapshot.docs[0].id);

    await updateDoc(progressRef, {
      ...progressData,
      updatedAt: Timestamp.now()
    });

    toast.success(`Progress updated! ${completed ? '✅ Completed' : '⏳ Reset'}`);
    return progressData;
  } catch (error) {
    console.error('Error updating progress:', error);
    toast.error('Failed to update progress');
    throw error;
  }
}

/**
 * Seed default New Member Journey plan
 */
export async function seedDefaultNewMemberJourney(orgId = ORG_ID) {
  try {
    const plans = await getGrowthPlans(orgId);
    if (plans.some(p => p.name === 'New Member Journey')) {
      toast.info('New Member Journey already exists');
      return;
    }

    const defaultPlan = {
      id: 'new-member-journey',
      name: 'New Member Journey',
      description: '7-step path for new members',
      milestones: [
        {
          id: 'welcome-class',
          name: 'Attend Welcome Class',
          order: 1,
          type: 'event',
          requirement: { eventType: 'welcome-class', count: 1 }
        },
        {
          id: 'meet-pastor',
          name: 'Meet with Pastor',
          order: 2,
          type: 'task',
          requirement: { taskType: 'pastoral-meeting' }
        },
        {
          id: 'join-small-group',
          name: 'Join a Small Group',
          order: 3,
          type: 'task',
          requirement: { taskType: 'small-group-enrollment' }
        },
        {
          id: '4-consecutive-weeks',
          name: 'Attend 4 Consecutive Weeks',
          order: 4,
          type: 'attendance',
          requirement: { consecutiveWeeks: 4 }
        },
        {
          id: 'serve-ministry',
          name: 'Serve in a Ministry',
          order: 5,
          type: 'task',
          requirement: { taskType: 'ministry-volunteer' }
        },
        {
          id: 'baptism-class',
          name: 'Complete Baptism Class',
          order: 6,
          type: 'event',
          requirement: { eventType: 'baptism-class', count: 1 }
        },
        {
          id: 'bring-friend',
          name: 'Bring a Friend',
          order: 7,
          type: 'task',
          requirement: { taskType: 'guest-invitation' }
        }
      ]
    };

    await addGrowthPlan(defaultPlan);
    toast.success('New Member Journey seeded!');
  } catch (error) {
    console.error('Seed error:', error);
    toast.error('Failed to seed default plan');
    throw error;
  }
}

/**
 * Assign plan to all new members (batch)
 */
export async function assignPlanToNewMembers(planId, orgId = ORG_ID) {
  try {
    const members = await getMembers(orgId);
    const newMembers = members.filter(m => !m.progressSummary?.currentPlanId);
    
    for (const member of newMembers) {
      await updateMemberProgress(member.id, planId, null, false, orgId);
      // Also update member summary
      const memberUpdates = {
        progressSummary: {
          currentPlanId: planId,
          progressPercent: 0,
          nextMilestone: 'welcome-class',
          streakDays: 0,
          updatedAt: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      };
      // Note: use members service to update
    }
    
    toast.success(`Assigned plan to ${newMembers.length} new members`);
  } catch (error) {
    console.error('Assign plan error:', error);
    toast.error('Failed to assign plan');
  }
}

// Get summary stats for growth dashboard
export async function getGrowthStats(orgId = ORG_ID) {
  try {
    const plans = await getGrowthPlans(orgId);
    const members = await getMembers(orgId);
    const progressRecords = await getAllMemberProgress(orgId);
    
    const stats = {
      totalPlans: plans.length,
      membersWithPlans: new Set(progressRecords.map(p => p.memberId)).size,
      avgProgress: Math.round(
        progressRecords.reduce((sum, p) => sum + (p.progress || 0), 0) / Math.max(progressRecords.length, 1)
      ),
      milestonesCompleted: progressRecords.reduce((sum, p) => sum + p.completedMilestones?.length || 0, 0)
    };
    
    return stats;
  } catch (error) {
    return { totalPlans: 0, membersWithPlans: 0, avgProgress: 0, milestonesCompleted: 0 };
  }
}

async function getAllMemberProgress(orgId) {
  const q = query(collection(db, MEMBER_PROGRESS_COLLECTION), where('orgId', '==', orgId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

