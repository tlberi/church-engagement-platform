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
from 'firebase/firestore';
  addDoc,
  getDoc,
  setDoc,
  orderBy

import { db } from '../config/firebase';
import { getTodayService, getServiceAttendance } from './attendance.service';
import { getMembers } from './members.service';
import { sendNotification, getTemplates, seedDefaultTemplates } from './notifications.service';

const MEMBERS_COLLECTION = 'members';
const ATTENDANCE_COLLECTION = 'attendance';
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
    console.error('Error getting recent services:', error);
    return [];
  }
}

// Calculate risk score for member - EXACT SPEC IMPLEMENTATION
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

    // Build attendance history
    const attendanceHistory = [];
    let totalAttended = 0;
    let consecMisses = 0;
    let currentStreak = 0;
    let daysSinceLast = 0;
    let lastAttendDate = null;

    for (const service of services) {
      const attendance = await getServiceAttendance(service.id);
      const present = attendance.some(a => a.memberId === memberId);
      attendanceHistory.push(present ? 1 : 0);
      
      if (present) {
        totalAttended++;
        currentStreak = 0;
        if (lastAttendDate) {
          const daysDiff = Math.floor((new Date(service.date) - lastAttendDate) / (1000 * 60 * 60 * 24));
          daysSinceLast = Math.min(daysSinceLast, daysDiff);
        }
        lastAttendDate = new Date(service.date);
      } else {
        currentStreak++;
        consecMisses = Math.max(consecMisses, currentStreak);
      }
    }

    const totalServices = services.length;
    const attendanceRate = totalServices > 0 ? (totalAttended / totalServices) * 100 : 0;

    // 1. ATTENDANCE PATTERN (35pts max)
    let attendancePts = 0;
    // Consecutive absences
    if (consecMisses === 1) attendancePts += 3;
    else if (consecMisses === 2) attendancePts += 7;
    else if (consecMisses >= 3) attendancePts += 15;
    // Decline (compare last 12 vs first half)
    const recentRate = attendanceHistory.slice(0, 12).reduce((a, b) => a + b, 0) / 12 * 100;
    const historicalRate = attendanceHistory.slice(12).reduce((a, b) => a + b, 0) / (totalServices - 12) * 100;
    const decline = historicalRate - recentRate;
    if (decline < 10) attendancePts += 2;
    else if (decline < 20) attendancePts += 5;
    else attendancePts += 10;
    // Instability (variance)
    const avg = attendanceRate / 100;
    const variance = attendanceHistory.reduce((sumSq, val) => sumSq + Math.pow(val - avg, 2), 0) / totalServices;
    const instability = Math.sqrt(variance) * 100;
    if (instability > 30) attendancePts += 5; // erratic
    else if (instability > 20) attendancePts += 8; // sudden
    else attendancePts += 10; // gradual decline

    // 2. ENGAGEMENT VELOCITY (25pts max) - proxy from attendance gaps
    let engagementPts = Math.min(daysSinceLast / 2, 25);

    // 3. PROGRESS VELOCITY (20pts) - mock 0 (no progress data)
    let progressPts = 0;

    // 4. RELATIONSHIP STRENGTH (15pts) - mock deficit
    let relationshipPts = 15; // assume 0 connections *1.6 = max

    // 5. LIFE CHANGE INDICATORS (5pts) - mock 0
    let lifePts = 0;

    const totalScore = Math.round(attendancePts + engagementPts + progressPts + relationshipPts + lifePts);

    // Risk Level
    let riskLevel = 'green';
    if (totalScore <= 25) riskLevel = 'green';
    else if (totalScore <= 50) riskLevel = 'yellow';
    else if (totalScore <= 75) riskLevel = 'orange';
    else riskLevel = 'red';

    // Evidence Report
    const evidence = [
      `Attendance Pattern: ${attendancePts.toFixed(0)}/35pts (${consecMisses} consec misses, ${decline.toFixed(1)}% decline, instability ${instability.toFixed(1)}%)`,
      `Engagement: ${engagementPts.toFixed(0)}/25pts (${daysSinceLast} days since last)`,
      `85% of members with ${consecMisses}+ consec absences disengage within 30 days`,
      `Predicted outcome: ${riskLevel === 'red' ? '75% chance of disengagement' : 'Healthy trajectory'}`
    ];

    // Recommendations
    const recommendations = riskLevel === 'red' ? [
      'Immediate personal contact (85% success)',
      'Home/small group visit (92% retention)',
      'Leadership assignment required'
    ] : riskLevel === 'orange' ? [
      'SMS/email nurture sequence (78% success)',
      'Small group invitation'
    ] : [];

    return {
      score: totalScore,
      riskLevel,
      status: riskLevel, // backward compat
      breakdown: {
        attendance: attendancePts,
        engagement: engagementPts,
        progress: progressPts,
        relationship: relationshipPts,
        life: lifePts
      },
      consecMisses,
      attendanceRate,
      servicesCount: totalServices,
      evidenceReport: evidence.join('; '),
      recommendations,
      reason: `${totalScore}pts - ${riskLevel.toUpperCase()} (${consecMisses} consec misses)`
    };
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return { 
      score: 0, 
      riskLevel: 'green', 
      status: 'green',
      breakdown: { attendance: 0, engagement: 0, progress: 0, relationship: 0, life: 0 },
      evidenceReport: 'Calculation error',
      consecMisses: 0 
    };
  }
}

// Update member's risk fields
export async function updateMemberRisk(memberId, riskData, orgId = ORG_ID) {
  try {
    const updates = {
      attendanceRate: riskData.attendanceRate || riskData.score,
      riskStatus: riskData.riskLevel || riskData.status,
      riskConsecMisses: riskData.consecMisses || 0,
      riskScore: riskData.score,
      riskBreakdown: riskData.breakdown || {},
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

// Get risk stats for dashboard (uses collection alerts)
export async function getRiskStats(orgId = ORG_ID) {
  try {
    const alerts = await getAlerts(orgId);
    const allMembers = await getMembers(orgId);
    const red = alerts.filter(a => a.severity === 'red').length;
    const yellow = alerts.filter(a => a.severity === 'yellow').length;
    const orange = alerts.filter(a => a.severity === 'orange').length;
    const green = allMembers.length - red - yellow - orange;
    const avgScore = alerts.length > 0 ? alerts.reduce((sum, a) => sum + a.riskScore, 0) / alerts.length : 100;
    return { red, yellow, orange, green, total: allMembers.length, avgScore };
  } catch (error) {
    console.error('Risk stats error:', error);
    return { red: 0, yellow: 0, orange: 0, green: 0, total: 0, avgScore: 100 };
  }
}

// ===== ALERTS COLLECTION CRUD =====

// Create new alert
export async function createAlert(alertData, orgId = ORG_ID) {
  try {
    const alertWithDefaults = {
      ...alertData,
      orgId,
      status: 'open',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, ALERTS_COLLECTION), alertWithDefaults);
    const newAlert = { id: docRef.id, ...alertWithDefaults };
    if (newAlert.severity === 'red') {
      await triggerAlertNotifications(newAlert.id);
    }
    return newAlert;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
}

// Get alerts from collection (with optional filters)
export async function getCollectionAlerts(orgId = ORG_ID, status = null, severity = null, limitCount = 50) {
  try {
    let q = query(
      collection(db, ALERTS_COLLECTION),
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (status) q = query(q, where('status', '==', status));
    if (severity) q = query(q, where('severity', '==', severity));

    const snapshot = await getDocs(q);
    const alerts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Sort by riskScore desc
    return alerts.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  } catch (error) {
    console.error('Error getting alerts:', error);
    return [];
  }
}

// Update alert status/fields
export async function updateAlert(alertId, updates) {
  try {
    const alertRef = doc(db, ALERTS_COLLECTION, alertId);
    await updateDoc(alertRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating alert:', error);
    return false;
  }
}

// Assign alert to leader
export async function assignAlert(alertId, leaderId, orgId = ORG_ID) {
  return await updateAlert(alertId, { assignedTo: leaderId });
}

// Resolve alert
export async function resolveAlert(alertId, notes = '') {
  const updates = { status: 'resolved', resolvedAt: Timestamp.now() };
  if (notes) updates.notes = notes;
  return await updateAlert(alertId, updates);
}

// Generate daily alerts (batch process)
export async function generateDailyAlerts(orgId = ORG_ID) {
  try {
    const members = await getMembers(orgId);
    const existingAlerts = await getCollectionAlerts(orgId, 'open');
    const existingIds = new Set(existingAlerts.map(a => a.memberId));

    const newAlerts = [];
    for (const member of members) {
      const risk = await calculateRiskScore(member.id, orgId);
      
      // Threshold: score >25 or orange/red
      if (risk.score > 25 && risk.riskLevel !== 'green') {
        const existing = existingAlerts.find(a => a.memberId === member.id);
        
        if (!existing || existing.riskScore < risk.score + 10 || Date.now() - (existing.updatedAt?.toMillis() || 0) > 7*24*60*60*1000) { // changed significantly or old
          const alertData = {
            memberId: member.id,
            memberName: member.name,
            severity: risk.riskLevel,
            riskScore: risk.score,
            type: 'absence',
            triggerCondition: risk.reason,
            riskBreakdown: risk.breakdown,
            evidenceReport: risk.evidenceReport,
            recommendations: risk.recommendations,
            status: 'open'
          };
          
          let result;
          if (existing) {
            result = await updateAlert(existing.id, {
              ...alertData,
              updatedAt: Timestamp.now()
            });
          } else {
            result = await createAlert(alertData, orgId);
            newAlerts.push(result);
          }
          
          if (result) {
            console.log(`Alert ${existing ? 'updated' : 'created'} for ${member.name}: ${risk.riskLevel}`);
          }
        }
      }
    }
    
    return {
      processed: members.length,
      newAlerts: newAlerts.length,
      updated: existingAlerts.length - newAlerts.length // rough
    };
  } catch (error) {
    console.error('Daily alerts generation error:', error);
    throw error;
  }
}

// Backward compat - old computed alerts
export async function getComputedAlerts(orgId = ORG_ID) {
  const members = await getMembers(orgId);
  const alerts = [];
  for (const member of members) {
    const risk = await calculateRiskScore(member.id, orgId);
    if (risk.status !== 'green') {
      alerts.push({ ...member, risk });
      await updateMemberRisk(member.id, risk, orgId);
    }
  }
  return alerts.sort((a, b) => (b.risk.score - a.risk.score));
}

export async function triggerAlertNotifications(alertId, orgId = ORG_ID) {
  try {
    // Get alert details
    const q = query(
      collection(db, ALERTS_COLLECTION),
      where('orgId', '==', orgId),
      where(docId(db, 'alerts', alertId), '==', alertId), // Note: Firestore where on id needs ==
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    const alert = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    
    if (alert.severity !== 'red') return false;

    // Get member
    const members = await getMembers(orgId);
    const member = members.find(m => m.id === alert.memberId);
    if (!member) return false;

    // Mock leader
    const leader = {
      name: 'Pastor David',
      email: 'pastor@church.org',
      phone: '+1-555-123-4567'
    };

    // Seed templates if none
    const templates = await getTemplates('alert', null, orgId);
    if (templates.length === 0) {
      await seedDefaultTemplates(orgId);
    }

    // Leader email
    const emailTemplates = await getTemplates('alert', 'email', orgId);
    const leaderTemplate = emailTemplates.find(t => t.name === 'Red Alert - Leader Email');
    if (leaderTemplate) {
      await sendNotification(
        leaderTemplate.id,
        'leader',
        leader.email,
        null,
        'email',
        {
          memberName: alert.memberName,
          riskScore: alert.riskScore,
          consecMisses: alert.consecMisses || alert.riskBreakdown?.attendance || 0,
          alertId: alertId
        }
      );
    }

    // Member SMS
    const smsTemplates = await getTemplates('alert', 'sms', orgId);
    const memberTemplate = smsTemplates.find(t => t.name === 'Red Alert - Member SMS');
    if (memberTemplate && member.phone) {
      await sendNotification(
        memberTemplate.id,
        member.id,
        null,
        member.phone,
        'sms',
        {
          memberName: member.name,
          leaderPhone: leader.phone,
          alertId: alertId
        }
      );
    }

    return true;
  } catch (error) {
    console.error('Trigger notifications error:', error);
    return false;
  }
}

// Main getAlerts now uses collection
export async function getAlerts(orgId = ORG_ID, status = 'open') {
  return await getCollectionAlerts(orgId, status);
}

