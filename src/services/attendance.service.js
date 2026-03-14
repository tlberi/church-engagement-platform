import { 
  collection, 
  addDoc, 
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const ATTENDANCE_COLLECTION = 'attendance';
const SERVICES_COLLECTION = 'services';

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Create a new service session
export async function createService(orgId, serviceData) {
  try {
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), {
      orgId,
      date: serviceData.date || getLocalDateString(),
      type: serviceData.type || 'Sunday Service',
      publicCheckIn: false,
      createdAt: Timestamp.now(),
    });
    
    return {
      id: docRef.id,
      orgId,
      ...serviceData
    };
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

// Get today's service or create one
export async function getTodayService(orgId) {
  try {
    const today = getLocalDateString();
    
    const q = query(
      collection(db, SERVICES_COLLECTION),
      where('orgId', '==', orgId),
      where('date', '==', today)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    // Create today's service if it doesn't exist
    return await createService(orgId, {
      date: today,
      type: 'Sunday Service'
    });
  } catch (error) {
    console.error('Error getting today service:', error);
    throw error;
  }
}

// Mark member as present
export async function markPresent(serviceId, memberId, memberName, orgId) {
  try {
    const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), {
      serviceId,
      memberId,
      memberName,
      status: 'present',
      checkInTime: Timestamp.now(),
    });
    
    // Trigger risk recalc for this member
    try {
      const { calculateRiskScore, updateMemberRisk } = await import('./alerts.service.js');
      const risk = await calculateRiskScore(memberId, orgId);
      await updateMemberRisk(memberId, risk, orgId);
    } catch (riskError) {
      // Risk update failed silently
    }

    return {
      id: docRef.id,
      serviceId,
      memberId,
      memberName,
      status: 'present'
    };
  } catch (error) {
    console.error('Error marking present:', error);
    throw error;
  }
}

// Get attendance for a service
export async function getServiceAttendance(serviceId) {
  try {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('serviceId', '==', serviceId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      checkInTime: doc.data().checkInTime?.toDate()
    }));
  } catch (error) {
    console.error('Error getting attendance:', error);
    throw error;
  }
}

// Get attendance statistics
export function calculateAttendanceStats(totalMembers, presentMembers) {
  const present = Array.isArray(presentMembers)
    ? presentMembers.length
    : Number(presentMembers) || 0;
  const absent = totalMembers - present;
  const percentage = totalMembers > 0 
    ? ((present / totalMembers) * 100).toFixed(1) 
    : 0;
  
  return {
    total: totalMembers,
    present,
    absent,
    percentage
  };
}
