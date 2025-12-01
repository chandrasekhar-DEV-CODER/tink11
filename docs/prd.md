# My School Ride MVP System Specification - Enhanced Version with Multi-Bus Tracking, Navigation Features & Comprehensive Settings Module

## 1. Website Name
My School Ride - School Bus Tracking Management System (MVP Version with Enhanced Multi-Bus Tracking, Navigation, Optimized Analytics, and Centralized Settings Management)

## 2. Website Description
A comprehensive school bus management platform providing unified login portal supporting four user roles: administrators, drivers, students, and parents. Core capabilities include: complete vehicle, driver, student, and parent management by administrators; real-time GPS location reporting by drivers; live bus tracking for students and parents with multi-bus route visibility and navigation assistance; push notification alerts; visual route management; optimized real-time hourly active vehicle analytics based on 24-hour database storage; self-service password recovery via OTP verification; comprehensive user profile management with image upload; enhanced admin modules for Vehicles, Routes, Stops, Students, and Trip History with full CRUD operations and advanced tracking features; **centralized settings management system enabling administrators to configure system-wide UI themes, security policies, notification preferences, localization settings, and file upload restrictions that apply to all users application-wide**.

## 3. Core Functional Modules

### 3.1 Unified Login System - Enhanced
(Content remains the same as original document)

#### 3.1.1 Forgot Password & OTP Verification System
(Content remains the same as original document)\n
#### 3.1.2 User Profile Management System
(Content remains the same as original document)

### 3.2 Administrator Module - Enhanced with Improved Core Sections & Settings Management
(Content remains the same as original document for sections3.2.1 through 3.2.11)

#### 3.2.12 Centralized Settings Management Module - NEW
\n##### 3.2.12.1 Settings Dashboard Overview
- **Access Control**: Only administrators with'Super Admin' or 'Settings Manager' role can access\n- **Navigation Structure**: Sidebar menu with categorized settings sections\n- **Visual Layout**: Card-based interface with clear section headers and descriptions
- **Save Mechanism**: Global'Save Changes' button with confirmation dialog
- **Reset Functionality**: 'Reset to Defaults' button with warning prompt for each section
- **Change History Log**: Display last modified timestamp and admin username for each setting

##### 3.2.12.2 UI Theme & Color Customization
- **Color Picker Interface**:
  - Primary Color: Main brand color used for headers, buttons, and key UI elements
  - Secondary Color: Supporting color for backgrounds and secondary actions
  - Accent Color: Highlight color for notifications, alerts, and active states
  - Each color picker shows hex code input and visual preview
- **Live Preview Panel**: Real-time preview of color changes on sample UI components
- **Application Logic**:
  - Colors stored in system_settings table as JSON object
  - Frontend fetches color scheme on app initialization
  - CSS variables dynamically updated: --primary-color, --secondary-color, --accent-color
  - All users see updated theme immediately after admin saves (no page refresh required)
- **Default Theme**: Cyber-dark theme with neon green (#10b981), dark gray (#1a1a1a), and tech blue (#3b82f6)\n
##### 3.2.12.3 System-Wide Announcements/Banners
- **Rich Text Editor**: TinyMCE or Quill editor for creating formatted announcements
- **Banner Configuration**:
  - Title: Short headline (max 100 characters)
  - Content: Rich text message with formatting, links, and images
  - Banner Type: Info/Warning/Critical (affects visual styling)
  - Visibility Toggle: Show/Hide banner\n  - Schedule Settings: Start date/time and end date/time for automatic display
  - Target Audience: All users or specific roles (Admin/Driver/Student/Parent)
- **Display Logic**:
  - Banner appears at top of application for all targeted users
  - Dismissible or persistent based on admin configuration
  - Stored in announcements table with active status flag
  - Frontend checks active announcements on page load and displays accordingly
- **Banner Styles**:
  - Info: Blue background with info icon\n  - Warning: Yellow background with warning icon
  - Critical: Red background with alert icon
\n##### 3.2.12.4 Privacy & Security Settings\n- **Password Complexity Requirements**:
  - Minimum Length: Slider input (6-20 characters, default: 8)
  - Required Character Types: Checkboxes for uppercase, lowercase, numbers, special characters
  - Password Expiry: Enable/disable with expiry period dropdown (30/60/90/180 days)
  - Password History: Prevent reuse of last N passwords (0-10, default: 3)
- **Two-Factor Authentication (2FA)**:
  - Global 2FA Toggle: Enable/disable 2FA requirement for all users
  - 2FA Method: SMS OTP or Authenticator App (Google Authenticator, Authy)\n  - Grace Period: Allow users N days to set up 2FA before enforcement (0-30days)\n- **Session Management**:
  - Session Timeout: Dropdown selection (15/30/60/120 minutes, or'Never')
  - Concurrent Sessions: Allow/disallow multiple simultaneous logins per user
  - Auto-Logout on Inactivity: Enable/disable with configurable idle time
- **Application Logic**:
  - Settings stored in system_settings table\n  - Backend validates password against configured rules on user registration/password change
  - 2FA enforcement checked during login process
  - Session timeout enforced via JWT expiry and frontend idle detection

##### 3.2.12.5 Notification Preferences
- **Default Notification Channels**:
  - Event Type List: New message, task assignment, bus arrival alert, trip started, trip completed, system announcement
  - Channel Selection: Checkboxes for Email, In-App, Push Notification (mobile)\n  - Per-Event Configuration: Admin sets default channels for each event type
- **User Customization Policy**:
  - Radio buttons:'Enforce defaults for all users' or 'Allow personal customization'
  - If enforced, users cannot change notification settings
  - If allowed, users can override defaults in their profile settings
- **Email Notification Settings**:
  - SMTP Configuration: Server, port, username, password, encryption (TLS/SSL)
  - From Address: Default sender email for system notifications
  - Email Template Editor: Customize email templates for each notification type
- **Push Notification Settings**:
  - FCM Server Key: Firebase Cloud Messaging configuration for mobile push
  - Default Sound: Enable/disable notification sound
  - Badge Count: Enable/disable app badge counter
- **Application Logic**:
  - Notification preferences stored in notification_settings table
  - Backend checks user's notification preferences (or defaults) before sending notifications
  - Email service uses configured SMTP settings
  - Push notifications sent via FCM using configured server key

##### 3.2.12.6 Localization and Regional Settings
- **Language Settings**:
  - Default Language: Dropdown selection (English, Spanish, French, Chinese, etc.)
  - Supported Languages: Multi-select list of enabled languages for user selection
  - Translation Management: Link to translation editor for adding/editing language strings
- **Time Zone Settings**:
  - Default Time Zone: Searchable dropdown with all IANA time zones
  - Auto-Detect User Time Zone: Enable/disable automatic detection based on browser\n- **Date/Time Format**:
  - Date Format: Dropdown (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.)
  - Time Format: Radio buttons (12-hour with AM/PM or 24-hour)
  - First Day of Week: Dropdown (Sunday or Monday)
- **Currency and Number Format**:
  - Default Currency: Dropdown (USD, EUR, GBP, CNY, etc.)
  - Number Format: Dropdown (1,234.56 or 1.234,56)
- **Application Logic**:
  - Settings stored in system_settings table
  - Frontend uses i18n library (e.g., react-i18next) to load language strings
  - All dates/times displayed using configured format and time zone
  - User can override language and time zone in personal profile if allowed

##### 3.2.12.7 File Upload and Storage Limits
- **Maximum File Size**:
  - Slider input with unit selector (KB/MB/GB)
  - Default: 10 MB
  - Range: 1 KB to 100 MB
- **Permitted File Types**:
  - Predefined Categories: Images (jpg, png, gif), Documents (pdf, doc, docx), Spreadsheets (xls, xlsx), Archives (zip, rar)\n  - Custom Extensions: Text input for additional allowed extensions (comma-separated)
  - Blocked Extensions: Text input for explicitly blocked extensions (e.g., exe, bat, sh)
- **Storage Quota**:
  - Per-User Storage Limit: Input field with unit selector (MB/GB)\n  - Total System Storage Limit: Display current usage and maximum capacity
  - Auto-Cleanup Policy: Enable/disable automatic deletion of files older than N days
- **Upload Restrictions**:
  - Virus Scanning: Enable/disable file scanning on upload (requires ClamAV or similar)
  - Image Compression: Auto-compress images above certain size threshold
  - Duplicate Detection: Prevent uploading identical files (based on hash)
- **Application Logic**:
  - Settings stored in system_settings table
  - Backend validates file size and type on upload endpoint
  - Rejected uploads return error message with configured limits
  - Storage quota checked before accepting upload
  - File metadata stored in uploads table with user_id, file_size, upload_date\n
##### 3.2.12.8 Settings Interface Structure
- **Sidebar Navigation**:
  1. Dashboard (Overview of all settings)
  2. Appearance (UI Theme & Colors)
  3. Announcements (System Banners)
  4. Security (Password & 2FA)
  5. Notifications (Channels & Preferences)
  6. Localization (Language & Regional)
  7. File Management (Upload Limits)
  8. Advanced (API Keys, Integrations)
- **Main Content Area**:
  - Section Header: Title and description
  - Setting Groups: Logically grouped form fields with labels and help text
  - Action Buttons: Save Changes, Reset to Defaults, Cancel\n  - Status Indicators: Success/error messages after save\n- **Responsive Design**: Mobile-friendly layout with collapsible sidebar
\n##### 3.2.12.9 System-Wide Application Mechanism
- **Settings Storage**:
  - Database Table: system_settings (key-value pairs with JSON data type)
  - Cache Layer: Redis cache for frequently accessed settings (TTL: 5 minutes)\n  - Version Control: Track setting changes with version number and timestamp
- **Settings Distribution**:
  - Backend API: GET /api/admin/settings/all (returns all current settings)
  - Frontend Initialization: Fetch settings on app load and store in global state (Redux/Context)\n  - Real-Time Updates: Socket.io event'settings:updated' broadcasts changes to all connected clients
  - Client-Side Application: Update CSS variables, i18n language, notification preferences immediately
- **Validation and Error Handling**:
  - Backend validates all setting values before saving
  - Return detailed error messages for invalid inputs
  - Rollback mechanism if settings update fails
- **Audit Trail**:
  - Log all setting changes in settings_audit_log table
  - Record: admin_id, setting_key, old_value, new_value, timestamp
  - Display audit log in settings dashboard for transparency

##### 3.2.12.10 Reset to Defaults Functionality
- **Reset Options**:
  - Reset Single Section: Button in each settings section to reset only that category
  - Reset All Settings: Global button to reset entire system to factory defaults
- **Confirmation Dialog**:
  - Warning message:'This action will reset all settings to default values. This cannot be undone. Are you sure?'
  - Require admin to type 'RESET' to confirm
- **Default Values**:
  - Stored in backend configuration file (config/defaults.json)
  - Includes default colors, password rules, notification channels, etc.
- **Reset Process**:
  - Backend deletes current settings from database
  - Inserts default values from configuration file
  - Broadcasts 'settings:reset' event to all clients
  - Clients reload settings and update UI

### 3.3 Driver Module (Phase 3: Driver Dashboard - The Publisher) - Existing Module (Preserved)
(Content remains the same as original document)\n
### 3.4 Student and Parent Module (Phase 4: Parent/Student View - The Subscriber) - Enhanced with Multi-Bus Tracking & Navigation
(Content remains the same as original document)

### 3.5 Development and Testing Tools - Preserved
(Content remains the same as original document)

## 4. Technical Architecture

### 4.1 Database Design - Enhanced Schema with Settings Tables
(All existing tables remain the same)\n
- **system_settings table - NEW**:
  - id (primary key)
  - setting_key (varchar, unique, indexed)
  - setting_value (JSON)\n  - setting_category (varchar: appearance/security/notifications/localization/files)
  - description (text)
  - version (integer, default: 1)
  - created_at (timestamp)
  - updated_at (timestamp)
- updated_by (foreign key to users.id)

- **announcements table - NEW**:
  - id (primary key)
  - title (varchar, max 100characters)
  - content (text, rich HTML)
  - banner_type (enum: info/warning/critical)
  - is_active (boolean)\n  - start_date (timestamp, nullable)
  - end_date (timestamp, nullable)
  - target_roles (JSON array: ['admin', 'driver', 'student', 'parent'])
  - is_dismissible (boolean)
  - created_by (foreign key to users.id)\n  - created_at (timestamp)
  - updated_at (timestamp)
\n- **settings_audit_log table - NEW**:
  - id (primary key)
  - admin_id (foreign key to users.id)
  - setting_key (varchar)\n  - old_value (JSON)
  - new_value (JSON)
  - action_type (enum: update/reset)\n  - ip_address (varchar)
  - user_agent (text)
  - timestamp (timestamp, indexed)

- **notification_settings table - NEW**:
  - id (primary key)
  - event_type (varchar: new_message/task_assignment/bus_arrival/trip_started/trip_completed/system_announcement)
  - email_enabled (boolean)
  - inapp_enabled (boolean)
  - push_enabled (boolean)
  - is_user_customizable (boolean)
  - created_at (timestamp)
  - updated_at (timestamp)
\n- **user_notification_preferences table - NEW**:
  - id (primary key)
  - user_id (foreign key to users.id)
  - event_type (varchar)\n  - email_enabled (boolean)
  - inapp_enabled (boolean)
  - push_enabled (boolean)\n  - created_at (timestamp)
  - updated_at (timestamp)
  - Composite unique index on (user_id, event_type)

### 4.2 Backend Technology Stack - Enhanced\n(All existing services remain the same)

- **NEW: Settings Management Service**: CRUD operations for system settings, validation, caching, and broadcasting
- **NEW: Announcement Service**: Create, update, delete, and retrieve active announcements based on schedule and target roles
- **NEW: Notification Service**: Send notifications via email, in-app, and push based on user preferences and system defaults
- **NEW: Localization Service**: Load and serve language strings, handle time zone conversions, format dates/times
- **NEW: File Upload Service**: Validate file size and type, enforce storage quotas, handle virus scanning and compression
\n### 4.3 Frontend Technology Stack - Enhanced
(All existing libraries remain the same)

#### Admin Portal - Enhanced:\n- React + Vite\n- Ant Design or Material-UI (for settings interface components)
- **NEW: React Color Picker library (react-color or @uiw/react-color)**
- **NEW: Rich Text Editor (TinyMCE or Quill)**
- **NEW: React i18next for localization**
- Redux or Context API for global settings state management
- Socket.io Client for real-time settings updates

### 4.4 Core API Endpoints - Enhanced with Settings Endpoints
(All existing endpoints remain the same)

**Admin - Settings Management:**
- GET /api/admin/settings/all: Retrieve all system settings
- GET /api/admin/settings/:category: Retrieve settings by category (appearance/security/notifications/localization/files)
- PUT /api/admin/settings/:key: Update a specific setting
- POST /api/admin/settings/reset: Reset all settings to defaults\n- POST /api/admin/settings/reset/:category: Reset specific category to defaults
- GET /api/admin/settings/audit-log: Retrieve settings change history with pagination

**Admin - Announcements:**
- GET /api/admin/announcements: List all announcements with filters (active/inactive, date range)
- POST /api/admin/announcements: Create new announcement
- PUT /api/admin/announcements/:id: Update announcement
- DELETE /api/admin/announcements/:id: Delete announcement
- GET /api/announcements/active: Get active announcements for current user (based on role and schedule)
\n**Admin - Notification Settings:**
- GET /api/admin/notification-settings: Retrieve default notification preferences for all event types
- PUT /api/admin/notification-settings/:eventType: Update default notification channels for specific event\n- PUT /api/admin/notification-settings/customization-policy: Enable/disable user customization\n\n**User - Notification Preferences:**
- GET /api/user/notification-preferences: Get user's notification preferences (or defaults if not customized)
- PUT /api/user/notification-preferences/:eventType: Update user's notification preference for specific event (only if customization allowed)
\n**Public - Settings:**
- GET /api/settings/public: Retrieve public settings (theme colors, language options, date format) for unauthenticated users
\n### 4.5 Socket.io Event Definitions - Enhanced
(All existing events remain the same)

#### Settings Events - NEW:
- admin:settings_updated: Broadcast to all clients when settings are changed (payload: { category, updatedSettings })
- admin:settings_reset: Broadcast when settings are reset to defaults (payload: { category })
- admin:announcement_published: Broadcast when new announcement is published (payload: { announcement })
- admin:announcement_dismissed: Notify when user dismisses announcement (payload: { announcementId, userId })
\n### 4.6 Settings Management Component Implementation - NEW
\n#### SettingsDashboard Component (src/components/admin/SettingsDashboard.jsx):
```typescript
interface SettingsDashboardProps {
  currentAdmin: User;
}\n
interface SystemSettings {
  appearance: {\n    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  security: {\n    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecialChars: boolean;
    twoFactorEnabled: boolean;
sessionTimeout: number;
  };\n  notifications: {
    defaultChannels: Record<string, { email: boolean; inapp: boolean; push: boolean }>;
    allowUserCustomization: boolean;
  };
  localization: {\n    defaultLanguage: string;\n    supportedLanguages: string[];
    defaultTimeZone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  files: {
    maxFileSize: number;
    allowedExtensions: string[];
    blockedExtensions: string[];
perUserStorageLimit: number;
};
}
```

#### ColorPickerSection Component (src/components/admin/settings/ColorPickerSection.jsx):
```typescript
interface ColorPickerSectionProps {\n  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  onColorChange: (colorType: 'primary' | 'secondary' | 'accent', color: string) => void;
  onSave: () => void;
  onReset: () => void;
}\n```

#### AnnouncementEditor Component (src/components/admin/settings/AnnouncementEditor.jsx):
```typescript
interface Announcement {
  id?: string;
  title: string;\n  content: string;
  bannerType: 'info' | 'warning' | 'critical';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  targetRoles: string[];
  isDismissible: boolean;
}\n\ninterface AnnouncementEditorProps {
  announcement?: Announcement;
  onSave: (announcement: Announcement) => void;
  onCancel: () => void;
}\n```

#### SecuritySettingsPanel Component (src/components/admin/settings/SecuritySettingsPanel.jsx):
```typescript
interface SecuritySettingsPanelProps {
  settings: SystemSettings['security'];
  onUpdate: (settings: SystemSettings['security']) => void;
  onReset: () => void;
}\n```

## 5. Real-time Tracking Implementation - Enhanced
(All existing sections remain the same)

### 5.5 Settings Synchronization - NEW
- Admin updates settings via settings dashboard
- Backend validates and saves settings to database
- Backend broadcasts 'admin:settings_updated' event via Socket.io to all connected clients
- All clients (admin, driver, student, parent) receive event and update local settings state
- Frontend applies new settings immediately:\n  - Theme colors: Update CSS variables
  - Language: Reload i18n strings
  - Notification preferences: Update notification service configuration
  - Session timeout: Reset idle timer
- No page refresh required for settings to take effect

## 6. Development Phase Planning - Updated with Settings Module Phase\n(All existing phases remain the same)

### Phase 15: Centralized Settings Management Module (Priority: High, Complexity: Medium) - NEW
- **Implement Database Schema**:
  - Create system_settings, announcements, settings_audit_log, notification_settings, user_notification_preferences tables
  - Set up indexes and foreign key constraints
  - Create default settings seed data
- **Develop Backend Settings Service**:
  - CRUD API endpoints for settings management
  - Validation logic for all setting types
  - Redis caching layer for settings
  - Audit logging for all setting changes
- **Build Settings Dashboard UI**:
  - Sidebar navigation with categorized sections
  - Color picker interface for theme customization
  - Rich text editor for announcements
  - Form inputs for security, notification, localization, and file settings
  - Save, reset, and cancel buttons with confirmation dialogs
- **Implement Real-Time Settings Distribution**:
  - Socket.io events for settings updates
  - Frontend global state management for settings
  - Dynamic CSS variable updates for theme colors
  - i18n integration for language switching
- **Develop Announcement System**:
  - Announcement editor with scheduling and targeting
  - Banner display component for all user interfaces
  - Dismissible banner logic with user tracking
- **Implement Notification Preferences**:
  - Default notification settings for all event types
  - User customization interface (if allowed)
  - Backend notification service integration
- **Build File Upload Validation**:
  - File size and type validation on upload
  - Storage quota enforcement
  - Error messages with configured limits
- **Testing**:
  - Test all settings CRUD operations
  - Verify real-time settings updates across all clients
  - Test theme color changes apply immediately
  - Test announcement scheduling and targeting
  - Test password complexity enforcement
  - Test 2FA requirement enforcement
  - Test notification channel preferences
  - Test file upload restrictions
  - Test reset to defaults functionality
  - Test audit log accuracy
  - Verify settings persist after system restart

## 7. Testing and Deployment Process - Enhanced
(All existing sections remain the same)

### 7.1 Development Testing Process - Enhanced
(All existing test steps remain the same with additions)

25. **Test Settings Management Module (NEW)**:
    - Log in as super admin
    - Navigate to Settings dashboard
    - Test color picker: Change primary, secondary, and accent colors
    - Verify live preview updates in real-time
    - Save color changes and verify application-wide theme update
    - Open another browser/device and verify theme changes applied
    - Test announcement creation with rich text editor
    - Set announcement schedule and target roles
    - Verify announcement displays for targeted users only
    - Test announcement dismissal functionality
    - Update password complexity requirements
    - Create new user and verify password validation enforces new rules
    - Enable 2FA requirement and verify users are prompted to set up 2FA
    - Change session timeout and verify auto-logout after configured time
    - Update default notification channels for an event type
    - Verify notifications are sent via configured channels
    - Test user notification customization (if allowed)
    - Change default language and verify UI language updates
    - Change date/time format and verify display format updates
    - Update file upload limits and verify file validation enforces new limits
    - Test reset to defaults for each settings section
    - Test global reset to defaults with confirmation
    - Verify audit log records all setting changes with correct details

### 7.2 Key Verification Points - Enhanced
(All existing verification points remain the same with additions)

- **Settings Management Verification (NEW)**:
  - All settings save correctly to database
  - Settings persist after system restart
  - Real-time settings updates work across all connected clients
  - Theme color changes apply immediately without page refresh
  - Announcements display correctly based on schedule and target roles
  - Password complexity rules are enforced on user registration and password change
  - 2FA requirement is enforced during login
  - Session timeout works correctly with auto-logout
  - Notification preferences control notification delivery channels
  - Language and date/time format changes apply correctly
  - File upload validation enforces configured limits
  - Reset to defaults restores correct default values
  - Audit log accurately records all setting changes
  - Settings interface is user-friendly and well-documented

### 7.3 Deployment Checklist - Enhanced
(All existing checklist items remain the same with additions)

- **Settings Module Deployment (NEW)**:
  - Run database migrations to create settings tables
  - Seed default settings data
  - Configure Redis cache for settings
  - Set up SMTP server for email notifications (if not already configured)
  - Configure FCM server key for push notifications (if not already configured)
  - Test settings API endpoints in production\n  - Verify Socket.io settings events work in production
  - Test theme color changes in production environment
  - Test announcement display in production\n  - Verify password complexity enforcement in production
  - Test 2FA requirement in production
  - Verify file upload validation in production
  - Set up monitoring for settings service errors
  - Configure backup for system_settings table
\n## 8. Security and Performance - Enhanced
(All existing security measures remain the same with additions)

- **Settings Module Security (NEW)**:
  - Restrict settings management access to super admin role only
  - Validate all setting values on backend before saving
  - Sanitize rich text content in announcements to prevent XSS attacks
  - Encrypt sensitive settings (SMTP password, API keys) in database
  - Rate limit settings API endpoints to prevent abuse
  - Log all settings changes with admin ID and IP address for audit trail
  - Require confirmation for destructive actions (reset to defaults)\n\n- **Settings Performance Optimization (NEW)**:
  - Cache frequently accessed settings in Redis with5-minute TTL
  - Use Socket.io for real-time settings distribution instead of polling
  - Lazy load settings sections in admin dashboard
  - Optimize database queries with indexes on setting_key and setting_category
  - Compress announcement content before storing in database
  - Use CDN for serving theme CSS files with dynamic variables
\n## 9. Website Design Style - Enhanced
(All existing design elements remain the same with additions)
\n- **Settings Dashboard Design**:
  - **Layout**: Sidebar navigation on left (collapsible on mobile), main content area on right
  - **Color Scheme**: Dark background (#1a1a1a) with neon green accents (#10b981) for active items
  - **Typography**: Clear section headers (24px bold), setting labels (14px medium), help text (12px regular)
  - **Form Elements**: \n    - Input fields: Dark background with light border, neon green focus state
    - Buttons: Primary (neon green), Secondary (gray), Danger (red)\n    - Toggles: Neon green when enabled, gray when disabled
    - Color pickers: Inline preview swatch with hex code input
  - **Cards**: Each settings section in a card with subtle shadow and rounded corners (8px)
  - **Spacing**: Consistent padding (16px) and margins (24px between sections)
  - **Icons**: Use Feather Icons or Heroicons for settings categories
  - **Responsive**: Mobile-friendly with stacked layout and bottom navigation

- **Announcement Banner Design**:
  - **Info Banner**: Blue background (#3b82f6) with info icon, white text\n  - **Warning Banner**: Yellow background (#f59e0b) with warning icon, dark text
  - **Critical Banner**: Red background (#ef4444) with alert icon, white text
  - **Position**: Fixed at top of page, full width, z-index above other content
  - **Dismissible**: Close button (X) on right side if configured as dismissible
  - **Animation**: Slide down from top on display, fade out on dismiss

## 10. Admin Module Audit & Enhancement Summary
(Content remains the same as original document)

## 11. New Features Summary
\n### 11.1 Multi-Bus Route Tracking for Students
(Content remains the same as original document)

### 11.2 Navigation Assistance\n(Content remains the same as original document)

### 11.3 Missed Bus Detection
(Content remains the same as original document)

### 11.4 Optimized Hourly Analytics
(Content remains the same as original document)

### 11.5 Centralized Settings Management Module - NEW
- **UI Theme & Color Customization**: Administrators can select primary, secondary, and accent colors that apply application-wide for all users immediately
- **System-Wide Announcements**: Rich text editor for creating scheduled announcements with role-based targeting and dismissible banners
- **Privacy & Security Settings**: Configure password complexity, enable 2FA for all users, set session timeout duration
- **Notification Preferences**: Define default notification channels for system events with option to allow user customization
- **Localization Settings**: Set default language, time zone, and date/time format for entire application
- **File Upload Limits**: Configure maximum file size, permitted file types, and storage quotas\n- **Real-Time Settings Distribution**: All setting changes broadcast to connected clients via Socket.io for immediate application\n- **Reset to Defaults**: Functionality to reset all settings or specific categories to factory defaults
- **Audit Trail**: Complete logging of all setting changes with admin ID, timestamp, and old/new values
- **User-Friendly Interface**: Logically grouped settings with clear documentation and confirmation dialogs for critical actions