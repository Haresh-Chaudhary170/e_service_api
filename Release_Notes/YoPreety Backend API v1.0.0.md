# YoPreety Backend API v0.1.0 - Release Notes

## 🚀 Major Features

### 1. Authentication System Overhaul
- **Enhanced Google OAuth2.0 Integration**
  - Full OAuth2.0 flow with authorization code grant
  - Secure token management (access & refresh tokens)
  - Automatic Google Calendar integration for service providers
  - Seamless user profile creation from Google data

- **Multi-factor Authentication**
  - Email verification with OTP system
  - Phone verification via Bitmoro SMS gateway (*Paused for stable release )
  - Secure OTP storage with expiration handling

### 2. Service Provider Management
- **Advanced Scheduling System**
  - Dynamic time slot management
  - Working hours configuration
  - Date exclusion handling
  - Service area definition with polygon area mapping support

- **KYC and Documentation** (Improvements Pending)
  - Document upload and verification system
  - Certification management
  - Multi-image support for services
  - Automated verification status tracking

### 3. Payment Integration
- **Multiple Payment Methods**
  - Khalti payment gateway integration
  - Cash on delivery support
  - Payment status tracking
  - Refund handling capability

### 4. Booking System
- **Enhanced Booking Management**
  - Multi-service booking support
  - Real-time availability checking
  - Google Calendar synchronization
  - Booking status tracking
  - Service tracking logs

## 💪 Technical Improvements

### 1. Security Enhancements
- JWT-based authentication with secure cookie handling
- CORS policy optimization
- Role-based access control (RBAC)
- Session management improvements
- Secure file upload handling

### 2. Database & Schema Updates
- New models:
  - `Contact` for customer support
  - `ActivityLog` for audit trails
  - Enhanced `User` model with OAuth fields
  - Expanded `ServiceProvider` with KYC fields

### 3. API Optimization
- Improved error handling
- Request validation using Zod and Joi
- Activity logging system
- File upload size and type restrictions
- Pagination and filtering improvements

### 4. Infrastructure
- Static file serving optimization
- Enhanced logging system
- Middleware restructuring
- TypeScript decorators for validation and logging

## 🔧 Configuration Updates

### Required Environment Variables
```env
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
KHALTI_SECRET_KEY=
BITMORO_API_KEY=
FRONTEND_URL=
CLIENT_URL=
```

### Dependencies
```json
{
  "major": {
    "@onesignal/node-onesignal": "^5.0.0-alpha-02",
    "bitmoro": "^1.1.2",
    "googleapis": "^148.0.0",
    "prisma": "^6.2.1"
  }
}
```

## 📝 Migration Notes

1. **Database Updates**
   - Run `prisma generate` after deployment
   - Execute `prisma migrate deploy` for schema changes
   - Backup existing data before migration

2. **Configuration Changes**
   - Update CORS origins for production
   - Configure session secret
   - Set up Google OAuth credentials
   - Configure payment gateway settings

3. **Security Considerations**
   - Enable HTTPS in production
   - Set secure cookie options
   - Configure rate limiting
   - Set up proper file upload permissions

## 🐛 Known Issues & Limitations
1. Maximum file upload size: 5MB per file
2. Maximum 5 images per service
3. OTP expiration time: 10 minutes
4. JWT token expiration: 1 hour
5. The Service Provider needs to complete all the initial setup process to expect correct service listing, appointments and bookings.


## 🔜 Upcoming Features
1. Real-time notifications
2. Advanced analytics dashboard
3. Bulk booking management
4. Enhanced service provider metrics
