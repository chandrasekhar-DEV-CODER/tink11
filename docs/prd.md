# My School Ride MVP System Specification

## 1. Website Name
My School Ride - School Bus Tracking Management System (MVP Version)

## 2. Website Description
A comprehensive school bus management platform providing unified login portal supporting four user roles: administrators, drivers, students, and parents. Core capabilities include: complete vehicle, driver, student, and parent management by administrators; real-time GPS location reporting by drivers; live bus tracking for students and parents; push notification alerts; and visual route management.

## 3. Core Functional Modules

### 3.1 Unified Login System
- **Unified Login Portal**: All user types (administrators, drivers, students, parents) access the system through a single login page
- **Role Selection Mechanism**: Login page provides dropdown menu or button group for users to select their role before entering credentials
- **Role Verification**: System validates username and password against the corresponding database table based on selected role
- **Admin-Specific Route**: Accessing `/adminherelogin` automatically redirects to login page with admin role pre-selected
- **Pre-configured Super Admin Account**:
  - Username: `chandrasekharadmin`
  - Password: `chandrasekharadmin1023@@`
- JWT authentication and session management

### 3.2 Administrator Module (Phase 1: Operational Data Management)
\n#### 3.2.1 Vehicle Management (CRUD)\n- **Add Vehicle**: Vehicle ID, license plate, model, capacity, route name (e.g., 'Route 4- North Campus')
- **View Vehicle List**: Display using shadcn/ui Data Tables component with search and filter capabilities
- **Edit Vehicle Information**: Implement seamless editing via Dialog/Sheet components
- **Deactivate/Delete Vehicle Records**\n- **Route Assignment**: Assign text-based route names to each vehicle (MVP simplified approach)
\n#### 3.2.2 Driver Management (CRUD)
- **Add Driver**: Name, contact information, license number, assigned vehicle (vehicle_id association)
- **View Driver List**: Display using shadcn/ui Data Tables component\n- **Edit Driver Information**: Implement via Dialog/Sheet components
- **Deactivate/Delete Driver Accounts**
- **Vehicle Association**: Must specify vehicle_id when creating driver to establish relationship link

#### 3.2.3 Student Management (CRUD) - Enhanced
- **Add Student Feature**:
  - **Student Information Form**: Capture all necessary student details including:\n    - Full name
    - Student ID number
    - Grade level
    - Pickup/drop-off point coordinates
    - Emergency contact information
  - **Automatic Student Account Generation**:\n    - System automatically generates a unique username for the student (format: `student_[studentID]` or custom pattern)
    - System automatically generates a secure random password for the student account
    - Display generated credentials to admin immediately after creation (with copy-to-clipboard functionality)
    - Store credentials securely in the `students` table with proper encryption
  - **Linked Parent Profile Creation**:
    - During student addition process, capture parent/guardian details:\n      - Parent/guardian full name
      - Contact phone number
      - Email address
      - Relationship to student (father/mother/guardian)
      - Secondary contact (optional)
    - System automatically generates a unique username for the parent account (format: `parent_[studentID]` or custom pattern)
    - System automatically generates a secure random password for the parent account
    - Automatically link parent account to the newly created student record via foreign key relationship
    - Display both student and parent credentials to admin after successful creation
    - Store parent credentials securely in the `parents` table\n  - **Data Integrity Enforcement**:
    - Parent account creation is mandatory when adding a student (cannot create student without parent)
    - System validates that parent account remains linked to at least one active student
    - Prevent orphaned parent accounts through database constraints
- **View Student List**: Display using shadcn/ui Data Tables component with associated parent information
- **Edit Student Information**: Update student details and modify parent associations if needed
- **Deactivate/Delete Student Records**: \n  - When deactivating a student, system prompts admin to handle associated parent account
  - Option to deactivate parent if no other students are linked\n  - Maintain data integrity through cascading rules
\n#### 3.2.4 Parent Management (CRUD) - Enhanced
- **View Parent List**: Display using shadcn/ui Data Tables component showing:\n  - Parent name and contact details
  - Associated student(s)\n  - Account status (active/inactive)
  - Login credentials (masked, with reveal option for admin)
- **Edit Parent Information**: Update contact details and modify student associations\n- **Deactivate/Delete Parent Accounts**:\n  - System prevents deletion if parent has active linked students
  - Provide warning and require confirmation before deactivation
- **Manual Parent Addition** (Optional):
  - Allow admin to manually add parent accounts for special cases
  - Require linking to at least one existing student during creation
  - Follow same automatic credential generation process

#### 3.2.5 Route and Stop Management (CRUD)
- **Route Drawing Tool**: Use mapbox-gl-draw plugin to create routes by clicking on the map
- **Stop Marking**: Mark pickup/drop-off stop coordinates along the route
- **Route Saving**: Store routes as polyline string format\n- **Route Editing**: Support modification of existing routes and stop locations
- **Route Assignment**: Associate routes with specific vehicles\n- **Admin-Exclusive Route Configuration**: All route definitions and modifications must be performed exclusively through the admin dashboard interface

#### 3.2.6 Real-time Monitoring Map
- **Global Vehicle View**: Display real-time locations of all online vehicles on the admin dashboard map
- **Vehicle Status Indicators**: Differentiate vehicle states (moving/stopped/offline) using distinct colors or icons
- **Vehicle Details View**: Click map markers to view detailed vehicle information\n- **Real-time Data Updates**: Receive vehicle location updates via Socket.io and refresh map display
\n#### 3.2.7 Role-Based Access Control (RBAC) - Enhanced
- **Supabase RLS (Row Level Security) Policies**:
  - **Administrator Role**:
    - Full CRUD permissions on all tables (vehicles, drivers, students, parents, routes)
    - Exclusive access to user account creation and credential generation
    - Exclusive access to route configuration and management
    - Ability to view and manage all system data
  - **Driver Role**:
    - READ-only access to assigned vehicle information
    - READ-only access to assigned route information
    - UPDATE permission only for own GPS location data
    - No access to student/parent personal information
  - **Student Role**:
    - READ-only access to own profile information
    - READ-only access to assigned bus location
    - No access to other students' data
  - **Parent Role**:
    - READ-only access to linked student(s) information
    - READ-only access to assigned bus location for linked students
    - No access to other families' data
- **Data Integrity Enforcement**:
  - Database-level foreign key constraints ensure parent accounts cannot exist without linked students
  - Cascading rules prevent orphaned records
  - Transaction-based operations ensure atomic creation of student-parent pairs
- **Administrative Privilege Segregation**:
  - All user account management functions accessible only through admin dashboard
  - No direct database access required for routine operations
  - Audit logging for all administrative actions (user creation, modifications, deletions)

### 3.3 Driver Module (Phase 3: Driver Dashboard - The Publisher)

#### 3.3.1 Driver Control Panel (Web Version)
- **Status Display**: Show current online/offline status\n- **Trip Control Buttons**:
  - START TRIP: Begin tracking, button in emerald green (#10b981)
  - STOP TRIP: Stop tracking, button in red (#ef4444)
  - Button styling: Large size (py-6 text-2xl), rounded design with shadow effects
- **Real-time Location Display**: Show current latitude/longitude coordinates (4 decimal places)
- **Vehicle Information Display**: Show assigned vehicle information and current task\n- **Speed and Direction Display**: Show current driving speed and heading
\n#### 3.3.2 Real-time Tracking Functionality
- **GPS Data Collection**:
  - Use `navigator.geolocation.watchPosition` API (preferred over getCurrentPosition)
  - Collected data: latitude, longitude, heading, speed\n  - Configuration parameters: enableHighAccuracy: true, timeout: 5000, maximumAge: 0
- **Data Throttling Mechanism**: Update database every 5-10 seconds (avoid excessive writes)
- **Location Data Upload**: Send real-time data to backend via Socket.io
- **Background Persistence**: Maintain location updates even when app is in background

#### 3.3.3 GPS Reporting Logic (Socket.io Implementation)
- Driver client sends location data via `socket.emit('driver:ping', payload)`
- Payload includes: busId, lat, lng, speed, heading, timestamp
- Backend receives and broadcasts to all clients subscribed to that vehicle
\n### 3.4 Student and Parent Module (Phase 4: Parent/Student View - The Subscriber)

#### 3.4.1 Real-time Map Tracking (Phase 2: Map Integration)
- **Map Engine**: React-Leaflet + CartoDB Dark Matter Tiles
- **Visual Style**: Cyber-dark theme with neon green markers\n- **Core Features**:
  - Automatically load map interface after login
  - Display real-time location of bus assigned to the student
  - Vehicle markers use neon green pulse animation effect
  - Vehicle markers automatically move with GPS data updates
  - Display vehicle movement trajectory\n  - Smooth animation transitions: Use CSS transitions to interpolate between coordinate points for sliding effect instead of teleportation
  - Display pulse animation when vehicle is moving (triggered when speed > 0)

#### 3.4.2 Location Information Display
- Student pickup/drop-off point markers
- Distance between current bus location and pickup point
- Estimated Time of Arrival (ETA)
- Automatic map refresh mechanism (via Socket.io real-time subscription)

#### 3.4.3 Real-time Data Subscription
- Subscribe to vehicle location updates using Socket.io
- Filter relevant vehicle data by busId
- No manual page refresh needed, data automatically pushed\n- Use hashmap data structure for efficient multi-vehicle state management: `{ busId: { lat, lng, speed, heading } }`

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
### 3.5 Development and Testing Tools
\n#### 3.5.1 GPS Simulator (simulateBus.js)
- **Purpose**: Simulate bus traveling along preset routes for development testing
- **Execution**: `node scripts/simulateBus.js <busId>`
- **Features**:
  - Connect to backend via Socket.io client
  - Simulate driver authentication process
  - Send GPS coordinates in loop following preset route array
  - Send location updates every 3seconds
  - Include simulated speed (45km/h) and heading (90 degrees) data
- **Route Configuration**: Support custom MOCK_ROUTE array or polyline decoder

## 4. Technical Architecture

### 4.1 Database Design - Enhanced Schema
- **Independent User Table Structure**:
  - `admins` table: Administrator account information
  - `drivers` table: Driver accounts and detailed information (includes vehicle_id foreign key, fcmToken field)
  - `students` table: Student profiles, pickup point coordinates, **auto-generated username and password fields**
  - `parents` table: Parent accounts and linked students (includes fcmToken field), **auto-generated username and password fields, student_id foreign key with NOT NULL constraint**
  - `vehicles` table: Vehicle information, assignment status, route name\n  - `routes` table: Route information (polyline string, stop coordinate arrays)
  - `gps_logs` table: Driver real-time location records (driver_id, vehicle_id, latitude, longitude, heading, speed, timestamp)
  - `audit_logs` table (new): Administrative action logging (admin_id, action_type, target_table, target_id, timestamp, details)

- **Database Constraints**:
  - Foreign key constraint: `parents.student_id` references `students.id` with ON DELETE RESTRICT
  - Unique constraint on auto-generated usernames\n  - Check constraint ensuring parent accounts have at least one linked student
\n### 4.2 Backend Technology Stack
- Supabase (replacing traditional Node.js + MongoDB approach)
- Supabase Auth (JWT authentication)
- Socket.io (WebSocket real-time communication, replacing Supabase Realtime)
- RESTful API auto-generation\n- Row Level Security (RLS) permission control
- GeofenceService (geofencing distance calculation service)
- Push Notification Service (push notification service, integrated with FCM)
- **Credential Generation Service**: Secure random username/password generator with configurable patterns
- **Audit Logging Service**: Track all administrative actions for compliance and security

### 4.3 Frontend Technology Stack
\n#### Admin Dashboard:\n- React (Vite build)\n- Tailwind CSS\n- shadcn/ui component library (Data Tables, Dialog, Sheet, Toast)
- Socket.io Client (real-time communication)
- react-map-gl or React-Leaflet (map components)
- mapbox-gl-draw (route drawing plugin)
- **Enhanced Student/Parent Management UI**:
  - Multi-step form wizard for student addition with parent details
  - Credential display modal with copy-to-clipboard functionality
  - Parent-student relationship visualization
  - Bulk import capability (optional future enhancement)

#### Driver Portal (Web Version):
- React (Vite build)
- Tailwind CSS
- Socket.io Client\n- Geolocation API (browser native)
- Responsive design supporting mobile browser access
\n#### Student/Parent Portal (Mobile):
- React Native + Expo\n- expo-notifications (push notifications)
- React-Leaflet or react-native-maps\n- Socket.io Client
- Geolocation API
\n#### Map Component Dependencies:
```bash\nnpm install leaflet react-leaflet\nnpm install -D @types/leaflet\nnpm install mapbox-gl @mapbox/mapbox-gl-draw
npm install socket.io-client
npm install expo-notifications (mobile)\n```

#### Global CSS Configuration (src/index.css):
```css
@import'leaflet/dist/leaflet.css';
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
- **`POST /api/admin/students`**: Admin add student with auto-generated credentials and linked parent (enhanced)
- **`GET /api/admin/students`**: Admin retrieve student list with parent associations
- **`PUT /api/admin/students/:id`**: Admin update student information
- **`DELETE /api/admin/students/:id`**: Admin deactivate student (with parent handling logic)
- **`GET /api/admin/parents`**: Admin retrieve parent list with student associations
- **`PUT /api/admin/parents/:id`**: Admin update parent information
- **`DELETE /api/admin/parents/:id`**: Admin deactivate parent (with validation)
- `POST /api/routes`: Create route (receive polyline string)
- `GET /api/routes/:id`: Get route details
- `PUT /api/routes/:id`: Update route
- `POST /api/users/update-fcm`: Update user FCM Token
- **`GET /api/admin/audit-logs`**: Retrieve administrative action logs
- Similar CRUD endpoints apply to drivers\n
### 4.5 Socket.io Event Definitions
\n#### Driver Events:
- `driver:auth`: Driver authentication (send token and busId)
- `driver:ping`: Send location update (busId, lat, lng, speed, heading, timestamp)
\n#### Admin Events:
- `admin:all_buses_update`: Receive all vehicle location updates
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
  status: 'moving' | 'stopped' | 'offline';\n}\n
interface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  vehicles?: VehicleLocation[];
}\n```

#### State Management:
- Store vehicle states using hashmap structure: `{ busId: { lat, lng, speed, heading } }`
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
      <LiveMap \n        center={[17.3850, 78.4867]} 
        zoom={13} \n        vehicles={Object.values(buses)} 
      />
    </div>
  );
};
```

### 4.7 Push Notification Implementation (mobile/hooks/useNotifications.ts)

#### Feature Configuration:
- Use expo-notifications library
- Configure notification handler: show notifications when app is open, play sound, do not set badge
- Automatically request push permissions
- Obtain Expo Push Token (FCM Token)\n- Listen for notification receipt events

#### Integration Steps:
1. Call `useNotifications()` hook after user login
2. Upload obtained FCM Token to backend: `axios.post('/api/users/update-fcm', { fcmToken: token })`
3. Backend sends push via FCM to corresponding users when geofence is triggered

## 5. Real-time Tracking Implementation

### 5.1 Driver Side (Data Publisher)
- Use `navigator.geolocation.watchPosition` to obtain location\n- Send location data via Socket.io every 3-5 seconds
- Included fields: busId, latitude, longitude, speed, heading, timestamp
- Support both web and mobile platforms

### 5.2 Server Side (Socket.io + Supabase)
- Receive driver location data and store in `gps_logs` table
- Real-time broadcast to subscribed clients via Socket.io
- Execute geofencing calculations (GeofenceService)
- Trigger push notifications (when distance < 500 meters)
- Location data retention policy: Keep last 24 hours of trajectory for historical playback

### 5.3 Student/Parent Side (Data Subscriber)
- Establish Socket.io connection and subscribe to specific vehicle\n- Listen for `bus:location_update` events
- Receive latest location and update map markers
- Use CSS transitions for smooth movement animations
- Receive push notification alerts\n
### 5.4 Admin Side (Global Monitoring)
- Establish Socket.io connection\n- Listen for `admin:all_buses_update` events
- Real-time update of all vehicle locations
- Use hashmap for efficient multi-vehicle state management
\n### 5.5 Performance Optimization
- GPS data throttled storage (3-10 second intervals to avoid database overload)
- Socket.io room mechanism (broadcast by vehicle ID grouping)
- Geospatial indexing for optimized query performance
- Frontend marker interpolation animation (reduce visual jumping)
- Use hashmap instead of array traversal for improved update efficiency

## 6. Development Phase Planning

### Phase 1: Operational Data Management (Priority: High, Complexity: Low-Medium)
- Implement admin CRUD interfaces\n- Use shadcn/ui Data Tables and Dialog components
- Configure Supabase RLS permission policies
- **Implement enhanced student/parent management with automatic credential generation**
- **Develop credential display and management UI**
- **Implement audit logging for administrative actions**
\n### Phase 2: Map Integration (Priority: High, Complexity: Medium)\n- Integrate React-Leaflet and CartoDB Dark Matter\n- Create LiveMap component\n- Implement neon green pulse markers
- Integrate mapbox-gl-draw route drawing tool
\n### Phase 3: Driver Location Logic (Priority: Medium, Complexity: High)
- Implement Geolocation API calls
- Configure data throttling mechanism
- Complete GPS data reporting logic (Socket.io)
- Develop driver web control panel interface

### Phase 4: Realtime Subscriptions (Priority: Medium, Complexity: High)
- Configure Socket.io server and client
- Implement event subscription logic
- Add smooth animation transitions
- Develop GPS simulator testing tool

### Phase 5: Geofencing & Push Notifications (Priority: Optional, Complexity: Medium)
- Implement Haversine distance calculation (GeofenceService)
- Integrate expo-notifications\n- Configure FCM push service
- Implement arrival alert functionality
- Configure Toast notification component

### Phase 6: Route Management (Priority: Medium, Complexity: Medium)
- Develop route drawing interface (RouteBuilder.jsx)
- Implement stop marking functionality
- Complete route-vehicle association logic
\n## 7. Testing and Deployment Process

### 7.1 Development Testing Process
1. **Start GPS Simulator**: `node scripts/simulateBus.js bus_001`
2. **Open Driver Control Panel**: Access `http://192.168.1.x:3000/driver` in mobile browser (use local IP)
3. **Open Admin Dashboard**: Access real-time monitoring map in desktop browser
4. **Verify Data Flow**: Confirm map markers move with simulator or real GPS
5. **Test Student/Parent Creation**: Verify automatic credential generation and parent linking
6. **Test RBAC**: Verify role-based access restrictions work correctly

### 7.2 Key Verification Points
- Socket.io connection status
- GPS data reporting frequency
- Map marker smooth movement effect
- Push notification trigger timing
- Multi-vehicle concurrent tracking performance
- **Student-parent account creation atomicity**
- **Credential generation uniqueness and security**
- **RBAC policy enforcement across all endpoints**

### 7.3 Deployment Checklist
- Generate Google Maps custom style JSON (mapStyle.json) to match Cyber-Dark theme
- Configure production Socket.io server address
- Set FCM server key\n- Configure Supabase production environment variables
- Enable HTTPS (required for push notifications and geolocation)
- **Verify RLS policies are active in production**
- **Test credential generation service under load**
- **Configure audit log retention policy**
\n## 8. Security and Performance\n- Password encryption storage (Supabase Auth built-in bcrypt)
- JWT token expiration mechanism
- CORS cross-origin configuration
- Request rate limiting protection
- GPS data throttled storage (3-10 second intervals)
- Geospatial indexing for optimized query performance
- Supabase RLS row-level security policies
- Socket.io room isolation mechanism
- FCM Token secure storage and updates
- **Secure random credential generation with cryptographic strength**
- **Audit logging for all administrative actions**
- **Database transaction management for atomic student-parent creation**
- **Input validation and sanitization for all user-generated content**

## 9. Website Design Style\n- **Theme Positioning**: Cyber-dark style with neon green accents, emphasizing technology and futurism
- **Color Scheme**:
  - Main background: #1a1a1a (deep black)
  - Card background: #ffffff (pure white, admin dashboard)
  - Primary color: #3b82f6 (tech blue)
  - Neon green: #10b981 (emerald, for map markers, emphasis elements, START button)
  - Warning/stop button: #ef4444 (red)\n  - Border color: #e2e8f0 (light gray)
- **Visual Details**:
  - Map markers: Neon green pulse animation (animate-ping) with shadow effects (shadow-green-400), pulse displays when vehicle is moving
  - Border radius: Medium rounded (0.5rem), large buttons use rounded-xl
  - Shadows: Subtle card shadows, buttons use shadow-lg for enhanced depth
  - Buttons: Flat design with slight lift effect on hover, driver control panel buttons use large size design (py-6text-2xl)
  - Map: CartoDB Dark Matter dark basemap, clear marker icons, vehicle markers with directional indicators and speed status
  - Tables: Zebra-striped rows, hover highlighting\n  - Status indicators: Use colors to distinguish online/offline status (ON AIR in emerald green, OFFLINE in gray)
  - **Form elements**: Clear field labels, validation feedback, success/error states with appropriate color coding
- **Layout Approach**:
  - Admin dashboard: Sidebar navigation + main content area
  - Driver control panel: Full-screen vertical center layout, large button design for mobile operation convenience
  - Mobile/parent portal: Full-screen map view + bottom status bar
  - Forms: Vertical arrangement with clear field labels\n  - Responsive design adapted for desktop and mobile devices
  - **Multi-step forms**: Progress indicators for student/parent creation workflow