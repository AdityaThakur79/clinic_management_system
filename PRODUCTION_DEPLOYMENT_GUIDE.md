# Production Deployment Guide for Render

## Email Configuration Issues on Production

### Common Issues on Render vs Localhost

1. **Environment Variables**: Render doesn't automatically load `.env` files
2. **SMTP Configuration**: Production SMTP settings may differ from local
3. **Network Restrictions**: Some SMTP providers block cloud hosting IPs
4. **App Passwords**: Gmail requires App Passwords for production

## Required Environment Variables for Render

### 1. Email Configuration (Choose ONE option)

#### Option A: Gmail with App Password (Recommended)
```bash
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
# No SMTP_HOST needed - will use Gmail service
```

#### Option B: Custom SMTP Provider
```bash
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 2. Admin Email
```bash
SUPERADMIN_EMAIL=admin@yourdomain.com
# OR
ADMIN_EMAIL=admin@yourdomain.com
```

### 3. Optional Email Settings
```bash
SMTP_FROM=your-email@domain.com
SMTP_FROM_NAME=Your Clinic Name
EMAIL_HEADER_IMAGE_URL=https://yourdomain.com/logo.png
WHATSAPP_MEDIA_URL=https://yourdomain.com/logo.png
```

## Step-by-Step Render Deployment

### 1. Set Up Gmail App Password (if using Gmail)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Generate a new app password for "Mail"
5. Use this 16-character password as `SMTP_PASS`

### 2. Configure Render Environment Variables

1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add all required environment variables
5. Click "Save Changes"
6. Redeploy your service

### 3. Test Email Configuration

Use the health check endpoint to test email:
```bash
GET /api/health/email
```

## Debugging Steps

### 1. Check Render Logs
```bash
# In Render dashboard, go to "Logs" tab
# Look for these log patterns:
[APPOINTMENT] Starting notification process...
[NOTIFICATIONS] Starting sendAppointmentNotifications...
[Mail] Using Gmail SMTP configuration
[Mail] Email sent successfully
```

### 2. Common Error Patterns

#### "Email credentials not configured"
- Missing `SMTP_USER` or `SMTP_PASS` environment variables
- Check Render environment variables are set correctly

#### "Invalid login" or "Authentication failed"
- Wrong email/password combination
- Gmail: Make sure you're using App Password, not regular password
- Other providers: Check SMTP credentials

#### "Connection timeout" or "ECONNREFUSED"
- SMTP host/port configuration issue
- Network restrictions from Render IPs
- Try different SMTP provider

#### "Message rejected" or "Recipient address rejected"
- Email address format issue
- SMTP provider blocking certain domains
- Check email addresses in database

### 3. Test Individual Components

#### Test SMTP Connection
```bash
# Add this to your server.js for testing
app.get('/test-email', async (req, res) => {
  try {
    const { sendEmail } = await import('./utils/common/sendMail.js');
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<h1>Test Email</h1>'
    });
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Alternative Email Providers for Production

### 1. SendGrid (Recommended)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_SECURE=false
```

### 2. Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
SMTP_SECURE=false
```

### 3. AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
SMTP_SECURE=false
```

## Monitoring and Alerts

### 1. Set Up Log Monitoring
- Use Render's built-in log monitoring
- Set up alerts for email failures
- Monitor email delivery rates

### 2. Health Check Endpoint
The system now includes comprehensive logging. Monitor these log patterns:
- `[APPOINTMENT]` - Appointment creation process
- `[NOTIFICATIONS]` - Email sending process
- `[Mail]` - SMTP connection and sending

### 3. Database Monitoring
- Check if appointments are being created successfully
- Verify patient email addresses are valid
- Monitor notification failure rates

## Troubleshooting Checklist

- [ ] Environment variables set in Render dashboard
- [ ] Service redeployed after environment changes
- [ ] Gmail App Password generated (if using Gmail)
- [ ] SMTP credentials are correct
- [ ] No typos in email addresses
- [ ] Check Render logs for error messages
- [ ] Test with health check endpoint
- [ ] Verify email provider allows Render IPs
- [ ] Check spam folders for test emails

## Performance Optimization

### 1. Email Queue (Future Enhancement)
Consider implementing a job queue for emails:
- Bull Queue with Redis
- Separate email worker process
- Retry failed emails
- Rate limiting

### 2. Email Templates
- Pre-compile email templates
- Cache frequently used data
- Optimize image loading

### 3. Monitoring
- Track email delivery rates
- Monitor SMTP connection health
- Set up alerts for failures
