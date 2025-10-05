import { wrapEmail, brandTheme } from "../common/sendMail.js";
const DEFAULT_HEADER_IMAGE = "https://res.cloudinary.com/dydzcpu4w/image/upload/v1759043284/popup_modal_banner_uuc7wq.jpg";

export const appointmentPatientEmail = ({ name, service, date, time, branch, address, serviceDetails, headerImageUrl }) => {
  const body = `
    <p style="margin:0 0 10px 0;">Dear ${name || 'Patient'},</p>
    <p style="margin:0 0 14px 0; color:${brandTheme.text}">Your appointment has been booked. We look forward to seeing you.</p>
    <div style="border:1px solid ${brandTheme.border};border-radius:8px;padding:12px;margin:8px 0 14px 0;">
      <p style="margin:6px 0"><strong>Service:</strong> ${service}</p>
      <p style="margin:6px 0"><strong>Date:</strong> ${date}</p>
      <p style="margin:6px 0"><strong>Time:</strong> ${time}</p>
      <p style="margin:6px 0"><strong>Branch:</strong> ${branch}</p>
      <p style="margin:6px 0"><strong>Address:</strong> ${address}</p>
    </div>
    ${serviceDetails ? `
    <div style="border:1px solid ${brandTheme.border};border-radius:8px;padding:14px;margin:0 0 14px 0;background:#f8fafc;">
      <p style="margin:0 0 8px 0;font-weight:700;color:${brandTheme.primaryDark}">About your service</p>
      ${serviceDetails.importance ? `<p style=\"margin:6px 0;color:${brandTheme.text}\"><strong>Why it’s important:</strong> ${serviceDetails.importance}</p>` : ''}
      ${serviceDetails.detailedInfo ? `<p style=\"margin:6px 0;color:${brandTheme.text}\"><strong>What to expect:</strong> ${serviceDetails.detailedInfo}</p>` : ''}
      ${serviceDetails.preparationInstructions ? `<p style=\"margin:6px 0;color:${brandTheme.text}\"><strong>Preparation:</strong> ${serviceDetails.preparationInstructions}</p>` : ''}
      ${Array.isArray(serviceDetails.benefits) && serviceDetails.benefits.length ? `
        <ul style=\"margin:6px 0 0 18px;color:${brandTheme.text}\">${serviceDetails.benefits.map(b=>`<li>${b}</li>`).join('')}</ul>
      ` : ''}
    </div>
    ` : ''}
    <div style="text-align:center;margin:18px 0 6px 0;">
      <a href="https://maps.app.goo.gl/m3QhftKJFMj3it9N7" target="_blank" style="display:inline-block;padding:12px 18px;border-radius:8px;border:2px solid ${brandTheme.primary};color:${brandTheme.primary};text-decoration:none;font-weight:700">📍 Get Directions</a>
    </div>
    <p style="margin:0;color:${brandTheme.muted}">If you need to reschedule, reply to this email or call us.</p>
  `;
  return wrapEmail('Appointment Confirmation', body, headerImageUrl || DEFAULT_HEADER_IMAGE);
};

export const appointmentAdminEmail = ({ patientName, service, date, time, branch, address, headerImageUrl }) => {
  const body = `
    <p style="margin:0 0 10px 0;">New appointment booked.</p>
    <div style="border:1px solid ${brandTheme.border};border-radius:8px;padding:12px;margin:8px 0 14px 0;">
      <p style="margin:6px 0"><strong>Patient:</strong> ${patientName}</p>
      <p style="margin:6px 0"><strong>Service:</strong> ${service}</p>
      <p style="margin:6px 0"><strong>Date:</strong> ${date}</p>
      <p style="margin:6px 0"><strong>Time:</strong> ${time}</p>
      <p style="margin:6px 0"><strong>Branch:</strong> ${branch}</p>
      <p style="margin:6px 0"><strong>Address:</strong> ${address}</p>
    </div>
  `;
  return wrapEmail('New Appointment Booked', body, headerImageUrl || DEFAULT_HEADER_IMAGE);
};


