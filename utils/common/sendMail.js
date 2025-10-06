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
    // For Gmail, use the same configuration as working projects
    console.log('[Mail] Using Gmail SMTP configuration', {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      user: (process.env.SMTP_USER || process.env.EMAIL_USER) ? '***provided***' : '***missing***'
    });
    // Try service-based configuration first (more reliable on cloud hosting)
    try {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        secure: true,
        port: 465,
        pool: true,
        maxConnections: 1,
        maxMessages: 3,
        family: 4, // force IPv4 (some hosts have issues with IPv6)
        tls: {
          rejectUnauthorized: false
        }
      });
    } catch (serviceError) {
      console.log('[Mail] Service-based config failed, trying host-based config...');
      // Fallback to host-based configuration
      transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        pool: true,
        maxConnections: 1,
        maxMessages: 3,
        family: 4,
        connectionTimeout: 45000,
        greetingTimeout: 20000,
        socketTimeout: 45000,
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        }
      });
    }
  }

  return transporter;
};

// Verify transporter connection with timeout
const verifyTransporter = async (transporter) => {
  try {
    console.log('[Mail] Starting transporter verification...');
    
    // Add timeout to verification
    const verificationPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Verification timeout after 30 seconds')), 30000)
    );
    
    await Promise.race([verificationPromise, timeoutPromise]);
    console.log('[Mail] Transporter verification successful');
    return true;
  } catch (error) {
    console.error('[Mail] Transporter verification failed:', {
      error: error?.message || error,
      code: error?.code,
      response: error?.response,
      command: error?.command,
      errno: error?.errno,
      syscall: error?.syscall,
      address: error?.address,
      port: error?.port
    });
    // Allow bypassing verify when providers block/no-op the NOOP/VRFY commands
    if (String(process.env.EMAIL_SKIP_VERIFY).toLowerCase() === 'true') {
      console.warn('[Mail] EMAIL_SKIP_VERIFY=true → proceeding without transporter.verify');
      return true;
    }
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
  console.log('[Mail] Starting sendEmail function...', { to, subject, timestamp: new Date().toISOString() });
  
  try {
    console.log('[Mail] Creating transporter...');
    const transporter = createTransporter();
    console.log('[Mail] Transporter created successfully');
    
    console.log('[Mail] Verifying transporter connection...');
    const isVerified = await verifyTransporter(transporter);
    if (!isVerified) {
      console.error('[Mail] Transporter verification failed');
      throw new Error("Email service not available");
    }
    console.log('[Mail] Transporter verification successful');

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

    console.log('[Mail] Prepared mail options:', { 
      from: `${fromName} <${emailUser}>`, 
      to, 
      subject, 
      hasHtml: Boolean(html), 
      hasText: Boolean(text),
      htmlLength: html?.length || 0
    });
    
    console.log('[Mail] Attempting to send email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('[Mail] Email sent successfully!', { 
      to, 
      subject, 
      messageId: result?.messageId,
      response: result?.response,
      accepted: result?.accepted,
      rejected: result?.rejected
    });
    return result;
  } catch (error) {
    console.error('[Mail] Failed to send email - Full error details:', { 
      to, 
      subject, 
      error: error?.message || error,
      code: error?.code,
      response: error?.response,
      command: error?.command,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

