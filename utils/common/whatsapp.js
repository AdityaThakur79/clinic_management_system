// AiSensy WhatsApp sender (template-based)
// Configure via env: AISENSY_API_KEY, AISENSY_CAMPAIGN_ID (or TEMPLATE), AISENSY_SENDER (optional)

export const sendWhatsAppTemplate = async ({ toPhone, templateName, templateParams = [], mediaUrl }) => {
  try {
    const apiKey = process.env.AISENSY_API_KEY;
    if (!apiKey) {
      console.log('[WhatsApp] Skipping send (AISENSY_API_KEY not set)');
      return { skipped: true };
    }
    // Format phone for WhatsApp (AiSensy needs + prefix)
    const cleaned = String(toPhone).replace(/\D/g, '');
    let destination;
    if (toPhone.startsWith('+')) {
      destination = toPhone; // Already has +
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      destination = `+${cleaned}`; // Has 91 prefix, add +
    } else if (cleaned.length === 10) {
      destination = `+91${cleaned}`; // 10 digits, add +91
    } else {
      destination = `+${cleaned}`; // Default: add +
    }
    
    // AiSensy API payload format - match exact structure from documentation
    const payload = {
      apiKey,
      campaignName: templateName || process.env.AISENSY_CAMPAIGN_ID,
      destination,
      userName: 'Patient',
      source: 'api',
      templateParams,
    };
    
    // Add media only if provided (object format as per AiSensy docs)
    if (mediaUrl) {
      payload.media = { 
        url: mediaUrl, 
        filename: 'image.jpg' 
      };
    }
    
    console.log('[WhatsApp] Sending template...', { 
      templateName: payload.campaignName, 
      to: payload.destination,
      paramsCount: templateParams.length,
      hasMedia: !!mediaUrl,
      params: templateParams
    });
    
    const resp = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));
    console.log('[WhatsApp] Response:', { to: payload.destination, status: resp.status, data });
    
    if (resp.status !== 200) {
      console.error('[WhatsApp] Error Details:', JSON.stringify({ payload: { ...payload, apiKey: 'HIDDEN' }, response: data }, null, 2));
    }
    return { status: resp.status, data };
  } catch (e) {
    console.error('[WhatsApp] Failed', e?.message || e);
    return { error: e?.message || 'unknown' };
  }
};

// Helpers to format standard templates
export const templates = {
  // Template: appointment_confirmation
  // Hi [Name], this is a reminder for your appointment for [Service] on [Date] at [Time] at [Branch].
  // Address: [Address]
  // [Preparation/Duration]
  appointmentPatient: ({ name, service, date, time, branch, address, preparation, duration }) => ({
    templateName: 'appointment_confirmation',
    params: [
      name || 'Patient',
      service || 'Consultation',
      date,
      time,
      branch,
      address,
      `Preparation: ${preparation || 'None'}; Duration: ${duration || 'N/A'}`
    ],
  }),
  
  // Template: appointment_reminder (same structure as confirmation)
  // Hi [Name], this is a reminder for your appointment for [Service] on [Date] at [Time] at [Branch].
  // Address: [Address]
  // [Preparation/Duration]
  reminderPatient: ({ name, service, date, time, branch, address, preparation, duration }) => ({
    templateName: 'appointment_reminder',
    params: [
      name || 'Patient',
      service || 'Consultation',
      date,
      time,
      branch,
      address,
      `Preparation: ${preparation || 'None'}; Duration: ${duration || 'N/A'}`
    ],
  }),
  
  // Birthday template - Not approved yet, commented out
  // birthday: ({ name }) => ({
  //   templateName: process.env.AISENSY_BIRTHDAY_TEMPLATE || process.env.AISENSY_CAMPAIGN_ID,
  //   params: [name || 'Friend'],
  // }),
  
  // Template: referral_doctor_thanks
  // Thank you [Doctor Name] for referring [Patient Name] on [Date] to [Clinic Name].
  // Service: [Service]
  // Address: [Address]
  referralDoctor: ({ doctorName, patientName, date, clinicName, service, address }) => ({
    templateName: 'referral_doctor_thanks',
    params: [
      doctorName || 'Doctor',
      patientName || 'Patient',
      date,
      clinicName || 'Aartiket Speech & Hearing Care',
      service || 'Consultation',
      address
    ],
  }),
};


