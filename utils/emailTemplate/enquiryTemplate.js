export const enquiryTemplate = ({ enquiry, recipientType, adminName, customerName }) => {
  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return 'Not specified';
    return time;
  };

  if (recipientType === 'customer') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for your enquiry</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.65; color: #0C2F4D; background:#f5fbff; }
          .container { max-width: 640px; margin: 0 auto; padding: 24px; }
          .header { background: linear-gradient(135deg, #2BA8D1, #3AC0E7); color: white; padding: 28px; text-align: center; border-radius: 16px 16px 0 0; box-shadow: 0 10px 25px rgba(43,168,209,.25); }
          .brand { font-size: 18px; letter-spacing:.3px; opacity:.95; }
          .content { background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 10px 25px rgba(12,47,77,.08); }
          .enquiry-details { background: #f8fdff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(43,168,209,.2); }
          .detail-row { margin: 10px 0; }
          .label { font-weight: 600; color: #2BA8D1; }
          .footer { text-align: center; margin-top: 30px; color: #42607a; font-size: 13px; }
          .button { display: inline-block; background: #2BA8D1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; margin: 10px 0; box-shadow: 0 6px 16px rgba(43,168,209,.35);} 
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0">Aartiket Speech & Hearing Care</h1>
            <p class="brand" style="margin:6px 0 0 0">Thank you for your enquiry!</p>
          </div>
          
          <div class="content">
            <h2>Dear ${customerName},</h2>
            
            <p>Thank you for reaching out to us! We have received your enquiry and our team will get back to you within 24 hours.</p>
            
            <div class="enquiry-details">
              <h3>Your Enquiry Details:</h3>
              <div class="detail-row"><span class="label">Name:</span> ${enquiry.name}</div>
              <div class="detail-row"><span class="label">Email:</span> ${enquiry.email}</div>
              <div class="detail-row"><span class="label">Phone:</span> ${enquiry.phone}</div>
              <div class="detail-row"><span class="label">Service:</span> ${enquiry.service}</div>
              <div class="detail-row"><span class="label">Locality:</span> ${enquiry.locality}</div>
              <div class="detail-row"><span class="label">Preferred Date:</span> ${formatDate(enquiry.preferredDate)}</div>
              <div class="detail-row"><span class="label">Preferred Time:</span> ${formatTime(enquiry.preferredTime)}</div>
              ${enquiry.hospitalPreference ? `<div class="detail-row"><span class="label">Hospital Preference:</span> ${enquiry.hospitalPreference}</div>` : ''}
              <div class="detail-row"><span class="label">Message:</span> ${enquiry.message}</div>
            </div>
            
            <p>Our team will review your requirements and contact you soon to schedule an appointment at the most convenient location for you.</p>
            
            <p>In the meantime, feel free to contact us directly:</p>
            <ul>
              <li>Phone: <a href="tel:+917977483031" style="color:#2BA8D1;text-decoration:none">+91 79774 83031</a></li>
              <li>Email: <a href="mailto:aartiketspeechandhearing@gmail.com" style="color:#2BA8D1;text-decoration:none">aartiketspeechandhearing@gmail.com</a></li>
              <li>WhatsApp: <a href="https://wa.me/917977483031" style="color:#2BA8D1;text-decoration:none">Click here to chat</a></li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/917977483031" class="button">Chat on WhatsApp</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>Aartiket Speech & Hearing Care Team</p>
            <p>Ghatkopar, Mumbai | Expert Hearing Care</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Admin notification template
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Enquiry Received</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.65; color: #0C2F4D; background:#f5fbff; }
        .container { max-width: 800px; margin: 0 auto; padding: 24px; }
        .header { background: linear-gradient(135deg, #0C2F4D, #2BA8D1); color: white; padding: 28px; text-align: center; border-radius: 16px 16px 0 0; box-shadow:0 10px 25px rgba(12,47,77,.25); }
        .content { background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 10px 25px rgba(12,47,77,.08); }
        .enquiry-details { background: #f8fdff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(43,168,209,.2); }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #0C2F4D; }
        .urgent { background: #ffebee; border-left-color: #f44336; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        .button { display: inline-block; background: #2BA8D1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; margin: 10px 0; box-shadow:0 6px 16px rgba(43,168,209,.35); }
        .priority-high { color: #f44336; font-weight: bold; }
        .priority-urgent { color: #d32f2f; font-weight: bold; background: #ffebee; padding: 5px 10px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Enquiry Received</h1>
          <p>Dear ${adminName}, a new enquiry has been submitted</p>
        </div>
        
        <div class="content">
          <div class="enquiry-details ${enquiry.priority === 'urgent' ? 'urgent' : ''}">
            <h3>Enquiry Details</h3>
            <div class="detail-row">
              <span class="label">Priority:</span> 
              <span class="priority-${enquiry.priority}">${enquiry.priority.toUpperCase()}</span>
            </div>
            <div class="detail-row"><span class="label">Name:</span> ${enquiry.name}</div>
            <div class="detail-row"><span class="label">Email:</span> ${enquiry.email}</div>
            <div class="detail-row"><span class="label">Phone:</span> ${enquiry.phone}</div>
            <div class="detail-row"><span class="label">Service:</span> ${enquiry.service}</div>
            <div class="detail-row"><span class="label">Locality:</span> ${enquiry.locality}</div>
            <div class="detail-row"><span class="label">Preferred Date:</span> ${formatDate(enquiry.preferredDate)}</div>
            <div class="detail-row"><span class="label">Preferred Time:</span> ${formatTime(enquiry.preferredTime)}</div>
            ${enquiry.hospitalPreference ? `<div class="detail-row"><span class="label">Hospital Preference:</span> ${enquiry.hospitalPreference}</div>` : ''}
            <div class="detail-row"><span class="label">Message:</span> ${enquiry.message}</div>
            <div class="detail-row"><span class="label">Source:</span> ${enquiry.source}</div>
            <div class="detail-row"><span class="label">Submitted:</span> ${new Date(enquiry.createdAt).toLocaleString('en-IN')}</div>
          </div>
          
          <p><strong>Action Required:</strong> Please review this enquiry and contact the customer within 24 hours.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${enquiry.email}" class="button">Reply via Email</a>
            <a href="https://wa.me/91${(enquiry.phone || '').replace(/\D/g, '')}" class="button">WhatsApp Customer</a>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from Aartiket Speech & Hearing Care System</p>
          <p>Direct contact: <a href="tel:+917977483031" style="color:#2BA8D1;text-decoration:none">+91 79774 83031</a> · <a href="mailto:aartiketspeechandhearing@gmail.com" style="color:#2BA8D1;text-decoration:none">aartiketspeechandhearing@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};
