import { wrapEmail } from "../common/sendMail.js";

export const birthdayEmail = ({ name }) => {
  const body = `
    <p style="margin:0 0 10px 0;">Dear ${name || 'Friend'},</p>
    <p style="margin:0 0 12px 0;">Warm wishes from all of us. May your year be healthy and joyful.</p>
    <p style="margin:0;color:#64748b">— Aartiket Speech & Hearing Care</p>
  `;
  return wrapEmail('Happy Birthday', body);
};


