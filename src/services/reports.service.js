// Pure service functions - no UI toast

// Mock attendance data for last 30 days
export const getAttendanceTrends = async (orgId = 'demo-org') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = [
        { date: '2024-01-01', attendance: 85, totalMembers: 120 },
        { date: '2024-01-08', attendance: 92, totalMembers: 120 },
        { date: '2024-01-15', attendance: 78, totalMembers: 122 },
        { date: '2024-01-22', attendance: 95, totalMembers: 122 },
        { date: '2024-01-29', attendance: 88, totalMembers: 125 },
        { date: '2024-02-05', attendance: 91, totalMembers: 125 },
        { date: '2024-02-12', attendance: 82, totalMembers: 128 },
      ];
      resolve(data);
    }, 800);
  });
};

// Mock risk distribution data
export const getRiskDistribution = async (orgId = 'demo-org') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        critical: 8,
        high: 15, 
        medium: 32,
        low: 45,
        healthy: 120
      });
    }, 500);
  });
};

// Mock overall metrics
export const getReportsSummary = async (orgId = 'demo-org') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalMembers: 125,
        avgAttendance: 87.3,
        engagementScore: 82.5,
        servicesThisMonth: 12,
        newMembers: 5,
        alertsResolved: 23
      });
    }, 600);
  });
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

