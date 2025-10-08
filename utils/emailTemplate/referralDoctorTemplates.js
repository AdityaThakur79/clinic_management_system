export const referralDoctorThankYouEmail = ({ doctorName, patientName, date, clinicName, service, address, headerImageUrl }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for the Referral</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3AC0E7 0%, #2BA8D1 100%); color: #fff; padding: 30px 20px; text-align: center; }
    .header img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .section { margin-bottom: 25px; }
    .section h2 { color: #3AC0E7; font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #3AC0E7; padding-bottom: 5px; }
    .info-box { background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #3AC0E7; margin: 15px 0; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; color: #555; min-width: 120px; }
    .info-value { color: #333; }
    .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 15px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
    .footer a { color: #3AC0E7; text-decoration: none; }
    .btn { display: inline-block; padding: 12px 30px; background: #3AC0E7; color: #fff; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
    .btn:hover { background: #2BA8D1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${headerImageUrl ? `<img src="${headerImageUrl}" alt="Aartiket Speech and Hearing Care" />` : ''}
      <h1>Thank You for Your Referral!</h1>
    </div>
    
    <div class="content">
      <div class="section">
        <p>Dear <strong>${doctorName}</strong>,</p>
        <p>We would like to express our sincere gratitude for referring <strong>${patientName}</strong> to our clinic.</p>
      </div>

      <div class="info-box">
        <div class="info-row">
          <div class="info-label">Patient Name:</div>
          <div class="info-value">${patientName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Date of Visit:</div>
          <div class="info-value">${date}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Clinic:</div>
          <div class="info-value">${clinicName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Service Provided:</div>
          <div class="info-value">${service}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Location:</div>
          <div class="info-value">${address}</div>
        </div>
      </div>

      <div class="highlight">
        <p style="margin: 0;"><strong>We appreciate your trust and collaboration.</strong></p>
        <p style="margin: 10px 0 0 0;">Your referral helps us serve more patients who need quality hearing and speech care services.</p>
      </div>

      <div class="section">
        <h2>Our Commitment</h2>
        <p>We are committed to providing the highest quality of care to all referred patients. Your confidence in our services motivates us to maintain our standards of excellence.</p>
      </div>

      <div class="section">
        <p>If you have any questions or would like to discuss the patient's care, please don't hesitate to reach out to us.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p><strong>Thank you once again for your continued support!</strong></p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Aartiket Speech and Hearing Care</strong></p>
      <p>${address}</p>
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>For any queries, please contact us through our official channels.</p>
    </div>
  </div>
</body>
</html>
  `;
};

