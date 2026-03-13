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

const MEMBERS_COLLECTION = 'members';

// Get all members for an organization
export async function getMembers(orgId) {
  try {
    // Query by orgId only (no orderBy to avoid index requirement)
    const q = query(
      collection(db, MEMBERS_COLLECTION),
      where('orgId', '==', orgId)
    );
    
    const snapshot = await getDocs(q);
    
    // Sort by name in JavaScript (client-side sorting)
    let members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => a.name.localeCompare(b.name));

    return members;
  } catch (error) {
    throw error;
  }
}

// Add a new member
export async function addMember(memberData) {
  try {
    const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
      ...memberData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return {
      id: docRef.id,
      ...memberData
    };
  } catch (error) {
    throw error;
  }
}

// Update a member
export async function updateMember(memberId, updates) {
  try {
    const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
    await updateDoc(memberRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    return {
      id: memberId,
      ...updates
    };
  } catch (error) {
    throw error;
  }
}

// Delete a member
export async function deleteMember(memberId) {
  try {
    await deleteDoc(doc(db, MEMBERS_COLLECTION, memberId));
    return true;
  } catch (error) {
    throw error;
  }
}

// Calculate member statistics
export function calculateMemberStats(members) {
  const total = members.length;
  const active = members.filter(m => m.attendanceRate >= 80).length;
  const atRisk = members.filter(m => m.attendanceRate < 60).length;
  const averageAttendance = total > 0 
    ? (members.reduce((sum, m) => sum + (m.attendanceRate || 0), 0) / total).toFixed(1)
    : 0;
  
  return {
    total,
    active,
    atRisk,
    averageAttendance
  };
}
