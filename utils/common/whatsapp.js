// AiSensy WhatsApp sender (template-based)
// Configure via env: AISENSY_API_KEY, AISENSY_CAMPAIGN_ID (or TEMPLATE), AISENSY_SENDER (optional)

export const sendWhatsAppTemplate = async ({ toPhone, templateName, templateParams = [], mediaUrl }) => {
  try {
    const apiKey = process.env.AISENSY_API_KEY;
    if (!apiKey) {
      console.log('[WhatsApp] Skipping send (AISENSY_API_KEY not set)');
      return { skipped: true };
    }
    const payload = {
      apiKey,
      campaignName: templateName || process.env.AISENSY_CAMPAIGN_ID,
      destination: toPhone.startsWith('+') ? toPhone : `+91${String(toPhone).replace(/\D/g, '').slice(-10)}`,
      userName: 'Patient',
      templateParams,
      source: 'api',
      media: mediaUrl ? [{ url: mediaUrl }] : undefined,
    };
    const resp = await fetch('https://backend.aisensy.com/apis/sendTemplateMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));
    console.log('[WhatsApp] Sent', { to: payload.destination, status: resp.status, data });
    return { status: resp.status, data };
  } catch (e) {
    console.error('[WhatsApp] Failed', e?.message || e);
    return { error: e?.message || 'unknown' };
  }
};

// Helpers to format standard templates
export const templates = {
  appointmentPatient: ({ name, service, date, time, branch, address }) => ({
    templateName: process.env.AISENSY_APPT_PATIENT_TEMPLATE || process.env.AISENSY_CAMPAIGN_ID,
    params: [name || 'Patient', service || 'Consultation', date, time, branch, address],
  }),
  reminderPatient: ({ name, date, time, branch }) => ({
    templateName: process.env.AISENSY_REMINDER_PATIENT_TEMPLATE || process.env.AISENSY_CAMPAIGN_ID,
    params: [name || 'Patient', date, time, branch],
  }),
  birthday: ({ name }) => ({
    templateName: process.env.AISENSY_BIRTHDAY_TEMPLATE || process.env.AISENSY_CAMPAIGN_ID,
    params: [name || 'Friend'],
  }),
  referralDoctor: ({ doctorName, patientName, date }) => ({
    templateName: process.env.AISENSY_REFERRAL_TEMPLATE || process.env.AISENSY_CAMPAIGN_ID,
    params: [doctorName || 'Doctor', patientName || 'Patient', date],
  }),
};


