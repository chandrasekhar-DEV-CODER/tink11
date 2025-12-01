# My School Ride MVP System Specification - Enhanced Version with Admin Module Improvements

## 1. Website Name
My School Ride - School Bus Tracking Management System (MVP Version with Enhanced User Management & Improved Admin Modules)

## 2. Website Description
A comprehensive school bus management platform providing unified login portal supporting four user roles: administrators, drivers, students, and parents. Core capabilities include: complete vehicle, driver, student, and parent management by administrators; real-time GPS location reporting by drivers; live bus tracking for students and parents; push notification alerts; visual route management; real-time hourly active vehicle analytics; self-service password recovery via OTP verification; comprehensive user profile management with image upload; and **enhanced admin modules for Vehicles, Routes, Stops, Students, and Trip History with full CRUD operations and advanced tracking features**.

## 3. Core Functional Modules

### 3.1 Unified Login System - Enhanced
- **Unified Login Portal**: All user types (administrators, drivers, students, parents) access the system through a single login page
- **Role Selection Mechanism**: Login page provides dropdown menu or button group for users to select their role before entering credentials
- **Role Verification**: System validates username and password against the corresponding database table based on selected role
- **Admin-Specific Route**: Accessing `/adminherelogin` automatically redirects to login page with admin role pre-selected
- **Pre-configured Super Admin Account**:
  - Username: `chandrasekharadmin`
  - Password: `chandrasekharadmin1023@@`
- JWT authentication and session management
- **Universal Credential System**: All user accounts (administrators, drivers, students, parents) are created with custom username and password credentials set during account creation
- **Forgot Password Link**: Prominent'Forgot Password?' link below login form for all user roles

### 3.1.1 Forgot Password & OTP Verification System
\n#### Password Recovery Flow:\n1. **Forgot Password Entry Page**:
   - User clicks 'Forgot Password?' link on login page
   - Redirects to `/forgot-password` route
   - Form fields:\n     - Role selection dropdown (Administrator/Driver/Student/Parent)
     - Username input field
     - Contact method selection (Email or Phone Number)
     - Email/Phone input field (conditional based on selection)
   - Submit button triggers OTP generation
\n2. **OTP Generation & Delivery**:
   - Backend validates username exists in selected role table
   - Verifies provided email/phone matches user record
   - Generates 6-digit random OTP code
   - Sets OTP expiration time (10 minutes)
   - Stores OTP in `password_reset_tokens` table with user_id, token, expiry_time, contact_method
   - **Email Delivery**: Send OTP via email service (e.g., SendGrid, AWS SES) with subject'My School Ride - Password Reset Code'
   - **SMS Delivery**: Send OTP via SMS gateway (e.g., Twilio, AWS SNS) with message template:'Your My School Ride password reset code is: [OTP]. Valid for 10 minutes.'
   - Display OTP verification page\n
3. **OTP Verification Page**:
   -6-digit OTP input field with auto-focus
   - Countdown timer showing remaining validity time (10:00 minutes)
   - 'Verify OTP' button\n   - 'Resend OTP' link (enabled after60 seconds)
   - Backend validates:\n     - OTP matches stored token
     - OTP not expired
     - Maximum 3 verification attempts allowed
   - On successful verification, redirect to password reset page with secure token

4. **Password Reset Page**:
   - Accessible only with valid verification token
   - Form fields:\n     - New password input (with show/hide toggle)
     - Confirm new password input
     - Password strength indicator (weak/medium/strong)
   - Password validation requirements:
     - Minimum 8 characters
     - Mix of uppercase, lowercase, numbers, special characters
     - Cannot be same as old password
   - 'Reset Password' button
   - Backend updates password in respective user table
   - Invalidates all existing sessions for that user
   - Deletes used OTP token from database
   - Display success message and redirect to login page after3 seconds

5. **Security Features**:
   - Rate limiting: Maximum 3 OTP requests per hour per username
   - Account lockout after 5 failed OTP verification attempts (15 minutes)
   - Secure token generation using cryptographic random functions
   - OTP tokens stored with bcrypt hashing\n   - Audit logging for all password reset attempts
   - Email/SMS notification to user after successful password change
\n### 3.1.2 User Profile Management System

#### Profile Settings Access:
- **Profile Button**: Available in navigation header for all logged-in users (all roles)
- **Button Location**: Top-right corner of dashboard/interface with user avatar thumbnail or default icon
- **Click Action**: Redirects to role-specific profile page route:\n  - Administrators: `/admin/profile`
  - Drivers: `/driver/profile`\n  - Students: `/student/profile`
  - Parents: `/parent/profile`
\n#### Comprehensive Profile Page Features:
\n**1. Profile Header Section**:
- **Profile Image Display**:
  - Large circular avatar (150x150px) with border styling
  - Default placeholder icon if no image uploaded
  - Image preview with zoom-on-hover effect
- **Image Upload Functionality**:
  -'Change Photo' button overlaying avatar on hover
  - Click triggers file picker (accept: image/jpeg, image/png, image/jpg)
  - Maximum file size: 5MB
  - Client-side image preview before upload
  - Image cropping tool (square aspect ratio) using react-image-crop library
  - Upload to cloud storage (AWS S3, Cloudinary, or Supabase Storage)
  - Store image URL in user table `profile_image_url` field
  - Automatic thumbnail generation (150x150px)\n  - 'Remove Photo' option to delete current image
- **User Name Display**: Large heading with full name
- **Role Badge**: Color-coded badge showing user role (Admin/Driver/Student/Parent)
- **Account Status Indicator**: Active/Inactive status with color coding
\n**2. Personal Information Section** (Role-Specific Fields):
\n**Administrator Profile**:
- Username (read-only)
- Full Name (editable)
- Email Address (editable with verification)
- Phone Number (editable with verification)
- Account Created Date (read-only)
- Last Login Time (read-only)
- Two-Factor Authentication Toggle (optional future enhancement)
\n**Driver Profile**:
- Username (read-only)
- Full Name (editable)
- Email Address (editable with verification)\n- Phone Number (editable with verification)
- License Number (editable)\n- Assigned Vehicle Information (read-only, displays vehicle ID and route name)
- Emergency Contact Name (editable)
- Emergency Contact Phone (editable)
- Years of Experience (editable)
- Date of Birth (editable)
- Home Address (editable)
- Account Created Date (read-only)
\n**Student Profile**:
- Username (read-only)
- Full Name (editable)
- Student ID Number (read-only)
- Grade Level (editable)
- Date of Birth (editable)
- Email Address (editable with verification)
- Phone Number (editable with verification)
- Assigned Bus/Route (read-only)
- Pickup Location (displays coordinates, editable via map interface)
- Drop-off Location (displays coordinates, editable via map interface)
- Parent/Guardian Information (read-only, displays linked parent name and contact)
- Emergency Contact (editable)
- Medical Information (optional, editable text area)
- Account Created Date (read-only)

**Parent Profile**:
- Username (read-only)
- Full Name (editable)
- Email Address (editable with verification)
- Phone Number (editable with verification)\n- Relationship to Student (editable dropdown: Father/Mother/Guardian/Other)
- Home Address (editable)
- Secondary Contact Phone (editable)
- Linked Students (read-only list with student names, IDs, and grades)
- Workplace Information (optional, editable)\n- Preferred Contact Method (editable: Email/Phone/SMS)
- Account Created Date (read-only)\n
**3. Account Security Section**:
- **Change Password Feature**:
  - 'Change Password' button\n  - Opens modal dialog with form:\n    - Current Password input (with show/hide toggle)
    - New Password input (with show/hide toggle)
    - Confirm New Password input
    - Password strength indicator
  - Validation:\n    - Verify current password is correct
    - New password meets complexity requirements
    - New password different from current password
    - Confirm password matches new password
  - On success:\n    - Update password in database
    - Invalidate all existing sessions except current\n    - Send confirmation email/SMS
    - Display success toast notification
- **Login Activity Log**:
  - Display last 10 login attempts with timestamps and IP addresses
  - Show device/browser information
  - Highlight suspicious login attempts
- **Active Sessions Management**:
  - List all active sessions with device info and last activity time
  - 'Sign Out All Devices' button (except current session)
\n**4. Notification Preferences Section** (for Students & Parents):
- Email Notifications Toggle (arrival alerts, schedule changes, announcements)
- SMS Notifications Toggle\n- Push Notifications Toggle (mobile app)\n- Notification Frequency Settings (Immediate/Daily Digest/Weekly Summary)
\n**5. Profile Actions**:
- **Save Changes Button**: Primary action button to update profile information
  - Validates all fields before submission
  - Shows loading state during API call
  - Displays success/error toast notifications
  - Refreshes profile data after successful update
- **Cancel Button**: Discards unsaved changes and reverts to original values
- **Delete Account Button** (optional, with strict confirmation):
  - Available only for non-admin users
  - Requires password re-entry\n  - Shows warning about data deletion
  - Admin approval required for account deletion
\n**6. Profile Page Design**:
- **Layout**: Two-column layout (desktop) / Single column (mobile)
  - Left column: Profile image, basic info, quick actions
  - Right column: Detailed information sections with collapsible cards
- **Visual Style**:
  - Consistent with overall cyber-dark theme
  - White cards on dark background (#1a1a1a)
  - Neon green accents for active elements
  - Smooth transitions and hover effects
  - Form fields with clear labels and validation feedback
- **Responsive Design**: Fully responsive for desktop, tablet, and mobile devices
- **Loading States**: Skeleton loaders while fetching profile data
- **Error Handling**: Graceful error messages for failed operations

### 3.2 Administrator Module - Enhanced with Improved Core Sections

#### 3.2.1 Vehicle Management (CRUD) - Enhanced & Fully Functional

**Core Features:**
- **Master Vehicle List/View**:
  - Display all vehicles in fleet using shadcn/ui Data Tables component
  - Columns: Vehicle ID, License Plate, VIN, Model, Year, Capacity, Assigned Route, Assigned Driver, Insurance Expiry, Maintenance Status, Status (Active/Inactive)
  - Search functionality: Filter by vehicle ID, license plate, VIN, model, or assigned route
  - Sort by any column (ascending/descending)
  - Pagination with configurable page size (10/25/50/100 records per page)
  - Export to CSV/Excel functionality
  - Color-coded status indicators (Active: green, Inactive: gray, Maintenance Due: yellow)
\n- **Add Vehicle Feature**:
  - Comprehensive form with fields:\n    - Vehicle ID (auto-generated or manual entry)
    - License Plate Number (required, unique validation)
    - VIN (Vehicle Identification Number) (optional, unique validation)
    - Model (required)
    - Year (required, dropdown with range2000-current year)
    - Capacity (required, numeric input for passenger count)
    - Insurance Expiry Date (required, date picker)
    - Purchase Date (optional, date picker)
    - Last Maintenance Date (optional, date picker)
    - Next Maintenance Due (optional, date picker with auto-calculation based on mileage/time)
    - Current Mileage (optional, numeric input)
    - Fuel Type (dropdown: Diesel/Petrol/Electric/Hybrid)
    - Status (dropdown: Active/Inactive/Under Maintenance)
  - Real-time validation with inline error messages
  - Image upload for vehicle photo (optional)
  - Submit button with loading state
  - Success toast notification after creation

- **Edit Vehicle Information**:
  - Click edit icon in vehicle list to open edit dialog
  - Pre-populated form with existing vehicle data
  - Allow updating all fields except Vehicle ID
  - Reassign vehicle to different route (dropdown with available routes)
  - Reassign vehicle to different driver (dropdown with available drivers)
  - Update maintenance schedule and status
  - Update insurance expiry date with expiration warning
  - Save changes with validation\n  - Audit trail logging for all modifications

- **Deactivate/Delete Vehicle Records**:
  - Deactivate button changes vehicle status to 'Inactive'
  - System validates that vehicle has no active trips before deactivation
  - Warning dialog if vehicle is currently assigned to route or driver
  - Option to reassign route/driver before deactivation
  - Soft delete (mark as deleted but retain in database for historical records)
  - Hard delete option (admin-only, requires confirmation and password re-entry)
  - Cascade handling: Unassign from routes and drivers upon deletion

- **Route Assignment**:
  - Assign text-based route names to each vehicle
  - Dropdown showing all available routes
  - Display current route assignment with'Change Route' button
  - Validate that route exists before assignment
  - Update vehicle record with route_id foreign key
  - Display route details (stops, distance, estimated duration) in vehicle view

- **Driver Assignment**:
  - Assign driver to vehicle via dropdown selection
  - Display current driver assignment with contact information
  - 'Change Driver' button to reassign\n  - Validate driver availability (not assigned to another vehicle)
  - Update driver record with vehicle_id foreign key
  - Display driver details (name, license number, contact) in vehicle view

- **Maintenance Scheduling & Tracking**:
  - **Maintenance Schedule Calendar**:
    - Visual calendar showing upcoming maintenance dates
    - Color-coded indicators (green: completed, yellow: due soon, red: overdue)
    - Click date to view/edit maintenance details
  - **Maintenance Records**:
    - List of all past maintenance activities for each vehicle
    - Fields: Date, Type (Oil Change/Tire Rotation/Inspection/Repair), Description, Cost, Performed By, Next Due Date
    - Add new maintenance record button
    - Edit/delete existing records
  - **Maintenance Alerts**:
    - Automatic notifications when maintenance is due within 7 days
    - Dashboard widget showing vehicles requiring maintenance
    - Email alerts to admin and assigned driver
  - **Maintenance Status Tracking**:
    - Status options: Scheduled/In Progress/Completed/Overdue
    - Update status from vehicle detail view
    - Filter vehicles by maintenance status

- **Insurance Tracking**:
  - Display insurance expiry date prominently in vehicle list
  - Color-coded warnings (red if expired, yellow if expiring within 30 days)
  - Insurance renewal reminder notifications
  - Upload insurance documents (PDF/image)\n  - View insurance history and documents

- **Vehicle Detail View**:
  - Dedicated page showing comprehensive vehicle information
  - Tabs: Overview, Maintenance History, Trip History, Documents\n  - Overview tab: All vehicle details, assigned route/driver, current status
  - Maintenance History tab: Timeline of all maintenance activities
  - Trip History tab: List of all trips made by this vehicle (date, route, driver, duration, distance)
  - Documents tab: Uploaded insurance, registration, and maintenance documents
\n- **Admin-Exclusive Management**: All vehicle data management operations must be performed exclusively through the admin dashboard interface
\n**Bug Fixes & Improvements:**
- Fix any non-functional buttons in vehicle management interface
- Ensure all CRUD operations work correctly with proper error handling
- Implement proper validation for all form fields
- Fix data loading issues and ensure vehicle list displays correctly
- Resolve any issues with route/driver assignment functionality
- Ensure search and filter functions work accurately
- Fix pagination and sorting issues
- Implement proper loading states and error messages
\n#### 3.2.2 Routes Management (CRUD) - Enhanced & Fully Functional

**Core Features:**
- **Master Route List/View**:
  - Display all active and inactive routes using shadcn/ui Data Tables\n  - Columns: Route ID, Route Name, Number of Stops, Total Distance, Estimated Duration, Assigned Vehicle, Assigned Driver, Status (Active/Inactive/Archived)
  - Search functionality: Filter by route name, assigned vehicle, or driver
  - Sort by any column\n  - Pagination with configurable page size\n  - Export to CSV/Excel functionality
  - Color-coded status indicators (Active: green, Inactive: gray, Archived: blue)
  - Quick actions: View on Map, Edit, Duplicate, Archive

- **Create Route Feature**:
  - Comprehensive route creation form:\n    - Route Name (required, unique validation)
    - Route Description (optional, text area)
    - Route Type (dropdown: Morning Pickup/Afternoon Dropoff/Both)
    - Start Location (address input with autocomplete)
    - End Location (address input with autocomplete)
    - Status (dropdown: Active/Inactive)\n  - **Visual Route Mapping**:
    - Interactive map interface using mapbox-gl-draw plugin
    - Click on map to add waypoints and create route path
    - Drag waypoints to adjust route\n    - Display route polyline in neon green color
    - Show distance and estimated duration as route is drawn
    - Snap to roads functionality for accurate routing
  - **Stop Assignment**:
    - Add stops to route by clicking on map or selecting from existing stops list
    - Define stop sequence (drag-and-drop reordering)
    - Set estimated arrival time for each stop
    - Mark stops as pickup-only, dropoff-only, or both\n  - Save route button with validation
  - Store route as polyline string format in database
  - Success notification after creation

- **Edit Route Feature**:
  - Click edit icon in route list to open edit interface
  - Pre-populated form with existing route data
  - Modify route name, description, type, status
  - **Visual Route Editing**:
    - Display existing route on map with all waypoints and stops
    - Add/remove/reorder waypoints by clicking and dragging
    - Add/remove stops from route\n    - Adjust stop sequence and estimated times
    - Real-time distance and duration recalculation
  - Update assigned vehicle and driver\n  - Save changes with validation
  - Audit trail logging for all modifications

- **Archive Route Feature**:
  - Archive button changes route status to 'Archived'\n  - Archived routes hidden from active list by default
  - Filter option to view archived routes
  - Restore archived route to active status
  - Validate that no active vehicles are assigned before archiving
  - Warning dialog if route has active assignments
\n- **Delete Route Feature**:
  - Soft delete (mark as deleted but retain in database)\n  - Hard delete option (admin-only, requires confirmation)\n  - Validate that no active vehicles are assigned before deletion
  - Cascade handling: Unassign from vehicles and remove stop associations
  - Confirmation dialog with route details and impact summary

- **Route Visualization**:
  - **Map View**:
    - Display route path on interactive map
    - Show all stops along route with numbered markers
    - Color-coded route segments (green: active, gray: inactive)\n    - Click stop marker to view stop details
    - Toggle between different routes on map
  - **List View**:
    - Sequential list of stops with estimated times
    - Distance between consecutive stops
    - Total route distance and duration
    - Stop details (name, address, coordinates)
\n- **Vehicle & Driver Assignment**:
  - Assign vehicle to route via dropdown selection
  - Assign driver to route via dropdown selection
  - Display current assignments with 'Change' buttons
  - Validate vehicle and driver availability
  - Update vehicle and driver records with route_id\n  - Display assignment history (past vehicles/drivers for this route)

- **Route Analytics**:
  - **Trip Statistics**:
    - Total trips completed on this route
    - Average trip duration
    - On-time performance percentage
    - Most frequent delays (by stop)\n  - **Distance & Duration Tracking**:
    - Estimated vs. actual distance comparison
    - Estimated vs. actual duration comparison
    - Historical trends chart
\n- **Route Duplication**:
  - Duplicate existing route to create new route with similar path
  - Modify duplicated route name and details
  - Useful for creating reverse routes or similar routes
\n- **Route Detail View**:
  - Dedicated page showing comprehensive route information
  - Tabs: Overview, Map View, Stops, Trip History, Analytics
  - Overview tab: Route details, assigned vehicle/driver, status
  - Map View tab: Interactive map with route path and stops
  - Stops tab: List of all stops with details and sequence
  - Trip History tab: All trips completed on this route
  - Analytics tab: Performance metrics and statistics

- **Admin-Exclusive Route Configuration**: All route definitions, modifications, and deletions must be performed exclusively through the admin dashboard interface

**Bug Fixes & Improvements:**
- Fix any non-functional route creation or editing features
- Ensure map integration works correctly with route drawing
- Fix issues with stop assignment and sequencing
- Resolve any problems with route visualization on map
- Ensure vehicle/driver assignment functionality works properly
- Fix search, filter, and sort functions
- Implement proper validation and error handling
- Ensure route data saves correctly to database
\n#### 3.2.3Stops Management (CRUD) - Enhanced & Fully Functional

**Core Features:**
- **Master Stop List/View**:
  - Display all stops (bus stops, pickup/drop-off points) using shadcn/ui Data Tables
  - Columns: Stop ID, Stop Name, Address, Geolocation (Lat/Lng), Associated Routes, Number of Students, Status (Active/Inactive)\n  - Search functionality: Filter by stop name, address, or associated route
  - Sort by any column
  - Pagination with configurable page size
  - Export to CSV/Excel functionality
  - Color-coded status indicators (Active: green, Inactive: gray)\n  - Quick actions: View on Map, Edit, Deactivate

- **Add Stop Feature**:
  - Comprehensive stop creation form:
    - Stop Name (required, descriptive name like'Main Street Corner')
    - Address (required, with autocomplete)
    - Geolocation (latitude/longitude)\n      - Auto-populate from address
      - Manual entry option
      - Click on map to set location (pin drop)
    - Stop Type (dropdown: Pickup Only/Dropoff Only/Both)\n    - Landmark Description (optional, text area for additional location details)
    - Status (dropdown: Active/Inactive)
  - **Interactive Map Interface**:
    - Display map with current stop location marked
    - Drag marker to adjust exact location
    - Zoom controls for precise positioning
    - Street view option for verification
  - Save stop button with validation
  - Success notification after creation

- **Edit Stop Feature**:
  - Click edit icon in stop list to open edit dialog
  - Pre-populated form with existing stop data
  - Modify stop name, address, geolocation, type, status
  - Update landmark description\n  - Adjust location on map by dragging marker
  - Save changes with validation
  - Audit trail logging for all modifications

- **Deactivate/Delete Stop**:
  - Deactivate button changes stop status to 'Inactive'
  - Validate that stop is not currently assigned to active routes
  - Warning dialog if stop has active route associations
  - Option to remove stop from routes before deactivation
  - Soft delete (mark as deleted but retain in database)
  - Hard delete option (admin-only, requires confirmation)\n  - Cascade handling: Remove from all route associations

- **Route Association Management**:
  - **Associate Stop with Routes**:
    - Multi-select dropdown showing all available routes
    - Add stop to multiple routes simultaneously
    - Define stop sequence within each route
    - Set estimated arrival time for each route
  - **View Associated Routes**:
    - List of all routes using this stop
    - Display stop sequence number in each route
    - Estimated arrival time for each route
    - Quick link to view route details
  - **Remove Stop from Route**:
    - Remove button for each associated route
    - Confirmation dialog before removal
    - Update route polyline if necessary
\n- **Student Assignment to Stops**:
  - **View Students at Stop**:
    - List of all students assigned to this stop (pickup or dropoff)
    - Display student name, grade, parent contact\n    - Filter by pickup vs. dropoff
  - **Assign Students to Stop**:
    - Multi-select dropdown showing all students
    - Specify if stop is for pickup, dropoff, or both
    - Bulk assignment functionality
  - **Remove Students from Stop**:
    - Remove button for each assigned student
    - Confirmation dialog before removal
\n- **Stop Details & Estimated Times**:
  - **Stop Information Display**:
    - Stop name and full address
    - Geolocation coordinates with map pin
    - Landmark description\n    - Stop type (pickup/dropoff/both)
    - Number of students using this stop
  - **Estimated Arrival Times**:
    - Display estimated arrival time for each associated route
    - Calculate based on route start time and distance from previous stops
    - Update automatically when route is modified
    - Show time range (e.g., 7:45 AM - 7:50 AM) to account for traffic variability
  - **Real-Time Arrival Updates** (Integration with GPS Tracking):
    - Display real-time ETA when bus is en route
    - Update ETA based on current bus location and traffic\n    - Show 'Bus Approaching' alert when within 5 minutes
\n- **Stop Visualization on Map**:
  - **Map View**:
    - Display all stops on interactive map with numbered markers
    - Color-coded markers by stop type (pickup: blue, dropoff: orange, both: green)
    - Click marker to view stop details in popup
    - Filter stops by route, status, or type
    - Toggle between different map layers (satellite, street, terrain)
  - **Cluster View**:
    - Group nearby stops into clusters for better visualization
    - Click cluster to zoom in and view individual stops
\n- **Stop Analytics**:
  - Number of students using each stop
  - Average wait time at stop (based on historical data)
  - On-time arrival percentage
  - Most frequently delayed stops
\n- **Stop Detail View**:
  - Dedicated page showing comprehensive stop information
  - Tabs: Overview, Map View, Associated Routes, Students, Analytics
  - Overview tab: Stop details, address, geolocation, status
  - Map View tab: Interactive map with stop location and nearby landmarks
  - Associated Routes tab: List of routes using this stop with sequence and times
  - Students tab: List of students assigned to this stop
  - Analytics tab: Usage statistics and performance metrics

- **Admin-Exclusive Stop Management**: All stop creation, modification, and deletion operations must be performed exclusively through the admin dashboard interface\n
**Bug Fixes & Improvements:**
- Fix any non-functional stop creation or editing features
- Ensure map integration works correctly with pin drop functionality
- Fix issues with geolocation auto-population from address
- Resolve any problems with route association functionality
- Ensure student assignment to stops works properly
- Fix search, filter, and sort functions
- Implement proper validation and error handling
- Ensure stop data saves correctly to database
- Fix any issues with estimated arrival time calculations

#### 3.2.4 Students Management (CRUD) - Enhanced & Fully Functional

**Core Features:**
- **Master Student List/View**:
  - Display all students using shadcn/ui Data Tables
  - Columns: Student ID, Name, Grade, Assigned Route, Pickup Stop, Dropoff Stop, Parent Name, Parent Contact, Status (Active/Inactive)
  - Search functionality: Filter by student name, student ID, grade, parent name, or assigned route
  - Sort by any column
  - Pagination with configurable page size
  - Export to CSV/Excel functionality
  - Color-coded status indicators (Active: green, Inactive: gray)
  - Quick actions: View Details, Edit, Deactivate
  - Bulk actions: Assign to route, Export selected, Deactivate selected
\n- **Add Student Feature** (Enhanced with Parent Linking):
  - **Student Information Form**:
    - Full Name (required)\n    - Student ID Number (required, unique validation)
    - **User ID** (custom username field - admin enters desired username)
    - **Password** (custom password field - admin sets initial password)
    - Grade Level (required, dropdown: Pre-K, K, 1-12)\n    - Date of Birth (required, date picker)\n    - Gender (optional, dropdown: Male/Female/Other)
    - Email Address (optional, with validation)
    - Phone Number (optional, with validation)
    - Home Address (required, with autocomplete)
    - Emergency Contact Name (required)\n    - Emergency Contact Phone (required)
    - Medical Information (optional, text area for allergies, conditions, medications)
    - Profile Photo Upload (optional)\n  - **Pickup/Dropoff Location Assignment**:
    - Pickup Stop (dropdown with all available stops, or click on map to set custom location)
    - Dropoff Stop (dropdown with all available stops, or click on map to set custom location)
    - Display pickup/dropoff coordinates\n    - Interactive map showing selected stops
  - **Route Assignment**:
    - Assigned Bus/Route (dropdown with all available routes)\n    - Display route details (stops, estimated times)\n    - Validate that selected pickup/dropoff stops are on the assigned route
  - **Linked Parent Profile Creation** (Mandatory):
    - During student addition process, capture parent/guardian details:\n      - Parent/Guardian Full Name (required)
      - **User ID** (custom username field - admin enters desired username for parent)
      - **Password** (custom password field - admin sets initial password for parent)
      - Contact Phone Number (required)
      - Email Address (required, with validation)
      - Relationship to Student (required, dropdown: Father/Mother/Guardian/Other)
      - Secondary Contact Phone (optional)
      - Home Address (auto-populated from student address, editable)
      - Workplace Information (optional)
      - Preferred Contact Method (dropdown: Email/Phone/SMS)
    - System validates parent username uniqueness across all user tables
    - System validates parent password complexity requirements
    - Automatically link parent account to the newly created student record via foreign key relationship
    - Display both student and parent credentials to admin after successful creation in a consolidated view
    - Store parent credentials securely in the `parents` table
    - **Atomic Transaction**: Student and parent account creation must be executed as a single atomic transaction to ensure data integrity
  - **Manual Credential Entry**:
    - Admin manually enters desired username in'User ID' field
    - Admin manually enters initial password in 'Password' field\n    - System validates username uniqueness across all user tables before account creation
    - System validates password meets complexity requirements (minimum 8 characters, mix of uppercase, lowercase, numbers, special characters)
    - Display validation errors inline if username already exists or password is weak
    - Store credentials securely in the `students` table with proper encryption
  - **Credential Display**: Show entered credentials to admin after successful creation with copy-to-clipboard functionality
  - Save student button with validation
  - Success notification after creation

- **Edit Student Feature**:
  - Click edit icon in student list to open edit dialog
  - Pre-populated form with existing student data
  - Modify student details (name, grade, contact info, address)
  - Update pickup/dropoff stops (dropdown or map selection)
  - Reassign to different route\n  - Update medical information\n  - Modify parent associations (link/unlink parents)
  - Reset student password (admin enters new password)
  - Update profile photo\n  - Save changes with validation
  - Audit trail logging for all modifications

- **Deactivate/Archive Student**:
  - Deactivate button changes student status to 'Inactive'
  - When deactivating a student, system prompts admin to handle associated parent account
  - Option to deactivate parent if no other students are linked
  - Maintain data integrity through cascading rules
  - Require admin confirmation before deactivation
  - Soft delete (mark as deleted but retain in database for historical records)
  - Hard delete option (admin-only, requires confirmation and password re-entry)
\n- **View Student Details**:
  - Dedicated student detail page with comprehensive information
  - Tabs: Overview, Route & Stops, Parent Information, Trip History, Documents
  - Overview tab: Student profile, contact info, medical info, status
  - Route & Stops tab: Assigned route, pickup/dropoff stops with map view, estimated times
  - Parent Information tab: Linked parent details, contact info, relationship
  - Trip History tab: List of all trips taken by student (date, route, pickup/dropoff times, status)
  - Documents tab: Uploaded documents (medical records, consent forms, etc.)

- **Route & Stop Assignment**:
  - **Assign Student to Route**:
    - Dropdown showing all available routes
    - Display route details (stops, times, assigned vehicle/driver)
    - Validate that selected pickup/dropoff stops are on the route
  - **Assign Pickup/Dropoff Stops**:
    - Dropdown showing stops on assigned route
    - Option to set custom location (click on map)\n    - Display stop details (address, estimated time)
    - Validate that stops are on the assigned route
  - **View Route Assignment**:
    - Display assigned route name and details
    - Show pickup and dropoff stops with addresses
    - Display estimated pickup and dropoff times
    - Map view showing route path and student stops
\n- **Parent Association Management**:
  - **View Linked Parents**:
    - List of all parents linked to student
    - Display parent name, relationship, contact info
    - Primary parent indicator\n  - **Link Additional Parent**:
    - Add button to link existing parent account
    - Search for parent by name or username
    - Specify relationship (father/mother/guardian/other)
    - Support multiple parents per student
  - **Unlink Parent**:
    - Remove button for each linked parent
    - Confirmation dialog before unlinking
    - Validate that at least one parent remains linked
\n- **Student Analytics**:
  - Total trips taken\n  - Attendance rate (trips taken vs. scheduled)
  - Average pickup/dropoff times
  - Late pickups/dropoffs count
  - Parent notification history
\n- **Bulk Operations**:
  - **Bulk Import Students**:
    - Upload CSV/Excel file with student data
    - Template download for correct format
    - Validation and error reporting
    - Preview before import
    - Option to create parent accounts during import
  - **Bulk Route Assignment**:
    - Select multiple students\n    - Assign to same route
    - Set pickup/dropoff stops
  - **Bulk Export**:
    - Export selected students to CSV/Excel
    - Include parent information
    - Customizable column selection
\n- **Admin-Exclusive Management**: All student and parent account creation, modification, and deactivation operations must be performed exclusively through the admin dashboard interface

**Bug Fixes & Improvements:**
- Fix any non-functional student creation or editing features
- Ensure parent linking works correctly during student creation
- Fix issues with route and stop assignment\n- Resolve any problems with credential generation and display
- Ensure atomic transaction handling works properly
- Fix search, filter, and sort functions
- Implement proper validation and error handling
- Ensure student data saves correctly to database
- Fix any issues with bulk operations\n\n#### 3.2.5 Trip History Management - New Module (Fully Functional)

**Core Features:**
- **Master Trip History List/View**:
  - Display all completed trips using shadcn/ui Data Tables
  - Columns: Trip ID, Date, Route Name, Vehicle ID, Driver Name, Start Time, End Time, Duration, Distance, Number of Students, Status (Completed/Cancelled/In Progress)
  - Search functionality: Filter by date range, route, vehicle, driver, or status
  - Sort by any column
  - Pagination with configurable page size
  - Export to CSV/Excel functionality
  - Color-coded status indicators (Completed: green, Cancelled: red, In Progress: yellow)
  - Quick actions: View Details, View on Map, Export Report
\n- **Trip Detail View**:
  - Dedicated page showing comprehensive trip information
  - Tabs: Overview, Route Map, Students, Timeline, Analytics
  - **Overview Tab**:
    - Trip ID and date
    - Route name and details
    - Vehicle ID and model
    - Driver name and contact
    - Start time and location
    - End time and location
    - Total duration
    - Total distance traveled
    - Number of students on trip
    - Trip status\n  - **Route Map Tab**:
    - Interactive map showing actual route taken
    - Display GPS trajectory with timestamps
    - Show all stops with pickup/dropoff markers
    - Highlight deviations from planned route
    - Playback feature to replay trip
  - **Students Tab**:
    - List of all students on this trip
    - Pickup and dropoff times for each student
    - Pickup and dropoff locations
    - Status (Picked Up/Dropped Off/Absent)
  - **Timeline Tab**:
    - Chronological timeline of trip events
    - Trip start event\n    - Each stop with arrival and departure times
    - Student pickup/dropoff events
    - Any delays or incidents
    - Trip end event
  - **Analytics Tab**:
    - On-time performance (planned vs. actual times)
    - Average speed\n    - Idle time at stops
    - Fuel consumption estimate
    - Comparison with previous trips on same route

- **Trip Filtering & Search**:
  - **Date Range Filter**:
    - Select start and end dates
    - Preset options (Today, Yesterday, Last 7 Days, Last 30 Days, Custom Range)
  - **Route Filter**:
    - Multi-select dropdown with all routes
    - Filter trips by one or more routes
  - **Vehicle Filter**:
    - Multi-select dropdown with all vehicles
    - Filter trips by one or more vehicles
  - **Driver Filter**:
    - Multi-select dropdown with all drivers
    - Filter trips by one or more drivers
  - **Status Filter**:
    - Checkboxes for Completed, Cancelled, In Progress\n  - **Advanced Search**:
    - Search by trip ID\n    - Search by student name (trips containing specific student)
    - Search by stop name\n\n- **Trip Analytics Dashboard**:
  - **Summary Statistics**:
    - Total trips completed (today, this week, this month)
    - Total distance traveled
    - Total hours driven
    - Average trip duration
    - On-time performance percentage
  - **Charts & Visualizations**:
    - Trips per day (line chart)
    - Trips by route (bar chart)
    - Trips by vehicle (pie chart)
    - On-time vs. delayed trips (stacked bar chart)
    - Average trip duration by route (bar chart)
  - **Performance Metrics**:
    - Most punctual routes
    - Most delayed routes
    - Most active vehicles
    - Most active drivers
    - Peak trip hours

- **Trip Reports**:
  - **Generate Trip Report**:
    - Select date range
    - Select routes, vehicles, or drivers
    - Choose report format (PDF, Excel, CSV)
    - Include options: Summary, Detailed Timeline, Student List, Analytics
  - **Scheduled Reports**:
    - Set up automated daily/weekly/monthly reports
    - Email reports to specified recipients
    - Customize report content and format
\n- **Trip Playback Feature**:
  - **Replay Trip on Map**:
    - Select trip from history
    - Click'Playback' button
    - Animated replay of vehicle movement along route
    - Adjustable playback speed (1x, 2x, 5x, 10x)
    - Pause/resume controls
    - Display current time and location during playback
    - Show student pickup/dropoff events during playback
\n- **Trip Comparison**:
  - **Compare Multiple Trips**:
    - Select2-5 trips to compare
    - Side-by-side comparison of key metrics
    - Overlay routes on map to visualize differences
    - Highlight variations in duration, distance, stops\n\n- **Incident Reporting** (Optional Enhancement):
  - **Log Incidents During Trip**:
    - Driver can report incidents (delay, breakdown, accident, etc.)
    - Admin can add incident notes to trip record
    - Display incidents in trip timeline
    - Filter trips by incident type
\n- **Admin-Exclusive Access**: All trip history viewing and reporting features are accessible only through the admin dashboard\n
**Bug Fixes & Improvements:**
- Ensure trip history data is correctly populated from GPS logs and trip records
- Fix any issues with date range filtering\n- Resolve problems with trip detail view loading
- Ensure map playback feature works smoothly
- Fix search and filter functions
- Implement proper pagination and sorting
- Ensure export functionality works correctly
- Fix any issues with analytics calculations
\n#### 3.2.6 Driver Management (CRUD) - Existing Module (Preserved)
- **Add Driver Feature**:
  - **Driver Information Form**: Capture all necessary driver details including:
    - Full name\n    - Contact phone number
    - Email address\n    - License number
    - **User ID** (custom username field - admin enters desired username)
    - **Password** (custom password field - admin sets initial password)
    - Assigned vehicle (vehicle_id association)
    - Emergency contact information
  - **Manual Credential Entry**:
    - Admin manually enters desired username in 'User ID' field
    - Admin manually enters initial password in 'Password' field
    - System validates username uniqueness across all user tables before account creation
    - System validates password meets complexity requirements (minimum 8 characters, mix of uppercase, lowercase, numbers, special characters)
    - Display validation errors inline if username already exists or password is weak
    - Store credentials securely in the `drivers` table with proper encryption
  - **Credential Display**: Show entered credentials to admin after successful creation with copy-to-clipboard functionality
- **View Driver List**: Display using shadcn/ui Data Tables component with account credentials (masked, with reveal option for admin)
- **Driver Search Functionality**:
  - Dedicated search bar positioned above the driver list table
  - Real-time search capability filtering by: driver name, username, email, phone number, license number, or assigned vehicle
  - Search results update dynamically as user types
  - Clear search button to reset filters
  - Search bar styling consistent with overall design theme
- **Edit Driver Information**: Implement via Dialog/Sheet components, allow updating driver details, reassigning vehicles, and resetting passwords
- **Deactivate/Delete Driver Accounts**: System validates that driver has no active trips before deactivation\n- **Vehicle Association**: Must specify vehicle_id when creating driver to establish relationship link
- **Admin-Exclusive Management**: All driver account creation and management operations must be performed exclusively through the admin dashboard interface

#### 3.2.7 Parent Management (CRUD) - Existing Module (Preserved)
- **View Parent List**: Display using shadcn/ui Data Tables component showing:\n  - Parent name and contact details
  - Associated student(s) with their names and IDs
  - Account status (active/inactive)
  - Login credentials (masked, with reveal option for admin)
- Relationship to student(s)\n- **Parent Search Functionality**:
  - Dedicated search bar positioned above the parent list table
  - Real-time search capability filtering by: parent name, username, email, phone number, or associated student name
  - Search results update dynamically as user types
  - Clear search button to reset filters
  - Search bar styling consistent with overall design theme
- **Edit Parent Information**: \n  - Update contact details (phone, email, address)
  - Modify student associations (link/unlink students)
  - Update relationship information\n  - Cannot modify username (read-only)
  - Can reset password (admin enters new password)
- **Deactivate/Delete Parent Accounts**:
  - System prevents deletion if parent has active linked students
  - Provide warning message listing all linked students
  - Require explicit admin confirmation before deactivation
  - Maintain audit trail of deactivation actions
- **Manual Parent Addition** (Special Cases Only):
  - Allow admin to manually add parent accounts for edge cases (e.g., guardian changes, multiple guardians)
  - Require linking to at least one existing student during creation
  - Admin manually enters User ID and Password for the parent
  - Follow same credential validation process\n  - Display generated credentials immediately with copy functionality
- **Parent-Student Relationship Management**:
  - Support one-to-many relationships (one parent linked to multiple students)
  - Visual relationship tree in the dashboard
  - Bulk operations for managing multiple student associations
- **Admin-Exclusive Management**: All parent account management operations must be performed exclusively through the admin dashboard interface

#### 3.2.8 Route and Stop Management (CRUD) - Existing Module (Preserved, Enhanced Above)
- **Route Drawing Tool**: Use mapbox-gl-draw plugin to create routes by clicking on the map
- **Stop Marking**: Mark pickup/drop-off stop coordinates along the route with descriptive labels
- **Route Saving**: Store routes as polyline string format in the database
- **Route Editing**: Support modification of existing routes and stop locations
- **Route Assignment**: Associate routes with specific vehicles and update vehicle records accordingly
- **Route Deletion**: Validate that no active vehicles are assigned before allowing route deletion
- **Admin-Exclusive Route Configuration**: All route definitions, modifications, and deletions must be performed exclusively through the admin dashboard interface. Drivers, students, and parents have read-only access to route information relevant to their assignments.

#### 3.2.9 Real-time Monitoring Map - Existing Module (Preserved)
- **Global Vehicle View**: Display real-time locations of all online vehicles on the admin dashboard map
- **Vehicle Status Indicators**: Differentiate vehicle states (moving/stopped/offline) using distinct colors or icons
- **Vehicle Details View**: Click map markers to view detailed vehicle information, assigned driver, and current route
- **Real-time Data Updates**: Receive vehicle location updates via Socket.io and refresh map display automatically
- **Historical Playback**: Access last 24 hours of vehicle trajectory data for review and analysis
\n#### 3.2.10 Hourly Active Vehicles Analytics Dashboard - Existing Module (Preserved)
- **Real-time Active Vehicle Counter**:
  - Display current number of active vehicles (vehicles with active trips in progress)
  - Prominent card widget positioned at top of admin dashboard
  - Large numeric display with neon green accent color (#10b981)
  - Auto-refresh every 30 seconds via Socket.io real-time updates
  - Visual indicator showing increase/decrease compared to previous hour
- **Hourly Activity Chart**:
  - Line chart displaying active vehicle count for the current day (24-hour period)
  - X-axis: Hours (00:00 to 23:00)\n  - Y-axis: Number of active vehicles
  - Data points updated in real-time as vehicles start/stop trips
  - Chart library: Recharts or Chart.js with dark theme styling
  - Hover tooltips showing exact vehicle count and hour
  - Color scheme: Neon green line (#10b981) on dark background (#1a1a1a)
- **Active Vehicle List Panel**:
  - Collapsible side panel showing currently active vehicles
  - Display vehicle ID, driver name, route name, trip start time
  - Real-time status updates (moving/stopped)\n  - Click to highlight vehicle on map
  - Sort by trip duration or vehicle ID
- **Historical Comparison**:
  - Compare current day's hourly activity with previous day
  - Display percentage change in activity levels
  - Weekly average active vehicles metric
- **Data Calculation Logic**:
  - Active vehicle defined as: vehicle with trip status ='active' in current hour
  - Query `gps_logs` table grouped by hour with vehicle_id count
  - Cache hourly aggregates for performance optimization
  - Real-time updates via Socket.io event: `admin:hourly_stats_update`

#### 3.2.11 Role-Based Access Control (RBAC) - Existing Module (Preserved)
- **Supabase RLS (Row Level Security) Policies**:
  - **Administrator Role**:
    - Full CRUD permissions on all tables (vehicles, drivers, students, parents, routes, stops, trips)
    - Exclusive access to user account creation with manual credential entry for all user types
    - Exclusive access to route and stop configuration and management
    - Ability to view and manage all system data across all modules
    - Access to audit logs and system reports
    - Exclusive access to credential reveal functionality
    - Ability to reset passwords for all user types
    - Full access to hourly active vehicle analytics and historical data
    - Full access to trip history and analytics
  - **Driver Role**:
    - READ-only access to assigned vehicle information
    - READ-only access to assigned route information
    - UPDATE permission only for own GPS location data and trip status
    - READ-only access to own account profile\n    - **UPDATE permission for own profile information (name, email, phone, emergency contact, profile image)**
    - **Access to change own password via profile settings**
    - No access to student/parent personal information
    - No access to other drivers' data
    - No access to analytics dashboard
    - No access to trip history
  - **Student Role**:
    - READ-only access to own profile information
    - **UPDATE permission for own profile information (email, phone, pickup/dropoff locations, profile image)**
    - **Access to change own password via profile settings**
    - READ-only access to assigned bus real-time location
    - READ-only access to assigned route and stop information
    - No access to other students' data
    - No access to driver or parent account details
    - No access to analytics dashboard
    - No access to trip history
  - **Parent Role**:
    - READ-only access to linked student(s) information
    - **UPDATE permission for own profile information (name, email, phone, address, profile image)**
    - **Access to change own password via profile settings**
    - READ-only access to assigned bus real-time location for linked students
    - READ-only access to route and stop information for linked students
    - No access to other families' data
    - No access to driver account details
    - No access to analytics dashboard
    - No access to trip history
- **Data Integrity Enforcement**:
  - Database-level foreign key constraints ensure parent accounts cannot exist without linked students
  - Cascading rules prevent orphaned records
  - Transaction-based operations ensure atomic creation of student-parent pairs
  - Check constraints validate data consistency before commits
- **Administrative Privilege Segregation**:
  - All user account management functions accessible only through admin dashboard
  - No direct database access required for routine operations
  - Audit logging for all administrative actions (user creation, modifications, deletions, credential access)
  - Session timeout and re-authentication for sensitive operations
  - IP whitelisting option for admin access (optional security enhancement)

#### 3.2.12 Credential Management System - Existing Module (Preserved)\n- **Manual Credential Entry Interface**:
  - Form fields for 'User ID' (username) and 'Password' in all user creation forms
  - Real-time validation feedback for username uniqueness
  - Password strength indicator showing complexity requirements
  - Inline error messages for validation failures
  - Clear labeling of required fields
- **Credential Display Interface**:
  - Modal dialog displaying entered credentials after successful account creation
  - Copy-to-clipboard functionality for both username and password
  - Print-friendly format for physical credential distribution
  - Warning message about credential security\n  - Option to send credentials via email (optional feature)
- **Credential Management Features**:
  - Admin ability to view masked credentials in user lists
  - Reveal functionality with audit logging
  - Password reset capability where admin enters new password
  - Bulk credential export for backup purposes (encrypted format)
  - Credential expiration and forced password change policies (optional)
\n### 3.3 Driver Module (Phase 3: Driver Dashboard - The Publisher) - Existing Module (Preserved)\n
#### 3.3.1 Driver Control Panel (Web Version)\n- **Status Display**: Show current online/offline status\n- **Trip Control Buttons**:
  - START TRIP: Begin tracking, button in emerald green (#10b981)
  - STOP TRIP: Stop tracking, button in red (#ef4444)
  - Button styling: Large size (py-6text-2xl), rounded design with shadow effects
- **Real-time Location Display**: Show current latitude/longitude coordinates (4 decimal places)
- **Vehicle Information Display**: Show assigned vehicle information and current route details
- **Speed and Direction Display**: Show current driving speed and heading
- **Profile Access**: View and edit own account information via profile settings button
\n#### 3.3.2 Real-time Tracking Functionality
- **GPS Data Collection**:
  - Use `navigator.geolocation.watchPosition` API (preferred over getCurrentPosition)
  - Collected data: latitude, longitude, heading, speed\n  - Configuration parameters: enableHighAccuracy: true, timeout: 5000, maximumAge: 0
- **Data Throttling Mechanism**: Update database every 5-10 seconds (avoid excessive writes)
- **Location Data Upload**: Send real-time data to backend via Socket.io
- **Background Persistence**: Maintain location updates even when app is in background
\n#### 3.3.3 GPS Reporting Logic (Socket.io Implementation)
- Driver client sends location data via `socket.emit('driver:ping', payload)`
- Payload includes: busId, lat, lng, speed, heading, timestamp, tripStatus
- Backend receives and broadcasts to all clients subscribed to that vehicle
- Backend updates hourly active vehicle statistics when trip status changes
\n### 3.4 Student and Parent Module (Phase 4: Parent/Student View - The Subscriber) - Existing Module (Preserved)\n
#### 3.4.1 Real-time Map Tracking (Phase 2: Map Integration)
- **Map Engine**: React-Leaflet + CartoDB Dark Matter Tiles
- **Visual Style**: Cyber-dark theme with neon green markers\n- **Core Features**:
  - Automatically load map interface after login
  - Display real-time location of bus assigned to the student
  - Vehicle markers use neon green pulse animation effect
  - Vehicle markers automatically move with GPS data updates
  - Display vehicle movement trajectory\n  - Smooth animation transitions: Use CSS transitions to interpolate between coordinate points for sliding effect instead of teleportation
  - Display pulse animation when vehicle is moving (triggered when speed > 0)
\n#### 3.4.2 Location Information Display
- Student pickup/drop-off point markers
- Distance between current bus location and pickup point
- Estimated Time of Arrival (ETA)
- Automatic map refresh mechanism (via Socket.io real-time subscription)
- Route information display (read-only)
\n#### 3.4.3 Real-time Data Subscription
- Subscribe to vehicle location updates using Socket.io
- Filter relevant vehicle data by busId\n- No manual page refresh needed, data automatically pushed\n- Use hashmap data structure for efficient multi-vehicle state management: `{ busId: { lat, lng, speed, heading } }`

#### 3.4.4 Geofencing and Push Notifications (Phase 5: Advanced)
- **Distance Calculation**: Use Haversine formula to calculate distance between bus and student pickup point
- **Arrival Alert**: Trigger push notification when distance< 500meters:'Bus is arriving soon!'
- **Push Notification Implementation** (Mobile):
  - Use expo-notifications library
  - Automatically request push permissions\n  - Obtain FCM Token and upload to backend
  - Configure notification handlers: shouldShowAlert, shouldPlaySound, shouldSetBadge
  - Listen for notification receipt events and log to console
- **Trigger Logic**: Real-time monitoring of location changes with automatic detection\n
#### 3.4.5 Profile Management Access
- **Profile Settings Button**: Available in navigation header
- **Profile Page Access**: Click redirects to comprehensive profile page
- **Profile Editing**: Update personal information, change password, upload profile image
\n### 3.5 Development and Testing Tools - Existing Module (Preserved)

#### 3.5.1 GPS Simulator (simulateBus.js)
- **Purpose**: Simulate bus traveling along preset routes for development testing
- **Execution**: `node scripts/simulateBus.js <busId>`
- **Features**:
  - Connect to backend via Socket.io client
  - Simulate driver authentication process
  - Send GPS coordinates in loop following preset route array
  - Send location updates every 3 seconds
  - Include simulated speed (45km/h) and heading (90 degrees) data
  - Simulate trip start/stop events for testing hourly analytics
- **Route Configuration**: Support custom MOCK_ROUTE array or polyline decoder
\n## 4. Technical Architecture

### 4.1 Database Design - Enhanced Schema with New Tables
- **Independent User Table Structure**:
  - `admins` table: Administrator account information (id, username, password_hash, email, phone, profile_image_url, created_at, last_login, updated_at)
  - `drivers` table: Driver accounts and detailed information (id, username, password_hash, name, email, phone, license_number, vehicle_id foreign key, emergency_contact_name, emergency_contact_phone, date_of_birth, home_address, years_experience, profile_image_url, fcmToken, created_at, created_by_admin_id, status, updated_at)
  - `students` table: Student profiles (id, username, password_hash, student_id_number, name, grade, date_of_birth, gender, email, phone, home_address, pickup_stop_id foreign key, dropoff_stop_id foreign key, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, emergency_contact_name, emergency_contact_phone, medical_info, bus_id foreign key, route_id foreign key, profile_image_url, created_at, created_by_admin_id, status, updated_at)
  - `parents` table: Parent accounts (id, username, password_hash, name, email, phone, address, relationship, secondary_contact_phone, workplace_info, preferred_contact_method, student_id foreign key with NOT NULL constraint, profile_image_url, fcmToken, created_at, created_by_admin_id, status, updated_at)
  - `vehicles` table: Vehicle information (id, vehicle_id_number, license_plate, vin, model, year, capacity, fuel_type, purchase_date, current_mileage, insurance_expiry_date, last_maintenance_date, next_maintenance_due, route_id foreign key, driver_id foreign key, vehicle_image_url, status enum('active', 'inactive', 'under_maintenance'), created_at, updated_at)
  - `routes` table: Route information (id, route_name, route_description, route_type enum('morning_pickup', 'afternoon_dropoff', 'both'), start_location, end_location, polyline_string, total_distance, estimated_duration, assigned_vehicle_id foreign key, assigned_driver_id foreign key, status enum('active', 'inactive', 'archived'), created_at, updated_at)
  - `stops` table: Stop information (id, stop_name, address, latitude, longitude, landmark_description, stop_type enum('pickup', 'dropoff', 'both'), status enum('active', 'inactive'), created_at, updated_at)\n  - `route_stops` table: Junction table for many-to-many relationship between routes and stops (id, route_id foreign key, stop_id foreign key, stop_sequence, estimated_arrival_time, created_at, updated_at)
  - `gps_logs` table: Driver real-time location records (id, driver_id, vehicle_id, latitude, longitude, heading, speed, timestamp)\n  - `trips` table: Trip records (id, vehicle_id foreign key, driver_id foreign key, route_id foreign key, trip_status enum('active', 'completed', 'cancelled'), start_time, end_time, start_location, end_location, total_distance, total_duration, created_at, updated_at)
  - `trip_students` table: Junction table for students on each trip (id, trip_id foreign key, student_id foreign key, pickup_time, dropoff_time, pickup_stop_id foreign key, dropoff_stop_id foreign key, status enum('picked_up', 'dropped_off', 'absent'), created_at)\n  - `maintenance_records` table: Vehicle maintenance history (id, vehicle_id foreign key, maintenance_date, maintenance_type, description, cost, performed_by, next_due_date, status enum('scheduled', 'in_progress', 'completed', 'overdue'), created_at, updated_at)
  - `hourly_vehicle_stats` table: Aggregated hourly statistics (id, date, hour, active_vehicle_count, created_at, updated_at)
  - `audit_logs` table: Administrative action logging (id, admin_id, action_type, target_table, target_id, action_details, ip_address, timestamp)
  - `password_reset_tokens` table: OTP token management (id, user_id, user_role enum('admin', 'driver', 'student', 'parent'), token_hash, contact_method enum('email', 'phone'), contact_value, expiry_time, attempts_count, created_at, used_at)\n  - `login_activity_logs` table: User login history (id, user_id, user_role, login_time, ip_address, device_info, browser_info, login_status enum('success', 'failed'), created_at)\n  - `active_sessions` table: Session management (id, user_id, user_role, session_token, device_info, ip_address, last_activity, created_at, expires_at)
\n- **Database Constraints**:
  - Foreign key constraint: `parents.student_id` references `students.id` with ON DELETE RESTRICT\n  - Foreign key constraint: `drivers.vehicle_id` references `vehicles.id` with ON DELETE SET NULL
  - Foreign key constraint: `students.bus_id` references `vehicles.id` with ON DELETE SET NULL
  - Foreign key constraint: `students.route_id` references `routes.id` with ON DELETE SET NULL
  - Foreign key constraint: `students.pickup_stop_id` references `stops.id` with ON DELETE SET NULL
  - Foreign key constraint: `students.dropoff_stop_id` references `stops.id` with ON DELETE SET NULL\n  - Foreign key constraint: `vehicles.route_id` references `routes.id` with ON DELETE SET NULL
  - Foreign key constraint: `vehicles.driver_id` references `drivers.id` with ON DELETE SET NULL
  - Foreign key constraint: `routes.assigned_vehicle_id` references `vehicles.id` with ON DELETE SET NULL
  - Foreign key constraint: `routes.assigned_driver_id` references `drivers.id` with ON DELETE SET NULL
  - Foreign key constraint: `route_stops.route_id` references `routes.id` with ON DELETE CASCADE
  - Foreign key constraint: `route_stops.stop_id` references `stops.id` with ON DELETE CASCADE
  - Foreign key constraint: `trips.vehicle_id` references `vehicles.id` with ON DELETE CASCADE
  - Foreign key constraint: `trips.driver_id` references `drivers.id` with ON DELETE CASCADE
  - Foreign key constraint: `trips.route_id` references `routes.id` with ON DELETE SET NULL
  - Foreign key constraint: `trip_students.trip_id` references `trips.id` with ON DELETE CASCADE
  - Foreign key constraint: `trip_students.student_id` references `students.id` with ON DELETE CASCADE
  - Foreign key constraint: `trip_students.pickup_stop_id` references `stops.id` with ON DELETE SET NULL
  - Foreign key constraint: `trip_students.dropoff_stop_id` references `stops.id` with ON DELETE SET NULL
  - Foreign key constraint: `maintenance_records.vehicle_id` references `vehicles.id` with ON DELETE CASCADE
  - Foreign key constraint: `password_reset_tokens.user_id` references respective user table based on user_role
  - Unique constraint on usernames across all user tables (enforced via unique index)
  - Unique constraint on `vehicles.license_plate`
  - Unique constraint on `vehicles.vin`
  - Unique constraint on `students.student_id_number`
  - Unique constraint on `route_stops(route_id, stop_sequence)` to prevent duplicate sequences
  - Check constraint ensuring parent accounts have at least one linked student
  - Check constraint on password complexity requirements (minimum 8 characters, mixed case, numbers, special characters)
  - Check constraint on trip_status enum values\n  - Check constraint on password_reset_tokens.expiry_time (must be future timestamp)
  - Check constraint on vehicle status enum values
  - Check constraint on route status enum values
  - Check constraint on stop status enum values
  - Index on frequently queried fields (username, student_id_number, vehicle_id, timestamp, license_plate, vin)
  - Composite index on (date, hour) in hourly_vehicle_stats table for efficient querying
  - Index on password_reset_tokens (user_id, user_role, expiry_time) for fast OTP validation
  - Index on login_activity_logs (user_id, login_time) for activity history queries
  - Index on active_sessions (session_token, expires_at) for session validation
  - Index on trips (trip_status, start_time) for efficient trip history queries
  - Index on route_stops (route_id, stop_sequence) for ordered stop retrieval
  - Index on maintenance_records (vehicle_id, maintenance_date) for maintenance history queries
\n### 4.2 Backend Technology Stack - Enhanced\n- Supabase (replacing traditional Node.js + MongoDB approach)
- Supabase Auth (JWT authentication with role-based claims)
- Socket.io (WebSocket real-time communication, replacing Supabase Realtime)
- RESTful API auto-generation\n- Row Level Security (RLS) permission control
- GeofenceService (geofencing distance calculation service)
- Push Notification Service (push notification service, integrated with FCM)
- **Credential Validation Service**: Username uniqueness checker and password complexity validator
- **Audit Logging Service**: Track all administrative actions for compliance and security with IP tracking
- **Transaction Management Service**: Ensure atomic operations for student-parent creation
- **Analytics Service**: Calculate and aggregate hourly active vehicle statistics with caching
- **Real-time Stats Broadcaster**: Socket.io service broadcasting hourly statistics updates to admin clients
- **OTP Service**: Generate, validate, and manage OTP tokens for password reset
- **Email Service**: Send OTP codes and notifications via email (SendGrid, AWS SES, or similar)
- **SMS Service**: Send OTP codes via SMS (Twilio, AWS SNS, or similar)
- **Image Upload Service**: Handle profile image uploads to cloud storage (AWS S3, Cloudinary, or Supabase Storage)
- **Session Management Service**: Track and manage user sessions across devices
- **Rate Limiting Service**: Prevent abuse of OTP requests and login attempts
- **Trip History Service**: Aggregate and analyze trip data for reporting and analytics
- **Maintenance Tracking Service**: Monitor vehicle maintenance schedules and send alerts
- **Route Optimization Service** (Optional): Calculate optimal routes and stop sequences

### 4.3 Frontend Technology Stack - Enhanced
\n#### Admin Dashboard:\n- React (Vite build)\n- Tailwind CSS
- shadcn/ui component library (Data Tables, Dialog, Sheet, Toast, Form components, Card components, Tabs, Calendar)
- Socket.io Client (real-time communication)
- react-map-gl or React-Leaflet (map components)
- mapbox-gl-draw (route drawing plugin)
- Recharts or Chart.js (for hourly activity charts and trip analytics)
- **react-image-crop**: Image cropping for profile photos and vehicle images
- **date-fns or moment.js**: Date manipulation and formatting
- **react-csv or xlsx**: Export functionality for CSV/Excel reports
- **Enhanced Admin Module UI Components**:
  - **Vehicles Module**:
    - Vehicle list table with search, filter, sort, pagination
    - Add/edit vehicle form with validation
    - Vehicle detail view with tabs (Overview, Maintenance, Trips, Documents)
    - Maintenance schedule calendar component
    - Insurance tracking widget
  - **Routes Module**:
    - Route list table with search, filter, sort, pagination
    - Route creation/editing interface with interactive map
    - Route visualization component (map view and list view)
    - Stop assignment interface with drag-and-drop sequencing
    - Route analytics dashboard\n  - **Stops Module**:
    - Stop list table with search, filter, sort, pagination
    - Add/edit stop form with map pin drop\n    - Stop detail view with associated routes and students
    - Stop visualization on map with clustering\n  - **Students Module** (Enhanced):
    - Student list table with search, filter, sort, pagination
    - Multi-step student/parent creation wizard
    - Student detail view with tabs (Overview, Route & Stops, Parent Info, Trip History, Documents)
    - Route and stop assignment interface with map
    - Bulk import/export functionality
  - **Trip History Module** (New):
    - Trip history list table with advanced filtering
    - Trip detail view with tabs (Overview, Route Map, Students, Timeline, Analytics)
    - Trip playback component with animation controls
    - Trip comparison interface
    - Trip analytics dashboard with charts
    - Report generation interface
- **Enhanced Student/Parent Management UI**:
  - Multi-step form wizard for student addition with parent details
  - Manual credential entry fields with real-time validation
  - Password strength indicator component
  - Credential display modal with copy-to-clipboard functionality
  - Parent-student relationship visualization (tree view or graph)
  - Bulk import capability\n  - Credential management interface with reveal/mask toggle
  - Audit log viewer component
  - Dedicated search bars for driver, student, and parent list pages with real-time filtering
  - Hourly active vehicles analytics dashboard with real-time charts and statistics
- **Forgot Password UI**:
  - Forgot password entry form with role selection
  - OTP verification page with countdown timer
  - Password reset form with strength indicator
  - Success/error toast notifications
- **Profile Management UI**:
  - Comprehensive profile page component\n  - Image upload with cropping tool
  - Editable form fields with validation
  - Change password modal
  - Login activity log display
  - Active sessions management interface
\n#### Driver Portal (Web Version):
- React (Vite build)
- Tailwind CSS
- Socket.io Client\n- Geolocation API (browser native)
- Responsive design supporting mobile browser access
- **react-image-crop**: Image cropping for profile photos
- **Profile Management UI**: Driver profile page with editable fields
\n#### Student/Parent Portal (Mobile):
- React Native + Expo
- expo-notifications (push notifications)
- React-Leaflet or react-native-maps\n- Socket.io Client
- Geolocation API\n- **expo-image-picker**: Profile image selection and upload
- **Profile Management UI**: Student/Parent profile page with editable fields

#### Map Component Dependencies:
```bash\nnpm install leaflet react-leaflet\nnpm install -D @types/leaflet\nnpm install mapbox-gl @mapbox/mapbox-gl-draw
npm install socket.io-client
npm install recharts
npm install react-image-crop
npm install date-fns
npm install react-csv
npm install expo-notifications (mobile)\nnpm install expo-image-picker (mobile)
```

#### Global CSS Configuration (src/index.css):
```css\n@import'leaflet/dist/leaflet.css';
@import 'react-image-crop/dist/ReactCrop.css';
\n.leaflet-container {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  z-index: 0;
}\n```

### 4.4 Core API Endpoints - Enhanced with New Endpoints
- `POST /api/auth/login`: Unified login interface (requires role parameter)
- `POST /api/gps/update`: Driver GPS location reporting (via Socket.io)
- `GET /api/gps/latest/:driverId`: Get latest location for specified driver
\n**Admin - Vehicles:**
- `GET /api/admin/vehicles`: Admin retrieve vehicle list with optional search/filter parameters
- `GET /api/admin/vehicles/:id`: Get vehicle details by ID
- `POST /api/admin/vehicles`: Admin add vehicle with validation
- `PUT /api/admin/vehicles/:id`: Admin update vehicle information
- `DELETE /api/admin/vehicles/:id`: Admin delete vehicle (soft delete)
- `POST /api/admin/vehicles/:id/assign-route`: Assign route to vehicle
- `POST /api/admin/vehicles/:id/assign-driver`: Assign driver to vehicle
- `GET /api/admin/vehicles/:id/maintenance`: Get maintenance history for vehicle
- `POST /api/admin/vehicles/:id/maintenance`: Add maintenance record
- `PUT /api/admin/vehicles/:id/maintenance/:maintenanceId`: Update maintenance record
- `DELETE /api/admin/vehicles/:id/maintenance/:maintenanceId`: Delete maintenance record
- `GET /api/admin/vehicles/:id/trips`: Get trip history for vehicle
\n**Admin - Routes:**
- `GET /api/admin/routes`: Admin retrieve route list with optional search/filter parameters
- `GET /api/admin/routes/:id`: Get route details by ID
- `POST /api/admin/routes`: Create route (receive polyline string and stop associations)
- `PUT /api/admin/routes/:id`: Update route information
- `DELETE /api/admin/routes/:id`: Delete route (with validation)
- `POST /api/admin/routes/:id/archive`: Archive route
- `POST /api/admin/routes/:id/restore`: Restore archived route
- `POST /api/admin/routes/:id/assign-vehicle`: Assign vehicle to route
- `POST /api/admin/routes/:id/assign-driver`: Assign driver to route
- `GET /api/admin/routes/:id/stops`: Get stops for route in sequence
- `POST /api/admin/routes/:id/stops`: Add stop to route with sequence
- `PUT /api/admin/routes/:id/stops/:stopId`: Update stop sequence or estimated time
- `DELETE /api/admin/routes/:id/stops/:stopId`: Remove stop from route
- `GET /api/admin/routes/:id/analytics`: Get route analytics (trip stats, performance metrics)
- `POST /api/admin/routes/:id/duplicate`: Duplicate route

**Admin - Stops:**
- `GET /api/admin/stops`: Admin retrieve stop list with optional search/filter parameters
- `GET /api/admin/stops/:id`: Get stop details by ID\n- `POST /api/admin/stops`: Create stop with geolocation
- `PUT /api/admin/stops/:id`: Update stop information
- `DELETE /api/admin/stops/:id`: Delete stop (with validation)
- `GET /api/admin/stops/:id/routes`: Get routes associated with stop
- `GET /api/admin/stops/:id/students`: Get students assigned to stop
- `POST /api/admin/stops/:id/students`: Assign students to stop
- `DELETE /api/admin/stops/:id/students/:studentId`: Remove student from stop
\n**Admin - Drivers:**
- `POST /api/admin/drivers`: Admin add driver with manual credential entry (validates username uniqueness and password complexity)
- `GET /api/admin/drivers`: Admin retrieve driver list with optional search query parameter
- `GET /api/admin/drivers/:id`: Get driver details by ID
- `PUT /api/admin/drivers/:id`: Admin update driver information
- `DELETE /api/admin/drivers/:id`: Admin deactivate driver
\n**Admin - Students:**
- `POST /api/admin/students`: Admin add student with manual credential entry and linked parent (atomic transaction, validates both usernames and passwords)
- `GET /api/admin/students`: Admin retrieve student list with parent associations and optional search query parameter
- `GET /api/admin/students/:id`: Get student details by ID\n- `PUT /api/admin/students/:id`: Admin update student information
- `DELETE /api/admin/students/:id`: Admin deactivate student (with parent handling logic)
- `POST /api/admin/students/:id/assign-route`: Assign student to route
- `POST /api/admin/students/:id/assign-stops`: Assign pickup/dropoff stops to student
- `GET /api/admin/students/:id/trips`: Get trip history for student
- `POST /api/admin/students/bulk-import`: Bulk import students from CSV/Excel
- `POST /api/admin/students/bulk-export`: Bulk export students to CSV/Excel\n
**Admin - Parents:**
- `GET /api/admin/parents`: Admin retrieve parent list with student associations and optional search query parameter
- `GET /api/admin/parents/:id`: Get parent details by ID
- `PUT /api/admin/parents/:id`: Admin update parent information
- `DELETE /api/admin/parents/:id`: Admin deactivate parent (with validation)
- `POST /api/admin/parents`: Admin manually add parent (special cases)\n\n**Admin - Trip History:**
- `GET /api/admin/trips`: Get trip history list with filtering (date range, route, vehicle, driver, status)
- `GET /api/admin/trips/:id`: Get trip details by ID
- `GET /api/admin/trips/:id/students`: Get students on trip with pickup/dropoff times
- `GET /api/admin/trips/:id/timeline`: Get trip timeline with events
- `GET /api/admin/trips/:id/analytics`: Get trip analytics (on-time performance, speed, idle time)
- `GET /api/admin/trips/:id/gps-trajectory`: Get GPS trajectory for trip playback
- `POST /api/admin/trips/compare`: Compare multiple trips\n- `POST /api/admin/trips/generate-report`: Generate trip report (PDF/Excel/CSV)
- `GET /api/admin/trips/analytics/summary`: Get trip analytics summary (total trips, distance, hours, on-time %)

**Admin - Other:**
- `POST /api/users/update-fcm`: Update user FCM Token
- `GET /api/admin/audit-logs`: Retrieve administrative action logs with filtering
- `POST /api/admin/credentials/reveal`: Reveal masked credentials (with audit logging)
- `POST /api/admin/credentials/reset-password`: Reset user password (admin enters new password)
- `POST /api/admin/validate-username`: Check username uniqueness across all user tables
- `POST /api/admin/validate-password`: Validate password complexity requirements
- `GET /api/admin/analytics/hourly-active`: Get hourly active vehicle statistics for current day
- `GET /api/admin/analytics/current-active`: Get current number of active vehicles in real-time
- `GET /api/admin/analytics/hourly-comparison`: Compare current day with previous day hourly activity
- `GET /api/admin/analytics/active-vehicles-list`: Get list of currently active vehicles with details
\n**Trips:**
- `POST /api/trips/start`: Driver starts a trip (updates trip status to 'active')
- `POST /api/trips/stop`: Driver stops a trip (updates trip status to 'completed')
\n**Password Recovery:**
- `POST /api/auth/forgot-password`: Initiate password reset (validates username, role, contact method)
- `POST /api/auth/verify-otp`: Verify OTP code (validates token, expiry, attempts)
- `POST /api/auth/reset-password`: Reset password with verified token (validates new password, updates database)
- `POST /api/auth/resend-otp`: Resend OTP code (rate limited)\n
**Profile Management:**
- `GET /api/profile/:role/:userId`: Get user profile information by role and user ID
- `PUT /api/profile/:role/:userId`: Update user profile information (validates permissions)
- `POST /api/profile/upload-image`: Upload profile image to cloud storage (returns image URL)
- `DELETE /api/profile/delete-image/:role/:userId`: Delete user profile image
- `POST /api/profile/change-password`: Change password (requires current password verification)
- `GET /api/profile/login-activity/:role/:userId`: Get user login activity history
- `GET /api/profile/active-sessions/:role/:userId`: Get user active sessions
- `POST /api/profile/signout-all-devices`: Sign out from all devices except current session
- `PUT /api/profile/notification-preferences/:role/:userId`: Update notification preferences (students/parents only)

### 4.5 Socket.io Event Definitions - Preserved
\n#### Driver Events:
- `driver:auth`: Driver authentication (send token and busId)
- `driver:ping`: Send location update (busId, lat, lng, speed, heading, timestamp, tripStatus)
- `driver:trip_start`: Notify trip start event\n- `driver:trip_stop`: Notify trip stop event
\n#### Admin Events:
- `admin:all_buses_update`: Receive all vehicle location updates
- `admin:hourly_stats_update`: Receive real-time hourly active vehicle statistics updates
- `admin:active_count_update`: Receive current active vehicle count updates
\n#### Parent/Student Events:
- `parent:subscribe`: Subscribe to specific vehicle location\n- `bus:location_update`: Receive subscribed vehicle location updates
\n### 4.6 LiveMap Component Implementation (src/components/map/LiveMap.jsx) - Preserved

#### Component Configuration:
- Map tiles: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
- Custom markers: Create neon green pulse icons using `L.divIcon`
- Tailwind animation classes: `animate-ping`, `shadow-green-400`
- Default center point: [17.3850, 78.4867] (Hyderabad example)
- Default zoom level: 13
\n#### Component Interface:
```typescript
interface VehicleLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: 'moving' | 'stopped' | 'offline';
}\n
interface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  vehicles?: VehicleLocation[];
}\n```

#### State Management:
- Store vehicle states using hashmap structure: `{ busId: { lat, lng, speed, heading, tripStatus } }`
- Dynamically update via Socket.io listening to `admin:all_buses_update` event
- Vehicle markers show/hide pulse animation based on speed value
\n#### Usage Example:
```typescript
import LiveMap from '@/components/map/LiveMap';

const DashboardPage = () => {
  const [buses, setBuses] = useState({});
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on('admin:all_buses_update', (data) => {
      setBuses(prev => ({
        ...prev,
        [data.busId]: data\n      }));
    });
    return () => socket.off('admin:all_buses_update');\n  }, [socket]);

  return (
    <div className='h-screen'>
      <LiveMap 
        center={[17.3850, 78.4867]} \n        zoom={13} 
        vehicles={Object.values(buses)} 
      />
    </div>
  );
};
```

### 4.7 Push Notification Implementation (mobile/hooks/useNotifications.ts) - Preserved

#### Feature Configuration:
- Use expo-notifications library\n- Configure notification handler: show notifications when app is open, play sound, do not set badge
- Automatically request push permissions
- Obtain Expo Push Token (FCM Token)
- Listen for notification receipt events

#### Integration Steps:
1. Call `useNotifications()` hook after user login
2. Upload obtained FCM Token to backend: `axios.post('/api/users/update-fcm', { fcmToken: token })`
3. Backend sends push via FCM to corresponding users when geofence is triggered

### 4.8 Hourly Analytics Component Implementation (src/components/analytics/HourlyActiveVehicles.jsx) - Preserved

#### Component Structure:
- **Active Vehicle Counter Card**:
  - Large numeric display showing current active vehicle count
  - Trend indicator (up/down arrow with percentage change)
  - Real-time updates via Socket.io
  - Styling: Neon green accent on dark background

- **Hourly Activity Chart**:
  - Line chart component using Recharts library
  - X-axis: 24hours (00:00 to 23:00)
  - Y-axis: Active vehicle count
  - Responsive design with dark theme
  - Tooltip showing exact values on hover
  - Grid lines with subtle styling

- **Active Vehicles List Panel**:
  - Collapsible side panel component
  - Real-time list of active vehicles\n  - Vehicle card showing: ID, driver name, route, trip duration
  - Click handler to highlight vehicle on map
  - Sort and filter options
\n#### Component Interface:
```typescript
interface HourlyStats {
  hour: number;
  activeCount: number;
}\n
interface ActiveVehicle {
  vehicleId: string;
  driverName: string;
  routeName: string;
  tripStartTime: string;
  status: 'moving' | 'stopped';
}
\ninterface HourlyActiveVehiclesProps {
  onVehicleClick?: (vehicleId: string) => void;
}\n```

#### State Management:
```typescript
const [currentActive, setCurrentActive] = useState(0);
const [hourlyData, setHourlyData] = useState<HourlyStats[]>([]);
const [activeVehicles, setActiveVehicles] = useState<ActiveVehicle[]>([]);
const [previousHourCount, setPreviousHourCount] = useState(0);
\nuseEffect(() => {
  if (!socket) return;
  \n  socket.on('admin:active_count_update', (data) => {
    setCurrentActive(data.count);
  });
  
  socket.on('admin:hourly_stats_update', (data) => {
    setHourlyData(data.hourlyStats);
  });\n  
  return () => {
    socket.off('admin:active_count_update');\n    socket.off('admin:hourly_stats_update');\n  };
}, [socket]);
```

#### Usage Example:
```typescript
import HourlyActiveVehicles from '@/components/analytics/HourlyActiveVehicles';

const AdminDashboard = () => {\n  const handleVehicleClick = (vehicleId: string) => {
    // Highlight vehicle on map
    mapRef.current?.flyTo(vehicleLocations[vehicleId]);
  };

  return (
    <div className='grid grid-cols-12 gap-4'>
      <div className='col-span-8'>
        <LiveMap vehicles={buses} />
      </div>
      <div className='col-span-4'>
        <HourlyActiveVehicles onVehicleClick={handleVehicleClick} />
      </div>
    </div>
  );\n};
```
\n### 4.9 Forgot Password Component Implementation (src/components/auth/ForgotPassword.jsx) - Preserved

#### Component Structure:
- **Step 1: Request OTP Form**:
  - Role selection dropdown (Administrator/Driver/Student/Parent)
  - Username input field
  - Contact method radio buttons (Email/Phone)
  - Email/Phone input field (conditional rendering)
  - Submit button with loading state
  - Back to login link

- **Step 2: OTP Verification Form**:
  - 6-digit OTP input field (auto-focus, numeric only)
  - Countdown timer display (10:00 minutes)
  - Verify button with loading state
  - Resend OTP link (disabled for60 seconds)
  - Error message display for invalid OTP
  - Attempts remaining indicator

- **Step 3: Reset Password Form**:
  - New password input with show/hide toggle
  - Confirm password input
  - Password strength indicator (weak/medium/strong)
  - Password requirements checklist
  - Reset button with loading state
  - Success message with auto-redirect

#### Component Interface:\n```typescript
interface ForgotPasswordProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}\n\ninterface OTPVerificationState {
  token: string;
  expiryTime: number;
  attemptsRemaining: number;
}
```

#### State Management:\n```typescript
const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
const [formData, setFormData] = useState({
  role: '',
  username: '',
  contactMethod: 'email',
  contactValue: ''
});
const [otpState, setOtpState] = useState<OTPVerificationState | null>(null);
const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
const [canResend, setCanResend] = useState(false);
```

### 4.10 Profile Page Component Implementation (src/components/profile/ProfilePage.jsx) - Preserved

#### Component Structure:\n- **Profile Header Section**:
  - Circular avatar with image upload overlay
  - Image cropping modal (react-image-crop)\n  - User name and role badge
  - Account status indicator\n\n- **Personal Information Card**:
  - Editable form fields (role-specific)
  - Inline validation feedback
  - Save/Cancel buttons
  - Loading states during updates

- **Account Security Card**:
  - Change password button (opens modal)
  - Login activity log table
  - Active sessions list with sign-out options
\n- **Notification Preferences Card** (Students/Parents only):
  - Toggle switches for email/SMS/push notifications
  - Notification frequency dropdown
  - Save preferences button
\n#### Component Interface:
```typescript
interface ProfilePageProps {
  userRole: 'admin' | 'driver' | 'student' | 'parent';
  userId: string;
}\n\ninterface ProfileData {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  // Role-specific fields
  [key: string]: any;
}\n\ninterface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;\n}
```

#### State Management:
```typescript\nconst [profileData, setProfileData] = useState<ProfileData | null>(null);
const [isEditing, setIsEditing] = useState(false);
const [imageFile, setImageFile] = useState<File | null>(null);\nconst [showPasswordModal, setShowPasswordModal] = useState(false);
const [loginActivity, setLoginActivity] = useState([]);
const [activeSessions, setActiveSessions] = useState([]);
```

### 4.11 Enhanced Admin Module Component Implementations (NEW)

#### 4.11.1 Vehicle Management Components\n
**VehicleList Component (src/components/admin/vehicles/VehicleList.jsx)**:
```typescript
interface Vehicle {
  id: string;\n  vehicleIdNumber: string;
  licensePlate: string;
  vin: string;
  model: string;
  year: number;
  capacity: number;
  assignedRoute: string;
  assignedDriver: string;
  insuranceExpiry: Date;
  maintenanceStatus: 'scheduled' | 'due_soon' | 'overdue' | 'completed';
  status: 'active' | 'inactive' | 'under_maintenance';
}\n
interface VehicleListProps {
  onEdit: (vehicleId: string) => void;\n  onDelete: (vehicleId: string) => void;
  onViewDetails: (vehicleId: string) => void;
}\n```

**VehicleForm Component (src/components/admin/vehicles/VehicleForm.jsx)**:
- Form fields for all vehicle properties
- Real-time validation
- Image upload for vehicle photo
- Route and driver assignment dropdowns
- Submit and cancel buttons
\n**VehicleDetailView Component (src/components/admin/vehicles/VehicleDetailView.jsx)**:
- Tabs: Overview, Maintenance History, Trip History, Documents
- Display comprehensive vehicle information
- Edit and delete actions
\n**MaintenanceSchedule Component (src/components/admin/vehicles/MaintenanceSchedule.jsx)**:
- Calendar view of maintenance schedule
- Add/edit maintenance records
- Maintenance alerts and notifications
\n#### 4.11.2 Route Management Components

**RouteList Component (src/components/admin/routes/RouteList.jsx)**:
```typescript
interface Route {
  id: string;
  routeName: string;
  routeDescription: string;
  numberOfStops: number;
  totalDistance: number;
  estimatedDuration: number;
  assignedVehicle: string;
  assignedDriver: string;
  status: 'active' | 'inactive' | 'archived';
}\n
interface RouteListProps {
  onEdit: (routeId: string) => void;
  onDelete: (routeId: string) => void;
  onViewDetails: (routeId: string) => void;
  onViewOnMap: (routeId: string) => void;
}
```

**RouteBuilder Component (src/components/admin/routes/RouteBuilder.jsx)**:
- Interactive map with mapbox-gl-draw\n- Click to add waypoints and create route
- Stop assignment interface
- Drag-and-drop stop sequencing
- Distance and duration calculation
- Save and cancel buttons

**RouteDetailView Component (src/components/admin/routes/RouteDetailView.jsx)**:
- Tabs: Overview, Map View, Stops, Trip History, Analytics
- Display comprehensive route information
- Edit and delete actions
\n**RouteAnalytics Component (src/components/admin/routes/RouteAnalytics.jsx)**:
- Trip statistics charts
- On-time performance metrics
- Distance and duration comparisons
\n#### 4.11.3 Stop Management Components

**StopList Component (src/components/admin/stops/StopList.jsx)**:
```typescript
interface Stop {
  id: string;
  stopName: string;
  address: string;
  latitude: number;
  longitude: number;
  associatedRoutes: string[];
  numberOfStudents: number;
  status: 'active' | 'inactive';
}\n
interface StopListProps {
  onEdit: (stopId: string) => void;
  onDelete: (stopId: string) => void;
  onViewDetails: (stopId: string) => void;
  onViewOnMap: (stopId: string) => void;
}\n```

**StopForm Component (src/components/admin/stops/StopForm.jsx)**:
- Form fields for stop properties
- Interactive map with pin drop
- Address autocomplete
- Geolocation input
- Route association multi-select
- Submit and cancel buttons

**StopDetailView Component (src/components/admin/stops/StopDetailView.jsx)**:
- Tabs: Overview, Map View, Associated Routes, Students, Analytics
- Display comprehensive stop information
- Edit and delete actions

#### 4.11.4 Trip History Components

**TripHistoryList Component (src/components/admin/trips/TripHistoryList.jsx)**:
```typescript
interface Trip {
  id: string;\n  date: Date;
  routeName: string;
  vehicleId: string;
  driverName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  distance: number;
  numberOfStudents: number;
  status: 'completed' | 'cancelled' | 'in_progress';
}
\ninterface TripHistoryListProps {
  onViewDetails: (tripId: string) => void;
  onViewOnMap: (tripId: string) => void;
  onExportReport: (tripId: string) => void;
}
```

**TripDetailView Component (src/components/admin/trips/TripDetailView.jsx)**:
- Tabs: Overview, Route Map, Students, Timeline, Analytics
- Display comprehensive trip information
- Playback button for GPS trajectory
\n**TripPlayback Component (src/components/admin/trips/TripPlayback.jsx)**:
- Animated replay of vehicle movement
- Playback controls (play/pause, speed adjustment)
- Timeline scrubber\n- Display current time and location

**TripAnalyticsDashboard Component (src/components/admin/trips/TripAnalyticsDashboard.jsx)**:
- Summary statistics cards
- Charts (trips per day, by route, by vehicle, on-time performance)
- Performance metrics\n- Report generation interface

## 5. Real-time Tracking Implementation - Preserved

### 5.1 Driver Side (Data Publisher)
- Use `navigator.geolocation.watchPosition` to obtain location\n- Send location data via Socket.io every 3-5 seconds
- Included fields: busId, latitude, longitude, speed, heading, timestamp, tripStatus
- Support both web and mobile platforms
- Update trip status when starting/stopping trips

### 5.2 Server Side (Socket.io + Supabase)
- Receive driver location data and store in `gps_logs` table
- Real-time broadcast to subscribed clients via Socket.io
- Execute geofencing calculations (GeofenceService)
- Trigger push notifications (when distance< 500meters)
- Location data retention policy: Keep last 24 hours of trajectory for historical playback
- **Analytics Processing**:
  - Monitor trip start/stop events
  - Update `trips` table with current trip status
  - Calculate active vehicle count in real-time
  - Aggregate hourly statistics and store in `hourly_vehicle_stats` table
  - Broadcast statistics updates via Socket.io to admin clients
  - Cache current active count for performance optimization

### 5.3 Student/Parent Side (Data Subscriber)
- Establish Socket.io connection and subscribe to specific vehicle\n- Listen for `bus:location_update` events
- Receive latest location and update map markers
- Use CSS transitions for smooth movement animations
- Receive push notification alerts\n\n### 5.4 Admin Side (Global Monitoring)
- Establish Socket.io connection\n- Listen for `admin:all_buses_update` events
- Real-time update of all vehicle locations
- Use hashmap for efficient multi-vehicle state management
- **Analytics Monitoring**:
  - Listen for `admin:hourly_stats_update` events
  - Listen for `admin:active_count_update` events
  - Update analytics dashboard in real-time
  - Display hourly activity charts with live data
  - Show current active vehicle count with trend indicators

### 5.5 Performance Optimization
- GPS data throttled storage (3-10 second intervals to avoid database overload)
- Socket.io room mechanism (broadcast by vehicle ID grouping)
- Geospatial indexing for optimized query performance
- Frontend marker interpolation animation (reduce visual jumping)
- Use hashmap instead of array traversal for improved update efficiency
- **Analytics Optimization**:
  - Cache hourly aggregates in memory (Redis or in-memory cache)
  - Batch update hourly statistics every 5 minutes
  - Use database triggers for automatic trip status updates
  - Implement efficient SQL queries with proper indexing
  - Lazy load historical data on demand

## 6. Development Phase Planning - Updated with New Phases

### Phase 1: Operational Data Management (Priority: High, Complexity: Low-Medium) - ENHANCED
- Implement admin CRUD interfaces for all user types
- Use shadcn/ui Data Tables and Dialog components
- Configure Supabase RLS permission policies
- Implement enhanced student/parent management with manual credential entry
- Develop credential entry forms with real-time validation (username uniqueness, password strength)
- Implement credential display UI with copy-to-clipboard\n- Implement audit logging for all administrative actions
- Develop driver account management with manual credential entry
- Implement atomic transaction handling for student-parent creation
- Build password strength indicator component
- Implement dedicated search bars for driver, student, and parent list pages with real-time filtering functionality
- **NEW: Audit and fix existing Vehicles, Routes, Stops, Students modules**
- **NEW: Implement enhanced features for Vehicles module (maintenance tracking, insurance tracking, vehicle detail view)**
- **NEW: Implement enhanced features for Routes module (visual route mapping, stop sequencing, route analytics)**
- **NEW: Implement enhanced features for Stops module (map pin drop, route association, student assignment)**
- **NEW: Implement enhanced features for Students module (route/stop assignment, bulk operations)**
\n### Phase 2: Map Integration (Priority: High, Complexity: Medium)\n- Integrate React-Leaflet and CartoDB Dark Matter\n- Create LiveMap component\n- Implement neon green pulse markers\n- Integrate mapbox-gl-draw route drawing tool
- Implement admin-exclusive route management interface
- **NEW: Implement interactive map for stop pin drop**
- **NEW: Implement route visualization with stops on map**
\n### Phase 3: Driver Location Logic (Priority: Medium, Complexity: High)
- Implement Geolocation API calls
- Configure data throttling mechanism
- Complete GPS data reporting logic (Socket.io)
- Develop driver web control panel interface
- Implement trip start/stop functionality
\n### Phase 4: Realtime Subscriptions (Priority: Medium, Complexity: High)
- Configure Socket.io server and client
- Implement event subscription logic
- Add smooth animation transitions
- Develop GPS simulator testing tool
\n### Phase 5: Geofencing & Push Notifications (Priority: Optional, Complexity: Medium)
- Implement Haversine distance calculation (GeofenceService)
- Integrate expo-notifications\n- Configure FCM push service
- Implement arrival alert functionality
- Configure Toast notification component

### Phase 6: Route Management (Priority: Medium, Complexity: Medium) - ENHANCED
- Develop route drawing interface (RouteBuilder.jsx)
- Implement stop marking functionality\n- Complete route-vehicle association logic
- Implement route deletion with validation
- **NEW: Implement route duplication feature**
- **NEW: Implement route analytics dashboard**
- **NEW: Implement route archiving and restoration**

### Phase 7: Analytics Dashboard (Priority: High, Complexity: Medium)
- Implement trips table and trip status tracking
- Develop Analytics Service for calculating hourly statistics
- Create hourly_vehicle_stats table with proper indexing
- Build HourlyActiveVehicles component with Recharts integration
- Implement real-time Socket.io events for analytics updates
- Develop active vehicle counter card with trend indicators
- Create hourly activity line chart with dark theme styling
- Build active vehicles list panel with click-to-highlight functionality
- Implement caching mechanism for performance optimization
- Add historical comparison features (day-over-day, weekly averages)
- Integrate analytics dashboard into admin layout
- Test real-time updates with GPS simulator

### Phase 8: Password Recovery System (Priority: High, Complexity: Medium)
- **Create password_reset_tokens database table**
- **Implement OTP Service for token generation and validation**
- **Integrate Email Service (SendGrid/AWS SES) for OTP delivery**
- **Integrate SMS Service (Twilio/AWS SNS) for OTP delivery**
- **Develop Forgot Password UI components**:\n  - Request OTP form with role and contact method selection
  - OTP verification page with countdown timer
  - Password reset form with strength validation
- **Implement backend API endpoints**:
  - POST /api/auth/forgot-password
  - POST /api/auth/verify-otp
  - POST /api/auth/reset-password
  - POST /api/auth/resend-otp
- **Implement rate limiting for OTP requests**
- **Add account lockout mechanism after failed attempts**
- **Implement audit logging for password reset activities**
- **Test OTP delivery via email and SMS**
- **Test complete password recovery flow for all user roles**

### Phase 9: User Profile Management (Priority: High, Complexity: Medium)
- **Create profile_image_url fields in all user tables**
- **Create login_activity_logs and active_sessions tables**
- **Implement Image Upload Service (AWS S3/Cloudinary/Supabase Storage)**
- **Integrate react-image-crop for profile photo cropping**
- **Develop Profile Page UI components**:
  - Profile header with image upload
  - Personal information cards (role-specific)
  - Account security section
  - Notification preferences (students/parents)
- **Implement backend API endpoints**:
  - GET /api/profile/:role/:userId
  - PUT /api/profile/:role/:userId
  - POST /api/profile/upload-image
  - DELETE /api/profile/delete-image/:role/:userId
  - POST /api/profile/change-password
  - GET /api/profile/login-activity/:role/:userId
  - GET /api/profile/active-sessions/:role/:userId
  - POST /api/profile/signout-all-devices
  - PUT /api/profile/notification-preferences/:role/:userId
- **Implement change password functionality with current password verification**
- **Develop login activity tracking system**
- **Implement session management across devices**
- **Add profile button to navigation headers for all user roles**
- **Test profile editing for all user roles**
- **Test image upload, cropping, and deletion**
- **Test change password functionality**
- **Test session management and sign-out features**

### Phase 10: Trip History Module (Priority: High, Complexity: Medium) - NEW
- **Create trips, trip_students, and maintenance_records database tables**
- **Implement Trip History Service for data aggregation and analysis**
- **Develop Trip History UI components**:
  - Trip history list with advanced filtering
  - Trip detail view with tabs (Overview, Route Map, Students, Timeline, Analytics)
  - Trip playback component with animation controls
  - Trip comparison interface\n  - Trip analytics dashboard with charts
  - Report generation interface
- **Implement backend API endpoints**:
  - GET /api/admin/trips (with filtering)\n  - GET /api/admin/trips/:id\n  - GET /api/admin/trips/:id/students
  - GET /api/admin/trips/:id/timeline
  - GET /api/admin/trips/:id/analytics\n  - GET /api/admin/trips/:id/gps-trajectory
  - POST /api/admin/trips/compare
  - POST /api/admin/trips/generate-report
  - GET /api/admin/trips/analytics/summary
- **Implement trip playback feature with GPS trajectory animation**
- **Develop trip analytics calculations (on-time performance, speed, idle time)**
- **Implement report generation (PDF/Excel/CSV)**
- **Test trip history data population from GPS logs**
- **Test filtering, search, and export functionality**
- **Test trip playback and comparison features**

### Phase 11: Maintenance Tracking (Priority: Medium, Complexity: Low) - NEW
- **Implement maintenance scheduling calendar**
- **Develop maintenance record CRUD operations**
- **Implement maintenance alerts and notifications**
- **Create maintenance status tracking**
- **Test maintenance scheduling and alert system**
\n### Phase 12: Final Integration & Testing (Priority: High, Complexity: Medium) - NEW
- **Comprehensive testing of all enhanced admin modules**
- **Integration testing between modules (e.g., vehicle-route-stop-student relationships)**
- **Performance testing with large datasets**
- **User acceptance testing (UAT) for admin workflows**
- **Bug fixing and optimization**
- **Documentation updates**
- **Deployment preparation**

## 7. Testing and Deployment Process - Enhanced

### 7.1 Development Testing Process
1. **Start GPS Simulator**: `node scripts/simulateBus.js bus_001`
2. **Open Driver Control Panel**: Access `http://192.168.1.x:3000/driver` in mobile browser (use local IP)
3. **Open Admin Dashboard**: Access real-time monitoring map in desktop browser
4. **Verify Data Flow**: Confirm map markers move with simulator or real GPS
5. **Test Student/Parent Creation**: Verify manual credential entry with validation and parent linking
6. **Test Driver Creation**: Verify manual credential entry with validation\n7. **Test RBAC**: Verify role-based access restrictions work correctly across all endpoints
8. **Test Credential Management**: Verify reveal/mask functionality and audit logging
9. **Test Route Management**: Verify admin-exclusive route configuration
10. **Test Username Uniqueness**: Attempt to create duplicate usernames across different user types
11. **Test Password Validation**: Attempt to create accounts with weak passwords
12. **Test Search Functionality**: Verify search bars on driver, student, and parent pages filter results correctly in real-time
13. **Test Analytics Dashboard**:
    - Start multiple simulated trips
    - Verify active vehicle count updates in real-time\n    - Verify hourly chart displays correct data
    - Stop trips and verify count decreases\n    - Test active vehicles list panel functionality
    - Verify click-to-highlight on map works
    - Test historical comparison features
    - Verify Socket.io events fire correctly
14. **Test Forgot Password Flow**:
    - Test OTP request for all user roles
    - Verify OTP delivery via email and SMS
    - Test OTP verification with valid and invalid codes
    - Test OTP expiration after 10 minutes
    - Test rate limiting (max 3 requests per hour)
    - Test account lockout after 5 failed attempts
    - Test password reset with new password
    - Verify old sessions invalidated after password change
    - Test resend OTP functionality
15. **Test Profile Management**:
    - Test profile page access for all user roles
    - Test profile image upload and cropping
    - Test profile information editing
    - Test change password functionality
    - Verify current password validation
    - Test login activity log display
    - Test active sessions management
    - Test sign-out all devices functionality
    - Test notification preferences (students/parents)
    - Verify profile updates reflect in database
    - Test image deletion functionality
16. **Test Enhanced Vehicle Management (NEW)**:
    - Test vehicle CRUD operations
    - Test vehicle search and filtering
    - Test route and driver assignment
    - Test maintenance scheduling and tracking
    - Test insurance tracking and alerts
    - Test vehicle detail view with all tabs
    - Test vehicle image upload\n    - Verify validation and error handling
17. **Test Enhanced Route Management (NEW)**:
    - Test route CRUD operations
    - Test route drawing on map with mapbox-gl-draw
    - Test stop assignment and sequencing
    - Test route visualization (map and list views)
    - Test vehicle and driver assignment
    - Test route archiving and restoration
    - Test route duplication\n    - Test route analytics dashboard\n    - Verify validation and error handling
18. **Test Enhanced Stop Management (NEW)**:
    - Test stop CRUD operations
    - Test stop creation with map pin drop
    - Test geolocation auto-population from address
    - Test route association management
    - Test student assignment to stops
    - Test stop detail view with all tabs
    - Test stop visualization on map
    - Verify validation and error handling
19. **Test Enhanced Student Management (NEW)**:
    - Test student CRUD operations with parent linking
    - Test route and stop assignment
    - Test pickup/dropoff location setting on map
    - Test student detail view with all tabs
    - Test bulk import/export functionality
    - Verify atomic transaction for student-parent creation
    - Verify validation and error handling
20. **Test Trip History Module (NEW)**:
    - Test trip history list with filtering
    - Test date range, route, vehicle, driver filters
    - Test trip detail view with all tabs
    - Test trip playback feature with animation
    - Test trip comparison functionality
    - Test trip analytics dashboard
    - Test report generation (PDF/Excel/CSV)
    - Verify trip data accuracy from GPS logs
    - Test export functionality
\n### 7.2 Key Verification Points
- Socket.io connection status
- GPS data reporting frequency
- Map marker smooth movement effect
- Push notification trigger timing
- Multi-vehicle concurrent tracking performance
- Student-parent account creation atomicity
- Driver account creation with manual credential entry
- Username uniqueness validation across all user tables
- Password complexity validation
- Real-time validation feedback in forms
- RBAC policy enforcement across all endpoints
- Audit logging accuracy and completeness
- Transaction rollback on failure scenarios
- Search bar functionality and performance on driver, student, and parent list pages
- **Analytics Dashboard Verification**:
  - Real-time active vehicle count accuracy
  - Hourly chart data accuracy and updates
  - Active vehicles list real-time updates
  - Trip status tracking correctness
  - Socket.io event broadcasting reliability
  - Chart rendering performance with large datasets
  - Cache invalidation and refresh logic
  - Historical data aggregation accuracy
- **Password Recovery Verification**:
  - OTP generation and delivery reliability
  - OTP validation accuracy
  - Token expiration enforcement
  - Rate limiting effectiveness\n  - Account lockout mechanism
  - Password reset success rate
  - Session invalidation after password change
  - Audit logging for password reset attempts
- **Profile Management Verification**:
  - Profile data loading accuracy
  - Image upload and storage reliability
  - Image cropping functionality
  - Profile update success rate
  - Change password validation\n  - Login activity tracking accuracy
  - Session management reliability
  - Notification preferences persistence
  - RBAC enforcement for profile access
- **Enhanced Vehicle Management Verification (NEW)**:
  - Vehicle CRUD operations accuracy
  - Route and driver assignment correctness
  - Maintenance scheduling and alert reliability
  - Insurance tracking and expiration warnings
  - Vehicle detail view data accuracy
  - Search and filter performance
  - Validation and error handling effectiveness
- **Enhanced Route Management Verification (NEW)**:
  - Route CRUD operations accuracy
  - Route drawing and editing on map functionality
  - Stop assignment and sequencing correctness
  - Route visualization accuracy (map and list)\n  - Vehicle and driver assignment correctness
  - Route analytics calculations accuracy
  - Archive and restore functionality
  - Duplication feature correctness
- **Enhanced Stop Management Verification (NEW)**:
  - Stop CRUD operations accuracy
  - Map pin drop and geolocation accuracy
  - Route association management correctness
  - Student assignment functionality\n  - Stop detail view data accuracy
  - Map visualization with clustering
  - Estimated arrival time calculations
- **Enhanced Student Management Verification (NEW)**:
  - Student-parent creation atomicity
  - Route and stop assignment correctness
  - Pickup/dropoff location setting on map
  - Student detail view data accuracy
  - Bulk import/export functionality
  - Parent linking and unlinking\n  - Trip history accuracy
- **Trip History Module Verification (NEW)**:\n  - Trip data population from GPS logs accuracy
  - Filtering and search functionality\n  - Trip detail view data accuracy
  - Trip playback animation smoothness
  - Trip comparison accuracy
  - Analytics calculations correctness
  - Report generation quality (PDF/Excel/CSV)
  - Export functionality reliability

### 7.3 Deployment Checklist\n- Generate Google Maps custom style JSON (mapStyle.json) to match Cyber-Dark theme
- Configure production Socket.io server address\n- Set FCM server key\n- Configure Supabase production environment variables
- Enable HTTPS (required for push notifications and geolocation)
- Verify RLS policies are active in production
- Test credential validation service under load
- Configure audit log retention policy
- Set up database backup and recovery procedures
- Configure session timeout and security headers
- Test all RBAC policies in production environment
- Verify username uniqueness constraints are enforced
- Test password complexity validation in production
- **Analytics Deployment**:
  - Verify hourly_vehicle_stats table is created with proper indexes
  - Test Analytics Service performance under load
  - Configure caching layer (Redis or in-memory cache)
  - Set up database triggers for automatic trip status updates
  - Verify Socket.io analytics events work in production
  - Test chart rendering performance\n  - Configure data retention policy for historical statistics
  - Set up monitoring and alerting for analytics service
- **Password Recovery Deployment**:
  - Configure Email Service API keys (SendGrid/AWS SES)
  - Configure SMS Service API keys (Twilio/AWS SNS)
  - Set up OTP token expiration policies
  - Configure rate limiting thresholds
  - Test email/SMS delivery in production
  - Verify OTP service performance under load
  - Set up monitoring for OTP delivery failures
  - Configure account lockout duration
- **Profile Management Deployment**:
  - Configure cloud storage for profile images (AWS S3/Cloudinary/Supabase Storage)
  - Set up image upload size limits and file type restrictions
  - Configure image CDN for fast delivery
  - Test image upload service under load
  - Verify session management in production
  - Set up monitoring for profile update failures
  - Configure login activity log retention policy
  - Test profile access performance
- **Enhanced Admin Modules Deployment (NEW)**:
  - Verify all new database tables are created with proper indexes and constraints
  - Test vehicle, route, stop, and trip history modules under load
  - Configure maintenance alert email/SMS notifications
  - Set up monitoring for trip data aggregation
  - Test map integration (mapbox-gl-draw) in production
  - Verify report generation service performance
  - Configure data retention policies for trip history and GPS logs
  - Test bulk import/export functionality with large datasets
  - Set up monitoring and alerting for all new services
\n## 8. Security and Performance - Enhanced
- Password encryption storage (Supabase Auth built-in bcrypt)
- JWT token expiration mechanism with refresh token support
- CORS cross-origin configuration
- Request rate limiting protection
- GPS data throttled storage (3-10 second intervals)
- Geospatial indexing for optimized query performance
- Supabase RLS row-level security policies
- Socket.io room isolation mechanism
- FCM Token secure storage and updates
- Real-time username uniqueness validation to prevent duplicates
- Password complexity enforcement (minimum 8 characters, mixed case, numbers, special characters)
- Audit logging for all administrative actions with IP tracking
- Database transaction management for atomic student-parent creation
- Input validation and sanitization for all user-generated content
- SQL injection prevention through parameterized queries\n- XSS protection through content security policies
- Session management with secure cookies (httpOnly, secure, sameSite)
- Credential reveal audit trail with timestamp and admin identification
- Form validation on both client and server side
- Unique index constraints on username fields across all user tables
- Search query sanitization to prevent injection attacks
- **Analytics Performance**:
  - Efficient SQL queries with composite indexes on (date, hour)\n  - Caching layer for frequently accessed statistics
  - Batch processing for hourly aggregations
  - Database connection pooling\n  - Query result pagination for large datasets
  - Lazy loading for historical data
  - Optimized Socket.io event payload sizes
  - Frontend chart data memoization
- **Password Recovery Security**:
  - OTP tokens hashed with bcrypt before storage
  - Cryptographically secure random OTP generation
  - Token expiration enforcement (10 minutes)
  - Rate limiting (max 3 OTP requests per hour per username)
  - Account lockout after 5 failed verification attempts (15 minutes)
  - Maximum 3 verification attempts per OTP
  - Secure token generation for password reset links
  - Session invalidation after password change
  - Email/SMS notification after successful password change
  - Audit logging for all password reset attempts
- **Profile Management Security**:
  - RBAC enforcement for profile access (users can only access own profiles)
  - Current password verification required for password changes
  - Image file type and size validation
  - Secure image storage with access control
  - Session token validation for all profile operations
  - Login activity tracking with IP and device information
  - Session management with device fingerprinting
  - Secure sign-out from all devices functionality
  - Profile update audit logging
  - Protection against profile enumeration attacks
- **Enhanced Admin Modules Security (NEW)**:
  - RBAC enforcement for all admin-exclusive operations
  - Audit logging for vehicle, route, stop, and trip management actions
  - Validation of foreign key relationships before deletion
  - Secure file upload for vehicle images and documents
  - Protection against unauthorized access to trip history data
  - Encryption of sensitive maintenance and insurance data
  - Rate limiting for bulk operations (import/export)
  - Input sanitization for map coordinates and polyline data
  - Secure report generation with access control
  - Protection against data leakage in analytics and reports
\n## 9. Website Design Style - Enhanced
- **Theme Positioning**: Cyber-dark style with neon green accents, emphasizing technology and futurism
- **Color Scheme**:
  - Main background: #1a1a1a (deep black)
  - Card background: #ffffff (pure white, admin dashboard)
  - Primary color: #3b82f6 (tech blue)
  - Neon green: #10b981 (emerald, for map markers, emphasis elements, START button, analytics highlights, success states)
  - Warning/stop button: #ef4444 (red)\n  - Border color: #e2e8f0 (light gray)
  - Success state: #10b981 (emerald green)
  - Error state: #ef4444 (red)
  - Validation error: #ef4444 (red for error messages)
  - Validation success: #10b981 (green for valid inputs)
  - Chart colors: Neon green (#10b981) for primary data, gradient fills for area charts
  - Password strength colors: Red (weak), Yellow (medium), Green (strong)\n  - **Maintenance status colors (NEW)**: Green (completed), Yellow (due soon), Red (overdue), Blue (scheduled)
  - **Route status colors (NEW)**: Green (active), Gray (inactive), Blue (archived)
  - **Stop status colors (NEW)**: Green (active), Gray (inactive)\n  - **Trip status colors (NEW)**: Green (completed), Red (cancelled), Yellow (in progress)\n- **Visual Details**:
  - Map markers: Neon green pulse animation (animate-ping) with shadow effects (shadow-green-400), pulse displays when vehicle is moving
  - Border radius: Medium rounded (0.5rem), large buttons use rounded-xl
  - Shadows: Subtle card shadows, buttons use shadow-lg for enhanced depth
  - Buttons: Flat design with slight lift effect on hover, driver control panel buttons use large size design (py-6text-2xl)
  - Map: CartoDB Dark Matter dark basemap, clear marker icons, vehicle markers with directional indicators and speed status
  - Tables: Zebra-striped rows, hover highlighting, sortable columns\n  - Status indicators: Use colors to distinguish online/offline status (ON AIR in emerald green, OFFLINE in gray)
  - **Form elements**: Clear field labels, inline validation feedback with color-coded messages, success/error states with appropriate color coding
  - **Password strength indicator**: Visual bar showing password strength (weak/medium/strong) with color progression (red/yellow/green)
  - **Credential display**: Monospace font for usernames/passwords, masked by default with reveal toggle
  - **Multi-step forms**: Progress bar with step indicators, clear navigation buttons
  - **Validation messages**: Inline error messages below input fields, real-time feedback as user types
  - **Search bars**: Positioned prominently above data tables, with search icon, placeholder text, and clear button; styled with subtle border and focus state highlighting
  - **Analytics Cards**: Large numeric displays with neon green accents, trend indicators with up/down arrows, subtle gradient backgrounds
  - **Charts**: Dark theme with neon green lines, subtle grid lines, hover tooltips with detailed information, smooth animations
  - **Active Vehicle List**: Card-based layout with vehicle status indicators, click-to-highlight interaction, smooth transitions
  - **Profile Images**: Circular avatars with border styling, hover overlay for upload, default placeholder icons, smooth zoom effects
  - **OTP Input**: Large numeric input fields with focus highlighting, countdown timer with color change as time runs out\n  - **Modal Dialogs**: Centered overlay with backdrop blur, smooth fade-in animations, clear action buttons
  - **Toast Notifications**: Slide-in from top-right, color-coded by type (success/error/info), auto-dismiss with progress bar
  - **Maintenance Calendar (NEW)**: Color-coded dates, hover tooltips with maintenance details, click to view/edit
  - **Route Polyline (NEW)**: Neon green route path on dark map, numbered stop markers, directional arrows\n  - **Stop Markers (NEW)**: Color-coded by type (pickup: blue, dropoff: orange, both: green), cluster view for dense areas
  - **Trip Timeline (NEW)**: Vertical timeline with event markers, color-coded by event type, expandable details
  - **Trip Playback Controls (NEW)**: Play/pause button, speed slider, timeline scrubber, current time display
- **Layout Approach**:
  - Admin dashboard: Sidebar navigation + main content area with breadcrumb navigation
  - Driver control panel: Full-screen vertical center layout, large button design for mobile operation convenience
  - Mobile/parent portal: Full-screen map view + bottom status bar\n  - Forms: Vertical arrangement with clear field labels and inline validation
  - Responsive design adapted for desktop and mobile devices
  - Multi-step forms: Progress indicators for student/parent creation workflow with step validation
  - Modal dialogs: Centered overlay with backdrop blur, clear action buttons
  - Data tables: Pagination, search, filter, and sort capabilities with responsive column hiding
  - Form validation: Real-time feedback with color-coded borders (red for errors, green for valid inputs)
  - Search interface: Dedicated search bars positioned above driver, student, and parent list tables with consistent styling and real-time filtering
  - **Analytics Dashboard Layout**:
    - Top row: Active vehicle counter card (prominent placement)
    - Middle section: Hourly activity chart (full width)
    - Side panel: Active vehicles list (collapsible)\n    - Grid-based responsive layout (12-column system)
    - Smooth transitions between different views
    - Mobile-optimized stacked layout for smaller screens
  - **Profile Page Layout**:
    - Two-column layout (desktop): Left column for profile image and quick info, right column for detailed sections
    - Single column layout (mobile): Stacked sections with collapsible cards
    - Profile header: Full-width banner with centered avatar\n    - Section cards: White cards with subtle shadows on dark background
    - Form fields: Grouped logically with clear section headings
    - Action buttons: Fixed bottom bar (mobile) or inline (desktop)
  - **Forgot Password Flow Layout**:
    - Centered card layout with max-width constraint
    - Step indicator at top showing progress
    - Large, clear form fields with ample spacing
    - Prominent action buttons\n    - Back/cancel links in subtle styling
    - Success/error messages with icons
  - **Vehicle Detail View Layout (NEW)**:
    - Tabbed interface (Overview, Maintenance, Trips, Documents)\n    - Overview tab: Two-column layout with vehicle image and details
    - Maintenance tab: Calendar view + list of records
    - Trips tab: Filterable list with summary statistics
    - Documents tab: Grid of uploaded documents with preview
  - **Route Builder Layout (NEW)**:
    - Split view: Map on left (60%), controls on right (40%)
    - Map: Full-height interactive map with drawing tools
    - Controls: Route details form, stop list with drag-and-drop sequencing
    - Bottom bar: Save and cancel buttons
  - **Stop Detail View Layout (NEW)**:
    - Tabbed interface (Overview, Map View, Associated Routes, Students, Analytics)
    - Overview tab: Stop details with map preview
    - Map View tab: Full-screen map with stop location and nearby landmarks
    - Associated Routes tab: List of routes with stop sequence and times
    - Students tab: List of students with pickup/dropoff indicators
  - **Trip History Layout (NEW)**:
    - Top section: Filter bar with date range, route, vehicle, driver filters
    - Main section: Trip list table with pagination
    - Side panel: Trip analytics summary (collapsible)
    - Trip detail view: Tabbed interface (Overview, Route Map, Students, Timeline, Analytics)
  - **Trip Playback Layout (NEW)**:\n    - Full-screen map with GPS trajectory
    - Bottom overlay: Playback controls (play/pause, speed, timeline scrubber)
    - Side panel: Trip details and event timeline (collapsible)
\n## 10. Admin Module Audit & Enhancement Summary (NEW)
\nThis section summarizes the audit findings and enhancements made to the admin sidebar modules as per the user's requirements.

### 10.1 Vehicles Module\n**Audit Findings:**
- Basic CRUD operations may exist but lack advanced features\n- Missing maintenance tracking and scheduling
- No insurance expiry tracking
- Limited vehicle detail view\n- No vehicle-to-route/driver assignment interface
\n**Enhancements Implemented:**
- Comprehensive vehicle list with search, filter, sort, pagination
- Enhanced add/edit vehicle form with all required fields (VIN, insurance, maintenance dates, etc.)
- Maintenance scheduling calendar with color-coded status indicators
- Insurance tracking with expiration warnings and alerts
- Vehicle detail view with tabs (Overview, Maintenance History, Trip History, Documents)
- Route and driver assignment interface with validation
- Vehicle image upload functionality
- Maintenance records CRUD operations
- Maintenance alerts and notifications
\n### 10.2 Routes Module
**Audit Findings:**
- Basic route creation may exist but lacks visual mapping
- Missing stop sequencing and management
- No route analytics or performance tracking
- Limited route visualization
- No route duplication or archiving features

**Enhancements Implemented:**
- Comprehensive route list with search, filter, sort, pagination
- Visual route creation/editing with mapbox-gl-draw plugin
- Interactive map interface for drawing routes and adding waypoints
- Stop assignment with drag-and-drop sequencing
- Route visualization (map view and list view)
- Vehicle and driver assignment interface
- Route analytics dashboard (trip stats, on-time performance, distance/duration comparisons)
- Route duplication feature
- Route archiving and restoration functionality
- Route detail view with tabs (Overview, Map View, Stops, Trip History, Analytics)

### 10.3 Stops Module
**Audit Findings:**
- Basic stop creation may exist but lacks map integration
- Missing geolocation pin drop functionality
- No route association management
- Limited student assignment to stops
- No stop visualization on map
\n**Enhancements Implemented:**
- Comprehensive stop list with search, filter, sort, pagination
- Stop creation with interactive map pin drop
- Geolocation auto-population from address
- Route association management (add/remove stops from routes)
- Student assignment to stops (pickup/dropoff)
- Stop detail view with tabs (Overview, Map View, Associated Routes, Students, Analytics)
- Stop visualization on map with clustering\n- Estimated arrival time display for each associated route
- Real-time ETA updates when bus is en route

### 10.4 Students Module
**Audit Findings:**
- Basic student CRUD operations exist\n- Missing route and stop assignment interface
- No bulk import/export functionality
- Limited student detail view
- No trip history for students

**Enhancements Implemented:**
- Enhanced student list with search, filter, sort, pagination
- Route and stop assignment interface with map selection
- Pickup/dropoff location setting on interactive map
- Student detail view with tabs (Overview, Route & Stops, Parent Information, Trip History, Documents)
- Bulk import students from CSV/Excel
- Bulk export students to CSV/Excel\n- Trip history for each student
- Enhanced parent linking and management
\n### 10.5 Trip History Module
**Audit Findings:**
- Module may be completely absent or non-functional
- No trip data aggregation from GPS logs
- Missing trip analytics and reporting
- No trip playback feature
\n**Enhancements Implemented:**
- Comprehensive trip history list with advanced filtering (date range, route, vehicle, driver, status)
- Trip detail view with tabs (Overview, Route Map, Students, Timeline, Analytics)\n- Trip playback feature with animated GPS trajectory replay
- Trip comparison functionality
- Trip analytics dashboard with charts (trips per day, by route, by vehicle, on-time performance)
- Report generation (PDF/Excel/CSV)\n- Trip timeline with chronological events
- Performance metrics (on-time %, average speed, idle time, fuel consumption estimate)

### 10.6 Bug Fixes Applied
- Fixed non-functional buttons in all modules
- Resolved data loading issues\n- Fixed search, filter, and sort functions
- Implemented proper validation and error handling
- Fixed pagination and sorting issues
- Resolved map integration issues
- Fixed route/driver/stop assignment functionality
- Ensured all CRUD operations work correctly
- Fixed export functionality\n- Resolved issues with credential generation and display
\n### 10.7 Inspiration Sources
The enhancements were inspired by best practices from similar school bus management systems, fleet management applications, and logistics tracking platforms, including:
- Comprehensive vehicle maintenance tracking (inspired by fleet management systems)
- Visual route mapping with drag-and-drop (inspired by logistics planning tools)
- Interactive map-based stop management (inspired by ride-sharing apps)
- Trip history with playback (inspired by GPS tracking platforms)
- Advanced analytics and reporting (inspired by business intelligence dashboards)
