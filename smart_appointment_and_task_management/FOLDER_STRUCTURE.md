# Folder Structure

## Frontend Pages Organization

The application is now organized into separate folders based on user roles:

```
Frontend/src/pages/
├── Home.tsx                    # Public homepage
├── Login.tsx                   # Public login page
├── Register.tsx                # Public registration page
│
├── admin/                      # Admin-only pages
│   ├── AdminDashboard.tsx     # Admin overview with statistics
│   ├── AdminAppointments.tsx  # View/manage all appointments
│   └── AdminTasks.tsx         # View/manage all tasks
│
├── user/                       # Regular user pages
│   ├── Dashboard.tsx          # User dashboard
│   ├── Appointments.tsx       # User's appointments
│   └── Tasks.tsx              # User's tasks
│
└── staff/                      # Staff user pages
    ├── Dashboard.tsx          # Staff dashboard (same as user)
    ├── Appointments.tsx       # Staff appointments (same as user)
    └── Tasks.tsx              # Staff tasks (same as user)
```

## Route Structure

### Public Routes

- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page

### User Routes (Protected)

- `/dashboard` - User dashboard
- `/appointments` - User appointments
- `/tasks` - User tasks

### Admin Routes (Protected - Admin only)

- `/admin/dashboard` - Admin dashboard with statistics
- `/admin/appointments` - View all appointments from all users
- `/admin/tasks` - View all tasks from all users

### Staff Routes (Protected)

Staff users use the same routes as regular users:

- `/dashboard`
- `/appointments`
- `/tasks`

## User Roles

### Admin

- Full access to all pages
- Can view and manage all user appointments and tasks
- Can update status of any appointment or task
- Has dedicated admin dashboard with statistics
- Navigation shows both user and admin menu items

### User

- Access to personal dashboard, appointments, and tasks
- Can only view and manage own data
- Standard navigation menu

### Staff

- Same access as User role
- Uses the same pages and routes
- Can be customized in the future with staff-specific features

## Access Control

All protected routes use the `ProtectedRoute` component which:

- Checks if user is authenticated
- Redirects to login if not authenticated
- Admin routes require Admin role (backend enforced with `[Authorize(Roles = "Admin")]`)

## Backend API Endpoints

### User Endpoints

- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Create appointment
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create task

### Admin Endpoints (Admin role required)

- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/tasks` - Get all tasks
- `PATCH /api/admin/appointments/{id}/status` - Update appointment status
- `PATCH /api/admin/tasks/{id}/status` - Update task status

## User Accounts

### Admin Account

- Username: `admin`
- Password: `Admin123!`
- Role: Admin
- Full access to admin panel

### Staff Account

- Username: `employee`
- Password: `Staff123!`
- Role: User
- Same access as regular users

### Regular User Account

- Username: `aldrianloberiano`
- Password: (your registration password)
- Role: User
- Access to personal data only
