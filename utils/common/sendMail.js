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

// Create transporter with better error handling
const createTransporter = () => {
  // Support both old and new environment variable names
  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  
  // Check if email credentials are configured
  if (!emailUser || !emailPass) {
    throw new Error("Email credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.");
  }

  // Allow custom SMTP or fallback to Gmail service
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : undefined;

  let transporter;
  if (smtpHost) {
    console.log('[Mail] Using custom SMTP host configuration', {
      host: smtpHost,
      port: smtpPort ?? 587,
      secure: smtpSecure ?? false,
      user: (process.env.SMTP_USER || process.env.EMAIL_USER) ? '***provided***' : '***missing***'
    });
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort ?? 587,
      secure: smtpSecure ?? false,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false },
    });
  } else {
    // For Gmail, use App Password
    console.log('[Mail] Using Gmail SMTP configuration', {
      service: 'gmail',
      port: 465,
      secure: true,
      user: (process.env.SMTP_USER || process.env.EMAIL_USER) ? '***provided***' : '***missing***'
    });
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
      secure: true,
      port: 465,
      tls: { rejectUnauthorized: false }
    });
  }

  return transporter;
};

// Verify transporter connection
const verifyTransporter = async (transporter) => {
  try {
    await transporter.verify();
    console.log('[Mail] Transporter verification successful');
    return true;
  } catch (error) {
    console.error('[Mail] Transporter verification failed:', error?.response || error?.message || error);
    return false;
  }
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    // Verify connection before sending
    const isVerified = await verifyTransporter(transporter);
    if (!isVerified) {
      throw new Error("Email service not available");
    }

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

    console.log('[Mail] Sending OTP email', { to: email });
    const result = await transporter.sendMail(mailOptions);
    console.log('[Mail] OTP email sent', { to: email, messageId: result?.messageId });
    return result;
  } catch (error) {
    console.error('[Mail] Failed to send OTP email:', error?.response || error?.message || error);
    throw error;
  }
};

// Generic email sender for reuse
export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    const transporter = createTransporter();
    const isVerified = await verifyTransporter(transporter);
    if (!isVerified) {
      throw new Error("Email service not available");
    }

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

    console.log('[Mail] Sending email', { to, subject, hasHtml: Boolean(html), hasText: Boolean(text) });
    const result = await transporter.sendMail(mailOptions);
    console.log('[Mail] Email sent', { to, subject, messageId: result?.messageId });
    return result;
  } catch (error) {
    console.error('[Mail] Failed to send email:', { to, subject, error: error?.response || error?.message || error });
    throw error;
  }
};

