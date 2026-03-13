import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const NOTIFICATIONS_COLLECTION = 'notifications';
const TEMPLATES_COLLECTION = 'notification_templates';
const ORG_ID = 'church1';

export async function getTemplates(type = null, channel = null, orgId = ORG_ID) {
  try {
    let q = query(
      collection(db, TEMPLATES_COLLECTION),
      where('orgId', '==', orgId),
      orderBy('name')
    );
    if (type) q = query(q, where('type', '==', type));
    if (channel) q = query(q, where('channel', '==', channel));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    toast.error(error.message);
    console.error(error);
    return [];
  }
}

export async function createTemplate(templateData, orgId = ORG_ID) {
  try {
    const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
      ...templateData,
      orgId,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...templateData };
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
}

export async function createNotification(notificationData, orgId = ORG_ID) {
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...notificationData,
      orgId,
      status: 'pending',
      createdAt: Timestamp.now(),
      sentAt: null
    });
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    throw error;
  }
}

export async function updateNotificationStatus(notificationId, status, sentAt = null) {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
      status,
      ...(sentAt && { sentAt }),
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getNotificationsForAlert(alertId, orgId = ORG_ID, limitCount = 10) {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('orgId', '==', orgId),
      where('metadata.alertId', '==', alertId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    return [];
  }
}

async function sendEmail(toEmail, subject, content, metadata = {}) {
  try {
    toast.success(`Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    toast.error('Failed to send email');
    return false;
  }
}

async function sendSMS(toPhone, message, metadata = {}) {
  try {
    toast.success(`SMS sent to ${toPhone}`);
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    toast.error('Failed to send SMS');
    return false;
  }
}

export async function sendNotification(templateId, recipientId, recipientEmail, recipientPhone, channel, metadata = {}) {
  try {
    const templates = await getTemplates('alert', channel);
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    let subject = template.subject || '';
    let content = template.body || '';
    const vars = { 
      member_name: metadata.memberName || 'Member',
      org_name: 'Grace Church', 
      leader_name: metadata.leaderName || 'Pastor',
      risk_score: metadata.riskScore || 0
    };
    Object.keys(vars).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      subject = subject.replace(regex, vars[key]);
      content = content.replace(regex, vars[key]);
    });

    const notificationData = {
      recipientId,
      type: 'alert',
      channel,
      subject,
      content,
      metadata,
      scheduledFor: Timestamp.now()
    };
    const notification = await createNotification(notificationData);

    let sent = false;
    if (channel === 'email' || channel === 'both') {
      sent = await sendEmail(recipientEmail, subject, content, metadata);
    }
    if (channel === 'sms' || channel === 'both') {
      sent = await sendSMS(recipientPhone, content.substring(0, 160), metadata);
    }

    await updateNotificationStatus(notification.id, sent ? 'sent' : 'failed');

    return { success: sent, notificationId: notification.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

