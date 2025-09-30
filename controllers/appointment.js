import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Patient from "../models/patient.js";
import Branch from "../models/branch.js";
import { User as Doctor } from "../models/user.js";
import { Service } from "../models/services.js";
import { sendEmail } from "../utils/common/sendMail.js";

export const getAvailability = async (req, res) => {
  try {
    const { branchId, date } = req.query;
    if (!branchId || !date) {
      return res.status(400).json({ success: false, message: "branchId and date are required" });
    }

    // Get branch details to check working days and hours
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if branch is open on this day using flexible working hours
    const dayWorkingHours = branch.dailyWorkingHours?.[dayName];
    const isWorkingDay = dayWorkingHours?.isWorking || branch.workingDays?.includes(dayName);
    
    if (!isWorkingDay) {
      return res.json({ 
        success: true, 
        availableSlots: [],
        bookedTimeSlots: [],
        message: `Branch is closed on ${dayName}` 
      });
    }

    const dayStart = new Date(requestedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Get all appointments for this branch and date
    const appointments = await Appointment.find({
      branchId,
      date: { $gte: dayStart, $lt: dayEnd },
    }).select("timeSlot");

    // Generate available slots based on branch working hours
    const availableSlots = generateBranchSlots(branch, requestedDate);
    
    // Get booked slots
    const normalizeTime = (t) => {
      if (!t || typeof t !== 'string') return t;
      const base = t.includes('-') ? t.split('-')[0] : t;
      const [hStr = '', mStr = ''] = base.split(':');
      const hours = String(parseInt(hStr, 10)).padStart(2, '0');
      const minutes = String(parseInt(mStr, 10)).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const bookedSlots = new Set(appointments.map(a => normalizeTime(a.timeSlot)));
    
    // Mark slots as booked or available
    const slotsWithStatus = availableSlots.map(slot => ({
      time: slot,
      isAvailable: !bookedSlots.has(slot),
      isBooked: bookedSlots.has(slot)
    }));

    return res.json({ 
      success: true, 
      availableSlots: slotsWithStatus,
      bookedTimeSlots: Array.from(bookedSlots),
      branchWorkingHours: {
        start: branch.workingHours.start,
        end: branch.workingHours.end,
        slotDuration: branch.slotDuration
      }
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to generate slots based on branch working hours
const generateBranchSlots = (branch, date) => {
  const slots = [];
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Use flexible daily working hours if available, otherwise fall back to legacy working hours
  const dayWorkingHours = branch.dailyWorkingHours?.[dayName];
  let start, end;
  
  if (dayWorkingHours && dayWorkingHours.isWorking) {
    start = dayWorkingHours.start;
    end = dayWorkingHours.end;
  } else {
    // Fall back to legacy working hours
    start = branch.workingHours?.start || '09:00';
    end = branch.workingHours?.end || '17:00';
  }
  
  const slotDuration = branch.slotDuration || 30;
  
  // Parse working hours
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startTime = new Date(date);
  startTime.setHours(startHour, startMin, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMin, 0, 0);
  
  // If it's today, start from current time + slot duration
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    const now = new Date();
    const nextAvailableTime = new Date(now);
    nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + slotDuration);
    
    // Round up to the next slot interval
    const minutesToAdd = slotDuration - (nextAvailableTime.getMinutes() % slotDuration);
    nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + minutesToAdd);
    
    if (nextAvailableTime > startTime) {
      startTime.setTime(nextAvailableTime.getTime());
    }
  }
  
  // Generate slots
  const currentSlot = new Date(startTime);
  while (currentSlot < endTime) {
    // Check if this slot conflicts with break times
    const isInBreak = branch.breakTimes?.some(breakTime => {
      const [breakStartHour, breakStartMin] = breakTime.start.split(':').map(Number);
      const [breakEndHour, breakEndMin] = breakTime.end.split(':').map(Number);
      
      const breakStart = new Date(date);
      breakStart.setHours(breakStartHour, breakStartMin, 0, 0);
      
      const breakEnd = new Date(date);
      breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);
      
      return currentSlot >= breakStart && currentSlot < breakEnd;
    });
    
    if (!isInBreak) {
      const hours = String(currentSlot.getHours()).padStart(2, '0');
      const minutes = String(currentSlot.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
    }
    
    // Move to next slot
    currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
  }
  
  return slots;
};

export const getMultipleDateAvailability = async (req, res) => {
  try {
    const { branchId, startDate, days = 7 } = req.query;
    
    if (!branchId || !startDate) {
      return res.status(400).json({ 
        success: false, 
        message: "branchId and startDate are required" 
      });
    }

    // Get branch details
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        message: "Branch not found" 
      });
    }

    const start = new Date(startDate);
    const results = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if branch is open on this day
      const dayWorkingHours = branch.dailyWorkingHours?.[dayName];
      const isWorkingDay = dayWorkingHours?.isWorking || branch.workingDays?.includes(dayName);
      
      if (!isWorkingDay) {
        results.push({
          date: currentDate.toISOString().split('T')[0],
          availableSlots: [],
          bookedTimeSlots: [],
          isWorkingDay: false,
          message: `Branch is closed on ${dayName}`
        });
        continue;
      }

      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      // Get all appointments for this branch and date
      const appointments = await Appointment.find({
        branchId,
        date: { $gte: dayStart, $lt: dayEnd },
      }).select("timeSlot");

      // Generate available slots based on branch working hours
      const availableSlots = generateBranchSlots(branch, currentDate);
      
      // Get booked slots
      const normalizeTime = (t) => {
        if (!t || typeof t !== 'string') return t;
        const base = t.includes('-') ? t.split('-')[0] : t;
        const [hStr = '', mStr = ''] = base.split(':');
        const hours = String(parseInt(hStr, 10)).padStart(2, '0');
        const minutes = String(parseInt(mStr, 10)).padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      const bookedTimeSlots = appointments.map(apt => normalizeTime(apt.timeSlot));
      const bookedSlotsSet = new Set(bookedTimeSlots);
      
      // Show ALL slots (both available and booked) with their status
      const finalAvailableSlots = availableSlots.map(slot => ({
        time: slot,
        isAvailable: !bookedSlotsSet.has(normalizeTime(slot)),
        isBooked: bookedSlotsSet.has(normalizeTime(slot))
      }));

      results.push({
        date: currentDate.toISOString().split('T')[0],
        availableSlots: finalAvailableSlots,
        bookedTimeSlots,
        isWorkingDay: true
      });
    }

    return res.json({
      success: true,
      data: results,
      branchId,
      startDate,
      days: parseInt(days)
    });

  } catch (error) {
    console.error("Error getting multiple date availability:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { branchId, service, date, timeSlot, notes, referredDoctorId, patient, patientId, servicePrice, serviceDuration, serviceDetails } = req.body;

    // Validate required fields
    if (!branchId || !service || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: "Missing required fields: branchId, service, date, timeSlot" });
    }
    if (!patientId && !patient?.name) {
      return res.status(400).json({ success: false, message: "Missing patient information" });
    }

    // Validate branch
    const branch = await Branch.findById(branchId).session(session);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    // Normalize date to specific day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    // Resolve patient: use provided patientId or find/create from inline data
    let patientDoc = null;
    if (patientId) {
      patientDoc = await Patient.findById(patientId).session(session);
      if (!patientDoc) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }
    } else {
      // Find or create patient by phone/email
      const patientQuery = [];
      if (patient?.contact) patientQuery.push({ contact: patient.contact });
      if (patient?.email) patientQuery.push({ email: patient.email.toLowerCase() });

      if (patientQuery.length > 0) {
        patientDoc = await Patient.findOne({ $or: patientQuery }).session(session);
      }
      if (!patientDoc) {
        patientDoc = await Patient.create([
          {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            contact: patient.contact,
            email: patient.email,
            address: patient.address,
            medicalHistory: patient.medicalHistory || [],
          },
        ], { session });
        patientDoc = Array.isArray(patientDoc) ? patientDoc[0] : patientDoc;
      } else {
        // Optionally update basic fields
        patientDoc.name = patient.name || patientDoc.name;
        if (patient.age !== undefined) patientDoc.age = patient.age;
        if (patient.gender) patientDoc.gender = patient.gender;
        if (patient.address) patientDoc.address = patient.address;
        await patientDoc.save({ session });
      }
    }

    // Create appointment (normalize timeSlot to HH:mm if a range was passed)
    const timeSlotNormalized = typeof timeSlot === 'string' && timeSlot.includes('-') ? timeSlot.split('-')[0] : timeSlot;
    let appointmentDoc;
    try {
      appointmentDoc = await Appointment.create([
        {
          patientId: patientDoc._id,
          service,
          branchId,
          referredDoctorId: referredDoctorId || undefined,
          date: dayStart,
          timeSlot: timeSlotNormalized,
          notes,
          charges: servicePrice || 0,
          duration: serviceDuration || 30, // Default 30 minutes
        },
      ], { session });
      appointmentDoc = Array.isArray(appointmentDoc) ? appointmentDoc[0] : appointmentDoc;
    } catch (err) {
      if (err?.code === 11000) {
        await session.abortTransaction();
        return res.status(409).json({ success: false, message: "Selected time slot is no longer available" });
      }
      throw err;
    }

    // Link appointment to patient
    await Patient.updateOne(
      { _id: patientDoc._id },
      { $addToSet: { appointments: appointmentDoc._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    // Send notifications in background (non-blocking)
    try {
      // Service details will be passed from frontend
      
      const [populatedAppointment, populatedBranch] = await Promise.all([
        Appointment.findById(appointmentDoc._id)
          .populate('patientId', 'name email contact')
          .populate('branchId', 'branchName address'),
        Branch.findById(branchId),
      ]);

      // Email notifications
      (async () => {
        try {
          const superAdminEmail = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
          const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          });
          const patientEmail = populatedAppointment?.patientId?.email;
          const toSend = [
            { to: patientEmail, role: 'Patient' },
            { to: superAdminEmail, role: 'SuperAdmin' },
          ].filter(e => !!e.to);
      
          const subject = `✅ Appointment Confirmed - ${populatedAppointment?.service} - ${formatDate(populatedAppointment?.date)} ${populatedAppointment?.timeSlot}`;
          
          const html = `
            <!doctype html>
            <html>
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <title>Appointment Confirmed - Aartiket Speech and Hearing Care</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: white;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                /* Header with Cover Image */
                .header {
                  position: relative;
                  background: #2BA8D1;
                  text-align: center;
                  color: white;
                  overflow: hidden;
                }
                .cover-image {
                  width: 100%;
                  height: 250px;
                  object-fit: cover;
                  object-position: center;
                  display: block;
                }
                .header-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: rgba(43, 168, 209, 0.85);
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  padding: 20px;
                }
                .clinic-name {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .confirmation-badge {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  background: rgba(255,255,255,0.2);
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-weight: 600;
                }
                
                /* Content */
                .content {
                  padding: 30px;
                }
                .success-message {
                  text-align: center;
                  margin-bottom: 30px;
                  padding: 20px;
                  background: #f0f9ff;
                  border-radius: 12px;
                  border: 2px solid #2BA8D1;
                }
                .success-title {
                  font-size: 22px;
                  color: #2BA8D1;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .success-text {
                  color: #666;
                  font-size: 16px;
                }
                
                /* Appointment Details */
                .appointment-details {
                  background: #f8fafc;
                  border-radius: 12px;
                  padding: 24px;
                  margin-bottom: 30px;
                  border: 1px solid #e2e8f0;
                }
                .details-title {
                  font-size: 18px;
                  color: #2BA8D1;
                  font-weight: bold;
                  margin-bottom: 16px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                .detail-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 12px 0;
                  border-bottom: 1px solid #e2e8f0;
                }
                .detail-item:last-child {
                  border-bottom: none;
                }
                .detail-label {
                  font-weight: 600;
                  color: #64748b;
                }
                .detail-value {
                  font-weight: 600;
                  color: #1a365d;
                  text-align: right;
                }
                .highlight {
                  color: #2BA8D1;
                  font-weight: bold;
                }
                
                 /* Action Buttons */
                 .actions {
                   margin-bottom: 30px;
                   text-align: center;
                 }
                 .btn {
                   display: inline-block;
                   min-width: 160px;
                   padding: 14px 24px;
                   border-radius: 8px;
                   text-decoration: none;
                   font-weight: 600;
                   text-align: center;
                   margin: 0 10px 10px 10px;
                 }
                 .btn-primary {
                   background: white;
                   color: #2BA8D1;
                   border: 2px solid #2BA8D1;
                 }
                 .btn-primary:hover {
                   background: #2BA8D1;
                   color: white;
                   transform: translateY(-2px);
                 }
                 .btn-secondary {
                   background: white;
                   color: #2BA8D1;
                   border: 2px solid #2BA8D1;
                 }
                 .btn-secondary:hover {
                   background: #2BA8D1;
                   color: white;
                   transform: translateY(-2px);
                 }
                 
                 /* Service Information */
                 .service-info {
                   background: #f8fafc;
                   border-radius: 12px;
                   padding: 24px;
                   margin-bottom: 24px;
                   border: 2px solid #e2e8f0;
                 }
                 .service-title {
                   font-size: 18px;
                   font-weight: bold;
                   color: #2BA8D1;
                   margin-bottom: 16px;
                   display: flex;
                   align-items: center;
                   gap: 8px;
                 }
                 .service-details {
                   display: grid;
                   grid-template-columns: 1fr;
                   gap: 16px;
                 }
                 @media (min-width: 600px) {
                   .service-details {
                     grid-template-columns: repeat(2, 1fr);
                   }
                 }
                 .service-section {
                   background: white;
                   padding: 16px;
                   border-radius: 8px;
                   border-left: 4px solid #2BA8D1;
                 }
                 .section-title {
                   font-size: 14px;
                   font-weight: bold;
                   color: #1a365d;
                   margin-bottom: 8px;
                 }
                 .section-content {
                   font-size: 14px;
                   color: #64748b;
                   line-height: 1.5;
                   margin: 0;
                 }
                 .benefits-list {
                   margin: 0;
                   padding-left: 16px;
                 }
                 .benefits-list li {
                   font-size: 14px;
                   color: #64748b;
                   margin-bottom: 4px;
                 }
                
                /* Quick Info */
                .quick-info {
                  background: #f0f9ff;
                  border-radius: 8px;
                  padding: 20px;
                  margin-bottom: 20px;
                }
                .info-title {
                  font-weight: bold;
                  color: #2BA8D1;
                  margin-bottom: 12px;
                }
                .info-list {
                  list-style: none;
                  padding: 0;
                }
                .info-list li {
                  padding: 4px 0;
                  color: #64748b;
                  position: relative;
                  padding-left: 20px;
                }
                .info-list li::before {
                  content: '•';
                  color: #2BA8D1;
                  font-weight: bold;
                  position: absolute;
                  left: 0;
                }
                
                /* Footer */
                .footer {
                  background: #2BA8D1;
                  color: white;
                  padding: 24px 30px;
                  text-align: center;
                }
                .footer-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .footer-text {
                  opacity: 0.9;
                  font-size: 14px;
                  line-height: 1.5;
                }
                 .contact-info {
                   margin-top: 16px;
                   text-align: center;
                 }
                .contact-item {
                  font-size: 14px;
                  opacity: 0.9;
                  display: inline-block;
                  margin: 0 10px;
                }
                .contact-item a {
                  color: white;
                  text-decoration: none;
                }
                
                @media (max-width: 600px) {
                  .content { padding: 20px; }
                  .footer { padding: 20px; }
                  .btn { min-width: auto; margin: 5px; }
                  .detail-item { display: block; }
                  .detail-label { display: block; margin-bottom: 4px; }
                  .detail-value { text-align: left; margin-left: 4px; }
                  .contact-item { display: block; margin: 5px 0; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <!-- Header with Cover Image -->
                <div class="header">
                  <img src="https://res.cloudinary.com/dydzcpu4w/image/upload/v1759043284/popup_modal_banner_uuc7wq.jpg" alt="Aartiket Speech and Hearing Care" class="cover-image" />
                  
                </div>
      
                <!-- Main Content -->
                <div class="content">
                  <!-- Success Message -->
                  <div class="success-message">
                    <h2 class="success-title">Your Appointment is Confirmed!</h2>
                    <p class="success-text">Thank you for choosing us. We look forward to helping you with your hearing and speech needs.</p>
                  </div>
      
                  <!-- Appointment Details -->
                  <div class="appointment-details">
                    <h3 class="details-title">
                     
                      Appointment Details
                    </h3>
                    <div class="detail-item">
                      <span class="detail-label">Service</span>
                      <span class="detail-value highlight">${populatedAppointment?.service}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Date</span>
                      <span class="detail-value">${formatDate(populatedAppointment?.date)}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Time</span>
                      <span class="detail-value">${populatedAppointment?.timeSlot}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Branch</span>
                      <span class="detail-value">${populatedAppointment?.branchId?.branchName || populatedBranch?.branchName}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Address</span>
                      <span class="detail-value">${populatedAppointment?.branchId?.address || populatedBranch?.address}</span>
                    </div>
                  </div>
      
                  <!-- Action Buttons -->
                  <div class="actions">
                    <a class="btn btn-primary" href="https://maps.app.goo.gl/m3QhftKJFMj3it9N7" target="_blank">
                      📍 Get Directions
                    </a>
                    <a class="btn btn-secondary" href="tel:+917977483031">
                      📞 Call Clinic
                    </a>
                  </div>
      

                  ${serviceDetails ? `
                  <!-- Service Information -->
                  <div class="service-info">
                    <h3 class="service-title">📋 About Your Service</h3>
                    <div class="service-details">
                      <div class="service-section">
                        <h4 class="section-title">Why This Service is Important:</h4>
                        <p class="section-content">${serviceDetails.importance}</p>
                      </div>
                      <div class="service-section">
                        <h4 class="section-title">What to Expect:</h4>
                        <p class="section-content">${serviceDetails.detailedInfo}</p>
                      </div>
                      ${serviceDetails.preparationInstructions ? `
                      <div class="service-section">
                        <h4 class="section-title">Preparation Instructions:</h4>
                        <p class="section-content">${serviceDetails.preparationInstructions}</p>
                      </div>
                      ` : ''}
                      ${serviceDetails.benefits && serviceDetails.benefits.length > 0 ? `
                      <div class="service-section">
                        <h4 class="section-title">Benefits:</h4>
                        <ul class="benefits-list">
                          ${serviceDetails.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                      </div>
                      ` : ''}
                    </div>
                  </div>
                  ` : ''}

                  <!-- Quick Info -->
                  <div class="quick-info">
                    <div class="info-title">Before Your Visit:</div>
                    <ul class="info-list">
                      <li>Arrive 15 minutes early</li>
                      <li>Bring valid ID and medical reports</li>
                      <li>List current medications</li>
                    </ul>
                  </div>
                </div>
      
                <!-- Footer -->
                <div class="footer">
                  <h3 class="footer-title">Need Help?</h3>
                  <p class="footer-text">Contact us for any questions or to reschedule your appointment.</p>
                  <div class="contact-info">
                    <div class="contact-item">📞 <a href="tel:+917977483031">+91 79774 83031</a></div>
                    <div class="contact-item">✉️ <a href="mailto:aartiketspeechandhearing@gmail.com">Email Us</a></div>
                    <div class="contact-item">⏰ Mon-Sat, 9:00 AM - 6:00 PM</div>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;
      
          await Promise.all(toSend.map(({ to }) => sendEmail({ to, subject, html })));
        } catch (e) {
          console.error('Email sending failed:', e);
        }
      })();

      // WhatsApp notification to patient via AiSensy (commented until API key is available)
      (async () => {
        try {
          const toPhone = populatedAppointment?.patientId?.contact;
          // NOTE: Enable below when AiSensy credentials are available.
          // Required env vars:
          //   AISENSY_API_KEY, AISENSY_CAMPAIGN_ID (or TEMPLATE), AISENSY_SENDER_ID (if applicable)
          // Docs: https://docs.aisensy.com/
          // Example payload (template-based):
          // if (process.env.AISENSY_API_KEY && toPhone) {
          //   const formatDate = (d) => new Date(d).toLocaleDateString('en-IN');
          //   const payload = {
          //     apiKey: process.env.AISENSY_API_KEY,
          //     campaignName: process.env.AISENSY_CAMPAIGN_ID, // or template/campaign identifier
          //     destination: `+91${String(toPhone).replace(/\D/g, '').slice(-10)}`,
          //     userName: populatedAppointment?.patientId?.name || 'Patient',
          //     templateParams: [
          //       populatedAppointment?.service,
          //       formatDate(populatedAppointment?.date),
          //       populatedAppointment?.timeSlot,
          //       populatedAppointment?.branchId?.branchName || '',
          //       populatedAppointment?.branchId?.address || '',
          //       populatedAppointment?.charges || 'TBD',
          //       serviceDetails?.importance || 'Important for your health',
          //       serviceDetails?.benefits?.join(', ') || 'Improved health outcomes',
          //       serviceDetails?.duration || '30 minutes',
          //       serviceDetails?.preparationInstructions || 'Please arrive 15 minutes early',
          //     ],
          //     source: 'api'
          //   };
          //   await fetch('https://backend.aisensy.com/apis/sendTemplateMessage', {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify(payload)
          //   });
          // }
          console.log('AiSensy WhatsApp notification skipped (no API key configured).');
        } catch (e) {
          console.error('WhatsApp notification (AiSensy) failed:', e?.message || e);
        }
      })();
    } catch (notifyErr) {

    }

    return res.status(201).json({ 
      success: true, 
      appointment: appointmentDoc, 
      patient: patientDoc,
      service: service,
      message: "Appointment booked successfully. A doctor will be assigned to your appointment."
    });
  } catch (error) {

    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      branchId, 
      doctorId, 
      status = '', 
      date,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (branchId) filter.branchId = branchId;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;
    
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.date = { $gte: dayStart, $lt: dayEnd };
    }

    // Build search filter
    if (search) {
      filter.$or = [
        { 'patient.name': { $regex: search, $options: 'i' } },
        { 'patient.contact': { $regex: search, $options: 'i' } },
        { 'patient.email': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get appointments with populated data
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name age gender contact email address plan')
      .populate('doctorId', 'name email specialization')
      .populate('branchId', 'branchName address')
      .populate('referredDoctorId', 'name clinicName contact')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Appointment.countDocuments(filter);

    return res.json({
      success: true,
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalAppointments: total,
        hasNext: skip + appointments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTodayAppointments = async (req, res) => {
  try {
    const { branchId, doctorId } = req.query;

    // Get today's date range - use local date to match appointment creation
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);


    // Build filter for today's appointments
    const filter = {
      date: { $gte: todayStart, $lt: tomorrowStart }
    };

    if (branchId) filter.branchId = branchId;
    if (doctorId) filter.doctorId = doctorId;

    // Get today's appointments
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name age gender contact email plan')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .populate('referredDoctorId', 'name clinicName')
      .sort({ timeSlot: 1 });


    // Group by status
    const grouped = {
      booked: appointments.filter(apt => apt.status === 'booked'),
      completed: appointments.filter(apt => apt.status === 'completed'),
      cancelled: appointments.filter(apt => apt.status === 'cancelled')
    };

    return res.json({
      success: true,
      appointments,
      grouped,
      total: appointments.length,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name age gender contact email address medicalHistory plan')
      .populate('doctorId', 'name email specialization')
      .populate('branchId', 'branchName address')
      .populate('referredDoctorId', 'name clinicName contact')
      .populate('billId')
      .populate('prescriptionId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    return res.json({
      success: true,
      appointment
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ success: false, message: "Appointment ID and status are required" });
    }

    const validStatuses = ['booked', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Must be one of: booked, completed, cancelled" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('patientId', 'name age gender contact email plan')
     .populate('doctorId', 'name specialization')
     .populate('branchId', 'branchName address')
     .populate('referredDoctorId', 'name clinicName');

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    return res.json({
      success: true,
      appointment,
      message: "Appointment status updated successfully"
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const assignDoctorToAppointment = async (req, res) => {
  try {
    const { appointmentId, doctorId } = req.body;

    if (!appointmentId || !doctorId) {
      return res.status(400).json({ success: false, message: "Appointment ID and Doctor ID are required" });
    }

    // Validate appointment exists and is not already assigned
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctorId) {
      return res.status(400).json({ success: false, message: "Appointment is already assigned to a doctor" });
    }

    // Validate doctor exists and belongs to the same branch
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (doctor.branch?.toString() !== appointment.branchId.toString()) {
      return res.status(400).json({ success: false, message: "Doctor does not belong to this branch" });
    }

    // Assign doctor to appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        doctorId,
        status: 'assigned',
        assignedAt: new Date(),
        assignedBy: req.user?.id
      },
      { new: true }
    ).populate('patientId', 'name email contact')
     .populate('doctorId', 'name email specialization')
     .populate('branchId', 'branchName address');

    return res.json({
      success: true,
      appointment: updatedAppointment,
      message: "Doctor assigned to appointment successfully"
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Remove appointment from patient's appointments array
    await Patient.findByIdAndUpdate(
      appointment.patientId,
      { $pull: { appointments: appointment._id } }
    );

    // Delete the appointment
    await Appointment.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

