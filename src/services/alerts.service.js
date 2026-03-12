import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getTodayService, getServiceAttendance } from './attendance.service';

const MEMBERS_COLLECTION = 'members';
const ATTENDANCE_COLLECTION = 'attendance';
const SERVICES_COLLECTION = 'services';
const ORG_ID = 'church1'; // Demo organization

// Get recent services (last 12)
async function getRecentServices(orgId = ORG_ID, count = 12) {
  try {
    const q = query(
      collection(db, SERVICES_COLLECTION),
      where('orgId', '==', orgId),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })).reverse(); // Chronological
  } catch (error) {
    console.error('Error getting recent services:', error);
    return [];
  }
}

// Calculate risk score for member
export async function calculateRiskScore(memberId, orgId = ORG_ID) {
  try {
    const services = await getRecentServices(orgId);
    if (services.length === 0) return { score: 100, status: 'green', consecMisses: 0 };

    let attended = 0;
    let consecMisses = 0;
    let currentStreak = 0;

    for (const service of services) {
      const attendance = await getServiceAttendance(service.id);
      const present = attendance.some(a => a.memberId === memberId);
      if (present) {
        attended++;
        currentStreak = 0;
      } else {
        currentStreak++;
        consecMisses = Math.max(consecMisses, currentStreak);
      }
    }

    const score = services.length > 0 ? Math.round((attended / services.length) * 100) : 100;
    let status = 'green';
    if (score < 60 || consecMisses >= 3) status = 'red';
    else if (score < 80) status = 'yellow';

    return {
      score,
      status,
      consecMisses,
      servicesCount: services.length,
      reason: consecMisses >= 3 ? `Missed ${consecMisses} consecutive` : `${score}% attendance`
    };
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return { score: 100, status: 'green', consecMisses: 0 };
  }
}

// Update member's risk fields
export async function updateMemberRisk(memberId, riskData, orgId = ORG_ID) {
  try {
    const updates = {
      attendanceRate: riskData.score,
      riskStatus: riskData.status,
      riskConsecMisses: riskData.consecMisses,
      riskUpdatedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    await updateDoc(doc(db, MEMBERS_COLLECTION, memberId), updates);
    return true;
  } catch (error) {
    console.error('Error updating member risk:', error);
    return false;
  }
}

// Get all alerts (at-risk members)
export async function getAlerts(orgId = ORG_ID) {
  try {
    const members = await getMembers(orgId); // Assume getMembers from members.service
    const alerts = [];
    for (const member of members) {
      const risk = await calculateRiskScore(member.id, orgId);
      if (risk.status !== 'green') {
        alerts.push({ ...member, risk });
        // Auto-update member doc
        await updateMemberRisk(member.id, risk, orgId);
      }
    }
    return alerts.sort((a, b) => (b.risk.score - a.risk.score));
  } catch (error) {
    console.error('Error getting alerts:', error);
    return [];
  }
}

// Get risk stats for dashboard
export async function getRiskStats(orgId = ORG_ID) {
  try {
    const alerts = await getAlerts(orgId);
    const allMembers = await getMembers(orgId);
    const red = alerts.filter(a => a.risk.status === 'red').length;
    const yellow = alerts.filter(a => a.risk.status === 'yellow').length;
    const green = allMembers.length - red - yellow;
    return { red, yellow, green, total: allMembers.length, avgScore: alerts.length > 0 ? alerts.reduce((sum, a) => sum + a.risk.score, 0) / alerts.length : 100 };
  } catch (error) {
    return { red: 0, yellow: 0, green: 0, total: 0, avgScore: 100 };
  }
}
