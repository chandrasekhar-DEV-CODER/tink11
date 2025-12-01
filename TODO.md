# TODO: Add Profile Management & Password Reset Features

## Plan Overview
Add comprehensive user profile management and password reset functionality to My School Ride.

## Features to Implement

### 1. Password Reset Flow
- [ ] Create Forgot Password page with email/phone input
- [ ] Implement OTP generation and sending (via Supabase Auth)
- [ ] Create OTP verification page
- [ ] Create new password setup page
- [ ] Add password strength validation
- [ ] Integrate with Supabase Auth password reset

### 2. User Profile Management
- [ ] Create comprehensive Profile Settings page
- [ ] Add profile image upload (Supabase Storage)
- [ ] Display user information (name, email, phone, role)
- [ ] Add edit profile functionality
- [ ] Add change password option (for logged-in users)
- [ ] Role-specific profile fields (Admin, Driver, Student, Parent)

### 3. Database Schema Updates
- [ ] Create storage bucket for profile images
- [ ] Add profile_image_url to profiles table
- [ ] Create OTP verification table (if needed)
- [ ] Add password reset tracking

### 4. UI Components
- [ ] Create ForgotPassword component
- [ ] Create OTPVerification component
- [ ] Create ResetPassword component
- [ ] Create ProfileSettings page
- [ ] Create ImageUpload component
- [ ] Add profile button to Header/Sidebar

### 5. API Integration
- [ ] Supabase Auth password reset flow
- [ ] Email/SMS OTP sending
- [ ] Profile update API
- [ ] Image upload API
- [ ] Password change API

### 6. Security & Validation
- [ ] Password strength requirements (min 8 chars, uppercase, lowercase, number, special char)
- [ ] OTP expiration (5 minutes)
- [ ] Rate limiting for OTP requests
- [ ] Secure image upload validation (max 1MB, image types only)
- [ ] Input sanitization

### 7. User Experience
- [ ] Toast notifications for all actions
- [ ] Loading states for async operations
- [ ] Error handling with user-friendly messages
- [ ] Success confirmations
- [ ] Responsive design for all new pages

## Implementation Order
1. Database schema updates (storage bucket, table updates)
2. Forgot Password flow (page + OTP + reset)
3. Profile Settings page (view + edit)
4. Image upload functionality
5. Change password for logged-in users
6. Integration with existing auth system
7. Testing and validation
8. Documentation

## Notes
- Use Supabase Auth built-in password reset
- Supabase handles OTP generation and email sending
- Profile images stored in Supabase Storage
- All changes maintain existing functionality
- Follow cyber-dark design theme
- Ensure mobile responsiveness
