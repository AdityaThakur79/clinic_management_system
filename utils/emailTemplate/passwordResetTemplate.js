export const passwordResetTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Aartiket Speech and Hearing Care</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #3AC0E7;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #3AC0E7;
                margin-bottom: 10px;
            }
            .otp-container {
                background: #f0f9ff;
                border: 2px dashed #3AC0E7;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #3AC0E7;
                letter-spacing: 5px;
                margin: 10px 0;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: #3AC0E7;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">👂 Aartiket Speech and Hearing Care</div>
                <h2>Password Reset Request</h2>
            </div>
            
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>We received a request to reset your password for your Aartiket Speech and Hearing Care account. If you didn't make this request, please ignore this email.</p>
            
            <div class="otp-container">
                <h3>Your Password Reset OTP</h3>
                <div class="otp-code">${otp}</div>
                <p>Enter this code to reset your password</p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                    <li>This OTP will expire in <strong>10 minutes</strong></li>
                    <li>Never share this OTP with anyone</li>
                    <li>Our team will never ask for your OTP</li>
                    <li>If you didn't request this, please contact support immediately</li>
                </ul>
            </div>
            
            <p>To reset your password:</p>
            <ol>
                <li>Go to your profile page</li>
                <li>Click on "Change Password"</li>
                <li>Enter the OTP above</li>
                <li>Enter your new password</li>
                <li>Confirm your new password</li>
            </ol>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2025 Aartiket Speech and Hearing Care. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
