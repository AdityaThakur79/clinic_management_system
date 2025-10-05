import { wrapEmail, brandTheme } from "../common/sendMail.js";
const DEFAULT_HEADER_IMAGE = "https://res.cloudinary.com/dydzcpu4w/image/upload/v1759043284/popup_modal_banner_uuc7wq.jpg";

export const reminderPatientEmail = ({ name, date, time, branch, address, doctor, service, notes, headerImageUrl }) => {
  const body = `
    <p style="margin:0 0 10px 0;">Dear ${name || 'Patient'},</p>
    <p style="margin:0 0 14px 0;">This is a reminder for your upcoming appointment. Please arrive a few minutes early.</p>
    <div style="border:1px solid ${brandTheme.border};border-radius:8px;padding:12px;">
      <p style="margin:6px 0"><strong>Date:</strong> ${date}</p>
      <p style="margin:6px 0"><strong>Time:</strong> ${time}</p>
      <p style="margin:6px 0"><strong>Branch:</strong> ${branch}</p>
      <p style="margin:6px 0"><strong>Address:</strong> ${address}</p>
      ${doctor ? `<p style=\"margin:6px 0\"><strong>Doctor:</strong> ${doctor}</p>` : ''}
      ${service ? `<p style=\"margin:6px 0\"><strong>Service:</strong> ${service}</p>` : ''}
      ${notes ? `<p style=\"margin:6px 0\"><strong>Notes:</strong> ${notes}</p>` : ''}
    </div>
    <div style="text-align:center;margin:18px 0 6px 0;">
      <a href="https://maps.app.goo.gl/m3QhftKJFMj3it9N7" target="_blank" style="display:inline-block;padding:12px 18px;border-radius:8px;border:2px solid ${brandTheme.primary};color:${brandTheme.primary};text-decoration:none;font-weight:700">📍 Get Directions</a>
    </div>
  `;
  return wrapEmail('Appointment Reminder', body, headerImageUrl || DEFAULT_HEADER_IMAGE);
};

export const reminderAdminEmail = ({ patientName, date, time, branch, doctor, service, headerImageUrl }) => {
  const body = `
    <p style="margin:0 0 10px 0;">Reminder scheduled for a patient.</p>
    <div style="border:1px solid ${brandTheme.border};border-radius:8px;padding:12px;">
      <p style="margin:6px 0"><strong>Patient:</strong> ${patientName}</p>
      <p style="margin:6px 0"><strong>Date:</strong> ${date}</p>
      <p style="margin:6px 0"><strong>Time:</strong> ${time}</p>
      <p style="margin:6px 0"><strong>Branch:</strong> ${branch}</p>
      ${doctor ? `<p style=\"margin:6px 0\"><strong>Doctor:</strong> ${doctor}</p>` : ''}
      ${service ? `<p style=\"margin:6px 0\"><strong>Service:</strong> ${service}</p>` : ''}
    </div>
  `;
  return wrapEmail('Appointment Reminder (Admin Copy)', body, headerImageUrl || DEFAULT_HEADER_IMAGE);
};


