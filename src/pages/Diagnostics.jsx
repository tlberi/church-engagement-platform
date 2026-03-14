import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrgId } from '../utils/org';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTIONS = {
  members: 'members',
  services: 'services',
  attendance: 'attendance',
  alerts: 'alerts',
  memberProgress: 'memberProgress'
};

const StatusRow = ({ label, value }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="text-sm font-semibold text-gray-700">{label}</div>
    <div className="text-lg font-bold text-gray-900">{value}</div>
  </div>
);

export default function Diagnostics() {
  const { currentUser } = useAuth();
  const orgId = getOrgId(currentUser);
  const [stats, setStats] = useState({
    members: 0,
    services: 0,
    attendance: 0,
    alerts: 0,
    memberProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const membersSnap = await getDocs(query(
          collection(db, COLLECTIONS.members),
          where('orgId', '==', orgId)
        ));
        const servicesSnap = await getDocs(query(
          collection(db, COLLECTIONS.services),
          where('orgId', '==', orgId)
        ));
        const alertsSnap = await getDocs(query(
          collection(db, COLLECTIONS.alerts),
          where('orgId', '==', orgId)
        ));
        const progressSnap = await getDocs(query(
          collection(db, COLLECTIONS.memberProgress),
          where('orgId', '==', orgId)
        ));

        let attendanceCount = 0;
        const services = servicesSnap.docs.map(docSnap => docSnap.id);
        for (const serviceId of services) {
          const attendanceSnap = await getDocs(query(
            collection(db, COLLECTIONS.attendance),
            where('serviceId', '==', serviceId)
          ));
          attendanceCount += attendanceSnap.size;
        }

        setStats({
          members: membersSnap.size,
          services: servicesSnap.size,
          attendance: attendanceCount,
          alerts: alertsSnap.size,
          memberProgress: progressSnap.size
        });
      } catch (err) {
        setError(err.message || 'Diagnostics failed');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [orgId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">Diagnostics Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Diagnostics</h1>
        <p className="text-gray-600">Org: {orgId} {currentUser?.email ? `(${currentUser.email})` : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusRow label="Members" value={stats.members} />
        <StatusRow label="Services" value={stats.services} />
        <StatusRow label="Attendance Records" value={stats.attendance} />
        <StatusRow label="Alerts" value={stats.alerts} />
        <StatusRow label="Growth Progress" value={stats.memberProgress} />
      </div>
    </div>
  );
}
