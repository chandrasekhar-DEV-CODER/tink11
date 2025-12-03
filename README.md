# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-7wscx5suxq0x

# My School Ride - School Bus Tracking System

## 🚌 Project Overview

My School Ride is an enterprise-level SaaS platform designed for schools to provide real-time school bus tracking, student safety management, driver dispatch, and parent notification services. The system features a cyber-dark themed interface with real-time GPS tracking capabilities.

## ✨ Key Features

### Core Functionality
- **Real-time GPS Tracking**: Live location tracking of all active school buses
- **Multi-role Access Control**: Support for super admins, school admins, drivers, and parents
- **Vehicle Fleet Management**: Comprehensive vehicle information and status tracking
- **Route & Stop Management**: Define bus routes with multiple stops and schedules
- **Student Profile Management**: Manage student information and bus assignments
- **Trip History & Analytics**: View past trips with detailed analytics
- **Dashboard & Statistics**: Real-time overview of fleet operations
- **Notification System**: Push notifications for proximity alerts and trip updates

### Technical Highlights
- **Cyber-Dark Theme**: Modern dark interface with neon green accents (#10b981)
- **Responsive Design**: Desktop-first with mobile adaptation
- **Real-time Updates**: Powered by Supabase Realtime
- **Geospatial Queries**: PostGIS integration for location-based features
- **Type-safe**: Full TypeScript implementation

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database with PostGIS extension
  - Row Level Security (RLS) policies
  - Real-time subscriptions
  - Authentication & authorization
  - Storage for avatars and files

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── common/          # Shared components (Header, Sidebar)
│   │   └── ui/              # shadcn/ui components
│   ├── db/
│   │   ├── supabase.ts      # Supabase client configuration
│   │   └── api.ts           # Database API layer
│   ├── pages/               # Application pages
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── LiveTracking.tsx # Real-time tracking
│   │   ├── Vehicles.tsx     # Vehicle management
│   │   ├── Routes.tsx       # Route management
│   │   ├── Stops.tsx        # Stop management
│   │   ├── Students.tsx     # Student management
│   │   ├── Trips.tsx        # Trip history
│   │   └── Settings.tsx     # System settings
│   ├── types/
│   │   └── types.ts         # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── routes.tsx           # Route configuration
│   └── index.css            # Global styles & design system
├── supabase/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 20
npm >= 10
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd app-7wscx5suxq0x
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

The `.env` file is already configured with Supabase credentials:
```
VITE_APP_ID=app-7wscx5suxq0x
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

4. **Start development server**
```bash
npm run dev -- --host 127.0.0.1
```

Or alternatively:
```bash
npx vite --host 127.0.0.1
```

5. **Open your browser**
Navigate to `http://127.0.0.1:5173`

## 📊 Database Schema

The system uses PostgreSQL with PostGIS extension for geospatial features. Key tables include:

- **profiles** - User profiles with role-based access
- **vehicles** - School bus fleet information
- **routes** - Bus route definitions
- **stops** - Bus stop locations with coordinates
- **students** - Student profiles and assignments
- **student_parents** - Parent-student relationships
- **trips** - Trip session records
- **location_logs** - GPS breadcrumb trail
- **trip_events** - Event logging (arrivals, pickups, etc.)
- **notifications** - Push notification records

## 🎨 Design System

### Color Palette
- **Background**: `#0f172a` (Deep slate blue)
- **Card**: `#1e293b` (Dark gray blue)
- **Primary**: `#10b981` (Neon green)
- **Destructive**: `#ef4444` (Alert red)
- **Border**: `#475569` (Slate gray)

### Typography
- Font family: System fonts
- Responsive sizing with Tailwind utilities

### Components
All UI components follow shadcn/ui patterns with custom cyber-dark theming.

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (RBAC)
- JWT authentication via Supabase Auth
- Secure API endpoints with proper authorization

## 📱 Features by Role

### Super Admin
- Full system access
- User management
- System configuration

### School Admin
- Fleet management
- Route planning
- Student assignments
- Analytics and reports

### Driver
- View assigned vehicles
- Start/end trips
- Update location
- Mark student attendance

### Parent
- Track child's bus in real-time
- View route and stops
- Receive proximity notifications
- View trip history

## 🔄 Real-time Features

The system uses Supabase Realtime for:
- Live vehicle location updates
- Trip status changes
- Notification delivery
- Dashboard statistics

## 📈 Future Enhancements

- Map integration (Mapbox/Google Maps)
- Mobile app for drivers and parents
- Advanced analytics and reporting
- Geofencing with automatic alerts
- Route optimization algorithms
- Maintenance scheduling
- Fuel consumption tracking

## 🤝 Contributing

This is an enterprise project. For contribution guidelines, please contact the project maintainers.

## 📄 License

Copyright © 2025 My School Ride

## 📞 Support

For support and inquiries, please contact the development team.

---

Built with ❤️ using React, TypeScript, and Supabase
