import nodemailer from "nodemailer";

export const brandTheme = {
  primary: "#2BA8D1",
  primaryDark: "#0C2F4D",
  text: "#1a365d",
  muted: "#64748b",
  border: "#e2e8f0",
};

export const wrapEmail = (title, bodyHtml, headerImageUrl) => `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;background:white;border:1px solid ${brandTheme.border};border-radius:12px;overflow:hidden">
    ${headerImageUrl ? `<img src="${headerImageUrl}" alt="Clinic" style="display:block;width:100%;height:200px;object-fit:cover;"/>` : ''}
    <div style="background:${brandTheme.primary};color:white;padding:18px 22px;font-weight:700;font-size:18px">${title}</div>
    <div style="padding:22px;color:${brandTheme.text};line-height:1.6">${bodyHtml}</div>
    <div style="padding:14px 22px;color:${brandTheme.muted};font-size:12px;border-top:1px solid ${brandTheme.border}">Aartiket Speech & Hearing Care</div>
  </div>
`;

// Minimal transporter (Gmail, port 465) – no verification, no pooling, no extras
const createTransporter = () => {
  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) {
    throw new Error("Email credentials not configured. Please set SMTP_USER and SMTP_PASS.");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: emailUser, pass: emailPass },
  });
};

// No verification step – send directly

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "OTP for Registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">OTP Verification</h2>
          <p>Your OTP for registration is: <strong style="color: #007bff; font-size: 24px;">${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
};

// Generic email sender for reuse
export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    const transporter = createTransporter();

    const emailUser = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'Clinic Management System';

    const mailOptions = {
      from: `${fromName} <${emailUser}>`,
      to,
      subject,
      html,
      text,
      attachments: attachments || [],
    };
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
};

