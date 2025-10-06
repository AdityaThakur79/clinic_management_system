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

// Minimal transporter with optional custom SMTP (e.g., Brevo). Falls back to Gmail if none provided.
const createTransporter = () => {
  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) {
    throw new Error("Email credentials not configured. Please set SMTP_USER and SMTP_PASS.");
  }
  const customHost = process.env.SMTP_HOST;
  if (customHost) {
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = typeof process.env.SMTP_SECURE === 'string' ? process.env.SMTP_SECURE === 'true' : false;
    return nodemailer.createTransport({
      host: customHost,
      port,
      secure,
      auth: { user: emailUser, pass: emailPass },
    });
  }
  // Fallback: Gmail
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
    // Prefer Brevo HTTPS API if configured (avoids SMTP egress issues)
    const brevoKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
    if (brevoKey) {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: fromEmail, name: process.env.SMTP_FROM_NAME || 'Clinic Management System' },
          to: [{ email }],
          subject: 'OTP for Registration',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">OTP Verification</h2>
              <p>Your OTP for registration is: <strong style=\"color: #007bff; font-size: 24px;\">${otp}</strong></p>
              <p>This OTP will expire in 10 minutes.</p>
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>`
        })
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`Brevo API error (${resp.status}): ${txt}`);
      }
      return { ok: true };
    }

    // Fallback to SMTP
    const transporter = createTransporter();
    return await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: 'OTP for Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">OTP Verification</h2>
          <p>Your OTP for registration is: <strong style=\"color: #007bff; font-size: 24px;\">${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>`
    });
  } catch (error) {
    throw error;
  }
};

// Generic email sender for reuse
export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    // Prefer Brevo HTTPS API if configured
    const brevoKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'Clinic Management System';

    if (brevoKey) {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: fromEmail, name: fromName },
          to: Array.isArray(to) ? to.map((e)=> ({ email: e })) : [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        })
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`Brevo API error (${resp.status}): ${txt}`);
      }
      return { ok: true };
    }

    // Fallback to SMTP
    const transporter = createTransporter();
    return await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
      text,
      attachments: attachments || [],
    });
  } catch (error) {
    throw error;
  }
};

