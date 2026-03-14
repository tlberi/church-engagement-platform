import { 
  collection, 
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

const SERVICES_COLLECTION = 'services';
const ATTENDANCE_COLLECTION = 'attendance';
const MEMBERS_COLLECTION = 'members';
const ALERTS_COLLECTION = 'alerts';

const sortByDate = (a, b) => (a.date || '').localeCompare(b.date || '');

const toDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isWithinDays = (dateValue, days) => {
  const date = toDate(dateValue);
  if (!date) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
};

const isCurrentMonth = (dateValue) => {
  const date = toDate(dateValue);
  if (!date) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

export const getAttendanceTrends = async (orgId = 'demo-org') => {
  const membersSnap = await getDocs(query(
    collection(db, MEMBERS_COLLECTION),
    where('orgId', '==', orgId)
  ));
  const totalMembers = membersSnap.size;

  const servicesSnap = await getDocs(query(
    collection(db, SERVICES_COLLECTION),
    where('orgId', '==', orgId)
  ));

  const services = servicesSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort(sortByDate)
    .slice(-12);

  const data = await Promise.all(services.map(async (service) => {
    const attendanceSnap = await getDocs(query(
      collection(db, ATTENDANCE_COLLECTION),
      where('serviceId', '==', service.id)
    ));
    const present = attendanceSnap.size;
    const attendance = totalMembers > 0
      ? Math.round((present / totalMembers) * 100)
      : 0;
    return {
      date: service.date || 'Unknown',
      attendance,
      totalMembers
    };
  }));

  return data;
};

export const getRiskDistribution = async (orgId = 'demo-org') => {
  const membersSnap = await getDocs(query(
    collection(db, MEMBERS_COLLECTION),
    where('orgId', '==', orgId)
  ));

  const distribution = {
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0
  };

  membersSnap.docs.forEach(docSnap => {
    const risk = docSnap.data().riskStatus || 'green';
    if (distribution[risk] !== undefined) {
      distribution[risk] += 1;
    } else {
      distribution.green += 1;
    }
  });

  return distribution;
};

export const getReportsSummary = async (orgId = 'demo-org') => {
  const membersSnap = await getDocs(query(
    collection(db, MEMBERS_COLLECTION),
    where('orgId', '==', orgId)
  ));
  const totalMembers = membersSnap.size;

  const servicesSnap = await getDocs(query(
    collection(db, SERVICES_COLLECTION),
    where('orgId', '==', orgId)
  ));
  const services = servicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const servicesThisMonth = services.filter(service => isCurrentMonth(service.date)).length;

  const newMembers = membersSnap.docs.filter(docSnap => isWithinDays(docSnap.data().createdAt, 30)).length;

  const alertsSnap = await getDocs(query(
    collection(db, ALERTS_COLLECTION),
    where('orgId', '==', orgId)
  ));
  const alertsResolved = alertsSnap.docs.filter(docSnap => {
    const data = docSnap.data();
    if (data.status !== 'resolved') return false;
    return isWithinDays(data.updatedAt || data.resolvedAt || data.createdAt, 30);
  }).length;

  const attendanceData = await getAttendanceTrends(orgId);
  const avgAttendance = attendanceData.length > 0
    ? (attendanceData.reduce((sum, entry) => sum + (entry.attendance || 0), 0) / attendanceData.length)
    : 0;

  const risk = await getRiskDistribution(orgId);
  const riskTotal = risk.red + risk.orange + risk.yellow + risk.green;
  const riskPenalty = risk.red * 30 + risk.orange * 20 + risk.yellow * 10;
  const engagementScore = riskTotal > 0
    ? Math.max(0, Math.round(100 - (riskPenalty / riskTotal)))
    : 0;

  return {
    totalMembers,
    avgAttendance: Number(avgAttendance.toFixed(1)),
    engagementScore,
    servicesThisMonth,
    newMembers,
    alertsResolved
  };
};

// Export attendance CSV (pure function - returns success)
export const exportAttendanceCSV = (data) => {
  if (!data || data.length === 0) {
    console.warn('No attendance data to export');
    return false;
  }
  
  const csv = 'Date,Attendance %,Total Members\n' + 
    data.map(row => `${row.date},${row.attendance},${row.totalMembers}`).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-report-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  return true;
};

// Export alerts CSV (pure function - returns success)  
export const exportAlertsCSV = (alerts) => {
  if (!alerts || alerts.length === 0) {
    console.warn('No alerts data to export');
    return false;
  }
  
  const csv = 'Member,Severity,Risk Score,Reason,Date\n' + 
    alerts.map(a => {
      const memberName = a.memberName || a.name || 'Unknown';
      const severity = a.severity || a.risk?.riskLevel || a.risk?.status || 'N/A';
      const riskScore = a.riskScore || a.risk?.score || 0;
      const reason = a.reason || a.risk?.evidenceReport || a.evidenceReport || 'N/A';
      const timestampValue = a.timestamp || a.createdAt?.toDate?.() || new Date();
      const timestamp = timestampValue instanceof Date ? timestampValue.toISOString() : timestampValue;
      return `"${memberName}",${severity},${riskScore},"${reason}","${timestamp}"`;
    }).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alerts-report-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  return true;
};

