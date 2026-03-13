import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc, 
  updateDoc, 
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getServiceAttendance } from './attendance.service';
import { getMembers } from './members.service';

const MEMBERS_COLLECTION = 'members';
const SERVICES_COLLECTION = 'services';
const ALERTS_COLLECTION = 'alerts';
const ORG_ID = 'church1'; // Demo organization

// Get recent services (last 12)
async function getRecentServices(orgId = ORG_ID, count = 52) { // 1 year history for patterns
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
    return [];
  }
}

// Calculate risk score for member
export async function calculateRiskScore(memberId, orgId = ORG_ID) {
  try {
    const services = await getRecentServices(orgId);
    if (services.length === 0) {
      return {
        score: 0,
        riskLevel: 'green',
        breakdown: { attendance: 0, engagement: 0, progress: 0, relationship: 0, life: 0 },
        evidenceReport: 'No service history available',
        status: 'green'
      };
    }

    const attendanceHistory = [];
    let totalAttended = 0;
    let consecMisses = 0;
    let currentStreak = 0;
    let daysSinceLast = 999;
    let lastAttendDate = null;

    for (const service of services) {
      const attendance = await getServiceAttendance(service.id);
      const present = attendance.some(a => a.memberId === memberId);
      attendanceHistory.push(present ? 1 : 0);
      
      if (present) {
        totalAttended++;
        currentStreak = 0;
        lastAttendDate = new Date(service.date);
      } else {
        currentStreak++;
        consecMisses = Math.max(consecMisses, currentStreak);
      }
    }

    const totalServices = services.length;
    const attendanceRate = totalServices > 0 ? (totalAttended / totalServices) * 100 : 0;

    let score = 0;
    if (consecMisses >= 3) score += 50;
    if (consecMisses >= 2) score += 25;
    if (attendanceRate < 50) score += 25;

    const riskLevel = score <= 25 ? 'green' : score <= 50 ? 'yellow' : score <= 75 ? 'orange' : 'red';

    return {
      score: Math.min(score, 100),
      riskLevel,
      status: riskLevel,
      breakdown: {
        attendance: Math.round(attendanceRate),
        engagement: Math.round(100 - score * 1.5),
        consecMisses
      },
      evidenceReport: `${consecMisses} consecutive misses, ${attendanceRate.toFixed(0)}% attendance`,
      recommendations: riskLevel !== 'green' ? ['Personal follow-up needed'] : []
    };
  } catch (error) {
    return { 
      score: 0, 
      riskLevel: 'green', 
      status: 'green',
      breakdown: { attendance: 0, engagement: 0, progress: 0, relationship: 0, life: 0 },
      evidenceReport: 'Calculation error'
    };
  }
}

// Update member's risk fields
export async function updateMemberRisk(memberId, riskData, orgId = ORG_ID) {
  try {
    const updates = {
      riskStatus: riskData.riskLevel || riskData.status,
      riskScore: riskData.score,
      riskConsecMisses: riskData.consecMisses || 0,
      updatedAt: Timestamp.now()
    };
    await updateDoc(doc(db, MEMBERS_COLLECTION, memberId), updates);
    return true;
  } catch (error) {
    return false;
  }
}

// Get risk stats for dashboard
export async function getRiskStats(orgId = ORG_ID) {
  try {
    const members = await getMembers(orgId);
    let red = 0, yellow = 0, orange = 0, green = 0;
    
    for (const member of members) {
      const risk = await calculateRiskScore(member.id, orgId);
      switch (risk.riskLevel) {
        case 'red': red++; break;
        case 'yellow': yellow++; break;
        case 'orange': orange++; break;
        default: green++;
      }
    }
    
    return { 
      red, 
      yellow, 
      orange, 
      green, 
      total: members.length, 
      avgScore: 85 
    };
  } catch (error) {
    return { red: 0, yellow: 0, orange: 0, green: 0, total: 0, avgScore: 100 };
  }
}

// Get alerts (at-risk members)
export async function getAlerts(orgId = ORG_ID) {
  try {
    const members = await getMembers(orgId);
    const alerts = [];
    
    for (const member of members) {
      const risk = await calculateRiskScore(member.id, orgId);
      if (risk.riskLevel !== 'green') {
        alerts.push({ ...member, risk });
        await updateMemberRisk(member.id, risk, orgId);
      }
    }
    
    return alerts.sort((a, b) => b.risk.score - a.risk.score);
  } catch (error) {
    return [];
  }
}

// Create new alert
export async function createAlert(alertData, orgId = ORG_ID) {
  try {
    const docRef = await addDoc(collection(db, ALERTS_COLLECTION), {
      ...alertData,
      orgId,
      status: 'open',
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...alertData };
  } catch (error) {
    throw error;
  }
}

// Update alert
export async function updateAlert(alertId, updates) {
  try {
    await updateDoc(doc(db, ALERTS_COLLECTION, alertId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Resolve alert
export async function resolveAlert(alertId) {
  return updateAlert(alertId, { status: 'resolved' });
}

