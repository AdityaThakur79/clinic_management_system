import nodemailer from "nodemailer";

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
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort ?? 587,
      secure: smtpSecure ?? false,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false },
    });
  } else {
    // For Gmail, use App Password
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
    console.log("Email transporter verified successfully");
    return true;
  } catch (error) {
    console.error("Email transporter verification failed:", error);
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

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending OTP email:", error);
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

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send salary slip email
export const sendSalarySlipEmail = async (email, employeeData, salarySlip, month, pdfBuffer) => {
  try {
    const transporter = createTransporter();
    
    // Verify connection before sending
    const isVerified = await verifyTransporter(transporter);
    if (!isVerified) {
      throw new Error("Email service not available");
    }

    // Create salary slip HTML content
    const salarySlipHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #007bff; margin: 0;">JAI MATA DI STITCHING</h1>
          <h2 style="color: #333; margin: 10px 0;">SALARY SLIP</h2>
          <p style="color: #666; margin: 0;">${month}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Employee Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">${employeeData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Employee ID:</td>
                <td style="padding: 8px 0; font-weight: bold;">${employeeData.employeeId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Designation:</td>
                <td style="padding: 8px 0; font-weight: bold;">${employeeData.designation || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Month:</td>
                <td style="padding: 8px 0; font-weight: bold;">${month}</td>
              </tr>
            </table>
          </div>
          
          <div>
            <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Salary Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Basic Salary:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #28a745;">₹${salarySlip.basicSalary.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Advances Deducted:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #dc3545;">-₹${salarySlip.advancesDeducted.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-top: 2px solid #007bff;">
                <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Final Payable:</td>
                <td style="padding: 12px 0; font-weight: bold; font-size: 18px; color: #007bff;">₹${salarySlip.finalPayable.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h4 style="color: #333; margin: 0 0 10px 0;">Notes</h4>
          <p style="color: #666; margin: 0;">${salarySlip.notes || 'No additional notes'}</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>Generated on: ${new Date(salarySlip.generatedAt).toLocaleDateString('en-IN')}</p>
          <p>This is an automated salary slip. Please contact HR for any queries.</p>
        </div>
      </div>
    `;

    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: `Salary Slip - ${month} - ${employeeData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Salary Slip for ${month}</h2>
          <p>Dear ${employeeData.name},</p>
          <p>Please find attached your official salary slip PDF for ${month}.</p>
          <p>If you have any questions, please contact the HR department.</p>
          <br>
          <p>Best regards,<br>Jai Mata Di Stitching</p>
          <hr>
          <div style='color:#888;font-size:13px;margin:12px 0 0 0;'>Preview:</div>
          ${salarySlipHTML}
        </div>
      `,
      attachments: pdfBuffer ? [
        {
          filename: `SalarySlip-${employeeData.employeeId}-${month}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ] : [],
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending salary slip email:", error);
    throw error;
  }
};
