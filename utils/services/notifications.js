import { sendEmail } from "../common/sendMail.js";
import { sendWhatsAppTemplate, templates as waTemplates } from "../common/whatsapp.js";
import { appointmentPatientEmail, appointmentAdminEmail } from "../emailTemplate/appointmentTemplates.js";
import { reminderPatientEmail, reminderAdminEmail } from "../emailTemplate/reminderTemplates.js";
import { birthdayEmail } from "../emailTemplate/birthdayTemplates.js";
import { User } from "../../models/user.js";
import { Service } from "../../models/services.js";

export const sendAppointmentNotifications = async ({ appointment, branch, serviceName, serviceDetails, mediaUrl }) => {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
  const fmtDate = formatDate(appointment?.date);
  const fmtTime = appointment?.timeSlot || '09:00';
  const patientEmail = appointment?.patientId?.email;
  const patientName = appointment?.patientId?.name || 'Patient';
  const branchName = branch?.branchName || appointment?.branchId?.branchName;
  const branchAddress = branch?.address || appointment?.branchId?.address;
  const service = serviceName || appointment?.service;

  // If no structured serviceDetails provided, try to enrich from Service model
  let enrichedServiceDetails = serviceDetails || null;
  if (!enrichedServiceDetails && service) {
    try {
      const svc = await Service.findOne({ name: service }).lean();
      if (svc) {
        enrichedServiceDetails = {
          importance: svc.description || undefined,
          detailedInfo: undefined,
          preparationInstructions: undefined,
          benefits: [],
        };
      }
    } catch (_) {}
  }

  // Patient email
  if (patientEmail) {
    const html = appointmentPatientEmail({ name: patientName, service, date: fmtDate, time: fmtTime, branch: branchName, address: branchAddress, serviceDetails: enrichedServiceDetails, headerImageUrl: mediaUrl || process.env.EMAIL_HEADER_IMAGE_URL });
    await sendEmail({ to: patientEmail, subject: `Appointment Confirmed - ${service} - ${fmtDate} ${fmtTime}`, html });
  }
  // Admin copies
  const superAdminEmail = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
  if (superAdminEmail) {
    const htmlAdmin = appointmentAdminEmail({ patientName, service, date: fmtDate, time: fmtTime, branch: branchName, address: branchAddress, headerImageUrl: mediaUrl || process.env.EMAIL_HEADER_IMAGE_URL });
    await sendEmail({ to: superAdminEmail, subject: `New Appointment - ${service} - ${fmtDate} ${fmtTime}`, html: htmlAdmin });
  }
  // Branch admins
  try {
    const branchAdmins = await User.find({ role: 'branchAdmin', branch: appointment?.branchId }).select('email');
    await Promise.all(branchAdmins.map((ba)=> ba.email ? sendEmail({ to: ba.email, subject: `New Appointment - ${service} - ${fmtDate} ${fmtTime}`, html: appointmentAdminEmail({ patientName, service, date: fmtDate, time: fmtTime, branch: branchName, address: branchAddress, headerImageUrl: mediaUrl || process.env.EMAIL_HEADER_IMAGE_URL }) }) : null));
  } catch(_) {}

  // WhatsApp to patient
  if (appointment?.patientId?.contact) {
    const wa = waTemplates.appointmentPatient({ name: patientName, service, date: fmtDate, time: fmtTime, branch: branchName, address: branchAddress });
    await sendWhatsAppTemplate({ toPhone: appointment.patientId.contact, templateName: wa.templateName, templateParams: wa.params, mediaUrl: mediaUrl || process.env.WHATSAPP_MEDIA_URL });
  }
};

export const sendReminderNotifications = async ({ appointment, mediaUrl }) => {
  const formatDate = (d) => {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
  };
  const formatTime = (t) => {
    if (!t) return '';
    // normalize to HH:mm, then format to 12h AM/PM for readability
    const [hh, mm] = String(t).split(':');
    const h = parseInt(hh, 10);
    const date = new Date();
    date.setHours(h, parseInt(mm,10)||0, 0, 0);
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  };
  const rawDate = appointment?.date || appointment?.appointmentId?.date;
  const rawTime = appointment?.timeSlot || appointment?.appointmentId?.timeSlot || '09:00';
  const fmtDate = formatDate(rawDate);
  const fmtTime = formatTime(rawTime);
  const patient = appointment?.patientId || appointment?.appointmentId?.patientId;
  const branch = appointment?.branchId || appointment?.appointmentId?.branchId;
  const doctor = appointment?.doctorId || appointment?.appointmentId?.doctorId;
  const patientName = patient?.name || 'Patient';
  const patientEmail = patient?.email;
  const branchName = branch?.branchName;
  const branchAddress = branch?.address;
  const doctorName = doctor?.name;
  const serviceName = appointment?.service || appointment?.appointmentId?.service;

  const safeDate = fmtDate || new Date(rawDate || Date.now()).toLocaleDateString('en-IN');
  if (patientEmail) {
    await sendEmail({ to: patientEmail, subject: `Appointment Reminder - ${safeDate} ${fmtTime}`, html: reminderPatientEmail({ name: patientName, date: safeDate, time: fmtTime, branch: branchName, address: branchAddress, doctor: doctorName, service: serviceName, notes: appointment?.notes, headerImageUrl: mediaUrl || process.env.EMAIL_HEADER_IMAGE_URL }) });
  }
  const superAdminEmail = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
  if (superAdminEmail) {
    await sendEmail({ to: superAdminEmail, subject: `Reminder (Admin) - ${patientName} - ${safeDate} ${fmtTime}`, html: reminderAdminEmail({ patientName, date: safeDate, time: fmtTime, branch: branchName, doctor: doctorName, service: serviceName, headerImageUrl: mediaUrl || process.env.EMAIL_HEADER_IMAGE_URL }) });
  }
  try {
    const branchAdmins = await User.find({ role: 'branchAdmin', branch: appointment?.branchId }).select('email');
    await Promise.all(branchAdmins.map((ba)=> ba.email ? sendEmail({ to: ba.email, subject: `Reminder (Admin) - ${patientName} - ${safeDate} ${fmtTime}`, html: reminderAdminEmail({ patientName, date: safeDate, time: fmtTime, branch: branchName, doctor: doctorName, service: serviceName, headerImageUrl: mediaUrl || process.env.EMAIL_HEADER_IMAGE_URL }) }) : null));
  } catch(_) {}

  if (appointment?.patientId?.contact) {
    const wa = waTemplates.reminderPatient({ name: patientName, date: fmtDate, time: fmtTime, branch: branchName });
    await sendWhatsAppTemplate({ toPhone: appointment.patientId.contact, templateName: wa.templateName, templateParams: wa.params, mediaUrl: mediaUrl || process.env.WHATSAPP_MEDIA_URL });
  }
};

export const sendBirthdayNotifications = async ({ person }) => {
  const name = person?.name || 'Friend';
  const email = person?.email;
  const phone = person?.contact || person?.phone;
  if (email) {
    await sendEmail({ to: email, subject: `Happy Birthday, ${name}!`, html: birthdayEmail({ name }) });
  }
  if (phone) {
    const wa = waTemplates.birthday({ name });
    await sendWhatsAppTemplate({ toPhone: phone, templateName: wa.templateName, templateParams: wa.params, mediaUrl: process.env.WHATSAPP_MEDIA_URL });
  }
};

export const sendReferralDoctorWhatsapp = async ({ doctorPhone, doctorName, patientName, date }) => {
  if (!doctorPhone) return;
  const wa = waTemplates.referralDoctor({ doctorName, patientName, date });
  await sendWhatsAppTemplate({ toPhone: doctorPhone, templateName: wa.templateName, templateParams: wa.params, mediaUrl: process.env.WHATSAPP_MEDIA_URL });
};


