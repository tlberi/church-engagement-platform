import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import toast from 'react-hot-toast'; // For service errors

const NOTIFICATIONS_COLLECTION = 'notifications';
const TEMPLATES_COLLECTION = 'notification_templates';
const ORG_ID = 'church1'; // Demo

// ===== TEMPLATES CRUD =====

// Get templates by type/channel
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

    return [];
  }
}

// Create template
export async function createTemplate(templateData, orgId = ORG_ID) {
  try {
    const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
      ...templateData,
      orgId,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...templateData };
  } catch (error) {

    throw error;
  }
}

// ===== NOTIFICATIONS CRUD =====

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

// ===== SEND FUNCTIONS (API PLACEHOLDERS) =====

async function sendEmail(toEmail, subject, content, metadata = {}) {
  try {
    // TODO: Real SendGrid
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: toEmail }] }],
    //     from: { email: 'no-reply@church.org' },
    //     subject,
    //     content: [{ type: 'text/plain', value: content }]
    //   })
    // });
    
    console.log('📧 EMAIL SENT:', { to: toEmail, subject, content: content.substring(0, 100) + '...' });
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
    // TODO: Real Twilio
    // const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': 'Basic ' + btoa(`${process.env.TWILIO_SID}:${process.env.TWILIO_AUTH_TOKEN}`),
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: new URLSearchParams({
    //     To: toPhone,
    //     From: process.env.TWILIO_PHONE,
    //     Body: message
    //   })
    // });
    
    console.log('📱 SMS SENT:', { to: toPhone, message: message.substring(0, 100) + '...' });
    toast(`SMS sent to ${toPhone}`);
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    toast.error('Failed to send SMS');
    return false;
  }
}

// Send notification with template rendering
export async function sendNotification(templateId, recipientId, recipientEmail, recipientPhone, channel, metadata = {}) {
  try {
    // Get template
    const templates = await getTemplates('alert', channel);
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    // Render template
    let subject = template.subject;
    let content = template.body;
    const vars = { member_name: metadata.memberName, org_name: 'Grace Church', leader_name: metadata.leaderName, risk_score: metadata.riskScore };
    Object.keys(vars).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      subject = subject.replace(regex, vars[key]);
      content = content.replace(regex, vars[key]);
    });

    // Create notification record
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

    // Send based on channel
    let sent = false;
    if (channel === 'email' || channel === 'both') {
      sent = await sendEmail(recipientEmail, subject, content, metadata);
    }
    if (channel === 'sms' || channel === 'both') {
      sent = await sendSMS(recipientPhone, content.substring(0, 160), metadata);
    }

    // Update status
    await updateNotificationStatus(notification.id, sent ? 'sent' : 'failed');

    return { success: sent, notificationId: notification.id };
  } catch (error) {

    return { success: false, error: error.message };
  }
}

// Seed default templates (run once)
export async function seedDefaultTemplates(orgId = ORG_ID) {
  const existing = await getTemplates(null, null, orgId);
  if (existing.length > 0) return { seeded: 0 };

  const templates = [
    {
      name: 'Red Alert - Leader Email',
      type: 'alert',
      channel: 'email',
      subject: '🚨 RED ALERT: {member_name} - Immediate Action Required',
      body: `URGENT: {member_name} ({risk_score}/100)\n\n{member_name} has {consec_misses} consecutive absences.\n89% dropout risk in 30 days.\n\nRecommended:\n• Personal contact within 24h (85% success)\n• Home/small group visit\n\nView: https://app.church/alerts/{alert_id}\n\nPastor {leader_name}`
    },
    {
      name: 'Yellow Alert - Member SMS',
      type: 'alert',
      channel: 'sms',
      subject: '',
      body: 'Hi {member_name}, we\\u2019ve missed you at church! Join us Sunday? Reply YES to connect. - Grace Church'
    },
    {
      name: 'Red Alert - Member SMS',
      type: 'alert',
      channel: 'sms',
      subject: '',
      body: 'URGENT: {member_name}, Pastor needs to connect urgently. Reply CALL or text {leader_phone}. We care! 🙏'
    }
  ];

  let seeded = 0;
  for (const t of templates) {
    await createTemplate(t, orgId);
    seeded++;
  }
  return { seeded };
}

