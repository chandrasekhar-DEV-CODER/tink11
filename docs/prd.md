# My School Ride MVP System Specification - Enhanced Version

## 1. Website Name
My School Ride - School Bus Tracking Management System (MVP Version with Enhanced User Management)

## 2. Website Description
A comprehensive school bus management platform providing unified login portal supporting four user roles: administrators, drivers, students, and parents. Core capabilities include: complete vehicle, driver, student, and parent management by administrators; real-time GPS location reporting by drivers; live bus tracking for students and parents; push notification alerts; visual route management; real-time hourly active vehicle analytics; **self-service password recovery via OTP verification; and comprehensive user profile management with image upload**.

## 3. Core Functional Modules

### 3.1 Unified Login System - Enhanced\n- **Unified Login Portal**: All user types (administrators, drivers, students, parents) access the system through a single login page
- **Role Selection Mechanism**: Login page provides dropdown menu or button group for users to select their role before entering credentials
- **Role Verification**: System validates username and password against the corresponding database table based on selected role
- **Admin-Specific Route**: Accessing `/adminherelogin` automatically redirects to login page with admin role pre-selected
- **Pre-configured Super Admin Account**:
  - Username: `chandrasekharadmin`
  - Password: `chandrasekharadmin1023@@`
- JWT authentication and session management
- **Universal Credential System**: All user accounts (administrators, drivers, students, parents) are created with custom username and password credentials set during account creation
- **Forgot Password Link**: Prominent'Forgot Password?' link below login form for all user roles

### 3.1.1 Forgot Password & OTP Verification System (NEW)
\n#### Password Recovery Flow:
1. **Forgot Password Entry Page**:
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
   - **SMS Delivery**: Send OTP via SMS gateway (e.g., Twilio, AWS SNS) with message template: 'Your My School Ride password reset code is: [OTP]. Valid for 10 minutes.'
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
   - Display success message and redirect to login page after 3 seconds

5. **Security Features**:
   - Rate limiting: Maximum 3 OTP requests per hour per username
   - Account lockout after 5 failed OTP verification attempts (15 minutes)
   - Secure token generation using cryptographic random functions
   - OTP tokens stored with bcrypt hashing\n   - Audit logging for all password reset attempts
   - Email/SMS notification to user after successful password change

### 3.1.2 User Profile Management System (NEW)

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
- **Account Status Indicator**: Active/Inactive status with color coding\n\n**2. Personal Information Section** (Role-Specific Fields):
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
- Phone Number (editable with verification)
- Relationship to Student (editable dropdown: Father/Mother/Guardian/Other)
- Home Address (editable)
- Secondary Contact Phone (editable)
- Linked Students (read-only list with student names, IDs, and grades)
- Workplace Information (optional, editable)\n- Preferred Contact Method (editable: Email/Phone/SMS)
- Account Created Date (read-only)
\n**3. Account Security Section**:
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
  - Form fields with clear labels and validation feedback\n- **Responsive Design**: Fully responsive for desktop, tablet, and mobile devices
- **Loading States**: Skeleton loaders while fetching profile data
- **Error Handling**: Graceful error messages for failed operations

### 3.2 Administrator Module (Phase 1: Operational Data Management)

#### 3.2.1 Vehicle Management (CRUD)\n- **Add Vehicle**: Vehicle ID, license plate, model, capacity, route name (e.g., 'Route 4- North Campus')
- **View Vehicle List**: Display using shadcn/ui Data Tables component with search and filter capabilities
- **Edit Vehicle Information**: Implement seamless editing via Dialog/Sheet components
- **Deactivate/Delete Vehicle Records**\n- **Route Assignment**: Assign text-based route names to each vehicle (MVP simplified approach)
- **Admin-Exclusive Management**: All vehicle data management operations must be performed exclusively through the admin dashboard interface

#### 3.2.2 Driver Management (CRUD)
- **Add Driver Feature**:
  - **Driver Information Form**: Capture all necessary driver details including:
    - Full name
    - Contact phone number
    - Email address
    - License number
    - **User ID** (custom username field - admin enters desired username)
    - **Password** (custom password field - admin sets initial password)
    - Assigned vehicle (vehicle_id association)
    - Emergency contact information
  - **Manual Credential Entry**:
    - Admin manually enters desired username in'User ID' field
    - Admin manually enters initial password in 'Password' field\n    - System validates username uniqueness across all user tables before account creation
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
- **Deactivate/Delete Driver Accounts**: System validates that driver has no active trips before deactivation
- **Vehicle Association**: Must specify vehicle_id when creating driver to establish relationship link
- **Admin-Exclusive Management**: All driver account creation and management operations must be performed exclusively through the admin dashboard interface

#### 3.2.3 Student Management (CRUD) - Enhanced
- **Add Student Feature**:
  - **Student Information Form**: Capture all necessary student details including:
    - Full name
    - Student ID number
    - **User ID** (custom username field - admin enters desired username)
    - **Password** (custom password field - admin sets initial password)
    - Grade level
    - Pickup/drop-off point coordinates
    - Emergency contact information\n    - Assigned bus/route information
  - **Manual Credential Entry**:
    - Admin manually enters desired username in 'User ID' field
    - Admin manually enters initial password in 'Password' field
    - System validates username uniqueness across all user tables\n    - System validates password complexity requirements\n    - Display validation errors inline if username exists or password is weak
    - Store credentials securely in the `students` table with proper encryption
  - **Linked Parent Profile Creation** (Mandatory):
    - During student addition process, capture parent/guardian details as part of the same workflow:\n      - Parent/guardian full name
      - **User ID** (custom username field - admin enters desired username for parent)
      - **Password** (custom password field - admin sets initial password for parent)
      - Contact phone number
      - Email address\n      - Relationship to student (father/mother/guardian)\n      - Secondary contact (optional)
      - Home address
    - System validates parent username uniqueness across all user tables\n    - System validates parent password complexity requirements
    - Automatically link parent account to the newly created student record via foreign key relationship
    - Display both student and parent credentials to admin after successful creation in a consolidated view
    - Store parent credentials securely in the `parents` table\n    - **Atomic Transaction**: Student and parent account creation must be executed as a single atomic transaction to ensure data integrity
  - **Data Integrity Enforcement**:
    - Parent account creation is mandatory when adding a student (cannot create student without parent)
    - System validates that parent account remains linked to at least one active student\n    - Prevent orphaned parent accounts through database constraints
    - Transaction rollback if either student or parent account creation fails
- **View Student List**: Display using shadcn/ui Data Tables component showing:\n  - Student name and ID
  - Grade level
  - Associated parent information\n  - Account credentials (masked, with reveal option for admin)
  - Account status (active/inactive)
  - Assigned bus/route\n- **Student Search Functionality**:
  - Dedicated search bar positioned above the student list table
  - Real-time search capability filtering by: student name, student ID number, username, grade level, parent name, or assigned bus\n  - Search results update dynamically as user types
  - Clear search button to reset filters
  - Search bar styling consistent with overall design theme
- **Edit Student Information**: Update student details, modify parent associations, and reset passwords if needed
- **Deactivate/Delete Student Records**: \n  - When deactivating a student, system prompts admin to handle associated parent account
  - Option to deactivate parent if no other students are linked\n  - Maintain data integrity through cascading rules
  - Require admin confirmation before deactivation
- **Admin-Exclusive Management**: All student and parent account creation, modification, and deactivation operations must be performed exclusively through the admin dashboard interface. No direct database access or external tools are permitted for these operations.\n
#### 3.2.4 Parent Management (CRUD) - Enhanced
- **View Parent List**: Display using shadcn/ui Data Tables component showing:
  - Parent name and contact details
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
- **Admin-Exclusive Management**: All parent account management operations must be performed exclusively through the admin dashboard interface\n
#### 3.2.5 Route and Stop Management (CRUD)
- **Route Drawing Tool**: Use mapbox-gl-draw plugin to create routes by clicking on the map
- **Stop Marking**: Mark pickup/drop-off stop coordinates along the route with descriptive labels
- **Route Saving**: Store routes as polyline string format in the database
- **Route Editing**: Support modification of existing routes and stop locations
- **Route Assignment**: Associate routes with specific vehicles and update vehicle records accordingly
- **Route Deletion**: Validate that no active vehicles are assigned before allowing route deletion
- **Admin-Exclusive Route Configuration**: All route definitions, modifications, and deletions must be performed exclusively through the admin dashboard interface. Drivers, students, and parents have read-only access to route information relevant to their assignments.

#### 3.2.6 Real-time Monitoring Map
- **Global Vehicle View**: Display real-time locations of all online vehicles on the admin dashboard map
- **Vehicle Status Indicators**: Differentiate vehicle states (moving/stopped/offline) using distinct colors or icons
- **Vehicle Details View**: Click map markers to view detailed vehicle information, assigned driver, and current route
- **Real-time Data Updates**: Receive vehicle location updates via Socket.io and refresh map display automatically
- **Historical Playback**: Access last 24 hours of vehicle trajectory data for review and analysis
\n#### 3.2.7 Hourly Active Vehicles Analytics Dashboard
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
  - Display vehicle ID, driver name, route name, trip start time\n  - Real-time status updates (moving/stopped)\n  - Click to highlight vehicle on map
  - Sort by trip duration or vehicle ID
- **Historical Comparison**:
  - Compare current day's hourly activity with previous day
  - Display percentage change in activity levels
  - Weekly average active vehicles metric
- **Data Calculation Logic**:
  - Active vehicle defined as: vehicle with trip status = 'active' in current hour
  - Query `gps_logs` table grouped by hour with vehicle_id count
  - Cache hourly aggregates for performance optimization
  - Real-time updates via Socket.io event: `admin:hourly_stats_update`

#### 3.2.8 Role-Based Access Control (RBAC) - Enhanced
- **Supabase RLS (Row Level Security) Policies**:
  - **Administrator Role**:
    - Full CRUD permissions on all tables (vehicles, drivers, students, parents, routes)\n    - Exclusive access to user account creation with manual credential entry for all user types
    - Exclusive access to route configuration and management
    - Ability to view and manage all system data across all modules
    - Access to audit logs and system reports
    - Exclusive access to credential reveal functionality
    - Ability to reset passwords for all user types
    - Full access to hourly active vehicle analytics and historical data
  - **Driver Role**:
    - READ-only access to assigned vehicle information
    - READ-only access to assigned route information
    - UPDATE permission only for own GPS location data and trip status
    - READ-only access to own account profile\n    - **UPDATE permission for own profile information (name, email, phone, emergency contact, profile image)**
    - **Access to change own password via profile settings**
    - No access to student/parent personal information
    - No access to other drivers' data
    - No access to analytics dashboard
  - **Student Role**:
    - READ-only access to own profile information
    - **UPDATE permission for own profile information (email, phone, pickup/dropoff locations, profile image)**
    - **Access to change own password via profile settings**
    - READ-only access to assigned bus real-time location
    - READ-only access to assigned route and stop information
    - No access to other students' data
    - No access to driver or parent account details
    - No access to analytics dashboard
  - **Parent Role**:
    - READ-only access to linked student(s) information
    - **UPDATE permission for own profile information (name, email, phone, address, profile image)**
    - **Access to change own password via profile settings**
    - READ-only access to assigned bus real-time location for linked students
    - READ-only access to route and stop information for linked students
    - No access to other families' data
    - No access to driver account details
    - No access to analytics dashboard
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

#### 3.2.9 Credential Management System
- **Manual Credential Entry Interface**:
  - Form fields for 'User ID' (username) and 'Password' in all user creation forms
  - Real-time validation feedback for username uniqueness
  - Password strength indicator showing complexity requirements
  - Inline error messages for validation failures
  - Clear labeling of required fields
- **Credential Display Interface**:
  - Modal dialog displaying entered credentials after successful account creation
  - Copy-to-clipboard functionality for both username and password
  - Print-friendly format for physical credential distribution
  - Warning message about credential security
  - Option to send credentials via email (optional feature)
- **Credential Management Features**:
  - Admin ability to view masked credentials in user lists
  - Reveal functionality with audit logging
  - Password reset capability where admin enters new password
  - Bulk credential export for backup purposes (encrypted format)
  - Credential expiration and forced password change policies (optional)
\n### 3.3 Driver Module (Phase 3: Driver Dashboard - The Publisher)

#### 3.3.1 Driver Control Panel (Web Version)
- **Status Display**: Show current online/offline status\n- **Trip Control Buttons**:
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
\n### 3.4 Student and Parent Module (Phase 4: Parent/Student View - The Subscriber)

#### 3.4.1 Real-time Map Tracking (Phase 2: Map Integration)
- **Map Engine**: React-Leaflet + CartoDB Dark Matter Tiles
- **Visual Style**: Cyber-dark theme with neon green markers
- **Core Features**:
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

#### 3.4.3 Real-time Data Subscription
- Subscribe to vehicle location updates using Socket.io
- Filter relevant vehicle data by busId\n- No manual page refresh needed, data automatically pushed\n- Use hashmap data structure for efficient multi-vehicle state management: `{ busId: { lat, lng, speed, heading } }`

#### 3.4.4 Geofencing and Push Notifications (Phase 5: Advanced)
- **Distance Calculation**: Use Haversine formula to calculate distance between bus and student pickup point
- **Arrival Alert**: Trigger push notification when distance< 500meters:'Bus is arriving soon!'
- **Push Notification Implementation** (Mobile):
  - Use expo-notifications library
  - Automatically request push permissions
  - Obtain FCM Token and upload to backend
  - Configure notification handlers: shouldShowAlert, shouldPlaySound, shouldSetBadge
  - Listen for notification receipt events and log to console
- **Trigger Logic**: Real-time monitoring of location changes with automatic detection\n
#### 3.4.5 Profile Management Access
- **Profile Settings Button**: Available in navigation header
- **Profile Page Access**: Click redirects to comprehensive profile page
- **Profile Editing**: Update personal information, change password, upload profile image
\n### 3.5 Development and Testing Tools

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

## 4. Technical Architecture

### 4.1 Database Design - Enhanced Schema
- **Independent User Table Structure**:
  - `admins` table: Administrator account information (id, username, password_hash, email, phone, profile_image_url, created_at, last_login, updated_at)
  - `drivers` table: Driver accounts and detailed information (id, username, password_hash, name, email, phone, license_number, vehicle_id foreign key, emergency_contact_name, emergency_contact_phone, date_of_birth, home_address, years_experience, profile_image_url, fcmToken, created_at, created_by_admin_id, status, updated_at)
  - `students` table: Student profiles (id, username, password_hash, student_id_number, name, grade, date_of_birth, email, phone, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, emergency_contact, medical_info, bus_id, profile_image_url, created_at, created_by_admin_id, status, updated_at)
  - `parents` table: Parent accounts (id, username, password_hash, name, email, phone, address, relationship, secondary_contact_phone, workplace_info, preferred_contact_method, student_id foreign key with NOT NULL constraint, profile_image_url, fcmToken, created_at, created_by_admin_id, status, updated_at)
  - `vehicles` table: Vehicle information (id, vehicle_id_number, license_plate, model, capacity, route_name, status, created_at, updated_at)
  - `routes` table: Route information (id, route_name, polyline_string, stops_json, assigned_vehicle_id, created_at, updated_at)\n  - `gps_logs` table: Driver real-time location records (id, driver_id, vehicle_id, latitude, longitude, heading, speed, timestamp)\n  - `trips` table: Trip records (id, vehicle_id, driver_id, trip_status enum('active', 'completed', 'cancelled'), start_time, end_time, created_at)\n  - `hourly_vehicle_stats` table: Aggregated hourly statistics (id, date, hour, active_vehicle_count, created_at, updated_at)
- `audit_logs` table: Administrative action logging (id, admin_id, action_type, target_table, target_id, action_details, ip_address, timestamp)
  - **`password_reset_tokens` table (NEW)**: OTP token management (id, user_id, user_role enum('admin', 'driver', 'student', 'parent'), token_hash, contact_method enum('email', 'phone'), contact_value, expiry_time, attempts_count, created_at, used_at)
  - **`login_activity_logs` table (NEW)**: User login history (id, user_id, user_role, login_time, ip_address, device_info, browser_info, login_status enum('success', 'failed'), created_at)\n  - **`active_sessions` table (NEW)**: Session management (id, user_id, user_role, session_token, device_info, ip_address, last_activity, created_at, expires_at)
\n- **Database Constraints**:
  - Foreign key constraint: `parents.student_id` references `students.id` with ON DELETE RESTRICT\n  - Foreign key constraint: `drivers.vehicle_id` references `vehicles.id` with ON DELETE SET NULL
  - Foreign key constraint: `students.bus_id` references `vehicles.id` with ON DELETE SET NULL
  - Foreign key constraint: `trips.vehicle_id` references `vehicles.id` with ON DELETE CASCADE
  - Foreign key constraint: `trips.driver_id` references `drivers.id` with ON DELETE CASCADE
  - Foreign key constraint: `password_reset_tokens.user_id` references respective user table based on user_role
  - Unique constraint on usernames across all user tables (enforced via unique index)
  - Check constraint ensuring parent accounts have at least one linked student
  - Check constraint on password complexity requirements (minimum 8 characters, mixed case, numbers, special characters)
  - Check constraint on trip_status enum values\n  - Check constraint on password_reset_tokens.expiry_time (must be future timestamp)
  - Index on frequently queried fields (username, student_id_number, vehicle_id, timestamp)
  - Composite index on (date, hour) in hourly_vehicle_stats table for efficient querying
  - Index on password_reset_tokens (user_id, user_role, expiry_time) for fast OTP validation
  - Index on login_activity_logs (user_id, login_time) for activity history queries
  - Index on active_sessions (session_token, expires_at) for session validation

### 4.2 Backend Technology Stack
- Supabase (replacing traditional Node.js + MongoDB approach)
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
- **OTP Service (NEW)**: Generate, validate, and manage OTP tokens for password reset
- **Email Service (NEW)**: Send OTP codes and notifications via email (SendGrid, AWS SES, or similar)
- **SMS Service (NEW)**: Send OTP codes via SMS (Twilio, AWS SNS, or similar)
- **Image Upload Service (NEW)**: Handle profile image uploads to cloud storage (AWS S3, Cloudinary, or Supabase Storage)
- **Session Management Service (NEW)**: Track and manage user sessions across devices
- **Rate Limiting Service (NEW)**: Prevent abuse of OTP requests and login attempts
\n### 4.3 Frontend Technology Stack
\n#### Admin Dashboard:\n- React (Vite build)\n- Tailwind CSS\n- shadcn/ui component library (Data Tables, Dialog, Sheet, Toast, Form components, Card components)
- Socket.io Client (real-time communication)
- react-map-gl or React-Leaflet (map components)
- mapbox-gl-draw (route drawing plugin)
- Recharts or Chart.js (for hourly activity charts)
- **react-image-crop (NEW)**: Image cropping for profile photos
- **Enhanced Student/Parent Management UI**:
  - Multi-step form wizard for student addition with parent details
  - Manual credential entry fields with real-time validation
  - Password strength indicator component
  - Credential display modal with copy-to-clipboard functionality
  - Parent-student relationship visualization (tree view or graph)
  - Bulk import capability (optional future enhancement)
  - Credential management interface with reveal/mask toggle
  - Audit log viewer component
  - Dedicated search bars for driver, student, and parent list pages with real-time filtering
  - Hourly active vehicles analytics dashboard with real-time charts and statistics
- **Forgot Password UI (NEW)**:
  - Forgot password entry form with role selection
  - OTP verification page with countdown timer
  - Password reset form with strength indicator
  - Success/error toast notifications
- **Profile Management UI (NEW)**:\n  - Comprehensive profile page component\n  - Image upload with cropping tool
  - Editable form fields with validation
  - Change password modal\n  - Login activity log display
  - Active sessions management interface
\n#### Driver Portal (Web Version):
- React (Vite build)
- Tailwind CSS
- Socket.io Client\n- Geolocation API (browser native)
- Responsive design supporting mobile browser access
- **react-image-crop (NEW)**: Image cropping for profile photos
- **Profile Management UI (NEW)**: Driver profile page with editable fields
\n#### Student/Parent Portal (Mobile):
- React Native + Expo\n- expo-notifications (push notifications)
- React-Leaflet or react-native-maps\n- Socket.io Client
- Geolocation API\n- **expo-image-picker (NEW)**: Profile image selection and upload
- **Profile Management UI (NEW)**: Student/Parent profile page with editable fields

#### Map Component Dependencies:
```bash\nnpm install leaflet react-leaflet\nnpm install -D @types/leaflet\nnpm install mapbox-gl @mapbox/mapbox-gl-draw
npm install socket.io-client
npm install recharts
npm install react-image-crop
npm install expo-notifications (mobile)\nnpm install expo-image-picker (mobile)
```

#### Global CSS Configuration (src/index.css):
```css
@import'leaflet/dist/leaflet.css';
@import 'react-image-crop/dist/ReactCrop.css';
\n.leaflet-container {
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  z-index: 0;
}\n```

### 4.4 Core API Endpoints - Enhanced
- `POST /api/auth/login`: Unified login interface (requires role parameter)
- `POST /api/gps/update`: Driver GPS location reporting (via Socket.io)
- `GET /api/gps/latest/:driverId`: Get latest location for specified driver
- `GET /api/admin/vehicles`: Admin retrieve vehicle list
- `POST /api/admin/vehicles`: Admin add vehicle\n- `PUT /api/admin/vehicles/:id`: Admin update vehicle
- `DELETE /api/admin/vehicles/:id`: Admin delete vehicle
- `POST /api/admin/drivers`: Admin add driver with manual credential entry (validates username uniqueness and password complexity)
- `GET /api/admin/drivers`: Admin retrieve driver list with optional search query parameter
- `PUT /api/admin/drivers/:id`: Admin update driver information
- `DELETE /api/admin/drivers/:id`: Admin deactivate driver
- `POST /api/admin/students`: Admin add student with manual credential entry and linked parent (atomic transaction, validates both usernames and passwords)
- `GET /api/admin/students`: Admin retrieve student list with parent associations and optional search query parameter
- `PUT /api/admin/students/:id`: Admin update student information
- `DELETE /api/admin/students/:id`: Admin deactivate student (with parent handling logic)
- `GET /api/admin/parents`: Admin retrieve parent list with student associations and optional search query parameter
- `PUT /api/admin/parents/:id`: Admin update parent information
- `DELETE /api/admin/parents/:id`: Admin deactivate parent (with validation)
- `POST /api/admin/parents`: Admin manually add parent (special cases)\n- `POST /api/routes`: Create route (receive polyline string)\n- `GET /api/routes/:id`: Get route details
- `PUT /api/routes/:id`: Update route
- `DELETE /api/routes/:id`: Delete route (with validation)
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
- `POST /api/trips/start`: Driver starts a trip (updates trip status to 'active')
- `POST /api/trips/stop`: Driver stops a trip (updates trip status to 'completed')\n- **`POST /api/auth/forgot-password` (NEW)**: Initiate password reset (validates username, role, contact method)
- **`POST /api/auth/verify-otp` (NEW)**: Verify OTP code (validates token, expiry, attempts)
- **`POST /api/auth/reset-password` (NEW)**: Reset password with verified token (validates new password, updates database)
- **`POST /api/auth/resend-otp` (NEW)**: Resend OTP code (rate limited)\n- **`GET /api/profile/:role/:userId` (NEW)**: Get user profile information by role and user ID
- **`PUT /api/profile/:role/:userId` (NEW)**: Update user profile information (validates permissions)
- **`POST /api/profile/upload-image` (NEW)**: Upload profile image to cloud storage (returns image URL)
- **`DELETE /api/profile/delete-image/:role/:userId` (NEW)**: Delete user profile image\n- **`POST /api/profile/change-password` (NEW)**: Change password (requires current password verification)
- **`GET /api/profile/login-activity/:role/:userId` (NEW)**: Get user login activity history
- **`GET /api/profile/active-sessions/:role/:userId` (NEW)**: Get user active sessions
- **`POST /api/profile/signout-all-devices` (NEW)**: Sign out from all devices except current session
- **`PUT /api/profile/notification-preferences/:role/:userId` (NEW)**: Update notification preferences (students/parents only)
\n### 4.5 Socket.io Event Definitions
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
\n### 4.6 LiveMap Component Implementation (src/components/map/LiveMap.jsx)

#### Component Configuration:
- Map tiles: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
- Custom markers: Create neon green pulse icons using `L.divIcon`
- Tailwind animation classes: `animate-ping`, `shadow-green-400`
- Default center point: [17.3850, 78.4867] (Hyderabad example)
- Default zoom level: 13
\n#### Component Interface:
```typescript
interface VehicleLocation {
  id: string;\n  name: string;
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
    return () => socket.off('admin:all_buses_update');
  }, [socket]);
\n  return (
    <div className='h-screen'>
      <LiveMap \n        center={[17.3850, 78.4867]} 
        zoom={13} \n        vehicles={Object.values(buses)} 
      />
    </div>
  );
};
```

### 4.7 Push Notification Implementation (mobile/hooks/useNotifications.ts)

#### Feature Configuration:
- Use expo-notifications library\n- Configure notification handler: show notifications when app is open, play sound, do not set badge
- Automatically request push permissions
- Obtain Expo Push Token (FCM Token)
- Listen for notification receipt events

#### Integration Steps:
1. Call `useNotifications()` hook after user login
2. Upload obtained FCM Token to backend: `axios.post('/api/users/update-fcm', { fcmToken: token })`
3. Backend sends push via FCM to corresponding users when geofence is triggered

### 4.8 Hourly Analytics Component Implementation (src/components/analytics/HourlyActiveVehicles.jsx)
\n#### Component Structure:
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
  });
  
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
\n### 4.9 Forgot Password Component Implementation (src/components/auth/ForgotPassword.jsx) (NEW)

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

### 4.10 Profile Page Component Implementation (src/components/profile/ProfilePage.jsx) (NEW)

#### Component Structure:
- **Profile Header Section**:
  - Circular avatar with image upload overlay
  - Image cropping modal (react-image-crop)
  - User name and role badge
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

#### Component Interface:
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

## 5. Real-time Tracking Implementation

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

## 6. Development Phase Planning

### Phase 1: Operational Data Management (Priority: High, Complexity: Low-Medium)
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
\n### Phase 2: Map Integration (Priority: High, Complexity: Medium)\n- Integrate React-Leaflet and CartoDB Dark Matter\n- Create LiveMap component\n- Implement neon green pulse markers\n- Integrate mapbox-gl-draw route drawing tool
- Implement admin-exclusive route management interface
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

### Phase 6: Route Management (Priority: Medium, Complexity: Medium)
- Develop route drawing interface (RouteBuilder.jsx)
- Implement stop marking functionality
- Complete route-vehicle association logic
- Implement route deletion with validation

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

### Phase 8: Password Recovery System (Priority: High, Complexity: Medium) (NEW)
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

### Phase 9: User Profile Management (Priority: High, Complexity: Medium) (NEW)
- **Create profile_image_url fields in all user tables**
- **Create login_activity_logs and active_sessions tables**
- **Implement Image Upload Service (AWS S3/Cloudinary/Supabase Storage)**
- **Integrate react-image-crop for profile photo cropping**
- **Develop Profile Page UI components**:
  - Profile header with image upload\n  - Personal information cards (role-specific)
  - Account security section
  - Notification preferences (students/parents)\n- **Implement backend API endpoints**:
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

## 7. Testing and Deployment Process

### 7.1 Development Testing Process
1. **Start GPS Simulator**: `node scripts/simulateBus.js bus_001`
2. **Open Driver Control Panel**: Access `http://192.168.1.x:3000/driver` in mobile browser (use local IP)
3. **Open Admin Dashboard**: Access real-time monitoring map in desktop browser
4. **Verify Data Flow**: Confirm map markers move with simulator or real GPS
5. **Test Student/Parent Creation**: Verify manual credential entry with validation and parent linking
6. **Test Driver Creation**: Verify manual credential entry with validation\n7. **Test RBAC**: Verify role-based access restrictions work correctly across all endpoints
8. **Test Credential Management**: Verify reveal/mask functionality and audit logging
9. **Test Route Management**: Verify admin-exclusive route configuration\n10. **Test Username Uniqueness**: Attempt to create duplicate usernames across different user types
11. **Test Password Validation**: Attempt to create accounts with weak passwords
12. **Test Search Functionality**: Verify search bars on driver, student, and parent pages filter results correctly in real-time
13. **Test Analytics Dashboard**:
    - Start multiple simulated trips
    - Verify active vehicle count updates in real-time
    - Verify hourly chart displays correct data
    - Stop trips and verify count decreases
    - Test active vehicles list panel functionality
    - Verify click-to-highlight on map works\n    - Test historical comparison features
    - Verify Socket.io events fire correctly
14. **Test Forgot Password Flow (NEW)**:
    - Test OTP request for all user roles
    - Verify OTP delivery via email and SMS
    - Test OTP verification with valid and invalid codes
    - Test OTP expiration after 10 minutes
    - Test rate limiting (max 3 requests per hour)
    - Test account lockout after 5 failed attempts
    - Test password reset with new password
    - Verify old sessions invalidated after password change
    - Test resend OTP functionality
15. **Test Profile Management (NEW)**:\n    - Test profile page access for all user roles
    - Test profile image upload and cropping\n    - Test profile information editing
    - Test change password functionality
    - Verify current password validation
    - Test login activity log display
    - Test active sessions management
    - Test sign-out all devices functionality
    - Test notification preferences (students/parents)
    - Verify profile updates reflect in database
    - Test image deletion functionality
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
- **Password Recovery Verification (NEW)**:
  - OTP generation and delivery reliability
  - OTP validation accuracy
  - Token expiration enforcement
  - Rate limiting effectiveness\n  - Account lockout mechanism
  - Password reset success rate
  - Session invalidation after password change
  - Audit logging for password reset attempts
- **Profile Management Verification (NEW)**:
  - Profile data loading accuracy
  - Image upload and storage reliability
  - Image cropping functionality
  - Profile update success rate
  - Change password validation\n  - Login activity tracking accuracy
  - Session management reliability
  - Notification preferences persistence
  - RBAC enforcement for profile access
\n### 7.3 Deployment Checklist
- Generate Google Maps custom style JSON (mapStyle.json) to match Cyber-Dark theme
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
  - Configure caching layer (Redis or in-memory)
  - Set up database triggers for trip status updates
  - Verify Socket.io analytics events work in production
  - Test chart rendering performance
  - Configure data retention policy for historical statistics
  - Set up monitoring and alerting for analytics service
- **Password Recovery Deployment (NEW)**:
  - Configure Email Service API keys (SendGrid/AWS SES)
  - Configure SMS Service API keys (Twilio/AWS SNS)
  - Set up OTP token expiration policies
  - Configure rate limiting thresholds
  - Test email/SMS delivery in production
  - Verify OTP service performance under load
  - Set up monitoring for OTP delivery failures
  - Configure account lockout duration
- **Profile Management Deployment (NEW)**:
  - Configure cloud storage for profile images (AWS S3/Cloudinary/Supabase Storage)
  - Set up image upload size limits and file type restrictions
  - Configure image CDN for fast delivery
  - Test image upload service under load
  - Verify session management in production
  - Set up monitoring for profile update failures
  - Configure login activity log retention policy
  - Test profile access performance
\n## 8. Security and Performance\n- Password encryption storage (Supabase Auth built-in bcrypt)
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
- **Password Recovery Security (NEW)**:
  - OTP tokens hashed with bcrypt before storage
  - Cryptographically secure random OTP generation
  - Token expiration enforcement (10 minutes)
  - Rate limiting (max 3 OTP requests per hour per username)
  - Account lockout after 5 failed verification attempts (15 minutes)
  - Maximum3 verification attempts per OTP
  - Secure token generation for password reset links
  - Session invalidation after password change
  - Email/SMS notification after successful password change
  - Audit logging for all password reset attempts
- **Profile Management Security (NEW)**:\n  - RBAC enforcement for profile access (users can only access own profiles)
  - Current password verification required for password changes
  - Image file type and size validation
  - Secure image storage with access control
  - Session token validation for all profile operations
  - Login activity tracking with IP and device information
  - Session management with device fingerprinting
  - Secure sign-out from all devices functionality
  - Profile update audit logging
  - Protection against profile enumeration attacks
\n## 9. Website Design Style\n- **Theme Positioning**: Cyber-dark style with neon green accents, emphasizing technology and futurism
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
  - Password strength colors: Red (weak), Yellow (medium), Green (strong)\n- **Visual Details**:
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
  - **Profile Images (NEW)**: Circular avatars with border styling, hover overlay for upload, default placeholder icons, smooth zoom effects
  - **OTP Input (NEW)**: Large numeric input fields with focus highlighting, countdown timer with color change as time runs out\n  - **Modal Dialogs (NEW)**: Centered overlay with backdrop blur, smooth fade-in animations, clear action buttons
  - **Toast Notifications (NEW)**: Slide-in from top-right, color-coded by type (success/error/info), auto-dismiss with progress bar
- **Layout Approach**:
  - Admin dashboard: Sidebar navigation + main content area with breadcrumb navigation
  - Driver control panel: Full-screen vertical center layout, large button design for mobile operation convenience
  - Mobile/parent portal: Full-screen map view + bottom status bar
  - Forms: Vertical arrangement with clear field labels and inline validation
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
  - **Profile Page Layout (NEW)**:
    - Two-column layout (desktop): Left column for profile image and quick info, right column for detailed sections
    - Single column layout (mobile): Stacked sections with collapsible cards
    - Profile header: Full-width banner with centered avatar\n    - Section cards: White cards with subtle shadows on dark background
    - Form fields: Grouped logically with clear section headings
    - Action buttons: Fixed bottom bar (mobile) or inline (desktop)
  - **Forgot Password Flow Layout (NEW)**:
    - Centered card layout with max-width constraint
    - Step indicator at top showing progress
    - Large, clear form fields with ample spacing
    - Prominent action buttons\n    - Back/cancel links in subtle styling
    - Success/error messages with icons
