# Aartiket Speech and Hearing Care - Clinic Management System

A comprehensive clinic management system designed specifically for speech and hearing care clinics. This system provides complete management of patients, appointments, doctors, billing, and administrative tasks with role-based access control.

## 🏥 Overview

This is a full-stack web application built with React.js frontend and Node.js/Express.js backend, designed to streamline operations for speech and hearing care clinics. The system supports multiple branches, role-based access control, and comprehensive patient management.

## ✨ Key Features

### 🏢 Multi-Branch Management
- **Branch Management**: Create and manage multiple clinic branches
- **Branch Admin Control**: Dedicated admin access for each branch
- **Centralized Oversight**: Super admin can manage all branches

### 👥 User Management & Authentication
- **Role-Based Access Control (RBAC)**:
  - **Super Admin**: Full system access
  - **Branch Admin**: Branch-specific management
  - **Doctor**: Patient and appointment management
- **Secure Authentication**: JWT-based authentication with OTP verification
- **Password Management**: Forgot password, reset functionality
- **Profile Management**: User profiles with photo uploads

### 👨‍⚕️ Doctor Management
- **Doctor Profiles**: Complete doctor information including specialization, experience, consultation charges
- **Specialization Support**: Multiple medical specializations
- **Availability Management**: Doctor availability and consultation time slots
- **Experience Tracking**: Years of experience and qualifications
- **Bio & Languages**: Doctor bio and language preferences

### 🏥 Patient Management
- **Patient Registration**: Complete patient information with medical history
- **Patient Plans**: Standard, wallet, and custom payment plans
- **Medical History**: Track patient medical records
- **Contact Management**: Multiple contact methods and addresses
- **Referral Tracking**: Track patient referrals from other doctors

### 📅 Appointment Management
- **Appointment Booking**: Schedule appointments with doctors
- **Time Slot Management**: Available time slots for each doctor
- **Appointment Types**: Consultation, follow-up, emergency, routine
- **Status Tracking**: Booked, completed, cancelled status
- **Reminder System**: Automated appointment reminders
- **Today's Appointments**: Quick view of daily appointments

### 💰 Billing & Payment System
- **Service Management**: Manage clinic services and pricing
- **Bill Generation**: Generate bills for appointments and services
- **PDF Generation**: Generate PDF bills and receipts
- **Payment Tracking**: Track payment status and methods
- **Service Categories**: Consultation, treatment, medicine, test, hearing aid, other

### 📊 Referred Doctor Management
- **Referral Tracking**: Track doctors who refer patients
- **Commission Management**: Calculate and track referral commissions
- **Analytics Dashboard**: Referral performance analytics
- **Earnings Tracking**: Monthly earnings from referrals
- **Patient Count**: Track number of patients referred

### 🔔 Reminder System
- **Appointment Reminders**: Automated appointment notifications
- **Custom Reminders**: Create custom reminders for patients
- **Email Notifications**: Send reminders via email
- **SMS Integration**: SMS reminder capabilities (configurable)

### 📈 Analytics & Reporting
- **Dashboard Analytics**: Comprehensive dashboard with key metrics
- **Appointment Analytics**: Appointment trends and statistics
- **Revenue Tracking**: Financial performance monitoring
- **Patient Analytics**: Patient demographics and trends
- **Doctor Performance**: Doctor-specific analytics

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first responsive design
- **Chakra UI**: Modern component library
- **Interactive Dashboards**: Real-time data visualization
- **User-Friendly Interface**: Intuitive navigation and workflows

## 🛠️ Technology Stack

### Frontend
- **React.js 19.0.0**: Modern React with hooks
- **Chakra UI 2.6.1**: Component library for UI
- **Redux Toolkit 2.9.0**: State management
- **React Router 6.25.1**: Client-side routing
- **ApexCharts 3.50.0**: Data visualization
- **React PDF 4.3.0**: PDF generation
- **Tailwind CSS 3.4.17**: Utility-first CSS framework

### Backend
- **Node.js**: JavaScript runtime
- **Express.js 4.21.1**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose 8.13.1**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Nodemailer 6.10.0**: Email service
- **Cloudinary 2.6.1**: Image storage and management
- **Multer**: File upload handling

### Additional Tools
- **Moment.js 2.30.1**: Date manipulation
- **Bcryptjs 3.0.2**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Express Session**: Session management

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clinic_management_system
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/clinic_management
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

5. **Start the application**
   ```bash
   # Start the server
   npm run dev

   # In another terminal, start the client
   cd client
   npm start
   ```

## 📁 Project Structure

```
clinic_management_system/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── views/         # Page components
│   │   │   ├── admin/     # Admin panel views
│   │   │   └── User/      # Public website views
│   │   ├── features/      # Redux features
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Layout components
│   │   └── utils/         # Utility functions
│   └── package.json
├── config/                # Database configuration
├── controllers/           # API controllers
├── middlewares/           # Express middlewares
├── models/               # MongoDB models
├── routes/               # API routes
├── utils/                # Utility functions
└── server.js             # Main server file
```

## 🔐 User Roles & Permissions

### Super Admin
- Manage all branches
- Create and manage branch admins
- System-wide analytics
- User management
- Global settings

### Branch Admin
- Manage branch-specific data
- Create and manage doctors
- Patient management
- Appointment management
- Branch analytics

### Doctor
- View assigned patients
- Manage appointments
- Update patient records
- View personal analytics

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

## 🔮 Future Features (Planned)

### 📦 Inventory Management System
- **Auto-Reduction**: Inventory automatically reduces when items are added to billing
- **Threshold Alerts**: Email and popup notifications when stock reaches threshold
- **Stock Tracking**: Real-time inventory tracking
- **Reorder Management**: Automatic reorder suggestions
- **Supplier Management**: Track suppliers and purchase orders

### Additional Planned Features
- **Telemedicine Integration**: Video consultation capabilities
- **Mobile App**: Native mobile applications
- **Advanced Analytics**: Machine learning insights
- **Integration APIs**: Third-party service integrations
- **Backup & Recovery**: Automated backup systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please contact:
- Email: support@aartiket.com
- Phone: +91-XXXXXXXXXX

## 🙏 Acknowledgments

- Chakra UI for the component library
- React community for excellent documentation
- MongoDB for database support
- All contributors who helped build this system

---

**Aartiket Speech and Hearing Care** - Comprehensive clinic management for better patient care.


