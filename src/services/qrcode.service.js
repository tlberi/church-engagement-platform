import QRCode from 'qrcode';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Generate QR code for a service/event
export async function generateServiceQR(serviceId, orgId) {
  try {
    // Create check-in URL - supports production URLs
    const publicUrl = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
    const checkInUrl = `${publicUrl}/checkin/${orgId}/${serviceId}`;

    try {
      await updateDoc(doc(db, 'services', serviceId), {
        publicCheckIn: true
      });
    } catch (error) {
      // If update fails, QR still works for authenticated users
    }
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#667eea',
        light: '#ffffff'
      }
    });
    
    return {
      qrCodeDataUrl,
      checkInUrl,
      serviceId
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// Generate downloadable QR code (for printing)
export async function downloadQRCode(serviceId, orgId, eventName) {
  try {
    const { qrCodeDataUrl } = await generateServiceQR(serviceId, orgId);
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `QR-${eventName}-${serviceId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    throw error;
  }
}

