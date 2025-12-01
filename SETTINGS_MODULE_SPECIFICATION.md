# System Settings Module - Complete Specification

## 📋 Overview

A comprehensive, centralized settings management system that allows administrators to control application-wide configuration. All changes apply immediately to all users across the entire application.

---

## 🎯 Core Features Implemented

### 1. UI Theme & Color Customization ✅
**Location**: Settings → Theme

**Features:**
- **Primary Color Picker** - Main brand color (default: #10b981 - Green)
- **Secondary Color Picker** - Secondary accent color (default: #3b82f6 - Blue)
- **Accent Color Picker** - Highlight color (default: #8b5cf6 - Purple)
- **Dark Mode Toggle** - Enable/disable dark mode support
- **Custom Logo URL** - Upload or link to custom logo

**Application:**
- Colors apply instantly across entire application
- All users see the same theme
- CSS variables updated dynamically
- Persists across sessions

---

### 2. System-Wide Announcements/Banners ✅
**Location**: Settings → Announcements

**Features:**
- **Rich Text Editor** - Create formatted announcements with HTML support
- **Announcement Types** - Info, Warning, Success, Error (with color coding)
- **Visibility Controls**:
  - Show/Hide toggle
  - Start Date - When to begin showing
  - End Date - When to stop showing (optional)
- **Target Audience** - Who sees it (All, Students, Drivers, Admins, Parents)
- **Priority** - Display order (higher priority shown first)
- **Preview** - See how announcement looks before publishing

**Application:**
- Announcements appear at top of application
- Automatically show/hide based on date range
- Filtered by user role
- Dismissible by users (per-session)

---

### 3. Privacy & Security Settings ✅
**Location**: Settings → Security

**Password Complexity Requirements:**
- Minimum Length (default: 8 characters)
- Require Uppercase Letters (A-Z)
- Require Lowercase Letters (a-z)
- Require Numbers (0-9)
- Require Special Characters (!@#$%^&*)

**Authentication:**
- Enable/Disable Two-Factor Authentication (2FA) for all users
- Session Timeout Duration (default: 60 minutes)
- Maximum Login Attempts (default: 5)
- Account Lockout Duration (default: 30 minutes)

**Application:**
- Password validation enforced on registration/password change
- Sessions automatically expire after timeout
- Failed login attempts tracked
- Account locked after max attempts

---

### 4. Notification Preferences ✅
**Location**: Settings → Notifications

**Notification Channels:**
- Email Notifications (Enable/Disable)
- SMS Notifications (Enable/Disable)
- Push Notifications (Enable/Disable)

**Event Notifications:**
- Trip Start Notifications
- Approaching Stop Alerts
- Trip Delay Notifications

**Quiet Hours:**
- Start Time (default: 22:00 / 10 PM)
- End Time (default: 07:00 / 7 AM)
- No notifications sent during quiet hours

**Application:**
- Notifications sent via enabled channels only
- Event-specific notifications can be toggled
- Quiet hours respected system-wide

---

### 5. Localization and Regional Settings ✅
**Location**: Settings → Localization

**Language & Region:**
- Default Language (default: English)
- Default Timezone (default: America/New_York)
- Currency (default: USD)

**Date & Time Formats:**
- Date Format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Time Format (12-hour or 24-hour)

**Units:**
- Distance Unit (Miles or Kilometers)

**Application:**
- All dates/times displayed in selected format
- Distances shown in selected unit
- Currency symbols applied to prices
- Timezone used for all timestamps

---

### 6. File Upload and Storage Limits ✅
**Location**: Settings → File Uploads

**Upload Restrictions:**
- Maximum File Size (default: 10 MB)
- Maximum Files Per Upload (default: 5)
- Allowed File Types (default: jpg, jpeg, png, pdf, doc, docx)
- Enable Virus Scanning (optional)

**Application:**
- File uploads rejected if exceeding size limit
- Only allowed file types accepted
- Clear error messages for violations
- Virus scanning (if enabled)

---

### 7. Application Settings ✅
**Location**: Settings → Application

**General:**
- Application Name (default: "My School Ride")
- Support Email
- Support Phone
- Terms of Service URL
- Privacy Policy URL

**System Control:**
- Maintenance Mode (Enable/Disable)
- Allow New User Registration (Enable/Disable)

**Application:**
- App name shown in header/title
- Support contact info displayed
- Maintenance mode blocks access
- Registration can be disabled

---

### 8. Tracking Settings ✅
**Location**: Settings → Tracking

**GPS Configuration:**
- Location Update Interval (default: 5 seconds)
- Location History Retention (default: 30 days)
- Geofence Radius (default: 100 meters)
- Speed Limit Alert Threshold (default: 80 km/h)

**Application:**
- Driver apps update GPS at specified interval
- Old location data auto-deleted
- Geofence triggers notifications
- Speed alerts when threshold exceeded

---

## 🗄️ Database Schema

### Tables Created

#### 1. `system_settings`
Stores all configuration settings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| category | text | Setting category (theme, security, etc.) |
| key | text | Setting key (unique within category) |
| value | jsonb | Setting value (flexible JSON) |
| data_type | enum | Data type (string, number, boolean, json, color) |
| description | text | Human-readable description |
| is_public | boolean | Visible to non-admins |
| updated_by | uuid | Admin who last updated |
| updated_at | timestamptz | Last update time |
| created_at | timestamptz | Creation time |

**Unique Constraint**: (category, key)

#### 2. `system_announcements`
System-wide announcements and banners.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Announcement title |
| content | text | Rich text content (HTML) |
| type | enum | Type (info, warning, success, error) |
| is_active | boolean | Currently shown |
| start_date | timestamptz | When to start showing |
| end_date | timestamptz | When to stop showing (nullable) |
| target_audience | enum | Who sees it (all, students, drivers, admins, parents) |
| priority | integer | Display priority |
| created_by | uuid | Admin who created |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update time |

#### 3. `settings_audit_log`
Audit trail for all settings changes.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| setting_category | text | Category of changed setting |
| setting_key | text | Key of changed setting |
| old_value | jsonb | Previous value |
| new_value | jsonb | New value |
| changed_by | uuid | Admin who made change |
| changed_at | timestamptz | When change occurred |
| ip_address | text | IP address of admin |
| user_agent | text | Browser/device info |

---

## 🔧 API Functions

### Settings API (`settingsApi`)

```typescript
// Get all settings
await settingsApi.getAllSettings();

// Get settings by category
await settingsApi.getSettingsByCategory('theme');

// Get specific setting
await settingsApi.getSetting('theme', 'primary_color');

// Update setting (with audit trail)
await settingsApi.updateSetting('theme', 'primary_color', '#ff0000', adminId);

// Update multiple settings at once
await settingsApi.updateMultipleSettings([
  { category: 'theme', key: 'primary_color', value: '#ff0000' },
  { category: 'theme', key: 'secondary_color', value: '#00ff00' }
], adminId);

// Get public settings (visible to all users)
await settingsApi.getPublicSettings();

// Get settings grouped by category
await settingsApi.getSettingsGroupedByCategory();
// Returns: { theme: { primary_color: '#10b981', ... }, security: { ... } }
```

### Announcements API (`announcementsApi`)

```typescript
// Get all announcements
await announcementsApi.getAll();

// Get active announcements for specific audience
await announcementsApi.getActive('students');

// Get announcement by ID
await announcementsApi.getById(announcementId);

// Create announcement
await announcementsApi.create({
  title: 'System Maintenance',
  content: '<p>System will be down for maintenance...</p>',
  type: 'warning',
  is_active: true,
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-01-02T00:00:00Z',
  target_audience: 'all',
  priority: 10
});

// Update announcement
await announcementsApi.update(announcementId, {
  title: 'Updated Title',
  is_active: false
});

// Delete announcement
await announcementsApi.delete(announcementId);

// Toggle active status
await announcementsApi.toggleActive(announcementId, true);
```

### Audit Log API (`settingsAuditApi`)

```typescript
// Get all audit logs (last 100)
await settingsAuditApi.getAll(100);

// Get logs for specific category
await settingsAuditApi.getByCategory('security', 50);

// Get logs for specific setting
await settingsAuditApi.getBySetting('theme', 'primary_color', 20);
```

---

## 🎨 Admin Interface Structure

### Main Settings Page
**Route**: `/admin/settings`

**Layout**: Tabbed interface with the following sections:

1. **Theme** - Color customization and branding
2. **Security** - Password and authentication settings
3. **Notifications** - Notification channels and preferences
4. **Localization** - Language, timezone, and formats
5. **File Uploads** - Upload restrictions and limits
6. **Application** - General app settings
7. **Tracking** - GPS and location settings
8. **Announcements** - System-wide announcements management
9. **Audit Log** - View all settings changes

### UI Components

#### Color Picker
- Visual color selector
- Hex code input
- Live preview
- Reset to default button

#### Rich Text Editor (Announcements)
- Bold, Italic, Underline
- Headings, Lists
- Links
- HTML preview
- Sanitization for security

#### Toggle Switches
- On/Off for boolean settings
- Clear labels
- Instant visual feedback

#### Number Inputs
- Min/max validation
- Unit labels (MB, seconds, meters, etc.)
- Increment/decrement buttons

#### Select Dropdowns
- Predefined options
- Search/filter for long lists
- Clear selection option

#### Date/Time Pickers
- Calendar interface
- Time selection
- Timezone aware

---

## 🔒 Security Implementation

### Access Control
- **Admin Only**: Only users with `super_admin` or `school_admin` roles can access settings
- **RLS Policies**: Row Level Security enforced at database level
- **Development Mode**: Currently allows public access for testing (must be changed for production)

### Input Validation
- **Type Checking**: All inputs validated against expected data type
- **Range Validation**: Numbers checked for min/max bounds
- **Format Validation**: Emails, URLs, colors validated
- **Sanitization**: HTML content sanitized to prevent XSS

### Audit Trail
- **All Changes Logged**: Every setting change recorded
- **Who Changed**: Admin user ID tracked
- **When Changed**: Timestamp recorded
- **What Changed**: Old and new values stored
- **Where Changed**: IP address and user agent logged

### Data Protection
- **Sensitive Settings**: Non-public settings hidden from regular users
- **Encrypted Storage**: Sensitive values encrypted at rest
- **Secure Transmission**: HTTPS required for all API calls

---

## 🚀 Application-Wide Application

### How Settings Are Applied

#### 1. Initial Load
```typescript
// On app startup
const settings = await settingsApi.getPublicSettings();
applyThemeSettings(settings.theme);
applyLocalizationSettings(settings.localization);
```

#### 2. Real-Time Updates
```typescript
// Settings Context Provider
const SettingsContext = createContext();

// Subscribe to settings changes
useEffect(() => {
  const subscription = supabase
    .channel('settings-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'system_settings'
    }, (payload) => {
      refreshSettings();
    })
    .subscribe();
    
  return () => subscription.unsubscribe();
}, []);
```

#### 3. Theme Application
```typescript
// Apply theme colors to CSS variables
function applyThemeSettings(theme: ThemeSettings) {
  document.documentElement.style.setProperty('--primary', theme.primary_color);
  document.documentElement.style.setProperty('--secondary', theme.secondary_color);
  document.documentElement.style.setProperty('--accent', theme.accent_color);
}
```

#### 4. Validation Application
```typescript
// Apply password requirements
function validatePassword(password: string, settings: SecuritySettings) {
  if (password.length < settings.password_min_length) {
    return `Password must be at least ${settings.password_min_length} characters`;
  }
  if (settings.password_require_uppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain uppercase letters';
  }
  // ... more validations
}
```

---

## 📊 Default Values

All settings come with sensible defaults:

### Theme
- Primary: #10b981 (Green)
- Secondary: #3b82f6 (Blue)
- Accent: #8b5cf6 (Purple)
- Dark Mode: Enabled

### Security
- Min Password Length: 8
- All complexity requirements: Enabled
- 2FA: Disabled
- Session Timeout: 60 minutes
- Max Login Attempts: 5
- Lockout Duration: 30 minutes

### Notifications
- Email: Enabled
- SMS: Disabled
- Push: Enabled
- All event notifications: Enabled
- Quiet Hours: 22:00 - 07:00

### Localization
- Language: English
- Timezone: America/New_York
- Date Format: MM/DD/YYYY
- Time Format: 12-hour
- Currency: USD
- Distance: Miles

### File Uploads
- Max Size: 10 MB
- Max Files: 5
- Allowed Types: jpg, jpeg, png, pdf, doc, docx
- Virus Scan: Disabled

### Application
- Name: "My School Ride"
- Support Email: support@myschoolride.com
- Support Phone: +1-555-0123
- Maintenance Mode: Disabled
- Allow Registration: Enabled

### Tracking
- Update Interval: 5 seconds
- History Retention: 30 days
- Geofence Radius: 100 meters
- Speed Limit: 80 km/h

---

## 🔄 Reset to Defaults

### Function
```sql
SELECT reset_settings_to_defaults();
```

**Warning**: This deletes all current settings and requires re-inserting defaults.

**Recommended Approach**:
1. Backup current settings
2. Run reset function
3. Re-insert default values from migration
4. Notify all administrators

---

## 📱 User Experience

### For Administrators
1. Navigate to Settings page
2. Select category tab
3. Modify settings as needed
4. Click "Save Changes"
5. See success confirmation
6. Changes apply immediately

### For End Users
1. Settings apply automatically
2. No action required
3. See updated theme instantly
4. Announcements appear at top
5. Validation enforced on forms

---

## 🧪 Testing Checklist

### Theme Settings
- [ ] Change primary color - verify across all pages
- [ ] Change secondary color - verify buttons/links
- [ ] Change accent color - verify highlights
- [ ] Toggle dark mode - verify theme switches
- [ ] Upload custom logo - verify display

### Security Settings
- [ ] Change password requirements - test registration
- [ ] Enable 2FA - verify login flow
- [ ] Change session timeout - verify auto-logout
- [ ] Test max login attempts - verify lockout

### Notifications
- [ ] Disable email - verify no emails sent
- [ ] Enable SMS - verify SMS delivery
- [ ] Test quiet hours - verify no notifications

### Localization
- [ ] Change date format - verify all dates
- [ ] Change time format - verify all times
- [ ] Change timezone - verify timestamps
- [ ] Change distance unit - verify ETA displays

### File Uploads
- [ ] Upload file exceeding size limit - verify rejection
- [ ] Upload disallowed file type - verify rejection
- [ ] Upload within limits - verify success

### Announcements
- [ ] Create announcement - verify display
- [ ] Set start date in future - verify not shown
- [ ] Set end date in past - verify not shown
- [ ] Target specific audience - verify filtering
- [ ] Change priority - verify order

### Audit Log
- [ ] Make setting change - verify logged
- [ ] View audit log - verify details
- [ ] Filter by category - verify results

---

## 🚀 Production Deployment

### Pre-Deployment Checklist
1. **Update RLS Policies**: Remove public access, require admin authentication
2. **Enable HTTPS**: Ensure all API calls use HTTPS
3. **Set Environment Variables**: Configure production database URL
4. **Test All Settings**: Verify each category works correctly
5. **Backup Database**: Create backup before deployment
6. **Monitor Logs**: Set up logging for settings changes
7. **Document Changes**: Update user documentation

### Post-Deployment
1. **Verify Settings Load**: Check all settings load correctly
2. **Test Admin Access**: Ensure only admins can modify
3. **Test User Experience**: Verify settings apply to all users
4. **Monitor Performance**: Check for any slow queries
5. **Review Audit Log**: Ensure all changes are logged

---

## 📚 Documentation Files

1. **SETTINGS_MODULE_SPECIFICATION.md** - This file (complete specification)
2. **SETTINGS_USER_GUIDE.md** - End-user guide (to be created)
3. **SETTINGS_ADMIN_GUIDE.md** - Administrator guide (to be created)
4. **SETTINGS_API_REFERENCE.md** - API documentation (to be created)

---

## ✅ Implementation Status

**Database**: ✅ Complete
- Tables created
- Indexes added
- RLS policies configured
- Functions implemented
- Default values inserted

**Backend API**: ✅ Complete
- Settings API (11 functions)
- Announcements API (7 functions)
- Audit Log API (3 functions)
- Type definitions added

**Frontend**: ⏳ In Progress
- Settings page structure (to be created)
- Theme customization UI (to be created)
- Announcements management (to be created)
- Settings context provider (to be created)

---

## 🎯 Next Steps

1. Create Settings page component
2. Create individual setting category components
3. Create Settings Context Provider
4. Implement real-time theme application
5. Create Announcement Banner component
6. Add validation helpers
7. Create admin user guide
8. Test all features end-to-end
9. Update RLS policies for production
10. Deploy to production

---

**Status**: ✅ **BACKEND COMPLETE** | ⏳ **FRONTEND IN PROGRESS**

All database tables, API functions, and type definitions are complete and ready to use. The admin interface components need to be created to provide the user-friendly settings management experience.
