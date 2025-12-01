# My School Ride MVP System Specification - Enhanced Version with Multi-Bus Tracking & Navigation Features

## 1. Website Name
My School Ride - School Bus Tracking Management System (MVP Version with Enhanced Multi-Bus Tracking, Navigation, and Optimized Analytics)

## 2. Website Description
A comprehensive school bus management platform providing unified login portal supporting four user roles: administrators, drivers, students, and parents. Core capabilities include: complete vehicle, driver, student, and parent management by administrators; real-time GPS location reporting by drivers; live bus tracking for students and parents with **multi-bus route visibility and navigation assistance**; push notification alerts; visual route management; **optimized real-time hourly active vehicle analytics based on 24-hour database storage**; self-service password recovery via OTP verification; comprehensive user profile management with image upload; and enhanced admin modules for Vehicles, Routes, Stops, Students, and Trip History with full CRUD operations and advanced tracking features.

## 3. Core Functional Modules
\n### 3.1 Unified Login System - Enhanced
(Content remains the same as originaldocument)

### 3.1.1 Forgot Password & OTP Verification System
(Content remains the same as original document)\n
### 3.1.2 User Profile Management System
(Content remains the same as original document)

### 3.2 Administrator Module - Enhanced with Improved Core Sections
(Content remains the same as original document for sections3.2.1 through 3.2.11)

#### 3.2.10 Hourly Active Vehicles Analytics Dashboard - Optimized with24-Hour Database Storage
- **Real-time Active Vehicle Counter**:\n  - Display current number of active vehicles (vehicles with active trips in progress)
  - Prominent card widget positioned at top of admin dashboard
  - Large numeric display with neon green accent color (#10b981)
  - **Auto-refresh every 30 seconds based on database queries of last 24 hours of stored data**
  - Visual indicator showing increase/decrease compared to previous hour
- **Hourly Activity Chart**:
  - Line chart displaying active vehicle count for the current day (24-hour period)
  - X-axis: Hours (00:00 to 23:00)
  - Y-axis: Number of active vehicles
  - **Data sourced exclusively from hourly_vehicle_stats table with 24-hour retention policy**
  - Chart library: Recharts or Chart.js with dark theme styling
  - Hover tooltips showing exact vehicle count and hour\n  - Color scheme: Neon green line (#10b981) on dark background (#1a1a1a)
- **Active Vehicle List Panel**:
  - Collapsible side panel showing currently active vehicles
  - Display vehicle ID, driver name, route name, trip start time\n  - Real-time status updates (moving/stopped)
  - Click to highlight vehicle on map
  - Sort by trip duration or vehicle ID
- **Historical Comparison**:
  - Compare current day's hourly activity with previous day
  - Display percentage change in activity levels
  - Weekly average active vehicles metric
- **Data Calculation Logic - Optimized**:
  - Active vehicle defined as: vehicle with trip status = 'active' in current hour
  - **Query hourly_vehicle_stats table for last 24 hours of aggregated data**
  - **Database retention policy: Automatically purge GPS logs and hourly stats older than 24 hours**
  - **Hourly aggregation runs every hour via scheduled job, stores results in hourly_vehicle_stats table**\n  - **Real-time active count calculated from current trips table, not from raw GPS logs**
  - Cache hourly aggregates for performance optimization
  - Real-time updates via Socket.io event: admin:hourly_stats_update

### 3.3 Driver Module (Phase 3: Driver Dashboard - The Publisher) - Existing Module (Preserved)
(Content remains the same as original document)

### 3.4 Student and Parent Module (Phase 4: Parent/Student View - The Subscriber) - Enhanced with Multi-Bus Tracking & Navigation
\n#### 3.4.1 Real-time Map Tracking - Enhanced with Multi-Bus Route Visibility
- **Map Engine**: React-Leaflet + CartoDB Dark Matter Tiles
- **Visual Style**: Cyber-dark theme with neon green markers\n- **Core Features**:
  - Automatically load map interface after login
  - **Display real-time location of assigned bus (primary bus) with prominent neon green pulse marker**
  - **NEW: Display all other buses traveling on the same route as the student's assigned route**
  - **Route-based bus filtering**: Query all vehicles assigned to the student's route_id and display their real-time locations
  - **Visual differentiation**: \n    - Assigned bus: Neon green pulse marker with'MY BUS' label
    - Other route buses: Blue pulse markers with vehicle ID labels
  - **Bus marker click interaction**: Click any bus marker to view detailed information popup
  - Vehicle markers use pulse animation effect when moving (speed > 0)\n  - Display vehicle movement trajectory\n  - Smooth animation transitions: Use CSS transitions to interpolate between coordinate points for sliding effect
\n#### 3.4.2 Multi-Bus Information Display & Navigation - NEW
- **Bus List Panel** (Collapsible Side Panel):
  - Display list of all buses on the student's route
  - Show bus status: Active/Stopped/Offline
  - Show current location description (nearest landmark or address)
  - Show estimated distance from student's pickup stop\n  - Highlight assigned bus with 'MY BUS' badge
  - Click any bus in list to center map on that bus and open detail view
\n- **Bus Detail View** (Modal/Popup when clicking bus marker or list item):
  - Bus ID and vehicle model\n  - Driver name and contact (optional, based on privacy settings)
  - Current speed and heading
  - Real-time location coordinates
  - Distance from student's pickup stop
  - Estimated Time of Arrival (ETA) to student's pickup stop
  - **NEW: 'Get Directions' button**
  - **NEW: 'Missed Bus' indicator** (if bus has already passed the student's stop)
\n- **Get Directions Feature**:
  - **Button**: Prominent 'Get Directions' button in bus detail view
  - **Functionality**: \n    - Calculate route from student's current location (or pickup stop) to the bus's current location
    - Display turn-by-turn directions on map
    - Show estimated walking/driving time to reach the bus
    - Option to open directions in external map app (Google Maps, Apple Maps)\n  - **Use Case**: Help student navigate to catch the bus if they are running late or at a different location
  - **Implementation**: Use Mapbox Directions API or Google Maps Directions API

- **Missed Bus Indicator**:\n  - **Logic**: If bus has already passed the student's pickup stop (based on stop sequence and GPS trajectory), display 'MISSED BUS' badge
  - **Visual**: Red badge with warning icon on bus marker and in bus detail view
  - **Information**: Show time when bus passed the stop, next available bus on route (if any)\n  - **Helpful Action**: Suggest alternative buses or display next scheduled bus time

- **Student Pickup/Drop-off Point Markers**:
  - Display student's assigned pickup and dropoff stops on map
  - Show distance between current bus location and pickup point
  - Estimated Time of Arrival (ETA) for assigned bus
  - **NEW: Show ETA for all other buses on route to the pickup stop**
\n#### 3.4.3 Real-time Data Subscription - Enhanced\n- Subscribe to vehicle location updates using Socket.io
- **Subscribe to all vehicles on the student's assigned route, not just assigned bus**
- Filter relevant vehicle data by route_id\n- No manual page refresh needed, data automatically pushed\n- Use hashmap data structure for efficient multi-vehicle state management: { busId: { lat, lng, speed, heading, routeId } }
\n#### 3.4.4 Geofencing and Push Notifications (Phase 5: Advanced) - Enhanced
- **Distance Calculation**: Use Haversine formula to calculate distance between bus and student pickup point
- **Arrival Alert**: Trigger push notification when assigned bus distance< 500meters:'Your bus is arriving soon!'
- **NEW: Missed Bus Alert**: Trigger push notification if assigned bus has passed the pickup stop: 'You missed your bus. Next bus arrives in X minutes.'
- **Push Notification Implementation** (Mobile):
  - Use expo-notifications library
  - Automatically request push permissions
  - Obtain FCM Token and upload to backend
  - Configure notification handlers: shouldShowAlert, shouldPlaySound, shouldSetBadge
  - Listen for notification receipt events and log to console
- **Trigger Logic**: Real-time monitoring of location changes with automatic detection\n
#### 3.4.5 Profile Management Access\n(Content remains the same as original document)\n
### 3.5 Development and Testing Tools - Preserved
(Content remains the same as original document)\n
## 4. Technical Architecture

### 4.1 Database Design - Enhanced Schema with Optimized Analytics Tables
(All existing tables remain the same)\n
- **hourly_vehicle_stats table - Optimized**:
  - id (primary key)
  - date (date, indexed)
  - hour (integer0-23, indexed)
  - active_vehicle_count (integer)
  - created_at (timestamp)
  - updated_at (timestamp)
  - **Composite index on (date, hour) for efficient querying**
  - **Automatic cleanup trigger: Delete records older than 24 hours**\n\n- **gps_logs table - Optimized**:
  - (Existing fields remain the same)
  - **Automatic cleanup trigger: Delete records older than 24 hours**
  - **Retention policy enforced at database level via scheduled job**

### 4.2 Backend Technology Stack - Enhanced
(All existing services remain the same)

- **NEW: Multi-Bus Route Service**: Query and filter vehicles by route_id for student/parent view
- **NEW: Navigation Service**: Calculate directions and ETA from student location to bus location using Mapbox/Google Directions API
- **NEW: Missed Bus Detection Service**: Analyze GPS trajectory and stop sequence to determine if bus has passed student's stop
- **Optimized Analytics Service**: \n  - Scheduled hourly aggregation job (runs every hour at :00 minutes)
  - Queries trips table for active vehicles in the past hour
  - Stores aggregated counts in hourly_vehicle_stats table
  - Automatic cleanup of data older than 24 hours
  - Real-time active count calculated from current trips table, not GPS logs

### 4.3 Frontend Technology Stack - Enhanced
(All existing libraries remain the same)

#### Student/Parent Portal (Mobile) - Enhanced:\n- React Native + Expo\n- expo-notifications (push notifications)
- React-Leaflet or react-native-maps
- Socket.io Client
- Geolocation API
- expo-image-picker (Profile image selection and upload)
- **NEW: @mapbox/mapbox-sdk or @react-native-community/google-maps for directions API integration**
- **NEW: react-native-maps-directions for turn-by-turn navigation display**
\n### 4.4 Core API Endpoints - Enhanced with New Endpoints
(All existing endpoints remain the same)

**Student/Parent - Multi-Bus Tracking:**
- GET /api/student/route-buses/:routeId: Get all buses currently on the student's assigned route with real-time locations
- GET /api/student/bus-details/:busId: Get detailed information for a specific bus (location, speed, driver, ETA)
- POST /api/student/get-directions: Calculate directions from student location to bus location (requires student coordinates and bus coordinates)
- GET /api/student/missed-bus-check/:studentId: Check if assigned bus has passed the student's pickup stop
- GET /api/student/next-bus/:routeId/:stopId: Get next available bus on route arriving at the stop

**Analytics - Optimized:**
- GET /api/admin/analytics/hourly-active: Get hourly active vehicle statistics for last 24 hours from hourly_vehicle_stats table
- GET /api/admin/analytics/current-active: Get current number of active vehicles from trips table (real-time query)
\n### 4.5 Socket.io Event Definitions - Enhanced
(All existing events remain the same)

#### Student/Parent Events - Enhanced:\n- parent:subscribe: Subscribe to specific vehicle location\n- **NEW: parent:subscribe_route: Subscribe to all vehicles on a specific route**
- bus:location_update: Receive subscribed vehicle location updates
- **NEW: route:buses_update: Receive location updates for all buses on subscribed route**
- **NEW: bus:missed_alert: Receive alert when assigned bus has passed the pickup stop**
\n### 4.6 LiveMap Component Implementation - Enhanced for Multi-Bus Display
(Existing implementation remains the same with additions)

#### Component Interface - Enhanced:
```typescript
interface VehicleLocation {
  id: string;\n  name: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: 'moving' | 'stopped' | 'offline';
  isAssignedBus: boolean; // NEW: Flag to differentiate assigned bus
  routeId: string; // NEW: Route identifier\n  missedStop: boolean; // NEW: Flag if bus has passed student's stop
}\n\ninterface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  vehicles?: VehicleLocation[];
  studentPickupStop?: { lat: number; lng: number; name: string }; // NEW\n  onBusClick?: (busId: string) => void; // NEW: Callback when bus marker is clicked
}\n```

#### State Management - Enhanced:
- Store vehicle states using hashmap structure: { busId: { lat, lng, speed, heading, tripStatus, routeId, isAssignedBus, missedStop } }
- Dynamically update via Socket.io listening to route:buses_update event
- Vehicle markers show/hide pulse animation based on speed value
- Differentiate assigned bus marker (neon green) from other route buses (blue)
\n### 4.7 Multi-Bus Tracking Component Implementation - NEW
\n#### BusListPanel Component (src/components/student/BusListPanel.jsx):
```typescript
interface Bus {
  id: string;\n  vehicleId: string;
  driverName: string;
  currentLocation: { lat: number; lng: number };
  speed: number;
  status: 'active' | 'stopped' | 'offline';
  distanceFromStop: number; // in meters
  eta: number; // in minutes
  isAssignedBus: boolean;\n  missedStop: boolean;\n}\n
interface BusListPanelProps {
  buses: Bus[];
  onBusSelect: (busId: string) => void;
  studentPickupStop: { lat: number; lng: number; name: string };
}\n```

#### BusDetailModal Component (src/components/student/BusDetailModal.jsx):\n```typescript
interface BusDetailModalProps {
  bus: Bus;
  studentLocation: { lat: number; lng: number };
  onGetDirections: (busId: string) => void;\n  onClose: () => void;
}
```

#### NavigationView Component (src/components/student/NavigationView.jsx):
```typescript
interface NavigationViewProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onOpenExternalMap: () => void;
}\n```

### 4.8 Optimized Analytics Service Implementation - NEW

#### Hourly Aggregation Job (backend/jobs/hourlyAggregation.js):\n- **Scheduled Job**: Runs every hour at :00 minutes using node-cron or similar scheduler
- **Logic**:
  1. Query trips table for all trips with status = 'active' in the past hour
  2. Count distinct vehicle_id values
  3. Insert aggregated count into hourly_vehicle_stats table with current date and hour
  4. Delete records from hourly_vehicle_stats older than 24 hours
  5. Delete records from gps_logs older than 24 hours
- **Error Handling**: Log errors, retry on failure, send alerts if job fails

#### Real-time Active Count Service (backend/services/activeVehicleService.js):
- **Function**: getCurrentActiveCount()
- **Logic**: Query trips table for count of vehicles with status = 'active' at current moment
- **Caching**: Cache result for 30 seconds to reduce database load
- **Socket.io Broadcast**: Emit admin:active_count_update event every 30 seconds with current count

## 5. Real-time Tracking Implementation - Enhanced
(All existing sections remain the same with additions)

### 5.3 Student/Parent Side (Data Subscriber) - Enhanced
- Establish Socket.io connection and subscribe to assigned route (not just assigned vehicle)
- Listen for route:buses_update events to receive locations of all buses on route
- Receive latest location and update map markers for all route buses
- Use CSS transitions for smooth movement animations
- Receive push notification alerts for assigned bus arrival and missed bus\n- Display bus list panel with all route buses\n- Handle bus marker click events to show bus detail modal
- Implement'Get Directions' functionality with external map integration

### 5.4 Admin Side (Global Monitoring) - Optimized
- Establish Socket.io connection\n- Listen for admin:all_buses_update events\n- Real-time update of all vehicle locations\n- Use hashmap for efficient multi-vehicle state management
- **Analytics Monitoring - Optimized**:
  - Listen for admin:active_count_update events (every 30 seconds)
  - Query hourly_vehicle_stats table for last 24 hours of data (on page load and hourly refresh)
  - Display hourly activity charts with data from database, not real-time GPS logs
  - Show current active vehicle count from real-time query of trips table

## 6. Development Phase Planning - Updated with New Phases
(All existing phases remain the same with additions)

### Phase 13: Multi-Bus Tracking & Navigation (Priority: High, Complexity: Medium) - NEW
- **Implement Multi-Bus Route Query Service**:
  - Backend API to query all vehicles on a specific route
  - Filter vehicles by route_id and return real-time locations
- **Develop Bus List Panel Component**:
  - Display all buses on student's route\n  - Show bus status, distance, and ETA
  - Highlight assigned bus\n- **Implement Bus Detail Modal**:\n  - Show detailed bus information\n  - Display 'Get Directions' button
  - Show 'Missed Bus' indicator if applicable
- **Integrate Navigation Service**:
  - Use Mapbox Directions API or Google Maps Directions API
  - Calculate route from student location to bus location
  - Display turn-by-turn directions on map
  - Implement'Open in External Map' functionality
- **Implement Missed Bus Detection**:
  - Analyze GPS trajectory and stop sequence\n  - Determine if bus has passed student's stop
  - Display missed bus indicator and send push notification
  - Show next available bus information
- **Enhance Socket.io Subscriptions**:
  - Implement route:buses_update event for multi-bus tracking
  - Implement bus:missed_alert event for missed bus notifications
- **Update Student/Parent Map Interface**:
  - Display multiple bus markers with differentiation
  - Implement bus marker click handlers
  - Integrate bus list panel and detail modal
- **Testing**:
  - Test multi-bus display with GPS simulator
  - Test navigation directions calculation
  - Test missed bus detection logic
  - Test push notifications for missed bus\n  - Test external map integration

### Phase 14: Analytics Optimization (Priority: High, Complexity: Low) - NEW
- **Implement Hourly Aggregation Job**:
  - Set up scheduled job to run every hour\n  - Aggregate active vehicle counts from trips table
  - Store results in hourly_vehicle_stats table
- **Implement Automatic Data Cleanup**:
  - Create database triggers or scheduled jobs to delete data older than 24 hours
  - Apply to gps_logs and hourly_vehicle_stats tables\n- **Optimize Real-time Active Count Service**:\n  - Query trips table instead of GPS logs for current active count
  - Implement caching with 30-second TTL
- **Update Admin Analytics Dashboard**:
  - Query hourly_vehicle_stats table for chart data
  - Display last 24 hours of hourly data
  - Show real-time active count from trips table query
- **Testing**:
  - Test hourly aggregation job execution
  - Verify data cleanup after 24 hours
  - Test real-time active count accuracy
  - Verify analytics dashboard displays correct data
  - Test performance under load

## 7. Testing and Deployment Process - Enhanced
(All existing sections remain the same with additions)
\n### 7.1 Development Testing Process - Enhanced
(All existing test steps remain the same with additions)
\n21. **Test Multi-Bus Tracking (NEW)**:
    - Log in as student
    - Verify assigned bus is displayed with'MY BUS' label and neon green marker
    - Verify all other buses on the same route are displayed with blue markers
    - Click on different bus markers and verify detail modal opens
    - Verify bus list panel shows all route buses with correct information
    - Test bus marker click-to-center functionality
    - Verify real-time location updates for all route buses
\n22. **Test Navigation Feature (NEW)**:
    - Open bus detail modal for any bus
    - Click 'Get Directions' button\n    - Verify directions are calculated and displayed on map
    - Verify estimated time and distance are shown
    - Test 'Open in External Map' functionality (Google Maps/Apple Maps)
    - Verify directions update if bus moves

23. **Test Missed Bus Detection (NEW)**:\n    - Simulate bus passing student's pickup stop using GPS simulator
    - Verify'MISSED BUS' indicator appears on bus marker and in detail modal
    - Verify push notification is sent to student
    - Verify next available bus information is displayed
    - Test with multiple buses on route

24. **Test Optimized Analytics (NEW)**:
    - Verify hourly aggregation job runs every hour
    - Check hourly_vehicle_stats table for new records
    - Verify data older than 24 hours is automatically deleted
    - Verify admin dashboard displays data from hourly_vehicle_stats table
    - Verify real-time active count is accurate and updates every 30 seconds
    - Test performance with large number of vehicles

### 7.2 Key Verification Points - Enhanced
(All existing verification points remain the same with additions)

- **Multi-Bus Tracking Verification (NEW)**:
  - All buses on student's route are displayed correctly
  - Assigned bus is visually differentiated from other buses
  - Bus markers update in real-time
  - Bus list panel shows accurate information
  - Bus detail modal displays correct data
  - Socket.io route subscription works correctly
\n- **Navigation Feature Verification (NEW)**:
  - Directions are calculated accurately
  - Turn-by-turn directions are displayed clearly
  - Estimated time and distance are correct
  - External map integration works on iOS and Android
  - Directions update dynamically as bus moves
\n- **Missed Bus Detection Verification (NEW)**:
  - Missed bus logic is accurate based on GPS trajectory and stop sequence
  - Missed bus indicator displays correctly
  - Push notifications are sent reliably
  - Next bus information is accurate
\n- **Optimized Analytics Verification (NEW)**:
  - Hourly aggregation job runs on schedule without errors
  - Data cleanup executes correctly after 24 hours
  - Real-time active count is accurate and performant
  - Admin dashboard queries hourly_vehicle_stats table, not GPS logs
  - Analytics performance is optimized with reduced database load

### 7.3 Deployment Checklist - Enhanced
(All existing checklist items remain the same with additions)\n
- **Multi-Bus Tracking Deployment (NEW)**:
  - Configure Mapbox Directions API or Google Maps Directions API keys
  - Test navigation service in production environment
  - Verify Socket.io route subscription works in production
  - Test external map integration on production mobile apps
  - Configure push notifications for missed bus alerts
\n- **Analytics Optimization Deployment (NEW)**:
  - Set up hourly aggregation job scheduler (cron job or cloud scheduler)
  - Configure database cleanup triggers or scheduled jobs
  - Verify24-hour data retention policy is enforced
  - Test analytics dashboard performance in production
  - Monitor hourly aggregation job execution and errors
  - Set up alerts for job failures

## 8. Security and Performance - Enhanced
(All existing security measures remain the same with additions)
\n- **Multi-Bus Tracking Security (NEW)**:
  - Validate student can only view buses on their assigned route
  - Protect driver personal information in bus detail view
  - Rate limit navigation API requests to prevent abuse
  - Validate student location data before calculating directions
\n- **Analytics Performance Optimization (NEW)**:
  - Hourly aggregation reduces real-time query load on GPS logs
  - 24-hour data retention minimizes database size and improves query speed
  - Caching of real-time active count reduces database queries
  - Indexed queries on hourly_vehicle_stats table for fast retrieval
  - Scheduled cleanup jobs run during low-traffic hours

## 9. Website Design Style - Enhanced
(All existing design elements remain the same with additions)
\n- **Color Scheme - Enhanced**:
  - Assigned bus marker: #10b981 (neon green with'MY BUS' label)
  - Other route buses marker: #3b82f6 (tech blue with vehicle ID label)
  - Missed bus indicator: #ef4444 (red badge with warning icon)
  - Navigation route line: #10b981 (neon green polyline)
  - Get Directions button: #10b981 (neon green with white text)
\n- **Visual Details - Enhanced**:
  - **Bus markers**: Differentiated by color and label (assigned bus vs. other buses)
  - **Bus list panel**: Card-based layout with status indicators, collapsible design
  - **Bus detail modal**: Centered overlay with bus information, prominent 'Get Directions' button\n  - **Missed bus badge**: Red badge with warning icon, displayed on marker and in modal
  - **Navigation view**: Turn-by-turn directions with route polyline, distance and time display
  - **External map button**: Icon button to open directions in Google Maps/Apple Maps

- **Layout Approach - Enhanced**:
  - **Student/Parent Map View**:
    - Full-screen map with multiple bus markers
    - Collapsible bus list panel on left side (mobile: bottom sheet)
    - Bus detail modal opens on marker click (centered overlay)
    - Navigation view replaces map when directions are active
    - Bottom bar with student pickup stop information and ETA
  - **Bus List Panel Layout**:
    - Vertical list of bus cards\n    - Each card shows: Bus ID, status, distance, ETA, 'MY BUS' badge (if assigned)
    - Click card to center map and open detail modal
  - **Bus Detail Modal Layout**:\n    - Top section: Bus ID, driver name, status\n    - Middle section: Current location, speed, distance from stop, ETA
    - Bottom section: 'Get Directions' button, 'Close' button\n    - Missed bus indicator (if applicable) displayed prominently at top

## 10. Admin Module Audit & Enhancement Summary
(Content remains the same as original document)\n
## 11. New Features Summary
\n### 11.1 Multi-Bus Route Tracking for Students
- Students can now view all buses traveling on their assigned route, not just their assigned bus
- Visual differentiation between assigned bus (neon green) and other route buses (blue)
- Real-time location updates for all route buses via Socket.io
- Bus list panel showing all route buses with status, distance, and ETA
- Click any bus marker or list item to view detailed information
\n### 11.2 Navigation Assistance
- 'Get Directions' button in bus detail view
- Calculate route from student's current location to bus location
- Display turn-by-turn directions on map with estimated time and distance
- Option to open directions in external map app (Google Maps, Apple Maps)
- Helps students navigate to catch the bus if running late

### 11.3 Missed Bus Detection\n- Automatic detection when assigned bus has passed the student's pickup stop
- 'MISSED BUS' indicator displayed on bus marker and in detail modal\n- Push notification alert sent to student when bus is missed
- Display next available bus information and estimated arrival time
- Helps students plan alternative transportation or catch next bus

### 11.4 Optimized Hourly Analytics
- Hourly aggregation job runs every hour to calculate active vehicle counts
- Data stored in hourly_vehicle_stats table with 24-hour retention
- Automatic cleanup of GPS logs and hourly stats older than 24 hours
- Real-time active count calculated from trips table, not GPS logs
- Improved performance and reduced database load for admin analytics dashboard
- Admin dashboard displays last 24 hours of hourly data from database, not real-time calculations
